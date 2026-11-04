import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/commons/lib/cache/server-cache";
import { getCalendarDateInSaoPaulo, getSecondsUntilMidnightSaoPaulo } from "@/commons/utils/date";
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
  AttachInstallmentReceiptPayload,
  AttachLoanReceiptPayload,
  DeleteDebtReceiptPayload,
  UpdateDebtPortalConfigPayload,
  UpdateDebtAgreementRulesPayload,
  UpdateDebtBreachStatusPayload,
  VerifyDebtInvoiceAccessPayload,
  DebtDetailsFormatted,
  InstallmentFormatted,
  DebtPaymentFormatted,
  DebtExcuseFormatted,
  InstallmentInsert,
  InstallmentStatus,
  DebtStatus,
  DebtBreachStatus,
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
  updateDebtAgreementRulesSupabase,
  getPublicDebtByIdSupabase,
  getPublicDebtContextByIdSupabase,
  updateDebtLoanReceiptSupabase,
  deleteDebtSupabase,
} from "../repository/debt.supabase";
import {
  createSignedReceiptUrlsSupabase,
  getCachedSignedReceiptUrlsSupabase,
  deleteReceiptFileSupabase,
} from "../repository/receipt-storage.supabase";
import {
  getUserPermissionsOrCacheApi,
  getUserPermissionsApi,
} from "@/server/account/service/subscription.api";
import { checkDebtLockedStatusApi } from "./debt-quota.api";

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
 * Calcula o estado de quebra/tolerância do acordo com base no limite de parcelas atrasadas
 */
