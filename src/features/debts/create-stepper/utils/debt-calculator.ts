import { formatBRL, formatDate } from "@/commons/utils/format";
import type { InterestType } from "@/commons/models/debt";

/**
 * Incrementa meses preservando o dia do mês sem desvios de timezone
 */
export function addMonthsToDateString(dateStr: string, monthsToAdd: number): string {
  if (!dateStr) return "";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const targetDate = new Date(year, month + monthsToAdd, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  // Quantidade de dias no mês de destino
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const finalDay = Math.min(day, daysInTargetMonth);

  const finalYearStr = String(targetYear).padStart(4, "0");
  const finalMonthStr = String(targetMonth + 1).padStart(2, "0");
  const finalDayStr = String(finalDay).padStart(2, "0");

  return `${finalYearStr}-${finalMonthStr}-${finalDayStr}`;
}

export interface CalculationResult {
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  interestType: InterestType;
  interestRate: number;
  installmentsCount: number;
  baseInstallmentNominal: number;
}

/**
 * Calcula o acréscimo e o valor total final com base na modalidade de juros escolhida
 */
export function calculateDebtTotals(params: {
  principalAmount: number;
  interestType: InterestType;
  interestRate: number;
  installmentsCount: number;
}): CalculationResult {
  const { principalAmount, interestType, interestRate, installmentsCount } = params;

  if (principalAmount <= 0) {
    return {
      principalAmount: 0,
      interestAmount: 0,
      totalAmount: 0,
      interestType,
      interestRate,
      installmentsCount: Math.max(1, installmentsCount),
      baseInstallmentNominal: 0,
    };
  }

  let interestAmount = 0;

  if (interestType === "fixed") {
    // Taxa fixa direta em reais no total
    interestAmount = Math.max(0, interestRate);
  } else if (interestType === "total_percentage") {
    // Percentual único sobre o montante total
    interestAmount = principalAmount * (Math.max(0, interestRate) / 100);
  } else if (interestType === "monthly_percentage") {
    // Percentual simples por mês x quantidade de parcelas
    const monthlyRate = Math.max(0, interestRate) / 100;
    interestAmount = principalAmount * monthlyRate * installmentsCount;
  } else {
    // Sem juros
    interestAmount = 0;
  }

  // Arredonda para 2 casas decimais
  const roundedInterest = Math.round(interestAmount * 100) / 100;
  const totalAmount = Math.round((principalAmount + roundedInterest) * 100) / 100;
  const count = Math.max(1, installmentsCount);
  const baseInstallmentNominal = Math.round((totalAmount / count) * 100) / 100;

  return {
    principalAmount,
    interestAmount: roundedInterest,
    totalAmount,
    interestType,
    interestRate,
    installmentsCount: count,
    baseInstallmentNominal,
  };
}

export interface ProjectedInstallmentItem {
  number: number;
  dueDate: string;
  formattedDueDate: string;
  nominalAmount: number;
  formattedNominalAmount: string;
  isFirstAdjusted: boolean;
}

/**
 * Projeta a lista individual das parcelas com garantia de exatidão de centavos
 * (a 1ª parcela absorve qualquer resto da divisão)
 */
export function projectInstallmentsSchedule(
  totalAmount: number,
  installmentsCount: number,
  firstDueDateStr: string
): ProjectedInstallmentItem[] {
  if (totalAmount <= 0 || installmentsCount <= 0 || !firstDueDateStr) {
    return [];
  }

  const totalCents = Math.round(totalAmount * 100);
  const count = installmentsCount;
  const baseCents = Math.floor(totalCents / count);
  const remainderCents = totalCents - baseCents * count;

  const result: ProjectedInstallmentItem[] = [];

  for (let i = 1; i <= count; i++) {
    const nominalCents = i === 1 ? baseCents + remainderCents : baseCents;
    const nominalAmount = nominalCents / 100;
    const dueDate = addMonthsToDateString(firstDueDateStr, i - 1);

    result.push({
      number: i,
      dueDate,
      formattedDueDate: formatDate(dueDate),
      nominalAmount,
      formattedNominalAmount: formatBRL(nominalAmount),
      isFirstAdjusted: i === 1 && remainderCents > 0,
    });
  }

  return result;
}

