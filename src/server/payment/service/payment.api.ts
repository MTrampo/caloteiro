import { ApiResponse } from "@/commons/lib/http/responses"
import { clientPreAproval, clientInvoice } from "@/commons/lib/mercadopago/server"

export const createPreApprovalSubscriptionApi = async (
  payerEmail: string,
  subscriptionId: string,
  planPrice: number,
  planName: string = "Plano Caloteiro",
  includeTrial: boolean = true
) => {
  try {
    console.info(`🌐 [PAYMENT:createPreApproval] Criando assinatura individual no MP | email: ${payerEmail} | subId: ${subscriptionId} | preço: ${planPrice} | plano: ${planName} | trial7Dias: ${includeTrial}`)
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (process.env.ENVIRONMENT === "development" && process.env.DEV_TUNNEL_URL) {
      console.info("🔧 [PAYMENT:createPreApproval] Modo dev detectado. Usando URL do Dev Tunnel para retorno do Mercado Pago.")
      baseUrl = process.env.DEV_TUNNEL_URL
    }
    const backUrl = `${baseUrl}/assinatura`

    const autoRecurringBody: {
      frequency: number
      frequency_type: string
      transaction_amount: number
      currency_id: string
      free_trial?: {
        frequency: number
        frequency_type: string
      }
    } = {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: planPrice,
      currency_id: "BRL",
    }

    if (includeTrial) {
      autoRecurringBody.free_trial = {
        frequency: 7,
        frequency_type: "days"
      }
    }

    const response = await clientPreAproval.create({
      body: {
        back_url: backUrl,
        reason: planName,
        auto_recurring: autoRecurringBody,
        payer_email: payerEmail,
        external_reference: subscriptionId,
        status: "pending"
      } as unknown as Parameters<typeof clientPreAproval.create>[0]["body"],
    })


    if (!response || !response.init_point) {
      console.error("❌ [PAYMENT:createPreApproval] Resposta inválida do MP", response)
      return ApiResponse.InternalError({
        message: "Resposta inválida do Mercado Pago ao criar assinatura"
      })
    }

    return ApiResponse.Ok({
      message: "Checkout de assinatura criado com sucesso",
      data: {
        initPoint: response.init_point,
        preapprovalId: response.id
      }
    })
  } catch (error) {
    console.error("❌ [PAYMENT:createPreApproval] Erro ao criar preapproval no MP:", error)
    return ApiResponse.InternalError({
      message: "Erro ao processar assinatura no Mercado Pago",
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

export const getPreapprovalApi = async (id: string) => {
  try {
    console.info(`🌐 [PAYMENT:getPreapproval] Consultando MP preapproval | id: ${id}`)
    const preapproval = await clientPreAproval.get({ id })

    if (!preapproval) {
      console.error(`❌ [PAYMENT:getPreapproval] Resposta nula do MP`)
      return ApiResponse.InternalError({
        message: "Resposta inválida do Mercado Pago ao consultar preapproval"
      })
    }

    console.info(`🌐 [PAYMENT:getPreapproval] Resposta do MP:`, {
      id: preapproval.id,
      status: preapproval.status,
      payer_email: preapproval.payer_email,
      payer_id: preapproval.payer_id,
    })

    return ApiResponse.Ok({
      message: "Preapproval consultado com sucesso",
      data: preapproval
    })
  } catch (error) {
    console.error('❌ [PAYMENT:getPreapproval] Erro ao buscar no MP:', error)
    return ApiResponse.InternalError({
      message: 'Erro ao buscar preapproval',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

export const getAuthorizedPaymentApi = async (authorizedPaymentId: string) => {
  try {
    console.info(`🌐 [PAYMENT:getAuthorizedPayment] Consultando MP | id: ${authorizedPaymentId}`)
    const authorizedPayment = await clientInvoice.get({ id: authorizedPaymentId })

    if (!authorizedPayment?.preapproval_id) {
      console.error(`❌ [PAYMENT:getAuthorizedPayment] preapproval_id ausente na resposta`, authorizedPayment)
      return ApiResponse.InternalError({
        message: 'preapproval_id não encontrado na resposta de authorized_payment',
      })
    }

    console.info(`🌐 [PAYMENT:getAuthorizedPayment] Resposta do MP:`, {
      id: authorizedPayment.id,
      preapproval_id: authorizedPayment.preapproval_id,
      payer_id: authorizedPayment.payer_id,
      status: authorizedPayment.status,
      transaction_amount: authorizedPayment.transaction_amount,
    })

    return ApiResponse.Ok({
      message: 'Authorized payment consultado com sucesso',
      data: authorizedPayment,
    })
  } catch (error) {
    console.error('❌ [PAYMENT:getAuthorizedPayment] Erro ao buscar no MP:', error)
    return ApiResponse.InternalError({
      message: 'Erro ao buscar authorized_payment',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}