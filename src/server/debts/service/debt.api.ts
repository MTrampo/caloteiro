import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { ResponseProps } from "@/commons/models/api";
import { formatBRL, formatDate, formatDateTime } from "@/commons/utils/format";
import { presentDebtorItem } from "@/commons/utils/format";
import { getDebtorByIdSupabase } from "@/server/debtors/repository/debtor.supabase";
import type {
  CreateDebtPayload,
  RegisterPaymentPayload,
  RegisterExcusePayload,
  DebtDetailsFormatted,
  InstallmentFormatted,
  DebtPaymentFormatted,
  DebtExcuseFormatted,
  InstallmentInsert,
  InstallmentStatus,
  DebtCategory,
  InterestType,
} from "@/commons/models/debt";
import { DEBT_CATEGORY_LABELS } from "@/commons/models/debt";
import {
  createDebtSupabase,
  createInstallmentsSupabase,
  getDebtByIdSupabase,
  getInstallmentsByDebtIdSupabase,
  updateInstallmentSupabase,
  updateDebtStatusSupabase,
  createPaymentSupabase,
  getPaymentsByDebtIdSupabase,
  createExcuseSupabase,
  getExcusesByInstallmentIdsSupabase,
  getInstallmentByIdSupabase,
  countActiveDebtsByUserIdSupabase,
} from "../repository/debt.supabase";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";

/**
 * Incrementa meses preservando o dia do mês sem desvios de timezone
 */
function addMonthsToDateString(dateStr: string, monthsToAdd: number): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const targetDate = new Date(year, month + monthsToAdd, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  // Dias no mês de destino
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const finalDay = Math.min(day, daysInTargetMonth);

  const finalYearStr = String(targetYear).padStart(4, "0");
  const finalMonthStr = String(targetMonth + 1).padStart(2, "0");
  const finalDayStr = String(finalDay).padStart(2, "0");

  return `${finalYearStr}-${finalMonthStr}-${finalDayStr}`;
}

/**
 * Calcula a diferença em dias entre a data de vencimento e hoje
 */
function calculateDaysDifference(dueDateStr: string): { isLate: boolean; lateDays: number } {
  const [yearStr, monthStr, dayStr] = dueDateStr.split("-");
  const dueDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { isLate: true, lateDays: diffDays };
  }
  return { isLate: false, lateDays: 0 };
}

/**
 * Criação da dívida e projeção precisa das parcelas em cêntimos inteiros
 */
