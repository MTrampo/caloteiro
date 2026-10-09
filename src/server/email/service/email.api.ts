import { resend, EMAIL_FROM } from "@/commons/lib/resend"
import {
  renderWelcomeSubscriptionHtml,
  renderRenewalSuccessHtml,
  renderRenewalFailedHtml,
  renderCancellationHtml,
  WelcomeEmailData,
  RenewalSuccessEmailData,
  RenewalFailedEmailData,
  CancellationEmailData,
} from "../templates"

export interface SendEmailResponse {
  success: boolean
  id?: string
  error?: string
}

/**
 * Envia e-mail de Boas-vindas / Primeira Assinatura
 */
export async function sendWelcomeSubscriptionEmailApi(
  toEmail: string,
  data: WelcomeEmailData
): Promise<SendEmailResponse> {
  try {
    const { subject, html } = renderWelcomeSubscriptionHtml(data)
    console.info(`📧 [EMAIL_SERVICE:Welcome] Enviando e-mail de boas-vindas para: ${toEmail}`)

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [toEmail],
      subject,
      html,
    })

    if (response.error) {
      console.error(`❌ [EMAIL_SERVICE:Welcome] Erro ao enviar pelo Resend:`, response.error)
      return { success: false, error: response.error.message }
    }

    console.info(`✅ [EMAIL_SERVICE:Welcome] E-mail enviado com sucesso | ID: ${response.data?.id}`)
    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error(`❌ [EMAIL_SERVICE:Welcome] Erro inesperado:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Envia e-mail de Renovação Bem-Sucedida
 */
export async function sendRenewalSuccessEmailApi(
  toEmail: string,
  data: RenewalSuccessEmailData
): Promise<SendEmailResponse> {
  try {
    const { subject, html } = renderRenewalSuccessHtml(data)
    console.info(`📧 [EMAIL_SERVICE:RenewalSuccess] Enviando e-mail de renovação positiva para: ${toEmail}`)

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [toEmail],
      subject,
      html,
    })

    if (response.error) {
      console.error(`❌ [EMAIL_SERVICE:RenewalSuccess] Erro ao enviar pelo Resend:`, response.error)
      return { success: false, error: response.error.message }
    }

    console.info(`✅ [EMAIL_SERVICE:RenewalSuccess] E-mail enviado com sucesso | ID: ${response.data?.id}`)
    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error(`❌ [EMAIL_SERVICE:RenewalSuccess] Erro inesperado:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Envia e-mail de Renovação Negativa / Pagamento Recusado
 */
export async function sendRenewalFailedEmailApi(
  toEmail: string,
  data: RenewalFailedEmailData
): Promise<SendEmailResponse> {
  try {
    const { subject, html } = renderRenewalFailedHtml(data)
    console.info(`📧 [EMAIL_SERVICE:RenewalFailed] Enviando e-mail de renovação negativa para: ${toEmail}`)

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [toEmail],
      subject,
      html,
    })

    if (response.error) {
      console.error(`❌ [EMAIL_SERVICE:RenewalFailed] Erro ao enviar pelo Resend:`, response.error)
      return { success: false, error: response.error.message }
    }

    console.info(`✅ [EMAIL_SERVICE:RenewalFailed] E-mail enviado com sucesso | ID: ${response.data?.id}`)
    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error(`❌ [EMAIL_SERVICE:RenewalFailed] Erro inesperado:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Envia e-mail de Cancelamento da Assinatura
 */
export async function sendCancellationEmailApi(
  toEmail: string,
  data: CancellationEmailData
): Promise<SendEmailResponse> {
  try {
    const { subject, html } = renderCancellationHtml(data)
    console.info(`📧 [EMAIL_SERVICE:Cancellation] Enviando e-mail de cancelamento para: ${toEmail}`)

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [toEmail],
      subject,
      html,
    })

    if (response.error) {
      console.error(`❌ [EMAIL_SERVICE:Cancellation] Erro ao enviar pelo Resend:`, response.error)
      return { success: false, error: response.error.message }
    }

    console.info(`✅ [EMAIL_SERVICE:Cancellation] E-mail enviado com sucesso | ID: ${response.data?.id}`)
    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error(`❌ [EMAIL_SERVICE:Cancellation] Erro inesperado:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
