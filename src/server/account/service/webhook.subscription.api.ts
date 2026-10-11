import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { InvoiceInsertPayload } from "@/commons/models/payment";
import type { Subscription } from "@/commons/models/subscription";
import { getPreapprovalApi, getAuthorizedPaymentApi } from "@/server/payment/service/payment.api";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { InvoiceResponse } from "mercadopago/dist/clients/invoice/commonTypes";
import { toIsoOrNull } from "@/commons/utils/helper";
import { formatCurrencyBRL, formatDate } from "@/commons/utils/format";
import {
  sendWelcomeSubscriptionEmailApi,
  sendRenewalSuccessEmailApi,
  sendRenewalFailedEmailApi,
  sendCancellationEmailApi,
} from "@/server/email";
import {
  webhookGetSubscriptionByIdSupabase,
  webhookGetSubscriptionByPayerEmailSupabase,
  webhookSyncSubscriptionSupabase,
  webhookGetSubscriptionByMpSubscriptionIdSupabase,
  webhookUpsertInvoiceSupabase,
} from "../repository/webhook.subscription.supabase";
import { internalSupabase } from "@/commons/lib/supabase/internal";

const webhookUpdateSubscriptionPreapprovalApi = async (preapproval: PreApprovalResponse) => {
  let subscription: Subscription | null = null;
  const subscriptionId = preapproval.external_reference;

  if (subscriptionId) {
    subscription = await webhookGetSubscriptionByIdSupabase(subscriptionId) as Subscription | null;
  }

  if (!subscription && preapproval.payer_email) {
    subscription = await webhookGetSubscriptionByPayerEmailSupabase(preapproval.payer_email) as Subscription | null;
  }

  if (!subscription && preapproval.id) {
    subscription = await webhookGetSubscriptionByMpSubscriptionIdSupabase(preapproval.id) as Subscription | null;
  }

  if (!subscription) {
    console.warn(`[WEBHOOK:updatePreapproval] Assinatura local não encontrada para preapproval: ${preapproval.id}`);
    return null;
  }

  const payload: Partial<Subscription> = {
    mp_subscription_id: preapproval.id,
    mp_payer_id: preapproval.payer_id ? Number(preapproval.payer_id) : null,
    mp_payer_email: preapproval.payer_email,
    mp_status: preapproval.status,
    current_period_end: toIsoOrNull(preapproval.next_payment_date),
  };

  const previousStatus = subscription.mp_status;
  const nextStatus = preapproval.status;

  const updateResult = await webhookSyncSubscriptionSupabase(payload, subscription.id);

  // Disparo de E-mails transacionais via Resend
  const targetEmail = preapproval.payer_email || subscription.mp_payer_email;
  if (targetEmail) {
    // Buscar nome do tubarão no profile
    const supabase = internalSupabase();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", subscription.user_id)
      .maybeSingle();

    const recipientName = profile?.name || "Tubarão";

    // 1. Boas-vindas na primeira autorização
    if (nextStatus === "authorized" && previousStatus !== "authorized") {
      void sendWelcomeSubscriptionEmailApi(targetEmail, {
        recipientName,
        planName: "Central Caloteiro",
        trialDays: 7,
        currentPeriodEnd: formatDate(preapproval.next_payment_date),
      });
    }
    // 2. Cancelamento
    else if (nextStatus === "cancelled" && previousStatus !== "cancelled") {
      void sendCancellationEmailApi(targetEmail, {
        recipientName,
        planName: "Central Caloteiro",
        accessUntil: formatDate(subscription.current_period_end || preapproval.next_payment_date),
      });
    }
  }

  return updateResult;
};

