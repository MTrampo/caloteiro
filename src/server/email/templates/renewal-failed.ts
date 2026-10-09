import { APP_URL } from "@/commons/constants/env"
import { renderBaseEmailLayout } from "./base-layout"

export interface RenewalFailedEmailData {
  recipientName?: string
  planName?: string
  amountFormatted?: string
  reason?: string
}

export function renderRenewalFailedHtml(data: RenewalFailedEmailData): { subject: string; html: string } {
  const subject = "⚠️ Alerta no Cofre: A renovação do seu plano Caloteiro não passou"

  const contentHtml = `
    <p style="margin: 0 0 14px 0;">
      Tentamos processar a renovação da sua assinatura <strong>${data.planName || "Caloteiro"}</strong>, mas a operadora do seu cartão não autorizou a cobrança ${data.amountFormatted ? `no valor de <strong>${data.amountFormatted}</strong>` : ""}.
    </p>
    <p style="margin: 0 0 14px 0;">
      Não se preocupe: isso costuma acontecer por motivos simples (limite momentâneo, troca de cartão ou bloqueio preventivo de segurança do seu banco).
    </p>
    <p style="margin: 0;">
      Os devedores já estavam quase comemorando, mas não vamos deixar seu arsenal desativado! Para que seu cofre continue 100% blindado e seus cálculos automáticos não parem, basta atualizar os dados do cartão direto pelo painel.
    </p>
  `

  const highlightCardHtml = `
    <div style="background-color: #271418; border: 1px solid #7f1d1d; border-radius: 12px; padding: 14px; margin-bottom: 4px;">
      <div style="color: #f87171; font-weight: 800; font-size: 13px; margin-bottom: 6px; font-family: monospace;">
        ⚠️ AÇÃO NECESSÁRIA NO COFRE:
      </div>
      <div style="color: #fca5a5; font-size: 13px; line-height: 1.5;">
        Atualize a forma de pagamento na sua conta para manter o envio de mensagens, o monitoramento de promessas e a cobrança ativa.
      </div>
    </div>
  `

  const html = renderBaseEmailLayout({
    title: "Atenção: Renovação Pendente",
    previewText: "Tivemos um imprevisto ao processar sua mensalidade. Atualize seu cartão para manter seu arsenal ativo!",
    bannerSvgPath: "/email/empty-wallet.svg",
    bannerSvgAlt: "Carteira indicando pagamento pendente",
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Atualizar Meu Cartão 💳",
    buttonUrl: `${APP_URL}/painel/conta`,
    footerNote: "Assim que a fatura for aprovada, sua blindagem financeira continuará normalmente sem nenhum impacto nas suas fichas.",
  })

  return { subject, html }
}