export function computeBreachStatus(params: {
  status: string;
  isFullySettled: boolean;
  maxLateInstallments: number | null;
  lateInstallmentsCount: number;
}): DebtBreachStatus {
  if (params.isFullySettled) return "none";
  if (params.status === "defaulted") return "breached";

  if (params.maxLateInstallments !== null && params.maxLateInstallments > 0) {
    if (params.lateInstallmentsCount >= params.maxLateInstallments) {
      return "breached";
    }
    if (
      params.maxLateInstallments > 1 &&
      params.lateInstallmentsCount === params.maxLateInstallments - 1
    ) {
      return "warning";
    }
  }

  return "none";
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
  // No plano grátis (Tubarão Lixa), gatilho de quebra, exibição externa de cláusulas e comprovantes são higienizados (Zero Trust)
  const canAttach = !permissions.isFreePlan || Boolean(permissions.canAttachReceipts);
  const sanitizedLoanReceiptPath = canAttach ? payload.loan_receipt_path || null : null;
  const sanitizedMaxLateInstallments = permissions.isFreePlan
    ? null
    : payload.max_late_installments ?? null;
  const sanitizedShowNotesOnInvoice = permissions.isFreePlan
    ? false
    : Boolean(payload.show_notes_on_invoice);

  const initialAccessCode = generateRandomAccessCode();
  const { data: debt, error: debtError } = await createDebtSupabase(userId, {
    ...payload,
    max_late_installments: sanitizedMaxLateInstallments,
    show_notes_on_invoice: sanitizedShowNotesOnInvoice,
    loan_receipt_path: sanitizedLoanReceiptPath,
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
 * Consulta detalhada da dívida, montando o resumo completo para visualização.
 * Dados da dívida, parcelas e comprovantes são cacheados pelo Next.js 16 por [debtId, userId, todaySaoPaulo]
 * com revalidação on-demand. A verificação de trava de plano (checkDebtLockedStatusApi) é avaliada em tempo real.
 */
export const getDebtDetailsApi = async (
  debtId: string,
  userId: string
): Promise<ResponseProps<DebtDetailsFormatted>> => {
  const todayStr = getCalendarDateInSaoPaulo(new Date());
  const ttlSeconds = getSecondsUntilMidnightSaoPaulo();

  const getCachedDebtCore = unstable_cache(
    async (dId: string, uId: string): Promise<DebtDetailsFormatted | null> => {
      const debt = await getDebtByIdSupabase(dId, uId);
      if (!debt) return null;

      const debtor = await getDebtorByIdSupabase(debt.debtor_id, uId);
      if (!debtor) return null;

      const [installmentsRaw, paymentsRaw] = await Promise.all([
        getInstallmentsByDebtIdSupabase(dId, uId),
        getPaymentsByDebtIdSupabase(dId, uId),
      ]);

      // Coleta todos os caminhos de comprovantes para assinar URLs em lote único
      const receiptPathsToSign: string[] = [];
      if (debt.loan_receipt_path) receiptPathsToSign.push(debt.loan_receipt_path);
      for (const inst of installmentsRaw) {
        if (inst.receipt_path) receiptPathsToSign.push(inst.receipt_path);
      }
      for (const pay of paymentsRaw) {
        if (pay.receipt_path) receiptPathsToSign.push(pay.receipt_path);
      }

      const signedUrlsMap = await getCachedSignedReceiptUrlsSupabase(
        dId,
        receiptPathsToSign,
        [CACHE_TAGS.debtDetails(dId), CACHE_TAGS.debtReceipts(dId)]
      );

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
          receiptUrl: inst.receipt_path ? signedUrlsMap.get(inst.receipt_path) || null : null,
          excuses: excusesByInstallment.get(inst.id) || [],
        };
      });

      // Tratamento e formatação de pagamentos (Pix recebidos)
      const paymentsFormatted: DebtPaymentFormatted[] = paymentsRaw.map((payment) => ({
        ...payment,
        receiptUrl: payment.receipt_path ? signedUrlsMap.get(payment.receipt_path) || null : null,
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
        defaulted: { label: "Quebra de Acordo / Calote", badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
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

      const maxLateInstallments =
        debt.max_late_installments !== undefined && debt.max_late_installments !== null
          ? Number(debt.max_late_installments)
          : null;
      const showNotesOnInvoice = Boolean(debt.show_notes_on_invoice);
      const breachStatus = computeBreachStatus({
        status: debt.status,
        isFullySettled,
        maxLateInstallments,
        lateInstallmentsCount,
      });

      return {
        ...debt,
        publicLinkEnabled: Boolean(debt.public_link_enabled),
        publicAccessCode: debt.public_access_code || "",
        maxLateInstallments,
        showNotesOnInvoice,
        breachStatus,
        isLocked: false,
        lockedReason: undefined,
        loanReceiptUrl: debt.loan_receipt_path ? signedUrlsMap.get(debt.loan_receipt_path) || null : null,
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
    },
    ["debt-details-data", debtId, userId, todayStr],
    {
      revalidate: ttlSeconds,
      tags: [CACHE_TAGS.userData(userId), CACHE_TAGS.debtDetails(debtId)],
    }
  );

  const cachedData = await getCachedDebtCore(debtId, userId);
  if (!cachedData) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada no tanque deste Tubarão.",
    });
  }

  // Avaliação 100% dinâmica em tempo real de status de trava/jaula da assinatura
  const lockStatus = await checkDebtLockedStatusApi(debtId, userId);

  const formattedData: DebtDetailsFormatted = {
    ...cachedData,
    isLocked: lockStatus.isLocked,
    lockedReason: lockStatus.reason,
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
): Promise<ResponseProps<{ settled: boolean; amortizedAmount: number; debtorId: string }>> => {
  const lockStatus = await checkDebtLockedStatusApi(debtId, userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

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
  const permissions = await getUserPermissionsOrCacheApi(userId);
  const canAttach = !permissions.isFreePlan || Boolean(permissions.canAttachReceipts);
  const sanitizedReceiptPath = canAttach ? payload.receipt_path || null : null;

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
      receipt_path: sanitizedReceiptPath || inst.receipt_path,
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
    receipt_path: sanitizedReceiptPath,
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
      debtorId: debt.debtor_id,
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
): Promise<
  ResponseProps<{ excuseId: string; debtId: string; debtorId: string }>
> => {
  const installment = await getInstallmentByIdSupabase(payload.installment_id, userId);
  if (!installment) {
    return ApiResponse.NotFound({
      message: "Parcela não encontrada para registrar a desculpa.",
    });
  }

  const lockStatus = await checkDebtLockedStatusApi(installment.debt_id, userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
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
    data: {
      excuseId: data.id,
      debtId: installment.debt_id,
      debtorId: installment.debtor_id,
    },
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
  const lockStatus = await checkDebtLockedStatusApi(payload.debtId, payload.userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

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

  const [permissions, lockStatus] = await Promise.all([
    getUserPermissionsApi(debt.user_id),
    checkDebtLockedStatusApi(debt.id, debt.user_id),
  ]);

  if (!permissions.canDebtorPortal || lockStatus.isLocked) {
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

  const [permissions, lockStatus] = await Promise.all([
    getUserPermissionsApi(debt.user_id),
    checkDebtLockedStatusApi(debt.id, debt.user_id),
  ]);

  if (!permissions.canDebtorPortal || lockStatus.isLocked) {
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

  // Assina URLs de comprovantes para exibição segura na fatura pública
  const receiptPathsToSign: string[] = [];
  if (debt.loan_receipt_path) receiptPathsToSign.push(debt.loan_receipt_path);
  for (const inst of context.installments) {
    if (inst.receipt_path) receiptPathsToSign.push(inst.receipt_path);
  }
  const signedUrlsMap = await createSignedReceiptUrlsSupabase(receiptPathsToSign);

  let paidInstallmentsCount = 0;
  let lateInstallmentsCount = 0;
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
    if (computedStatus === "late" || (isLate && !isPaid)) lateInstallmentsCount++;

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
      receiptUrl: inst.receipt_path ? signedUrlsMap.get(inst.receipt_path) || null : null,
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

  const maxLateInstallments =
    debt.max_late_installments !== undefined && debt.max_late_installments !== null
      ? Number(debt.max_late_installments)
      : null;
  const breachStatus = computeBreachStatus({
    status: debt.status,
    isFullySettled,
    maxLateInstallments,
    lateInstallmentsCount,
  });
  const publicNotes =
    Boolean(debt.show_notes_on_invoice) && debt.notes && debt.notes.trim().length > 0
      ? debt.notes.trim()
      : null;

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
    statusLabel: isFullySettled
      ? "Acordo Quitado"
      : debt.status === "defaulted"
      ? "Acordo em Quebra"
      : "Acordo em Andamento",
    isFullySettled,
    paidInstallmentsCount,
    totalInstallmentsCount: installmentsFormatted.length,
    remainingInstallmentsCount,
    lateInstallmentsCount,
    maxLateInstallments,
    breachStatus,
    publicNotes,
    nextInstallment,
    installments: installmentsFormatted,
    payments: paymentsFormatted,
  };

  return ApiResponse.Ok({
    data: viewData,
    message: "Fatura carregada com sucesso.",
  });
};

/**
 * Atualiza as cláusulas/regras do acordo (notes), o gatilho de tolerância de atraso e a visibilidade na fatura pública
 * Exclusivo para planos pagos (Tubarão Branco e Tubarão Cabeça Chato)
 */
export const updateDebtAgreementRulesApi = async (
  payload: UpdateDebtAgreementRulesPayload
): Promise<
  ResponseProps<{
    notes: string | null;
    maxLateInstallments: number | null;
    showNotesOnInvoice: boolean;
  }>
> => {
  const lockStatus = await checkDebtLockedStatusApi(payload.debtId, payload.userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

  const permissions = await getUserPermissionsOrCacheApi(payload.userId);
  if (permissions.isFreePlan) {
    return ApiResponse.Forbidden({
      message:
        "Cláusulas do acordo e gatilho de quebra são exclusivos dos planos Tubarão Branco e Tubarão Cabeça Chato! Faça o upgrade para blindar seus combinados.",
      error: "PLAN_NOT_ALLOWED",
    });
  }

  const debt = await getDebtByIdSupabase(payload.debtId, payload.userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada na gruta deste Tubarão.",
    });
  }

  const cleanNotes = payload.notes ? payload.notes.trim() || null : null;
  const maxLate =
    payload.maxLateInstallments && payload.maxLateInstallments >= 1
      ? Math.min(debt.installments_count, payload.maxLateInstallments)
      : null;

  const { data: updated, error } = await updateDebtAgreementRulesSupabase({
    debtId: payload.debtId,
    userId: payload.userId,
    notes: cleanNotes,
    maxLateInstallments: maxLate,
    showNotesOnInvoice: Boolean(payload.showNotesOnInvoice),
  });

  if (error || !updated) {
    return ApiResponse.BadRequest({
      message: "Não foi possível atualizar as cláusulas e o gatilho de quebra do acordo.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: {
      notes: updated.notes || null,
      maxLateInstallments:
        updated.max_late_installments !== undefined && updated.max_late_installments !== null
          ? Number(updated.max_late_installments)
          : null,
      showNotesOnInvoice: Boolean(updated.show_notes_on_invoice),
    },
    message: "Cláusulas e gatilho de quebra do acordo atualizados com sucesso!",
  });
};

/**
 * Declara ou reverte a Quebra de Acordo (status 'defaulted' <-> 'pending')
 * Exclusivo para planos pagos (Tubarão Branco e Tubarão Cabeça Chato)
 */
export const updateDebtBreachStatusApi = async (
  payload: UpdateDebtBreachStatusPayload
): Promise<ResponseProps<{ status: DebtStatus }>> => {
  const lockStatus = await checkDebtLockedStatusApi(payload.debtId, payload.userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

  const permissions = await getUserPermissionsOrCacheApi(payload.userId);
  if (permissions.isFreePlan) {
    return ApiResponse.Forbidden({
      message:
        "A declaração formal de Quebra de Acordo é exclusiva dos planos Tubarão Branco e Tubarão Cabeça Chato!",
      error: "PLAN_NOT_ALLOWED",
    });
  }

  const debt = await getDebtByIdSupabase(payload.debtId, payload.userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada na gruta deste Tubarão.",
    });
  }

  if (debt.status === "settled") {
    return ApiResponse.BadRequest({
      message: "Esta dívida já foi quitada e honrada.",
    });
  }

  const targetStatus: DebtStatus = payload.isBreached ? "defaulted" : "pending";
  const { success, error } = await updateDebtStatusSupabase(
    payload.debtId,
    payload.userId,
    targetStatus
  );

  if (!success || error) {
    return ApiResponse.BadRequest({
      message: "Não foi possível alterar o status de quebra do acordo.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: { status: targetStatus },
    message: payload.isBreached
      ? "Quebra de acordo declarada! Dívida marcada como Quebra de Acordo / Calote."
      : "Acordo reaberto e retornado para acompanhamento normal.",
  });
};

/**
 * Anexa ou substitui o comprovante de uma parcela específica (exclusivo para planos pagos)
 */
export const attachInstallmentReceiptApi = async (
  userId: string,
  payload: AttachInstallmentReceiptPayload
): Promise<ResponseProps<{ success: boolean; installmentId: string }>> => {
  const lockStatus = await checkDebtLockedStatusApi(payload.debtId, userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

  // 1. Verificação de permissões do plano (Planos pagos)
  const permissions = await getUserPermissionsOrCacheApi(userId);
  const canAttach = !permissions.isFreePlan || Boolean(permissions.canAttachReceipts);

  if (!canAttach) {
    return ApiResponse.Forbidden({
      message:
        "O anexo de comprovantes é exclusivo dos planos Tubarão Branco e Tubarão Cabeça Chato! Faça o upgrade para liberar.",
      error: "RECEIPTS_NOT_ALLOWED_ON_PLAN",
    });
  }

  // 2. Busca a parcela para verificar existência e isolamento por usuário
  const installment = await getInstallmentByIdSupabase(payload.installmentId, userId);
  if (!installment) {
    return ApiResponse.NotFound({
      message: "Parcela não encontrada ou não pertence a este Tubarão.",
    });
  }

  if (installment.debt_id !== payload.debtId) {
    return ApiResponse.BadRequest({
      message: "Esta parcela não pertence à dívida indicada.",
    });
  }

  // 3. Atualiza o comprovante da parcela
  const { success, error } = await updateInstallmentSupabase(payload.installmentId, userId, {
    receipt_path: payload.receipt_path.trim(),
  });

  if (!success || error) {
    return ApiResponse.InternalError({
      message: "Erro ao anexar comprovante à parcela.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: {
      success: true,
      installmentId: payload.installmentId,
    },
    message: "Comprovante anexado à parcela com sucesso!",
  });
};

/**
 * Anexa ou substitui o comprovante da transferência inicial (Pix do Tubarão) em uma dívida existente
 * Exclusivo para planos pagos (Tubarão Branco e Tubarão Cabeça Chato)
 */
export const attachLoanReceiptApi = async (
  userId: string,
  payload: AttachLoanReceiptPayload
): Promise<ResponseProps<{ success: boolean; debtId: string }>> => {
  const lockStatus = await checkDebtLockedStatusApi(payload.debtId, userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

  // 1. Verificação de permissões do plano (Planos pagos)
  const permissions = await getUserPermissionsOrCacheApi(userId);
  const canAttach = !permissions.isFreePlan || Boolean(permissions.canAttachReceipts);

  if (!canAttach) {
    return ApiResponse.Forbidden({
      message:
        "O anexo de comprovantes é exclusivo dos planos Tubarão Branco e Tubarão Cabeça Chato! Faça o upgrade para liberar.",
      error: "RECEIPTS_NOT_ALLOWED_ON_PLAN",
    });
  }

  // 2. Busca a dívida para verificar existência e isolamento por usuário
  const debt = await getDebtByIdSupabase(payload.debtId, userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada na gruta deste Tubarão.",
    });
  }

  // 3. Atualiza o comprovante inicial da dívida
  const { success, error } = await updateDebtLoanReceiptSupabase({
    debtId: payload.debtId,
    userId,
    receiptPath: payload.receipt_path.trim(),
  });

  if (!success || error) {
    return ApiResponse.InternalError({
      message: "Erro ao anexar comprovante de transferência à dívida.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: {
      success: true,
      debtId: payload.debtId,
    },
    message: "Comprovante do empréstimo salvo na gruta com sucesso!",
  });
};

/**
 * Exclui o comprovante físico do storage e limpa o registro da dívida ou parcela no banco
 */
export const deleteDebtReceiptApi = async (
  userId: string,
  payload: DeleteDebtReceiptPayload
): Promise<ResponseProps<{ success: boolean; debtId: string }>> => {
  const lockStatus = await checkDebtLockedStatusApi(payload.debtId, userId);
  if (lockStatus.isLocked) {
    return ApiResponse.Forbidden({
      message:
        lockStatus.reason ||
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual.",
      error: "DEBT_LOCKED_BY_PLAN",
    });
  }

  if (payload.target === "loan") {
    const debt = await getDebtByIdSupabase(payload.debtId, userId);
    if (!debt) {
      return ApiResponse.NotFound({
        message: "Dívida não encontrada na gruta deste Tubarão.",
      });
    }

    if (debt.loan_receipt_path) {
      await deleteReceiptFileSupabase(debt.loan_receipt_path);
    }

    const { success, error } = await updateDebtLoanReceiptSupabase({
      debtId: payload.debtId,
      userId,
      receiptPath: null,
    });

    if (!success || error) {
      return ApiResponse.InternalError({
        message: "Erro ao remover comprovante da dívida.",
        error: error || undefined,
      });
    }

    return ApiResponse.Ok({
      data: { success: true, debtId: payload.debtId },
      message: "Comprovante de empréstimo excluído da gruta com sucesso!",
    });
  }

  // target === 'installment'
  if (!payload.installmentId) {
    return ApiResponse.BadRequest({
      message: "Identificador da parcela obrigatório para exclusão do comprovante.",
    });
  }

  const installment = await getInstallmentByIdSupabase(payload.installmentId, userId);
  if (!installment) {
    return ApiResponse.NotFound({
      message: "Parcela não encontrada ou não pertence a este Tubarão.",
    });
  }

  if (installment.debt_id !== payload.debtId) {
    return ApiResponse.BadRequest({
      message: "Esta parcela não pertence à dívida indicada.",
    });
  }

  if (installment.receipt_path) {
    await deleteReceiptFileSupabase(installment.receipt_path);
  }

  const { success, error } = await updateInstallmentSupabase(payload.installmentId, userId, {
    receipt_path: null,
  });

  if (!success || error) {
    return ApiResponse.InternalError({
      message: "Erro ao remover comprovante da parcela.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: { success: true, debtId: payload.debtId },
    message: "Comprovante da parcela excluído com sucesso!",
  });
};

/**
 * Remove uma dívida da gruta (e suas parcelas em cascata)
 * A exclusão é sempre permitida e libera espaço para promover automaticamente outra dívida
 */
export const deleteDebtApi = async (
  debtId: string,
  userId: string
): Promise<ResponseProps<{ deleted: boolean; debtorId: string }>> => {
  const debt = await getDebtByIdSupabase(debtId, userId);
  if (!debt) {
    return ApiResponse.NotFound({
      message: "Dívida não encontrada na gruta deste Tubarão.",
    });
  }

  const { success, error } = await deleteDebtSupabase(debtId, userId);
  if (!success) {
    return ApiResponse.BadRequest({
      message: "Não foi possível remover a dívida no momento.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: { deleted: true, debtorId: debt.debtor_id },
    message: "Dívida removida da gruta com sucesso.",
  });
};