const webhookSaveInvoiceFromAuthorizedPaymentApi = async (authorizedPayment: InvoiceResponse) => {
  try {
    const preapprovalId = authorizedPayment.preapproval_id;
    if (!preapprovalId) {
      return ApiResponse.BadRequest({
        message: "preapproval_id ausente no authorized_payment",
      });
    }

    const subscription = await webhookGetSubscriptionByMpSubscriptionIdSupabase(preapprovalId) as Subscription | null;
    if (!subscription) {
      return ApiResponse.NotFound({
        message: `Assinatura local não encontrada para preapproval_id: ${preapprovalId}`,
      });
    }

    const paymentStatus = authorizedPayment.payment?.status ?? authorizedPayment.status ?? "pending";

    const payload: InvoiceInsertPayload = {
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      mp_invoice_id: String(authorizedPayment.id || ""),
      mp_subscription_id: authorizedPayment.preapproval_id || null,
      amount: authorizedPayment.transaction_amount ?? 0,
      currency: authorizedPayment.currency_id ?? "BRL",
      status: paymentStatus,
      paid_at: toIsoOrNull(authorizedPayment.debit_date),
      raw_payload: JSON.parse(JSON.stringify(authorizedPayment)),
    };

    const { data, error } = await webhookUpsertInvoiceSupabase(payload);

    if (error) {
      return ApiResponse.InternalError({
        message: "Falha ao salvar fatura no banco de dados",
        error: error.message,
      });
    }

    // Notificações por e-mail de renovação
    const targetEmail = subscription.mp_payer_email;
    if (targetEmail) {
      const supabase = internalSupabase();
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", subscription.user_id)
        .maybeSingle();

      const recipientName = profile?.name || "Tubarão";
      const amountFormatted = formatCurrencyBRL(authorizedPayment.transaction_amount ?? subscription.base_value ?? 0);

      if (paymentStatus === "approved") {
        void sendRenewalSuccessEmailApi(targetEmail, {
          recipientName,
          planName: "Central Caloteiro",
          amountFormatted,
          nextPaymentDate: formatDate(authorizedPayment.debit_date || authorizedPayment.date_created),
        });
      } else if (paymentStatus === "rejected") {
        void sendRenewalFailedEmailApi(targetEmail, {
          recipientName,
          planName: "Central Caloteiro",
          amountFormatted,
          reason: "Cartão não autorizado pela operadora",
        });
      }
    }

    return ApiResponse.Ok({
      message: "Fatura registrada com sucesso",
      data,
    });
  } catch (error) {
    return ApiResponse.InternalError({
      message: "Erro ao processar fatura",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const webhookSubscriptionPreapprovalApi = async (preapprovalId: string) => {
  try {
    const preapprovalResult = await getPreapprovalApi(preapprovalId);
    if (preapprovalResult.error || !preapprovalResult.data) {
      return ApiResponse.InternalError({
        message: preapprovalResult.message,
        error: preapprovalResult.error,
      });
    }

    const updated = await webhookUpdateSubscriptionPreapprovalApi(preapprovalResult.data);
    if (!updated) {
      return ApiResponse.NotFound({
        message: "Assinatura associada ao email do pagador não encontrada.",
      });
    }

    return ApiResponse.Ok({
      message: "Preapproval processado com sucesso",
      data: updated,
    });
  } catch (error) {
    return ApiResponse.InternalError({
      message: "Erro ao processar preapproval",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const webhookSubscriptionAuthorizedPaymentApi = async (authorizedPaymentId: string) => {
  try {
    const authorizedPaymentResult = await getAuthorizedPaymentApi(authorizedPaymentId);
    if (authorizedPaymentResult.error || !authorizedPaymentResult.data) {
      return ApiResponse.InternalError({
        message: authorizedPaymentResult.message,
        error: authorizedPaymentResult.error,
      });
    }

    const authorizedPayment = authorizedPaymentResult.data;
    await webhookSaveInvoiceFromAuthorizedPaymentApi(authorizedPayment);

    const preapprovalId = authorizedPayment.preapproval_id!;
    return await webhookSubscriptionPreapprovalApi(preapprovalId);
  } catch (error) {
    return ApiResponse.InternalError({
      message: "Erro ao processar authorized_payment",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
