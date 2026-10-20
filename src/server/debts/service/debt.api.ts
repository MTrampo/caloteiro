import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { ResponseProps } from "@/commons/models/api";
import {
  formatBRL,
  formatDate,
  formatDateTime,
  formatProperName,
  presentDebtorItem,
} from "@/commons/utils/format";
import { formatRelativeDueDate } from "@/commons/utils/date-formatter";
import { getDebtorByIdSupabase } from "@/server/debtors/repository/debtor.supabase";
import type {
  CreateDebtPayload,
  RegisterPaymentPayload,
  RegisterExcusePayload,
  UpdateDebtPortalConfigPayload,
  VerifyDebtInvoiceAccessPayload,
  DebtDetailsFormatted,
  InstallmentFormatted,
  DebtPaymentFormatted,
  DebtExcuseFormatted,
  InstallmentInsert,
  InstallmentStatus,
  DebtStatus,
  InterestType,
  PublicDebtInvoiceViewData,
  PublicInstallmentItem,
  PublicDebtPaymentItem,
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
  updateDebtPortalConfigSupabase,
  getPublicDebtByIdSupabase,
  getPublicDebtContextByIdSupabase,
} from "../repository/debt.supabase";
import {
  getUserPermissionsOrCacheApi,
  getUserPermissionsApi,
} from "@/server/account/service/subscription.api";

const ACCESS_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Gera um código de acesso aleatório legível de 6 caracteres (sem caracteres ambíguos como 0/O ou 1/I)
 */
export function generateRandomAccessCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ACCESS_CODE_CHARS.length);
    code += ACCESS_CODE_CHARS[randomIndex];
  }
  return code;
}

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

  // 4. Persistência do cabeçalho da dívida (com código de acesso aleatório e link desabilitado por padrão)
  const initialAccessCode = generateRandomAccessCode();
  const { data: debt, error: debtError } = await createDebtSupabase(userId, {
    ...payload,
    public_link_enabled: false,
    public_access_code: initialAccessCode,
  });
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
 * Consulta detalhada da dívida, montando o resumo completo para visualização
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

  const originalAmount = Number(debt.original_amount) || 0;
  const totalDebtAmount = Number(debt.total_amount || debt.original_amount) || 0;
  const totalInterestAmount = Math.max(0, Math.round((totalDebtAmount - originalAmount) * 100) / 100);
  const hasInterest = totalInterestAmount > 0;

  // O saldo restante na pista reflete o compromisso total contratado (com juros) menos o amortizado
  const remainingAmount = Math.max(0, Math.round((totalDebtAmount - totalAmortized) * 100) / 100);
  const progressPercentage = totalDebtAmount > 0
    ? Math.min(100, Math.round((totalAmortized / totalDebtAmount) * 100))
    : 0;

  const remainingInstallmentsCount = Math.max(0, installmentsFormatted.length - paidInstallmentsCount);
  const formattedTotalInterestAmount = totalInterestAmount > 0
    ? `+ ${formatBRL(totalInterestAmount)}`
    : formatBRL(0);

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
    publicLinkEnabled: Boolean(debt.public_link_enabled),
    publicAccessCode: debt.public_access_code || "",
    formattedOriginalAmount: formatBRL(originalAmount),
    formattedTotalAmount: formatBRL(totalDebtAmount),
    formattedPaidAmount: formatBRL(totalAmortized),
    formattedRemainingAmount: formatBRL(remainingAmount),
    totalInterestAmount,
    formattedTotalInterestAmount,
    hasInterest,
    remainingInstallmentsCount,
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
    message: "Detalhes da dívida carregados.",
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
    message: "Caô devidamente registrado! A contagem da nova promessa começou.",
  });
};

/**
 * Configura o Link Público da Fatura (/fatura/[id]) e o Código de Acesso pelo Tubarão
 * Exclusivo para planos Tubarão Branco e Tubarão Cabeça Chato (canDebtorPortal)
 */
