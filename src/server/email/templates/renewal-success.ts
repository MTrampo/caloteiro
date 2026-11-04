import { APP_URL } from "@/commons/constants/env"
import { renderBaseEmailLayout } from "./base-layout"

export interface RenewalSuccessEmailData {
  recipientName?: string
  planName?: string
  amountFormatted?: string
  nextPaymentDate?: string
}

export function renderRenewalSuccessHtml(data: RenewalSuccessEmailData): { subject: string; html: string } {
  const subject = "Assinatura Renovada! Sua mensalidade Caloteiro foi confirmada"

  const contentHtml = `
    <p style="margin: 0 0 14px 0;">
      Passando para avisar que a renovação da sua assinatura foi <strong>processada e confirmada com sucesso</strong>!
    </p>
    <p style="margin: 0;">
      Mais um ciclo de blindagem garantido. Suas presas marcadas, cálculo automático de juros e mensagens afiadas continuam operando com força total para não deixar nenhum centavo sumir.
    </p>
  `

  const highlightCardHtml = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #d4d4d8;">
      <tr>
        <td style="padding: 6px 0; color: #a1a1aa; font-weight: 500;">Plano Ativo:</td>
        <td align="right" style="font-weight: 800; color: #ffffff;">${data.planName || "Caloteiro"}</td>
      </tr>
      ${data.amountFormatted ? `
        <tr>
          <td style="padding: 6px 0; color: #a1a1aa; font-weight: 500;">Valor da Mensalidade:</td>
          <td align="right" style="font-weight: 800; color: #10b981; font-size: 14px; font-family: monospace;">${data.amountFormatted}</td>
        </tr>
      ` : ""}
      ${data.nextPaymentDate ? `
        <tr>
          <td style="padding: 6px 0; color: #a1a1aa; font-weight: 500;">Próxima Renovação:</td>
          <td align="right" style="font-weight: 700; color: #34d399; font-family: monospace;">${data.nextPaymentDate}</td>
        </tr>
      ` : ""}
      <tr>
        <td style="padding: 6px 0; color: #a1a1aa; font-weight: 500;">Status do Pagamento:</td>
        <td align="right" style="font-weight: 800; color: #10b981;">Pago e Confirmado</td>
      </tr>
    </table>
  `

  const html = renderBaseEmailLayout({
    title: "Assinatura Renovada com Sucesso!",
    previewText: "Seu pagamento foi confirmado com sucesso. Seu cofre e ferramentas continuam 100% ativos.",
    bannerSvgPath: "/email/printing-invoice.svg",
    bannerSvgAlt: "Fatura de pagamento confirmada",
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Acessar Painel de Controle",
    buttonUrl: `${APP_URL}/painel`,
    footerNote: "O histórico completo de faturas e comprovantes fica sempre disponível na aba de conta do seu painel.",
  })

  return { subject, html }
}

