import { APP_URL } from "@/commons/constants/env"
import { renderBaseEmailLayout } from "./base-layout"

export interface CancellationEmailData {
  recipientName?: string
  planName?: string
  accessUntil?: string
}

export function renderCancellationHtml(data: CancellationEmailData): { subject: string; html: string } {
  const subject = "Confirmação de Cancelamento da sua Assinatura"

  const contentHtml = `
    <p style="margin: 0 0 14px 0;">
      Confirmamos o cancelamento da sua assinatura <strong>${data.planName || "Caloteiro"}</strong>, conforme solicitado.
    </p>
    <p style="margin: 0 0 14px 0;">
      Sentiremos sua falta na trincheira contra o calote! Esperamos de verdade que seus devedores tenham quitado cada centavo antes de você ir embora.
    </p>
    <p style="margin: 0;">
      Lembrando que não há nenhuma multa, fidelidade ou taxa de cancelamento.
    </p>
  `

  const highlightCardHtml = `
    <div style="font-size: 12px; color: #a1a1aa; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; font-family: monospace;">
      Informações sobre o seu Cofre:
    </div>
    <div style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
      ${data.accessUntil ? `
        Seu acesso completo às ferramentas e presas marcadas continuará liberado até o dia <strong style="color: #34d399;">${data.accessUntil}</strong>.
      ` : "Nenhuma nova cobrança automática será realizada no seu cartão."}
      <br/><br/>
      Seus cadastros de devedores e histórico de promessas ficarão guardados com segurança na sua gruta caso você decida reativar sua assinatura no futuro!
    </div>
  `

  const html = renderBaseEmailLayout({
    title: "Cancelamento Confirmado",
    previewText: "Sua assinatura foi cancelada. Sua gruta e presas marcadas continuarão preservadas para quando você quiser voltar.",
    bannerSvgPath: "/email/feeling-blue.svg",
    bannerSvgAlt: "Cancelamento de assinatura do Caloteiro",
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Acessar Meu Painel",
    buttonUrl: `${APP_URL}/painel`,
    footerNote: "Mudou de ideia ou apareceu mais um devedor na praça? Você pode reativar seu plano a qualquer momento pelo painel.",
  })

  return { subject, html }
}

