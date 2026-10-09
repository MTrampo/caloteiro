import { APP_URL } from "@/commons/constants/env"
import { renderBaseEmailLayout } from "./base-layout"

export interface WelcomeEmailData {
  recipientName?: string
  planName?: string
  isTrial?: boolean
  trialDays?: number
  currentPeriodEnd?: string
}

export function renderWelcomeSubscriptionHtml(data: WelcomeEmailData): { subject: string; html: string } {
  const isTrial = data.isTrial ?? true
  const trialDays = data.trialDays ?? 7
  const subject = "🛡️ Arsenal Liberado! Bem-vindo à Central do Caloteiro"

  const contentHtml = `
    <p style="margin: 0 0 14px 0; font-size: 15px; color: #10b981; font-weight: 700;">
      A partir de hoje, ninguém mais enrola o seu dinheiro! 💸
    </p>
    <p style="margin: 0 0 14px 0;">
      Chega de esquecer parcelas, perder o sono de vergonha de cobrar ou aceitar desculpas esfarrapadas. O <strong>Caloteiro</strong> agora é seu aliado estratégico para colocar ordem em cada centavo que prometeram devolver.
    </p>
    <p style="margin: 0;">
      Sua assinatura foi <strong>confirmada com sucesso</strong>! ${isTrial 
        ? `Você ganhou <strong>${trialDays} dias de degustação gratuita</strong> para cadastrar seus suspeitos e testar toda a artilharia.`
        : `Todos os recursos do seu plano <strong>${data.planName || "Arsenal Ativo"}</strong> já estão 100% liberados!`
      }
    </p>
  `

  const highlightCardHtml = `
    <div style="font-size: 12px; color: #10b981; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.8px; font-family: monospace;">
      🎯 Armas liberadas na sua conta:
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
      <tr>
        <td style="padding: 5px 0; vertical-align: top; width: 22px;">📋</td>
        <td style="padding: 5px 0;"><strong style="color: #ffffff;">Fichas de Devedores:</strong> cadastre os suspeitos com valores, datas de vencimento e juros.</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; vertical-align: top; width: 22px;">💬</td>
        <td style="padding: 5px 0;"><strong style="color: #ffffff;">Mensagens de WhatsApp:</strong> modelos afiados que vão do lembrete amigo até a pressão máxima estilo Julius.</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; vertical-align: top; width: 22px;">⚡</td>
        <td style="padding: 5px 0;"><strong style="color: #ffffff;">Chave Pix Integrada:</strong> envio automático dos dados para o devedor não ter desculpa de que não sabe onde pagar.</td>
      </tr>
    </table>
    ${data.currentPeriodEnd ? `
      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #27272a; font-size: 12px; color: #a1a1aa; font-family: monospace;">
        ${isTrial ? "Primeira cobrança apenas após o período de teste em:" : "Vigência do ciclo atual até:"} <strong style="color: #34d399;">${data.currentPeriodEnd}</strong>
      </div>
    ` : ""}
  `

  const html = renderBaseEmailLayout({
    title: "Arsenal de Cobrança Liberado!",
    previewText: "Sua assinatura foi confirmada com sucesso! Bem-vindo ao Caloteiro. Chega de tomar prejuízo em silêncio.",
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Acessar Central de Cobranças 🛡️",
    buttonUrl: `${APP_URL}/painel`,
    footerNote: "Liberdade total: cancele ou altere seu plano quando quiser diretamente pelo painel, sem taxas escondidas ou multas.",
  })

  return { subject, html }
}