export const createDebtApi = async (
  userId: string,
  payload: CreateDebtPayload
): Promise<ResponseProps<{ debtId: string }>> => {
  // 1. Verificação de travas e limites do plano (Zero Trust)
  const permissions = await getUserPermissionsOrCacheApi(userId);
  if (permissions.maxDebtors !== null) {
    const activeDebtsCount = await countActiveDebtsByUserIdSupabase(userId);
    if (activeDebtsCount >= permissions.maxDebtors) {
      return ApiResponse.Forbidden({
        message: `O tanque encheu! Seu plano permite manter até ${permissions.maxDebtors} ${
          permissions.maxDebtors === 1 ? "dívida ativa" : "dívidas ativas"
        } simultaneamente. Finalize uma pendência ou evolua para o próximo plano de Tubarão!`,
        error: "LIMIT_REACHED",
      });
    }
  }

  // 2. Limite de parcelas por plano (Grátis: até 12x, Intermediário: até 36x, Top: até 120x)
  const maxInstallmentsAllowed = permissions.isFreePlan
    ? 12
    : (permissions.maxDebtors !== null && permissions.maxDebtors <= 10)
    ? 36
    : 120;

  if (payload.installments_count > maxInstallmentsAllowed) {
    return ApiResponse.Forbidden({
      message: `Limite de parcelamento excedido! Seu plano permite parcelar em até ${maxInstallmentsAllowed}x. Faça o upgrade para esticar os prazos!`,
      error: "INSTALLMENTS_LIMIT_REACHED",
    });
  }

  // 3. Validação das modalidades de juros por plano
  if (payload.interest_type === "monthly_percentage" && permissions.maxDebtors !== null) {
    return ApiResponse.Forbidden({
      message:
        "A modalidade de juros ao mês (% a.m.) é exclusiva do plano Tubarão Cabeça Chato! Faça o upgrade para liberar o cálculo dinâmico mensal.",
      error: "INTEREST_TYPE_NOT_ALLOWED",
    });
  }

  if (payload.interest_type === "fixed" && permissions.isFreePlan) {
    return ApiResponse.Forbidden({
      message:
        "A modalidade de taxa fixa do Tubarão é liberada a partir do plano Tubarão Branco! Faça o upgrade para definir valores adicionais fixos.",
      error: "INTEREST_TYPE_NOT_ALLOWED",
    });
  }

  // 4. Validação de devedor existente pertencente ao usuário
  const debtor = await getDebtorByIdSupabase(payload.debtor_id, userId);
  if (!debtor) {
    return ApiResponse.BadRequest({
      message: "Devedor não encontrado no tanque deste Tubarão.",
    });
  }

  // 4. Persistência do cabeçalho da dívida
  const { data: debt, error: debtError } = await createDebtSupabase(userId, payload);
  if (debtError || !debt) {
    return ApiResponse.BadRequest({
      message: "Não foi possível registrar o acordo de dívida.",
      error: debtError || undefined,
    });
  }

  // 5. Cálculo das parcelas com garantia de cêntimos exatos sobre o total a receber (capital + juros)
  const finalAmount = payload.total_amount && payload.total_amount > 0
    ? payload.total_amount
    : payload.original_amount;
  const totalCents = Math.round(finalAmount * 100);
  const count = payload.installments_count;
  const baseCents = Math.floor(totalCents / count);
  const remainderCents = totalCents - baseCents * count;

  const installmentsToInsert: InstallmentInsert[] = [];

  for (let i = 1; i <= count; i++) {
    // A primeira parcela absorve os centavos restantes para fechar exatamente a soma
    const nominalCents = i === 1 ? baseCents + remainderCents : baseCents;
    const nominalAmount = nominalCents / 100;
    const dueDate = addMonthsToDateString(payload.first_due_date, i - 1);

    installmentsToInsert.push({
      debt_id: debt.id,
      debtor_id: payload.debtor_id,
      user_id: userId,
      installment_number: i,
      nominal_amount: nominalAmount,
      paid_amount: 0,
      due_date: dueDate,
      status: "pending",
    });
  }

  const { error: installmentsError } = await createInstallmentsSupabase(installmentsToInsert);
  if (installmentsError) {
    return ApiResponse.InternalError({
      message: "Erro ao gerar o cronograma de parcelas.",
      error: installmentsError,
    });
  }

  return ApiResponse.Created({
    data: { debtId: debt.id },
    message: "Dívida registrada com sucesso! Cronograma de parcelas ativo.",
  });
};

/**
 * Consulta detalhada da dívida, montando o dossiê completo para visualização
 */