export const updateDebtPortalConfigApi = async (
  payload: UpdateDebtPortalConfigPayload
): Promise<ResponseProps<{ publicLinkEnabled: boolean; publicAccessCode: string }>> => {
  const permissions = await getUserPermissionsOrCacheApi(payload.userId);
  if (!permissions.canDebtorPortal) {
    return ApiResponse.Forbidden({
      message:
        "O Link da Fatura para a presa é exclusivo a partir do plano Tubarão Branco! Faça o upgrade para liberar o acompanhamento externo.",
      error: "PLAN_NOT_ALLOWED",
    });
  }

  const debt = await getDebtByIdSupabase(payload.debtId, payload.userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada na gruta deste Tubarão.",
    });
  }

  let finalCode = (debt.public_access_code || "").trim().toUpperCase();
  if (payload.regenerateCode) {
    finalCode = generateRandomAccessCode();
  } else if (payload.publicAccessCode !== undefined) {
    finalCode = payload.publicAccessCode.trim().toUpperCase();
  }

  if (!finalCode || finalCode.length < 4 || finalCode.length > 16) {
    finalCode = generateRandomAccessCode();
  }

  const { data: updated, error } = await updateDebtPortalConfigSupabase({
    debtId: payload.debtId,
    userId: payload.userId,
    publicLinkEnabled: payload.publicLinkEnabled,
    publicAccessCode: finalCode,
  });

  if (error || !updated) {
    return ApiResponse.BadRequest({
      message: "Não foi possível atualizar a configuração do link da fatura.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: {
      publicLinkEnabled: Boolean(updated.public_link_enabled),
      publicAccessCode: updated.public_access_code || finalCode,
    },
    message: payload.regenerateCode
      ? "Novo código de acesso gerado com sucesso!"
      : updated.public_link_enabled
      ? "Link da fatura habilitado e atualizado!"
      : "Link da fatura desabilitado.",
  });
};

/**
 * Verifica se o link público da fatura existe e está habilitado (sem expor nenhum dado sensível)
 */
export const checkPublicDebtGateApi = async (
  debtId: string
): Promise<ResponseProps<{ available: boolean }>> => {
  const debt = await getPublicDebtByIdSupabase(debtId);
  if (!debt || !debt.public_link_enabled) {
    return ApiResponse.NotFound({
      message: "Esta fatura está desativada ou não existe.",
    });
  }

  const permissions = await getUserPermissionsApi(debt.user_id);
  if (!permissions.canDebtorPortal) {
    return ApiResponse.Forbidden({
      message: "Este link de fatura não está ativo no momento.",
    });
  }

  return ApiResponse.Ok({
    data: { available: true },
    message: "Fatura protegida disponível para desbloqueio.",
  });
};

/**
 * Valida o código de acesso informado pelo devedor para liberar a visualização da fatura
 */
export const verifyPublicDebtInvoiceAccessApi = async (
  payload: VerifyDebtInvoiceAccessPayload
): Promise<ResponseProps<{ verified: boolean; normalizedCode: string }>> => {
  const debt = await getPublicDebtByIdSupabase(payload.debtId);
  if (!debt || !debt.public_link_enabled) {
    return ApiResponse.NotFound({
      message: "Esta fatura está desativada ou não existe.",
    });
  }

  const permissions = await getUserPermissionsApi(debt.user_id);
  if (!permissions.canDebtorPortal) {
    return ApiResponse.Forbidden({
      message: "Este link de fatura não está disponível no plano atual do credor.",
    });
  }

  const expectedCode = (debt.public_access_code || "").trim().toUpperCase();
  const providedCode = (payload.accessCode || "").trim().toUpperCase();

  if (!expectedCode || providedCode !== expectedCode) {
    return ApiResponse.Unauthorized({
      message: "Código de acesso incorreto. Confira o código enviado pelo credor.",
    });
  }

  return ApiResponse.Ok({
    data: {
      verified: true,
      normalizedCode: expectedCode,
    },
    message: "Acesso liberado com sucesso!",
  });
};

