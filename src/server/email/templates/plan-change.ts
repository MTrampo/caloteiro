import { APP_URL } from "@/commons/constants/env"
import { getPlanBenefits } from "@/commons/constants/subscription"
import { renderBaseEmailLayout } from "./base-layout"

export interface PlanChangeEmailData {
  recipientName?: string
  previousPlanName: string
  newPlanName: string
  isUpgrade: boolean
  newPrice: number
  maxDebtors?: number | null
  effectiveDateNote?: string
  benefits?: string[]
  chargedNow?: boolean
}

export function renderPlanChangeHtml(data: PlanChangeEmailData): { subject: string; html: string } {
  const isUpgrade = data.isUpgrade
  const formattedPrice = (data.newPrice).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  const subject = isUpgrade
    ? `Evolução de Tubarão! Você subiu para o plano ${data.newPlanName}`
    : `Caloteiro: Confirmação de alteração para o plano ${data.newPlanName}`

  const defaultBenefits = isUpgrade
    ? getPlanBenefits(data.newPlanName, { max_debtors: data.maxDebtors })
    : []

  const activeBenefits = data.benefits && data.benefits.length > 0 ? data.benefits : defaultBenefits

  const contentHtml = isUpgrade
    ? `
      <p style="margin: 0 0 14px 0; font-size: 15px; color: #ffffff; font-weight: 700;">
        Evolução de predador confirmada!
      </p>
      <p style="margin: 0 0 14px 0;">
        <strong>Obrigado pela sua confiança no Caloteiro!</strong> É uma honra ter você no comando dessa nova fase. Agora você tem em mãos a artilharia definitiva para rastrear cada centavo e recuperar o que é seu por direito, sem vergonha e sem enrolação.
      </p>
      <p style="margin: 0 0 14px 0;">
        Sua conta foi atualizada com sucesso de <strong>${data.previousPlanName}</strong> para <strong>${data.newPlanName}</strong>. Todos os novos recursos já estão <strong>liberados imediatamente</strong> na sua gruta!
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
        Vai afrouxar a mordida por enquanto, Tubarão? Sem problemas. As presas que você já cadastrou continuam salvas no histórico, mas a nova capacidade da sua gruta entrou em vigor.
      </p>
    `

  const benefitsListHtml = activeBenefits.length > 0
    ? `
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #27272a;">
        <div style="font-size: 12px; color: #ffffff; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          Principais Benefícios Desbloqueados:
        </div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #d4d4d8; line-height: 1.6;">
          ${activeBenefits.map(b => `<li style="margin-bottom: 6px;">${b}</li>`).join("")}
        </ul>
      </div>
    `
    : ""

  const chargeNoteHtml = data.chargedNow
    ? `<strong>Pagamento Aprovado:</strong> O valor de <strong>${formattedPrice}</strong> foi processado com sucesso no Mercado Pago e sua assinatura já está ativa.`
    : `<strong>Importante sobre a cobrança:</strong> O valor do novo plano (<strong>${formattedPrice}</strong>) será cobrado <strong>somente na sua próxima fatura</strong>, no ciclo seguinte do Mercado Pago. Até lá, nenhum valor adicional será debitado.`

  const highlightCardHtml = `
    <div style="font-size: 12px; color: #ffffff; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.8px; font-family: monospace;">
      Detalhes da sua assinatura:
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
      <tr>
        <td style="padding: 5px 0; width: 140px; color: #a1a1aa;">Novo Plano:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #ffffff;">${data.newPlanName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #a1a1aa;">Valor Cobrado:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #ffffff;">${formattedPrice}/mês</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #a1a1aa;">Capacidade da Gruta:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #ffffff;">${
          data.maxDebtors ? `${data.maxDebtors} presas simultâneas` : "Presas Ilimitadas"
        }</td>
      </tr>
    </table>
    ${benefitsListHtml}
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #27272a; font-size: 12px; color: #e4e4e7; line-height: 1.5; font-family: monospace;">
      ${chargeNoteHtml}
    </div>
  `

  const html = renderBaseEmailLayout({
    title: isUpgrade ? "Evolução de Predador Confirmada" : "Alteração de Plano Confirmada",
    previewText: `Obrigado pela confiança! Seu plano no Caloteiro agora é ${data.newPlanName} (${formattedPrice}/mês). Confira os benefícios liberados.`,
    name: data.recipientName,
    contentHtml,
    highlightCardHtml,
    buttonText: "Entrar na Minha Gruta",
    buttonUrl: `${APP_URL}/painel`,
    footerNote: "Você tem liberdade total para gerenciar ou ajustar sua assinatura quando quiser diretamente pelo seu painel.",
  })

  return { subject, html }
}
