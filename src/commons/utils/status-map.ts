import { CardAccent } from "@/components/cards/summary-card"
import { FaCircleCheck, FaClock, FaUsers, FaUserXmark } from "react-icons/fa6"
import { IconType } from "react-icons"

export type MetricStatus = "LOW" | "STABLE" | "HIGH"

export type SummaryCardConfig = {
  key: string
  title: string
  accent: CardAccent
  icon: IconType
  helpText: string
}

export const SUMMARY_CARD_CONFIGS: Record<string, SummaryCardConfig> = {
  EM_ABERTO: {
    key: "em_aberto",
    title: "Em Aberto",
    accent: "neutral",
    icon: FaUsers,
    helpText: "Total de figurinhas com promessas e pendências na pista.",
  },
  EM_DIA: {
    key: "em_dia",
    title: "Em Dia",
    accent: "emerald",
    icon: FaCircleCheck,
    helpText: "Milagreiros que honram os pagamentos sem você precisar mandar 10 áudios.",
  },
  EM_ATRASO: {
    key: "em_atraso",
    title: "Em Atraso",
    accent: "amber",
    icon: FaClock,
    helpText: "Caloteiros em treinamento que sumiram do WhatsApp e esqueceram o Pix.",
  },
  CALOTEIROS: {
    key: "caloteiros",
    title: "Caloteiros",
    accent: "rose",
    icon: FaUserXmark,
    helpText: "Casos graves com diploma de sumiço. Hora de agir ou aceitar o golpe.",
  },
}

export function formatTrendStatus(changePercent: number, isNegativeMetric = false) {
  let status: MetricStatus = "STABLE"
  if (changePercent > 0) status = "HIGH"
  if (changePercent < 0) status = "LOW"

  const formattedValue = `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(0)}%`

  return {
    status,
    negative: isNegativeMetric,
    statusText: formattedValue,
  }
}