export const getDebtDetailsApi = async (
  debtId: string,
  userId: string
): Promise<ResponseProps<DebtDetailsFormatted>> => {
  const debt = await getDebtByIdSupabase(debtId, userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada no tanque deste Tubarão.",
    });
  }

  const debtor = await getDebtorByIdSupabase(debt.debtor_id, userId);
  if (!debtor) {
    return ApiResponse.NotFound({
      message: "Devedor associado a esta dívida não foi localizado.",
    });
  }

  const [installmentsRaw, paymentsRaw] = await Promise.all([
    getInstallmentsByDebtIdSupabase(debtId, userId),
    getPaymentsByDebtIdSupabase(debtId, userId),
  ]);

  const installmentIds = installmentsRaw.map((inst) => inst.id);
  const excusesRaw = await getExcusesByInstallmentIdsSupabase(installmentIds);

  // Mapeamento de desculpas por parcela
  const excusesByInstallment = new Map<string, DebtExcuseFormatted[]>();
  for (const exc of excusesRaw) {
    const formattedExcuse: DebtExcuseFormatted = {
      ...exc,
      formattedPromisedDate: formatDate(exc.promised_date),
      formattedCreatedAt: formatDateTime(exc.created_at),
    };
    const list = excusesByInstallment.get(exc.installment_id) || [];
    list.push(formattedExcuse);
    excusesByInstallment.set(exc.installment_id, list);
  }

  // Tratamento e formatação de parcelas
  let paidInstallmentsCount = 0;
  let lateInstallmentsCount = 0;
  let totalAmortized = 0;

  const installmentsFormatted: InstallmentFormatted[] = installmentsRaw.map((inst) => {
    const nominal = Number(inst.nominal_amount);
    const paid = Number(inst.paid_amount);
    const remaining = Math.max(0, nominal - paid);
    totalAmortized += paid;

    const { isLate, lateDays } = calculateDaysDifference(inst.due_date);
    const isPaid = inst.status === "paid" || remaining <= 0;

    let computedStatus: InstallmentStatus = inst.status as InstallmentStatus;
    if (!isPaid) {
      if (paid > 0) {
        computedStatus = "partially_paid";
      } else if (isLate) {
        computedStatus = "late";
      } else {
        computedStatus = "pending";
      }
    } else {
      computedStatus = "paid";
    }

    if (computedStatus === "paid") paidInstallmentsCount++;
    if (computedStatus === "late" || (isLate && !isPaid)) lateInstallmentsCount++;

    const statusMeta = {
      pending: { label: "A Vencer", badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700" },
      late: { label: "Em Atraso", badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
      partially_paid: { label: "Parcial", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      paid: { label: "Liquidada", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    }[computedStatus];

    let lateDaysText = "";
    if (isLate && !isPaid) {
      lateDaysText = lateDays === 1 ? "Venceu ontem" : `Venceu há ${lateDays} dias`;
    }

    return {
      ...inst,
      status: computedStatus,
      formattedNominalAmount: formatBRL(nominal),
      formattedPaidAmount: formatBRL(paid),
      formattedRemainingAmount: formatBRL(remaining),
      formattedDueDate: formatDate(inst.due_date),
      isLate: isLate && !isPaid,
      lateDays: isLate && !isPaid ? lateDays : 0,
      lateDaysText,
      statusLabel: statusMeta.label,
      statusBadgeClass: statusMeta.badgeClass,
      excuses: excusesByInstallment.get(inst.id) || [],
    };
  });

  // Tratamento e formatação de pagamentos (Pix recebidos)
  const paymentsFormatted: DebtPaymentFormatted[] = paymentsRaw.map((payment) => ({
    ...payment,
    formattedAmount: formatBRL(Number(payment.amount)),
    formattedPaidAt: formatDateTime(payment.paid_at),
  }));

  const originalAmount = Number(debt.original_amount);
  const remainingAmount = Math.max(0, originalAmount - totalAmortized);
  const progressPercentage = originalAmount > 0
    ? Math.min(100, Math.round((totalAmortized / originalAmount) * 100))
    : 0;

  const isFullySettled = remainingAmount <= 0 || debt.status === "settled";

  const debtStatusMeta = {
    pending: { label: "Em Aberto", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    settled: { label: "Quitada (Honrada)", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    defaulted: { label: "Calote Confirmado", badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  }[debt.status] || { label: debt.status, badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700" };

  const categoryLabels = DEBT_CATEGORY_LABELS;
  const interestType = (debt.interest_type || "none") as InterestType;
  let interestLabel = "Sem juros";
  if (interestType === "fixed") {
    interestLabel = `Taxa Fixa (+${formatBRL(Number(debt.interest_rate || 0))})`;
  } else if (interestType === "total_percentage") {
    interestLabel = `${Number(debt.interest_rate || 0)}% sobre o total`;
  } else if (interestType === "monthly_percentage") {
    interestLabel = `${Number(debt.interest_rate || 0)}% ao mês`;
  }

  const formattedData: DebtDetailsFormatted = {
    ...debt,
    formattedOriginalAmount: formatBRL(originalAmount),
    formattedTotalAmount: formatBRL(Number(debt.total_amount || debt.original_amount)),
    formattedPaidAmount: formatBRL(totalAmortized),
    formattedRemainingAmount: formatBRL(remainingAmount),
    progressPercentage,
    formattedLoanDate: formatDate(debt.loan_date),
    formattedFirstDueDate: formatDate(debt.first_due_date),
    statusLabel: debtStatusMeta.label,
    statusBadgeClass: debtStatusMeta.badgeClass,
    categoryLabel: (categoryLabels as Record<string, string>)[debt.category] || "Geral",
    interestLabel,
    paidInstallmentsCount,
    totalInstallmentsCount: installmentsFormatted.length,
    isFullySettled,
    hasLateInstallments: lateInstallmentsCount > 0,
    lateInstallmentsCount,
    debtor: presentDebtorItem(debtor),
    installments: installmentsFormatted,
    payments: paymentsFormatted,
  };

  return ApiResponse.Ok({
    data: formattedData,
    message: "Dossiê da dívida carregado.",
  });
};

/**
 * Amortização em cascata (Pingou o Pix!)
 * O valor recebido quita a parcela atual em aberto e escorre para as futuras.
 */
export const registerDebtPaymentApi = async (
  debtId: string,
  userId: string,
  payload: RegisterPaymentPayload
): Promise<ResponseProps<{ settled: boolean; amortizedAmount: number }>> => {
  const debt = await getDebtByIdSupabase(debtId, userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada.",
    });
  }

  if (debt.status === "settled") {
    return ApiResponse.BadRequest({
      message: "Esta dívida já foi totalmente quitada e honrada!",
    });
  }

  const installments = await getInstallmentsByDebtIdSupabase(debtId, userId);
  if (installments.length === 0) {
    return ApiResponse.BadRequest({
      message: "Nenhuma parcela encontrada para esta dívida.",
    });
  }

  let remainingPaymentCents = Math.round(payload.amount * 100);
  if (remainingPaymentCents <= 0) {
    return ApiResponse.BadRequest({
      message: "O valor recebido deve ser superior a zero.",
    });
  }

  // 1. Percorre as parcelas em ordem de vencimento amortizando em cascata
  for (const inst of installments) {
    if (remainingPaymentCents <= 0) break;

    const nominalCents = Math.round(Number(inst.nominal_amount) * 100);
    const paidCents = Math.round(Number(inst.paid_amount) * 100);
    const neededCents = Math.max(0, nominalCents - paidCents);

    if (neededCents <= 0) {
      // Parcela já estava totalmente paga
      continue;
    }

    const appliedCents = Math.min(remainingPaymentCents, neededCents);
    const newPaidCents = paidCents + appliedCents;
    remainingPaymentCents -= appliedCents;

    const isFullyPaid = newPaidCents >= nominalCents;
    const newStatus: InstallmentStatus = isFullyPaid ? "paid" : "partially_paid";

    await updateInstallmentSupabase(inst.id, userId, {
      paid_amount: newPaidCents / 100,
      status: newStatus,
    });
  }

  // 2. Registra o comprovante no extrato de pagamentos
  await createPaymentSupabase({
    debt_id: debtId,
    debtor_id: debt.debtor_id,
    user_id: userId,
    amount: payload.amount,
    notes: payload.notes || null,
    paid_at: payload.paid_at || new Date().toISOString(),
  });

  // 3. Verifica se todas as parcelas foram liquidadas
  const updatedInstallments = await getInstallmentsByDebtIdSupabase(debtId, userId);
  const allPaid = updatedInstallments.every((inst) => inst.status === "paid");

  if (allPaid) {
    await updateDebtStatusSupabase(debtId, userId, "settled");
  }

  return ApiResponse.Ok({
    data: {
      settled: allPaid,
      amortizedAmount: payload.amount,
    },
    message: allPaid
      ? "CANCELEM O VELÓRIO! Ele pagou tudo! Dívida honrada e liquidada com sucesso!"
      : "Milagre na praça! Caiu o Pix. As parcelas foram amortizadas com sucesso.",
  });
};

/**
 * Anotação de Caô / Desculpa do devedor com nova promessa de pagamento
 */
export const registerDebtExcuseApi = async (
  userId: string,
  payload: RegisterExcusePayload
): Promise<ResponseProps<{ excuseId: string }>> => {
  const installment = await getInstallmentByIdSupabase(payload.installment_id, userId);
  if (!installment) {
    return ApiResponse.NotFound({
      message: "Parcela não encontrada para registrar a desculpa.",
    });
  }

  const { data, error } = await createExcuseSupabase({
    installment_id: payload.installment_id,
    debtor_id: installment.debtor_id,
    user_id: userId,
    excuse_text: payload.excuse_text.trim(),
    promised_date: payload.promised_date,
  });

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: "Não foi possível anotar o caô no momento.",
      error: error || undefined,
    });
  }

  return ApiResponse.Created({
    data: { excuseId: data.id },
    message: "Caô devidamente registrado no dossiê! A contagem da nova promessa começou.",
  });
};
