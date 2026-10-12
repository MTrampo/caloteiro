import { APP_URL } from "@/commons/constants/env"
import { renderBaseEmailLayout } from "./base-layout"

export interface PlanChangeEmailData {
  recipientName?: string
  previousPlanName: string
  newPlanName: string
  isUpgrade: boolean
  newPrice: number
  maxDebtors?: number | null
  effectiveDateNote?: string
}

export function renderPlanChangeHtml(data: PlanChangeEmailData): { subject: string; html: string } {
  const isUpgrade = data.isUpgrade
  const formattedPrice = (data.newPrice).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  const subject = isUpgrade
    ? `🦈 Evolução de Tubarão! Você subiu para o plano ${data.newPlanName}`
    : `🦈 Caloteiro: Confirmação de alteração para o plano ${data.newPlanName}`

  const contentHtml = isUpgrade
    ? `
      <p style="margin: 0 0 14px 0; font-size: 15px; color: #ffffff; font-weight: 700;">
        Evolução de predador confirmada! 🦈⚡
      </p>
      <p style="margin: 0 0 14px 0;">
        Você subiu de nível no ecossistema da cobrança. Agora seus devedores não terão onde se esconder. Sua conta foi atualizada com sucesso de <strong>${data.previousPlanName}</strong> para <strong>${data.newPlanName}</strong>.
      </p>
      <p style="margin: 0 0 14px 0;">
        Todos os novos recursos e limites do seu plano já estão <strong>liberados imediatamente</strong> no seu tanque!
      </p>
    `
    : `
      <p style="margin: 0 0 14px 0; font-size: 15px; color: #ffffff; font-weight: 700;">
        Plano alterado para ${data.newPlanName}
      </p>
      <p style="margin: 0 0 14px 0;">
        Confirmamos a alteração do seu plano de <strong>${data.previousPlanName}</strong> para <strong>${data.newPlanName}</strong>.
      </p>
      <p style="margin: 0 0 14px 0;">
        Vai afrouxar a mordida por enquanto, Tubarão? Sem problemas. As presas que você já cadastrou continuam salvas no histórico, mas os novos limites de radar entraram em vigor.
      </p>
    `

  const highlightCardHtml = `
    <div style="font-size: 12px; color: #ffffff; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.8px; font-family: monospace;">
      📋 Detalhes da sua assinatura:
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
      <tr>
        <td style="padding: 5px 0; width: 140px; color: #a1a1aa;">Novo Plano:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #ffffff;">${data.newPlanName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #a1a1aa;">Mensalidade:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #ffffff;">${formattedPrice}/mês</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #a1a1aa;">Presas no Radar:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #ffffff;">${
          data.maxDebtors ? `${data.maxDebtors} devedores simultâneos` : "Ilimitados"
        }</td>
      </tr>
    </table>
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #27272a; font-size: 12px; color: #e4e4e7; line-height: 1.5; font-family: monospace;">
      ℹ️ <strong>Importante sobre a cobrança:</strong> O valor do novo plano (${formattedPrice}) será cobrado <strong>somente na sua próxima fatura</strong>, no ciclo seguinte do Mercado Pago. Até lá, nenhum valor adicional será debitado.
    </div>
  `

  const html = renderBaseEmailLayout({
    title: isUpgrade ? "Evolução de Predador Confirmada" : "Alteração de Plano Confirmada",
    previewText: `Seu plano no Caloteiro agora é ${data.newPlanName}. Fique por dentro dos novos limites e do próximo ciclo de fatura.`,
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Acessar Meu Tanque 🦈",
    buttonUrl: `${APP_URL}/painel`,
    footerNote: "Você tem liberdade total para alterar ou ajustar seu plano quando quiser diretamente pelo seu painel.",
  })

  return { subject, html }
}

