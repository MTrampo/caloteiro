import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { ResponseProps } from "@/commons/models/api";
import { clientPreAproval, clientInvoice } from "@/commons/lib/mercadopago/server";
import type {
  CreatePreApprovalPayload,
  MercadopagoAutoRecurring,
  PreApprovalCheckoutResult,
} from "@/commons/models/payment";

export const createPreApprovalSubscriptionApi = async (
  payload: CreatePreApprovalPayload
): Promise<ResponseProps<PreApprovalCheckoutResult>> => {
  const {
    payerEmail,
    subscriptionId,
    planPrice,
    planName,
    includeTrial = true,
  } = payload;

  try {
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.ENVIRONMENT === "development";
    const isBuyerTest = Boolean(
      process.env.MP_EMAIL_COMPRADOR_TEST &&
        payerEmail === process.env.MP_EMAIL_COMPRADOR_TEST
    );
    console.info(
      `🌐 [PAYMENT:createPreApproval] Criando assinatura individual no MP | payerEmail: ${payerEmail}${
        isBuyerTest ? " [Sandbox Comprador Teste]" : ""
      } | subId: ${subscriptionId} | preço: ${planPrice} | plano: ${planName} | trial30Dias: ${includeTrial}`
    );

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (isDev && process.env.DEV_TUNNEL_URL) {
      console.info(
        "🔧 [PAYMENT:createPreApproval] Modo dev detectado. Usando URL do Dev Tunnel para retorno do Mercado Pago."
      );
      baseUrl = process.env.DEV_TUNNEL_URL;
    }
    const backUrl = `${baseUrl}/assinatura`;

    const autoRecurringBody: MercadopagoAutoRecurring = {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: planPrice,
      currency_id: "BRL",
      ...(includeTrial
        ? {
            free_trial: {
              frequency: 30,
              frequency_type: "days",
            },
          }
        : {}),
    };

    const response = await clientPreAproval.create({
      body: {
        back_url: backUrl,
        reason: planName,
        auto_recurring: autoRecurringBody,
        payer_email: payerEmail,
        external_reference: subscriptionId,
        status: "pending",
      },
    });

    if (!response || !response.init_point || !response.id) {
      console.error(
        "❌ [PAYMENT:createPreApproval] Resposta inválida do MP",
        response
      );
      return ApiResponse.InternalError({
        message: "Resposta inválida do Mercado Pago ao criar assinatura",
      });
    }

    return ApiResponse.Ok({
      message: "Checkout de assinatura criado com sucesso",
      data: {
        initPoint: response.init_point,
        preapprovalId: response.id,
      },
    });
  } catch (error) {
    console.error(
      "❌ [PAYMENT:createPreApproval] Erro ao criar preapproval no MP:",
      error
    );
    return ApiResponse.InternalError({
      message: "Erro ao processar assinatura no Mercado Pago",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getPreapprovalApi = async (id: string) => {
  try {
    console.info(`🌐 [PAYMENT:getPreapproval] Consultando MP preapproval | id: ${id}`);
    const preapproval = await clientPreAproval.get({ id });

    if (!preapproval) {
      console.error("❌ [PAYMENT:getPreapproval] Resposta nula do MP");
      return ApiResponse.InternalError({
        message: "Resposta inválida do Mercado Pago ao consultar preapproval",
      });
    }

    console.info("🌐 [PAYMENT:getPreapproval] Resposta do MP:", {
      id: preapproval.id,
      status: preapproval.status,
      payer_email: preapproval.payer_email,
      payer_id: preapproval.payer_id,
    });

    return ApiResponse.Ok({
      message: "Preapproval consultado com sucesso",
      data: preapproval,
    });
  } catch (error) {
    console.error("❌ [PAYMENT:getPreapproval] Erro ao buscar no MP:", error);
    return ApiResponse.InternalError({
      message: "Erro ao buscar preapproval",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAuthorizedPaymentApi = async (authorizedPaymentId: string) => {
  try {
    console.info(
      `🌐 [PAYMENT:getAuthorizedPayment] Consultando MP | id: ${authorizedPaymentId}`
    );
    const authorizedPayment = await clientInvoice.get({ id: authorizedPaymentId });

    if (!authorizedPayment?.preapproval_id) {
      console.error(
        "❌ [PAYMENT:getAuthorizedPayment] preapproval_id ausente na resposta",
        authorizedPayment
      );
      return ApiResponse.InternalError({
        message: "preapproval_id não encontrado na resposta de authorized_payment",
      });
    }

    console.info("🌐 [PAYMENT:getAuthorizedPayment] Resposta do MP:", {
      id: authorizedPayment.id,
      preapproval_id: authorizedPayment.preapproval_id,
      payer_id: authorizedPayment.payer_id,
      status: authorizedPayment.status,
      transaction_amount: authorizedPayment.transaction_amount,
    });

    return ApiResponse.Ok({
      message: "Authorized payment consultado com sucesso",
      data: authorizedPayment,
    });
  } catch (error) {
    console.error("❌ [PAYMENT:getAuthorizedPayment] Erro ao buscar no MP:", error);
    return ApiResponse.InternalError({
      message: "Erro ao buscar authorized_payment",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Atualiza o valor e identificação da assinatura no Mercado Pago para faturas futuras
 */
export const updatePreApprovalPlanOrPriceApi = async (
  preapprovalId: string,
  newPrice: number,
  planName: string
) => {
  try {
    console.info(
      `🌐 [PAYMENT:updatePreApproval] Atualizando valor da assinatura no MP | id: ${preapprovalId} | novoPreço: ${newPrice} | plano: ${planName}`
    );
    const response = await clientPreAproval.update({
      id: preapprovalId,
      body: {
        auto_recurring: {
          transaction_amount: newPrice,
          currency_id: "BRL",
        },
        reason: planName,
      },
    });

    return ApiResponse.Ok({
      message: "Assinatura atualizada no Mercado Pago com sucesso",
      data: response,
    });
  } catch (error) {
    console.error("❌ [PAYMENT:updatePreApproval] Erro ao atualizar preapproval no MP:", error);
    return ApiResponse.InternalError({
      message: "Erro ao atualizar valor da assinatura no Mercado Pago",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Cancela a recorrência ativa de uma assinatura no Mercado Pago
 */
export const cancelPreApprovalApi = async (preapprovalId: string) => {
  try {
    console.info(`🌐 [PAYMENT:cancelPreApproval] Cancelando preapproval no MP | id: ${preapprovalId}`);
    const response = await clientPreAproval.update({
      id: preapprovalId,
      body: {
        status: "cancelled",
      },
    });

    return ApiResponse.Ok({
      message: "Assinatura cancelada no Mercado Pago com sucesso",
      data: response,
    });
  } catch (error) {
    console.error("❌ [PAYMENT:cancelPreApproval] Erro ao cancelar preapproval no MP:", error);
    return ApiResponse.InternalError({
      message: "Erro ao cancelar assinatura no Mercado Pago",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};