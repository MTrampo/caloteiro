import { ApiResponse } from "@/commons/lib/http/responses";
import type { InvoiceInsertPayload } from "@/commons/models/payment";
import {
  getInvoicesByUserIdSupabase,
  upsertInvoiceSupabase,
} from "../repository/invoice.supabase";
import { getSubscriptionByMpSubscriptionIdSupabase } from "@/server/account/repository/subscription.supabase";
import type { InvoiceResponse } from "mercadopago/dist/clients/invoice/commonTypes";
import { toIsoOrNull } from "@/commons/utils/helper";

export const saveInvoiceFromAuthorizedPaymentApi = async (
  authorizedPayment: InvoiceResponse
) => {
  try {
    const preapprovalId = authorizedPayment.preapproval_id;
    if (!preapprovalId) {
      return ApiResponse.BadRequest({
        message: "preapproval_id ausente no authorized_payment",
      });
    }

    const subscription = await getSubscriptionByMpSubscriptionIdSupabase(preapprovalId);
    if (!subscription) {
      return ApiResponse.NotFound({
        message: `Assinatura local não encontrada para preapproval_id: ${preapprovalId}`,
      });
    }

    const payload: InvoiceInsertPayload = {
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      mp_invoice_id: String(authorizedPayment.id || ""),
      mp_subscription_id: authorizedPayment.preapproval_id || null,
      amount: authorizedPayment.transaction_amount || 0,
      currency: authorizedPayment.currency_id || "BRL",
      status: authorizedPayment.payment?.status ?? authorizedPayment.status ?? "pending",
      paid_at: toIsoOrNull(authorizedPayment.debit_date),
      raw_payload: JSON.parse(JSON.stringify(authorizedPayment)),
    };

    const { data, error } = await upsertInvoiceSupabase(payload);

    if (error) {
      console.error("[saveInvoiceFromAuthorizedPaymentApi] Erro ao salvar fatura:", error);
      return ApiResponse.InternalError({
        message: "Falha ao salvar fatura no banco de dados",
        error: error.message,
      });
    }

    return ApiResponse.Ok({
      message: "Fatura registrada com sucesso",
      data,
    });
  } catch (error) {
    console.error("[saveInvoiceFromAuthorizedPaymentApi] Erro ao processar fatura:", error);
    return ApiResponse.InternalError({
      message: "Erro ao processar fatura",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getInvoicesByUserIdApi = async (userId: string) => {
  const data = await getInvoicesByUserIdSupabase(userId);
  return ApiResponse.Ok({
    message: "Faturas encontradas com sucesso",
    data: data ?? [],
  });
};
