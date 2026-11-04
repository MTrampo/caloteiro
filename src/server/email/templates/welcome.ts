import { APP_URL } from "@/commons/constants/env"
import { getPlanBenefits } from "@/commons/constants/subscription"
import { renderBaseEmailLayout } from "./base-layout"

export interface WelcomeEmailData {
  recipientName?: string
  planName?: string
  planSlug?: string
  isTrial?: boolean
  trialDays?: number
  currentPeriodEnd?: string
  maxDebtors?: number | null
  benefits?: string[]
}

export function renderWelcomeSubscriptionHtml(data: WelcomeEmailData): { subject: string; html: string } {
  const isTrial = data.isTrial ?? true
  const trialDays = data.trialDays ?? 7
  const subject = "Assinatura Liberada! Bem-vindo à Gruta do Tubarão"

  const contentHtml = `
    <p style="margin: 0 0 14px 0; font-size: 15px; color: #10b981; font-weight: 700;">
      A partir de hoje, ninguém mais enrola o seu dinheiro!
    </p>
    <p style="margin: 0 0 14px 0;">
      Chega de esquecer parcelas, perder o sono de vergonha de cobrar ou aceitar desculpas esfarrapadas. O <strong>Caloteiro</strong> agora é seu aliado estratégico para colocar ordem em cada centavo que prometeram devolver.
    </p>
    <p style="margin: 0;">
      Sua assinatura foi <strong>confirmada com sucesso</strong>! ${isTrial 
        ? `Você ganhou <strong>${trialDays} dias de degustação gratuita</strong> para cadastrar seus suspeitos e testar toda a artilharia.`
        : `Todos os recursos do seu plano <strong>${data.planName || "Plano Ativo"}</strong> já estão 100% liberados!`
      }
    </p>
  `

  const activeBenefits =
    data.benefits && data.benefits.length > 0
      ? data.benefits
      : getPlanBenefits(data.planName || data.planSlug, { max_debtors: data.maxDebtors })

  const highlightCardHtml = `
    <div style="font-size: 12px; color: #10b981; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.8px; font-family: monospace;">
      Artilharia liberada no seu plano ${data.planName || "Ativo"}:
    </div>
    <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #d4d4d8; line-height: 1.6;">
      ${activeBenefits.map((b) => `<li style="margin-bottom: 6px;">${b}</li>`).join("")}
    </ul>
    ${data.currentPeriodEnd ? `
      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #27272a; font-size: 12px; color: #a1a1aa; font-family: monospace;">
        ${isTrial ? "Primeira cobrança apenas após o período de teste em:" : "Vigência do ciclo atual até:"} <strong style="color: #34d399;">${data.currentPeriodEnd}</strong>
      </div>
    ` : ""}
  `

  const html = renderBaseEmailLayout({
    title: "Recursos de Cobrança Liberados!",
    previewText: "Sua assinatura foi confirmada com sucesso! Bem-vindo ao Caloteiro. Chega de tomar prejuízo em silêncio.",
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Entrar na Gruta",
    buttonUrl: `${APP_URL}/painel`,
    footerNote: "Liberdade total: cancele ou altere seu plano quando quiser diretamente pelo painel, sem taxas escondidas ou multas.",
  })

  return { subject, html }
}
