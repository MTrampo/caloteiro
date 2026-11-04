import {
  format,
  isToday,
  isYesterday,
  isTomorrow,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns"
import { ptBR } from "date-fns/locale"

export interface RelativeDueDate {
  formatted: string
  detail: string
  isPast: boolean
  isToday: boolean
  daysDifference: number
  severity: "critical" | "warning" | "neutral" | "future"
}

/**
 * Normaliza datas (especialmente strings YYYY-MM-DD vindas do banco) para o fuso local,
 * prevenindo o recuo de 3 horas em UTC-3 que transforma 05/11 em 04/11.
 */
export function parseDateOnly(targetDate: Date | string): Date {
  if (targetDate instanceof Date) return targetDate
  if (typeof targetDate === "string") {
    const match = targetDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const day = parseInt(match[3], 10)
      return new Date(year, month, day)
    }
    return new Date(targetDate)
  }
  return new Date()
}

/**
 * Formata datas de vencimento relativas para a linguagem humana do sistema.
 * Ex: "Hoje", "Ontem", "Amanhã", "Segunda-feira", "23/11/2026"
 */
export function formatRelativeDueDate(targetDate: Date | string): RelativeDueDate {
  const date = parseDateOnly(targetDate)
  const today = startOfDay(new Date())
  const targetDay = startOfDay(date)
  const diffDays = differenceInCalendarDays(targetDay, today)

  if (isToday(date)) {
    return {
      formatted: "Hoje",
      detail: "Vence hoje até 23h59 — hora de cobrar!",
      isPast: false,
      isToday: true,
      daysDifference: 0,
      severity: "warning",
    }
  }

  if (isYesterday(date)) {
    return {
      formatted: "Ontem",
      detail: `Venceu ontem (${format(date, "dd/MM")}) — mande o 'bom dia'`,
      isPast: true,
      isToday: false,
      daysDifference: -1,
      severity: "warning",
    }
  }

  if (isTomorrow(date)) {
    return {
      formatted: "Amanhã",
      detail: `Vence amanhã (${format(date, "dd/MM")})`,
      isPast: false,
      isToday: false,
      daysDifference: 1,
      severity: "neutral",
    }
  }

  // Passado (> 1 dia em atraso)
  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays)
    const isCritical = daysAgo >= 30

    if (daysAgo < 7) {
      const weekday = format(date, "EEEE", { locale: ptBR })
      const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
      return {
        formatted: `${capitalized}`,
        detail: `Venceu há ${daysAgo} dias (${format(date, "dd/MM")})`,
        isPast: true,
        isToday: false,
        daysDifference: diffDays,
        severity: isCritical ? "critical" : "warning",
      }
    }

    return {
      formatted: format(date, "dd/MM/yyyy"),
      detail: `Atrasado há ${daysAgo} dias — ${isCritical ? "Alerta vermelho de calote" : "Atraso leve"}`,
      isPast: true,
      isToday: false,
      daysDifference: diffDays,
      severity: isCritical ? "critical" : "warning",
    }
  }

  // Futuro (> 1 dia)
  if (diffDays <= 6) {
    const weekday = format(date, "EEEE", { locale: ptBR })
    const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
    return {
      formatted: `${capitalized}`,
      detail: `Vence em ${diffDays} dias (${format(date, "dd/MM")})`,
      isPast: false,
      isToday: false,
      daysDifference: diffDays,
      severity: "future",
    }
  }

  return {
    formatted: format(date, "dd/MM/yyyy"),
    detail: `Vence em ${diffDays} dias`,
    isPast: false,
    isToday: false,
    daysDifference: diffDays,
    severity: "future",
  }
}

/**
 * Formata valores numéricos para moeda Real (R$ 1.234,56)
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formata valores numéricos compactos (R$ 38.200)
 */
export function formatCompactCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