/**
 * Carrega os dados públicos sanitizados da fatura após validação do código de acesso
 * GARANTIA ZERO LEAK: Nunca retorna notes, excuses, document, address ou relacionamento interno.
 */
export const getPublicDebtInvoiceDataApi = async (
  payload: VerifyDebtInvoiceAccessPayload
): Promise<ResponseProps<PublicDebtInvoiceViewData>> => {
  const verification = await verifyPublicDebtInvoiceAccessApi(payload);
  if (verification.status !== 200 || !verification.data?.verified) {
    return {
      status: verification.status,
      message: verification.message,
      error: verification.error,
      data: null,
    };
  }

  const debt = await getPublicDebtByIdSupabase(payload.debtId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Fatura não encontrada.",
    });
  }

  const context = await getPublicDebtContextByIdSupabase(debt);
  if (!context) {
    return ApiResponse.NotFound({
      message: "Não foi possível carregar os detalhes desta fatura.",
    });
  }

  let paidInstallmentsCount = 0;
  let totalAmortized = 0;

  const installmentsFormatted: PublicInstallmentItem[] = context.installments.map((inst) => {
    const nominal = Number(inst.nominal_amount);
    const paid = Number(inst.paid_amount);
    const remaining = Math.max(0, Math.round((nominal - paid) * 100) / 100);
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

    const statusMeta = {
      pending: { label: "A Vencer", badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700" },
      late: { label: "Em Atraso", badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
      partially_paid: { label: "Parcialmente Paga", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      paid: { label: "Liquidada", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    }[computedStatus];

    const relativeInfo = formatRelativeDueDate(inst.due_date);
    let relativeDueDateLabel = relativeInfo.formatted;
    if (isPaid) {
      relativeDueDateLabel = "Parcela quitada";
    } else if (relativeInfo.isToday) {
      relativeDueDateLabel = "Vence hoje";
    } else if (relativeInfo.isPast) {
      relativeDueDateLabel =
        Math.abs(relativeInfo.daysDifference) === 1
          ? "Venceu ontem"
          : `Venceu há ${Math.abs(relativeInfo.daysDifference)} dias`;
    } else {
      relativeDueDateLabel =
        relativeInfo.daysDifference === 1
          ? "Vence amanhã"
          : `Faltam ${relativeInfo.daysDifference} dias`;
    }

    return {
      id: inst.id,
      installmentNumber: inst.installment_number,
      nominalAmount: nominal,
      paidAmount: paid,
      remainingAmount: remaining,
      formattedNominalAmount: formatBRL(nominal),
      formattedPaidAmount: formatBRL(paid),
      formattedRemainingAmount: formatBRL(remaining),
      dueDate: inst.due_date,
      formattedDueDate: formatDate(inst.due_date),
      relativeDueDateLabel,
      status: computedStatus,
      statusLabel: statusMeta.label,
      statusBadgeClass: statusMeta.badgeClass,
      isLate: isLate && !isPaid,
      lateDays: isLate && !isPaid ? lateDays : 0,
    };
  });

  const nextInstallment =
    installmentsFormatted.find((inst) => inst.status !== "paid" && inst.remainingAmount > 0) || null;

  const paymentsFormatted: PublicDebtPaymentItem[] = context.payments.map((payment) => ({
    id: payment.id,
    amount: Number(payment.amount),
    formattedAmount: formatBRL(Number(payment.amount)),
    paidAt: payment.paid_at,
    formattedPaidAt: formatDateTime(payment.paid_at),
  }));

  const originalAmount = Number(debt.original_amount) || 0;
  const totalDebtAmount = Number(debt.total_amount || debt.original_amount) || 0;
  const totalInterestAmount = Math.max(0, Math.round((totalDebtAmount - originalAmount) * 100) / 100);
  const hasInterest = totalInterestAmount > 0;
  const remainingAmount = Math.max(0, Math.round((totalDebtAmount - totalAmortized) * 100) / 100);
  const progressPercentage =
    totalDebtAmount > 0 ? Math.min(100, Math.round((totalAmortized / totalDebtAmount) * 100)) : 0;

  const isFullySettled = remainingAmount <= 0 || debt.status === "settled";
  const remainingInstallmentsCount = Math.max(0, installmentsFormatted.length - paidInstallmentsCount);

  const interestType = (debt.interest_type || "none") as InterestType;
  let interestLabel = "Sem juros (na parceria)";
  if (interestType === "fixed") {
    interestLabel = `Taxa Fixa (+${formatBRL(Number(debt.interest_rate || 0))})`;
  } else if (interestType === "total_percentage") {
    interestLabel = `${Number(debt.interest_rate || 0)}% sobre o total`;
  } else if (interestType === "monthly_percentage") {
    interestLabel = `${Number(debt.interest_rate || 0)}% ao mês`;
  }

  const properDebtorName = formatProperName(context.debtorName);
  const debtorFirstName = properDebtorName.split(" ")[0] || properDebtorName;
  const creditorDisplayName = formatProperName(
    context.creditorNickname || context.creditorName || "Credor"
  );

  const whatsAppMessage = nextInstallment
    ? `Oi ${creditorDisplayName}! Acabei de fazer o Pix referente à parcela ${nextInstallment.installmentNumber}/${installmentsFormatted.length} (${nextInstallment.formattedRemainingAmount}) do acordo "${debt.title}". Segue o comprovante!`
    : `Oi ${creditorDisplayName}! Acabei de fazer o Pix referente ao acordo "${debt.title}". Segue o comprovante!`;

  const cleanCreditorPhone = (context.creditorPhone || "").replace(/\D/g, "");
  const creditorWhatsAppUrl = cleanCreditorPhone
    ? `https://wa.me/55${cleanCreditorPhone}?text=${encodeURIComponent(whatsAppMessage)}`
    : null;

  const paymentMethodMap: Record<string, string> = {
    pix: "Pix",
    cash: "Dinheiro",
    transfer: "Transferência Bancária",
    card: "Cartão",
  };

  const viewData: PublicDebtInvoiceViewData = {
    debtId: debt.id,
    title: debt.title,
    categoryLabel: (DEBT_CATEGORY_LABELS as Record<string, string>)[debt.category] || "Acordo",
    debtorFirstName,
    creditorDisplayName,
    creditorPhone: context.creditorPhone,
    creditorWhatsAppUrl,
    pixKey: context.pixKey,
    pixKeyType: context.pixKeyType,
    pixHolderName: context.pixHolderName,
    pixBankName: context.pixBankName,
    originalAmount,
    totalAmount: totalDebtAmount,
    paidAmount: Math.round(totalAmortized * 100) / 100,
    remainingAmount,
    totalInterestAmount,
    formattedOriginalAmount: formatBRL(originalAmount),
    formattedTotalAmount: formatBRL(totalDebtAmount),
    formattedPaidAmount: formatBRL(totalAmortized),
    formattedRemainingAmount: formatBRL(remainingAmount),
    formattedTotalInterestAmount: hasInterest ? `+ ${formatBRL(totalInterestAmount)}` : "R$ 0,00",
    hasInterest,
    interestLabel,
    progressPercentage,
    formattedLoanDate: formatDate(debt.loan_date),
    formattedFirstDueDate: formatDate(debt.first_due_date),
    paymentMethodLabel: paymentMethodMap[debt.payment_method] || "Pix",
    status: (isFullySettled ? "settled" : debt.status) as DebtStatus,
    statusLabel: isFullySettled ? "Acordo Quitado" : "Acordo em Andamento",
    isFullySettled,
    paidInstallmentsCount,
    totalInstallmentsCount: installmentsFormatted.length,
    remainingInstallmentsCount,
    nextInstallment,
    installments: installmentsFormatted,
    payments: paymentsFormatted,
  };

  return ApiResponse.Ok({
    data: viewData,
    message: "Fatura carregada com sucesso.",
  });
};

