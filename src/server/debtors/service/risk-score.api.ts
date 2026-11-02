import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/commons/lib/cache/server-cache";
import { getSecondsUntilMidnightSaoPaulo } from "@/commons/utils/date";
import { ApiResponse } from "@/commons/lib/http/responses";
import type { ResponseProps } from "@/commons/models/api";
import {
  BIOLOGICAL_TIER_METADATA,
  type BiologicalTier,
  type CalculateDebtorRiskScoreInput,
  type DebtorRaioXData,
  type DebtorRaioXDebtItem,
  type DebtorRaioXExcuseItem,
  type DebtorRiskScoreResult,
  type DebtorRiskScoreSummary,
  type GrottoThermometerData,
  type RiskScoreBadge,
  type RiskScoreFactor,
  type ThermometerDebtorItem,
  type ThermometerGroup,
  type WhatsappWeaponLevel,
} from "@/commons/models/risk-score";
import type { DebtorItemFormatted } from "@/commons/models/debtor";
import {
  formatBRL,
  formatDate,
  formatProperName,
  getCalendarDateInSaoPaulo,
  presentDebtorItem,
} from "@/commons/utils/format";
import {
  getBatchDebtorsRiskContextSupabase,
  getDebtorRiskContextByIdSupabase,
} from "../repository/risk-score.supabase";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";

export const INITIAL_RISK_SCORE = 50;

/**
 * Calcula a diferença em dias corridos entre duas datas YYYY-MM-DD (dateB - dateA)
 */
export function diffCalendarDays(dateAStr: string, dateBStr: string): number {
  const cleanA = dateAStr.slice(0, 10);
  const cleanB = dateBStr.slice(0, 10);
  const [aY, aM, aD] = cleanA.split("-").map(Number);
  const [bY, bM, bD] = cleanB.split("-").map(Number);

  const utcA = Date.UTC(aY, aM - 1, aD);
  const utcB = Date.UTC(bY, bM - 1, bD);
  return Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
}

/**
 * Classifica a pontuação (0 a 100) na Escada Biológica de 5 níveis
 */
export function resolveBiologicalTier(score: number): BiologicalTier {
  if (score >= 85) return "flying_fish";
  if (score >= 50) return "slippery_fish";
  if (score >= 35) return "trainee_defaulter";
  if (score >= 15) return "defaulter";
  return "professional_defaulter";
}

/**
 * Determina o Nível da Arma de WhatsApp com base no Score
 */
export function resolveWhatsappWeaponLevel(score: number): {
  level: WhatsappWeaponLevel;
  label: string;
} {
  if (score >= 50) {
    return { level: 1, label: "Nível 1: Lembrete Amigável" };
  }
  if (score >= 35) {
    return { level: 2, label: "Nível 2: Cobrança Ácida" };
  }
  return { level: 3, label: "Nível 3: Modo Tio Patinhas (Ultimato)" };
}

/**
 * Monta a URL do WhatsApp com a arma pré-engatilhada de acordo com o Score da presa
 */
export function buildWeaponWhatsappUrl(params: {
  debtorName: string;
  debtorPhone: string;
  weaponLevel: WhatsappWeaponLevel;
  creditorPixKey?: string | null;
  openExposureAmount?: number;
}): string {
  const cleanPhone = (params.debtorPhone || "").replace(/\D/g, "");
  const formattedName = formatProperName(params.debtorName || "Parceiro");
  const pixPart = params.creditorPixKey
    ? ` Segue a chave Pix: ${params.creditorPixKey}.`
    : "";
  const amountPart =
    params.openExposureAmount && params.openExposureAmount > 0
      ? ` (${formatBRL(params.openExposureAmount)} em aberto)`
      : "";

  let message = "";
  if (params.weaponLevel === 1) {
    message = `Fala ${formattedName}, beleza? Passando só pra alinhar nossas pendências${amountPart}.${pixPart} Valeu!\n\n_(Notificação automática • Sistema Caloteiro)_`;
  } else if (params.weaponLevel === 2) {
    message = `E aí ${formattedName}! Nosso prazo já escorregou e o Pix ainda não pingou${amountPart}. Meu boleto não espera, meu parceiro!${pixPart}\n\n_(Disparo automático de cobrança • Sistema Caloteiro)_`;
  } else {
    message = `Alerta vermelho, ${formattedName}. Você sumiu e a paciência do Tubarão chegou no limite${amountPart}. Vai honrar sua palavra no Pix agora ou vamos resolver de outro jeito?${pixPart}\n\n_(Alerta crítico automático • Sistema Caloteiro)_`;
  }

  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Motor matemático puro da "Mordida Exploratória" (Score 0 a 100, iniciando em 50 pts)
 */
export function calculateDebtorRiskScore(
  input: CalculateDebtorRiskScoreInput
): DebtorRiskScoreResult {
  const todayStr = getCalendarDateInSaoPaulo(input.referenceDate || new Date());
  const factors: RiskScoreFactor[] = [
    {
      id: "initial_base",
      label: "Ponto de partida na gruta (Peixe Ensaboado)",
      points: INITIAL_RISK_SCORE,
      occurrences: 1,
      type: "base",
    },
  ];

  let rawScore = INITIAL_RISK_SCORE;

  // Contadores de eventos para fatores e badges
  let earlyPaidCount = 0;
  let onTimePaidCount = 0;
  let paidLightDelayCount = 0;
  let paidHeavyDelayCount = 0;

  let activeOverdueLightCount = 0;  // 1 a 5 dias
  let activeOverdueMediumCount = 0; // 6 a 15 dias
  let activeOverdueHeavyCount = 0;  // > 15 dias
  let maxActiveOverdueDays = 0;

  let totalDaysToPaySum = 0;
  let paidInstallmentsTotal = 0;
  let openExposureCents = 0;

  // Mapa rápido de pagamentos por debt_id (mais recente primeiro)
  const paymentsByDebt = new Map<string, string[]>();
  for (const p of input.payments) {
    const list = paymentsByDebt.get(p.debt_id) || [];
    list.push(p.paid_at);
    paymentsByDebt.set(p.debt_id, list);
  }

  const unpaidInstallmentIds = new Set<string>();
  const overdueByDebtCount = new Map<string, number>();

  for (const inst of input.installments) {
    const nominalCents = Math.round(Number(inst.nominal_amount || 0) * 100);
    const paidCents = Math.round(Number(inst.paid_amount || 0) * 100);
    const isPaid = inst.status === "paid" || (nominalCents > 0 && paidCents >= nominalCents);

    if (isPaid) {
      paidInstallmentsTotal++;
      const debtPayments = paymentsByDebt.get(inst.debt_id);
      const effectivePaidDateStr =
        inst.updated_at || (debtPayments && debtPayments[0]) || inst.due_date;
      const paidCalendarStr = getCalendarDateInSaoPaulo(effectivePaidDateStr);
      const delayDays = diffCalendarDays(inst.due_date, paidCalendarStr);

      totalDaysToPaySum += Math.max(0, delayDays);

      if (delayDays < 0) {
        earlyPaidCount++;
      } else if (delayDays === 0) {
        onTimePaidCount++;
      } else if (delayDays <= 5) {
        paidLightDelayCount++;
      } else {
        paidHeavyDelayCount++;
      }
    } else {
      unpaidInstallmentIds.add(inst.id);
      const remainingCents = Math.max(0, nominalCents - paidCents);
      openExposureCents += remainingCents;

      const overdueDays = diffCalendarDays(inst.due_date, todayStr);
      if (overdueDays > 0) {
        overdueByDebtCount.set(
          inst.debt_id,
          (overdueByDebtCount.get(inst.debt_id) || 0) + 1
        );
        if (overdueDays > maxActiveOverdueDays) {
          maxActiveOverdueDays = overdueDays;
        }
        if (overdueDays <= 5) {
          activeOverdueLightCount++;
        } else if (overdueDays <= 15) {
          activeOverdueMediumCount++;
        } else {
          activeOverdueHeavyCount++;
        }
      }
    }
  }

  // 1. Cicatrização por pagamentos adiantados (+6 pts)
  if (earlyPaidCount > 0) {
    const pts = earlyPaidCount * 6;
    rawScore += pts;
    factors.push({
      id: "paid_early",
      label: "Parcelas pagas antes do vencimento (+6 pts cada)",
      points: pts,
      occurrences: earlyPaidCount,
      type: "healing",
    });
  }

  // 2. Cicatrização por pagamentos em dia (+4 pts)
  if (onTimePaidCount > 0) {
    const pts = onTimePaidCount * 4;
    rawScore += pts;
    factors.push({
      id: "paid_on_time",
      label: "Parcelas pagas rigorosamente no prazo (+4 pts cada)",
      points: pts,
      occurrences: onTimePaidCount,
      type: "healing",
    });
  }

  // 3. Análise de Acordos (Quitados vs Quebrados)
  let settledDebtsCount = 0;
  let activeDebtsCount = 0;
  let breachedDebtsCount = 0;
  let totalBorrowedCents = 0;

  for (const debt of input.debts) {
    const debtTotal = Number(debt.total_amount ?? debt.original_amount ?? 0);
    totalBorrowedCents += Math.round(debtTotal * 100);

    const overdueInDebt = overdueByDebtCount.get(debt.id) || 0;
    const isBreached =
      debt.status === "defaulted" ||
      debt.status === "judicial" ||
      (debt.max_late_installments !== null &&
        debt.max_late_installments !== undefined &&
        debt.max_late_installments > 0 &&
        overdueInDebt >= debt.max_late_installments);

    if (debt.status === "settled") {
      settledDebtsCount++;
    } else if (isBreached) {
      breachedDebtsCount++;
      activeDebtsCount++;
    } else {
      activeDebtsCount++;
    }
  }

  if (settledDebtsCount > 0) {
    const pts = settledDebtsCount * 10;
    rawScore += pts;
    factors.push({
      id: "settled_debts",
      label: "Acordos inteiros quitados até o fim (+10 pts cada)",
      points: pts,
      occurrences: settledDebtsCount,
      type: "healing",
    });
  }

  // 4. Sangramento por parcelas já pagas mas com atraso histórico
  if (paidLightDelayCount > 0) {
    const pts = -(paidLightDelayCount * 2);
    rawScore += pts;
    factors.push({
      id: "paid_light_delay",
      label: "Atraso leve histórico (1 a 5 dias) em parcelas quitadas (-2 pts cada)",
      points: pts,
      occurrences: paidLightDelayCount,
      type: "bleeding",
    });
  }

  if (paidHeavyDelayCount > 0) {
    const pts = -(paidHeavyDelayCount * 5);
    rawScore += pts;
    factors.push({
      id: "paid_heavy_delay",
      label: "Atraso grave histórico (> 5 dias) em parcelas quitadas (-5 pts cada)",
      points: pts,
      occurrences: paidHeavyDelayCount,
      type: "bleeding",
    });
  }

  // 5. Sangramento por parcelas atualmente vencidas (Ativas)
  if (activeOverdueLightCount > 0) {
    const pts = -(activeOverdueLightCount * 8);
    rawScore += pts;
    factors.push({
      id: "active_overdue_light",
      label: "Parcela vencida há poucos dias (1 a 5 dias) (-8 pts cada)",
      points: pts,
      occurrences: activeOverdueLightCount,
      type: "bleeding",
    });
  }

  if (activeOverdueMediumCount > 0) {
    const pts = -(activeOverdueMediumCount * 15);
    rawScore += pts;
    factors.push({
      id: "active_overdue_medium",
      label: "Parcela em atraso médio (6 a 15 dias) (-15 pts cada)",
      points: pts,
      occurrences: activeOverdueMediumCount,
      type: "bleeding",
    });
  }

  if (activeOverdueHeavyCount > 0) {
    const pts = -(activeOverdueHeavyCount * 25);
    rawScore += pts;
    factors.push({
      id: "active_overdue_heavy",
      label: "Parcela em atraso crítico (> 15 dias) (-25 pts cada)",
      points: pts,
      occurrences: activeOverdueHeavyCount,
      type: "bleeding",
    });
  }

  // 6. Histórico de Meteção de Louco (Caôs / Desculpas)
  const excusesCount = input.excuses.length;
  let honoredExcusesCount = 0;
  let brokenExcusesCount = 0;

  for (const exc of input.excuses) {
    if (exc.was_honored === true) {
      honoredExcusesCount++;
    } else if (
      exc.was_honored === false ||
      (unpaidInstallmentIds.has(exc.installment_id) &&
        diffCalendarDays(exc.promised_date, todayStr) > 0)
    ) {
      brokenExcusesCount++;
    }
  }

  if (excusesCount > 0) {
    const pts = -(excusesCount * 6);
    rawScore += pts;
    factors.push({
      id: "excuses_recorded",
      label: "Desculpas e caôs anotados no mural (-6 pts cada)",
      points: pts,
      occurrences: excusesCount,
      type: "bleeding",
    });
  }

  if (honoredExcusesCount > 0) {
    const pts = honoredExcusesCount * 3;
    rawScore += pts;
    factors.push({
      id: "excuses_honored",
      label: "Promessas de renegociação cumpridas no prazo (+3 pts cada)",
      points: pts,
      occurrences: honoredExcusesCount,
      type: "healing",
    });
  }

  if (brokenExcusesCount > 0) {
    const pts = -(brokenExcusesCount * 10);
    rawScore += pts;
    factors.push({
      id: "excuses_broken",
      label: "Promessas de caô vencidas e não cumpridas (-10 pts cada)",
      points: pts,
      occurrences: brokenExcusesCount,
      type: "bleeding",
    });
  }

  // 7. Quebra de acordo / Judicial (-30 pts)
  if (breachedDebtsCount > 0) {
    const pts = -(breachedDebtsCount * 30);
    rawScore += pts;
    factors.push({
      id: "breached_debts",
      label: "Quebra de acordo ou limite de tolerância estourado (-30 pts cada)",
      points: pts,
      occurrences: breachedDebtsCount,
      type: "bleeding",
    });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const tier = resolveBiologicalTier(finalScore);
  const tierMeta = BIOLOGICAL_TIER_METADATA[tier];
  const weapon = resolveWhatsappWeaponLevel(finalScore);

  const overdueInstallmentsCount =
    activeOverdueLightCount + activeOverdueMediumCount + activeOverdueHeavyCount;
  const paidOnTimeTotal = earlyPaidCount + onTimePaidCount;
  const totalInstallmentsCount = input.installments.length;

  // Cálculo do Delta Recente para mostrar a Cicatrização ou Sangramento ativo
  let recentDelta = 0;
  let recentDeltaLabel = "Score inicial na gruta (50 pts)";

  if (breachedDebtsCount > 0) {
    recentDelta = -30;
    recentDeltaLabel = "-30 pts por quebra de acordo";
  } else if (activeOverdueHeavyCount > 0) {
    recentDelta = -25;
    recentDeltaLabel = "-25 pts por atraso crítico (> 15d)";
  } else if (activeOverdueMediumCount > 0) {
    recentDelta = -15;
    recentDeltaLabel = "-15 pts por atraso ativo";
  } else if (brokenExcusesCount > 0) {
    recentDelta = -10;
    recentDeltaLabel = "-10 pts por promessa furada";
  } else if (activeOverdueLightCount > 0) {
    recentDelta = -8;
    recentDeltaLabel = "-8 pts por parcela vencida";
  } else if (excusesCount > 0 && paidOnTimeTotal === 0) {
    recentDelta = -6;
    recentDeltaLabel = "-6 pts por caô registrado";
  } else if (settledDebtsCount > 0) {
    recentDelta = 10;
    recentDeltaLabel = "+10 pts por acordo quitado";
  } else if (earlyPaidCount > 0) {
    recentDelta = 6;
    recentDeltaLabel = "+6 pts com Pix adiantado";
  } else if (onTimePaidCount > 0) {
    recentDelta = 4;
    recentDeltaLabel = "+4 pts com Pix em dia";
  } else if (finalScore !== INITIAL_RISK_SCORE) {
    recentDelta = finalScore - INITIAL_RISK_SCORE;
    recentDeltaLabel =
      recentDelta > 0
        ? `+${recentDelta} pts acumulados na gruta`
        : `${recentDelta} pts acumulados na gruta`;
  }

  // Gamificação: Insígnias Comportamentais da Presa
  const badges: RiskScoreBadge[] = [];

  const hadPastSlip =
    excusesCount > 0 || paidLightDelayCount > 0 || paidHeavyDelayCount > 0;

  if (
    totalInstallmentsCount === 0 ||
    (paidInstallmentsTotal === 0 && overdueInstallmentsCount === 0 && excusesCount === 0)
  ) {
    badges.push({
      id: "fresh_prey",
      label: "Recém-Marcada",
      description: "Ainda na linha dos 50 pts aguardando o primeiro vencimento pra mostrar quem é.",
      variant: "zinc",
    });
  }

  if (
    paidOnTimeTotal >= 3 &&
    overdueInstallmentsCount === 0 &&
    paidLightDelayCount === 0 &&
    paidHeavyDelayCount === 0
  ) {
    badges.push({
      id: "swiss_watch",
      label: "Relógio Suíço",
      description: "3 ou mais parcelas pagas com 100% de pontualidade e zero atrasos.",
      variant: "emerald",
    });
  }

  if (hadPastSlip && overdueInstallmentsCount === 0 && finalScore >= 70) {
    badges.push({
      id: "rehabilitation_miracle",
      label: "Milagre da Reabilitação",
      description: "Já deu trabalho no passado, mas cicatrizou o score pagando tudo em dia.",
      variant: "emerald",
    });
  }

  if (excusesCount >= 3) {
    badges.push({
      id: "excuse_king",
      label: "Rei do Caô",
      description: `Acumula ${excusesCount} desculpas registradas no Histórico de Meteção de Louco.`,
      variant: "amber",
    });
  }

  if (maxActiveOverdueDays > 15) {
    badges.push({
      id: "whatsapp_ghost",
      label: "Fantasma do WhatsApp",
      description: `Parcela vencida há ${maxActiveOverdueDays} dias sem dar sinal de Pix.`,
      variant: "rose",
    });
  }

  const openExposureAmount = openExposureCents / 100;
  const totalBorrowedAmount = totalBorrowedCents / 100;
  const totalPaidCents = input.payments.reduce(
    (acc, p) => acc + Math.round(Number(p.amount || 0) * 100),
    0
  );
  const totalPaidAmount = totalPaidCents / 100;

  const evaluatedInstallments = paidInstallmentsTotal + overdueInstallmentsCount;
  const punctualityRate =
    evaluatedInstallments > 0
      ? Math.round((paidOnTimeTotal / evaluatedInstallments) * 100)
      : 100;

  const averageDaysToPay =
    paidInstallmentsTotal > 0
      ? Math.round(totalDaysToPaySum / paidInstallmentsTotal)
      : 0;

  const recommendedWhatsappUrl = buildWeaponWhatsappUrl({
    debtorName: input.debtorName,
    debtorPhone: input.debtorPhone,
    weaponLevel: weapon.level,
    creditorPixKey: input.creditorPixKey,
    openExposureAmount,
  });

  return {
    score: finalScore,
    tier,
    tierLabel: tierMeta.label,
    tierShortLabel: tierMeta.shortLabel,
    tierDescription: tierMeta.description,
    colorHex: tierMeta.colorHex,
    badgeClass: tierMeta.badgeClass,
    textClass: tierMeta.textClass,
    recentDelta,
    recentDeltaLabel,
    weaponLevel: weapon.level,
    weaponLabel: weapon.label,
    recommendedWhatsappUrl,
    overdueInstallmentsCount,
    excusesCount,
    paidOnTimeCount: paidOnTimeTotal,
    totalInstallmentsCount,
    openExposureAmount,
    badges,
    factors,
    punctualityRate,
    averageDaysToPay,
    settledDebtsCount,
    activeDebtsCount,
    breachedDebtsCount,
    totalBorrowedAmount,
    totalPaidAmount,
  };
}

/**
 * Enriquece uma lista de DebtorItemFormatted com seus respectivos RiskScores (quando canRiskScore = true)
 */
export const enrichDebtorsWithRiskScoreApi = async (
  userId: string,
  debtorsFormatted: DebtorItemFormatted[],
  canRiskScore?: boolean
): Promise<DebtorItemFormatted[]> => {
  if (debtorsFormatted.length === 0) return [];

  const hasPermission =
    canRiskScore !== undefined
      ? canRiskScore
      : (await getUserPermissionsOrCacheApi(userId)).canRiskScore;

  if (!hasPermission) {
    return debtorsFormatted.map((d) => ({ ...d, riskScore: null }));
  }

  const debtorIds = debtorsFormatted.map((d) => d.id);
  const bundle = await getBatchDebtorsRiskContextSupabase(userId, debtorIds);

  return debtorsFormatted.map((debtor) => {
    const debtorDebts = bundle.debts.filter((d) => d.debtor_id === debtor.id);
    const debtorInstallments = bundle.installments.filter(
      (i) => i.debtor_id === debtor.id
    );
    const debtorPayments = bundle.payments.filter((p) => p.debtor_id === debtor.id);
    const debtorExcuses = bundle.excuses.filter((e) => e.debtor_id === debtor.id);

    const fullScore = calculateDebtorRiskScore({
      debtorId: debtor.id,
      debtorName: debtor.name,
      debtorPhone: debtor.phone,
      creditorPixKey: bundle.creditorPixKey,
      debts: debtorDebts,
      installments: debtorInstallments,
      payments: debtorPayments,
      excuses: debtorExcuses,
    });

    const summary: DebtorRiskScoreSummary = {
      score: fullScore.score,
      tier: fullScore.tier,
      tierLabel: fullScore.tierLabel,
      tierShortLabel: fullScore.tierShortLabel,
      tierDescription: fullScore.tierDescription,
      colorHex: fullScore.colorHex,
      badgeClass: fullScore.badgeClass,
      textClass: fullScore.textClass,
      recentDelta: fullScore.recentDelta,
      recentDeltaLabel: fullScore.recentDeltaLabel,
      weaponLevel: fullScore.weaponLevel,
      weaponLabel: fullScore.weaponLabel,
      recommendedWhatsappUrl: fullScore.recommendedWhatsappUrl,
      overdueInstallmentsCount: fullScore.overdueInstallmentsCount,
      excusesCount: fullScore.excusesCount,
      paidOnTimeCount: fullScore.paidOnTimeCount,
      totalInstallmentsCount: fullScore.totalInstallmentsCount,
      openExposureAmount: fullScore.openExposureAmount,
      badges: fullScore.badges,
    };

    return {
      ...debtor,
      whatsAppUrl: fullScore.recommendedWhatsappUrl,
      riskScore: summary,
    };
  });
};

/**
 * Carrega o Raio-X Comportamental Completo de uma Presa (/painel/devedores/[id])
 * Exclusivo do plano Tubarão Cabeça Chata (canRiskScore = true)
 */
export const getDebtorRaioXApi = async (
  debtorId: string,
  userId: string
): Promise<ResponseProps<DebtorRaioXData>> => {
  const permissions = await getUserPermissionsOrCacheApi(userId);
  if (!permissions.canRiskScore) {
    return ApiResponse.Forbidden({
      message:
        "O Raio-X Comportamental e o Velocímetro de Score são armas exclusivas do Tubarão Cabeça Chata!",
      error: "PLAN_UPGRADE_REQUIRED",
    });
  }

  const todayStr = getCalendarDateInSaoPaulo(new Date());
  const ttlSeconds = getSecondsUntilMidnightSaoPaulo();

  const getCachedRaioX = unstable_cache(
    async (dId: string, uId: string): Promise<DebtorRaioXData | null> => {
      const bundle = await getDebtorRiskContextByIdSupabase(dId, uId);
      if (!bundle) return null;

      const riskScore = calculateDebtorRiskScore({
        debtorId: bundle.debtor.id,
        debtorName: bundle.debtor.name,
        debtorPhone: bundle.debtor.phone,
        creditorPixKey: bundle.creditorPixKey,
        debts: bundle.debts,
        installments: bundle.installments,
        payments: bundle.payments,
        excuses: bundle.excuses,
      });

      const debtorFormatted: DebtorItemFormatted = {
        ...presentDebtorItem(bundle.debtor),
        whatsAppUrl: riskScore.recommendedWhatsappUrl,
        riskScore,
      };

      // Mapeia dívidas do devedor
      const debtMap = new Map<string, { title: string }>();
      const debtsFormatted: DebtorRaioXDebtItem[] = bundle.debts.map((debt) => {
        debtMap.set(debt.id, { title: debt.title });
        const debtInsts = bundle.installments.filter((i) => i.debt_id === debt.id);

        let paidCount = 0;
        let overdueCount = 0;
        let paidCents = 0;
        let totalNominalCents = 0;

        for (const inst of debtInsts) {
          const nom = Math.round(Number(inst.nominal_amount || 0) * 100);
          const pd = Math.round(Number(inst.paid_amount || 0) * 100);
          totalNominalCents += nom;
          paidCents += Math.min(nom, pd);

          if (inst.status === "paid" || (nom > 0 && pd >= nom)) {
            paidCount++;
          } else if (diffCalendarDays(inst.due_date, todayStr) > 0) {
            overdueCount++;
          }
        }

        const totalAmount =
          totalNominalCents > 0
            ? totalNominalCents / 100
            : Number(debt.total_amount ?? debt.original_amount ?? 0);
        const paidAmount = paidCents / 100;
        const remainingAmount = Math.max(0, (totalNominalCents - paidCents) / 100);

        let statusLabel = "Em andamento";
        let statusBadgeClass = "bg-zinc-800 text-zinc-300 border-zinc-700";

        if (debt.status === "settled" || (debtInsts.length > 0 && paidCount >= debtInsts.length)) {
          statusLabel = "Quitada";
          statusBadgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        } else if (debt.status === "defaulted" || overdueCount >= 2) {
          statusLabel = "Quebra / Crítico";
          statusBadgeClass = "bg-rose-500/15 text-rose-400 border-rose-500/30";
        } else if (overdueCount > 0) {
          statusLabel = `${overdueCount} em atraso`;
          statusBadgeClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
        }

        return {
          id: debt.id,
          title: debt.title,
          status: debt.status,
          statusLabel,
          statusBadgeClass,
          originalAmount: Number(debt.original_amount || 0),
          totalAmount,
          paidAmount,
          remainingAmount,
          formattedTotalAmount: formatBRL(totalAmount),
          formattedPaidAmount: formatBRL(paidAmount),
          formattedRemainingAmount: formatBRL(remainingAmount),
          formattedLoanDate: formatDate(debt.loan_date),
          installmentsCount: debtInsts.length || debt.installments_count || 1,
          paidInstallmentsCount: paidCount,
          overdueInstallmentsCount: overdueCount,
        };
      });

      // Mapa de parcelas para vincular desculpas
      const instMap = new Map<string, { debtId: string; number: number; isPaid: boolean }>();
      for (const inst of bundle.installments) {
        const isPaid =
          inst.status === "paid" ||
          Number(inst.paid_amount || 0) >= Number(inst.nominal_amount || 0);
        instMap.set(inst.id, {
          debtId: inst.debt_id,
          number: inst.installment_number,
          isPaid,
        });
      }

      const excusesFormatted: DebtorRaioXExcuseItem[] = bundle.excuses.map((exc) => {
        const instInfo = instMap.get(exc.installment_id);
        const debtId = instInfo?.debtId || "";
        const debtTitle = debtMap.get(debtId)?.title || "Acordo na Gruta";
        const wasHonored = Boolean(exc.was_honored || instInfo?.isPaid);

        return {
          id: exc.id,
          excuseText: exc.excuse_text,
          promisedDate: exc.promised_date,
          formattedPromisedDate: formatDate(exc.promised_date),
          formattedCreatedAt: formatDate(exc.created_at),
          wasHonored,
          debtId,
          debtTitle,
          installmentNumber: instInfo?.number || 1,
        };
      });

      return {
        debtor: debtorFormatted,
        riskScore,
        debts: debtsFormatted,
        excuses: excusesFormatted,
      };
    },
    ["debtor-raiox-data", debtorId, userId, todayStr],
    {
      revalidate: ttlSeconds,
      tags: [CACHE_TAGS.userData(userId), CACHE_TAGS.debtorDetails(debtorId)],
    }
  );

  const raioXData = await getCachedRaioX(debtorId, userId);
  if (!raioXData) {
    return ApiResponse.NotFound({
      message: "Presa não encontrada na sua gruta.",
    });
  }

  return ApiResponse.Ok({
    data: raioXData,
    message: "Raio-X comportamental da presa carregado com sucesso.",
  });
};

/**
 * Calcula o Termômetro Geral da Gruta (Visão macro da base de devedores do Tubarão)
 */
export const getGrottoThermometerDataApi = async (
  userId: string
): Promise<ResponseProps<GrottoThermometerData>> => {
  const permissions = await getUserPermissionsOrCacheApi(userId);
  if (!permissions.canRiskScore) {
    return ApiResponse.Forbidden({
      message:
        "O Termômetro da Gruta é exclusivo do plano Tubarão Cabeça Chata!",
      error: "PLAN_UPGRADE_REQUIRED",
    });
  }

  const todayStr = getCalendarDateInSaoPaulo(new Date());
  const ttlSeconds = getSecondsUntilMidnightSaoPaulo();

  const getCachedThermometer = unstable_cache(
    async (uid: string): Promise<GrottoThermometerData> => {
      const bundle = await getBatchDebtorsRiskContextSupabase(uid);
      const totalDebtors = bundle.debtors.length;

      let eliteCount = 0;
      let averageCount = 0;
      let defaulterCount = 0;

      let safeExposureCents = 0;
      let riskExposureCents = 0;
      let scoreSum = 0;

      const debtorsRanked: ThermometerDebtorItem[] = bundle.debtors.map((rawDebtor) => {
        const debtorDebts = bundle.debts.filter((d) => d.debtor_id === rawDebtor.id);
        const debtorInstallments = bundle.installments.filter(
          (i) => i.debtor_id === rawDebtor.id
        );
        const debtorPayments = bundle.payments.filter(
          (p) => p.debtor_id === rawDebtor.id
        );
        const debtorExcuses = bundle.excuses.filter(
          (e) => e.debtor_id === rawDebtor.id
        );

        const calc = calculateDebtorRiskScore({
          debtorId: rawDebtor.id,
          debtorName: rawDebtor.name,
          debtorPhone: rawDebtor.phone,
          creditorPixKey: bundle.creditorPixKey,
          debts: debtorDebts,
          installments: debtorInstallments,
          payments: debtorPayments,
          excuses: debtorExcuses,
        });

        scoreSum += calc.score;

        let group: ThermometerGroup = "average";
        if (calc.score >= 70) {
          group = "elite";
          eliteCount++;
        } else if (calc.score >= 50) {
          group = "average";
          averageCount++;
        } else {
          group = "defaulter";
          defaulterCount++;
        }

        const exposureCents = Math.round(calc.openExposureAmount * 100);
        if (calc.score >= 50) {
          safeExposureCents += exposureCents;
        } else {
          riskExposureCents += exposureCents;
        }

        const summary: DebtorRiskScoreSummary = {
          score: calc.score,
          tier: calc.tier,
          tierLabel: calc.tierLabel,
          tierShortLabel: calc.tierShortLabel,
          tierDescription: calc.tierDescription,
          colorHex: calc.colorHex,
          badgeClass: calc.badgeClass,
          textClass: calc.textClass,
          recentDelta: calc.recentDelta,
          recentDeltaLabel: calc.recentDeltaLabel,
          weaponLevel: calc.weaponLevel,
          weaponLabel: calc.weaponLabel,
          recommendedWhatsappUrl: calc.recommendedWhatsappUrl,
          overdueInstallmentsCount: calc.overdueInstallmentsCount,
          excusesCount: calc.excusesCount,
          paidOnTimeCount: calc.paidOnTimeCount,
          totalInstallmentsCount: calc.totalInstallmentsCount,
          openExposureAmount: calc.openExposureAmount,
          badges: calc.badges,
        };

        const debtorFormatted: DebtorItemFormatted = {
          ...presentDebtorItem(rawDebtor),
          whatsAppUrl: calc.recommendedWhatsappUrl,
          riskScore: summary,
        };

        return {
          debtor: debtorFormatted,
          riskScore: summary,
          group,
          formattedExposure: formatBRL(calc.openExposureAmount),
        };
      });

      // Ordena do menor score (maior perigo) para o maior por padrão, ou permite filtro na UI
      debtorsRanked.sort((a, b) => a.riskScore.score - b.riskScore.score);

      const overallScore =
        totalDebtors > 0 ? Math.round(scoreSum / totalDebtors) : INITIAL_RISK_SCORE;
      const overallTier = resolveBiologicalTier(overallScore);
      const overallTierMeta = BIOLOGICAL_TIER_METADATA[overallTier];

      const elitePercentage =
        totalDebtors > 0 ? Math.round((eliteCount / totalDebtors) * 100) : 0;
      const averagePercentage =
        totalDebtors > 0 ? Math.round((averageCount / totalDebtors) * 100) : 0;
      const defaulterPercentage =
        totalDebtors > 0
          ? Math.max(0, 100 - elitePercentage - averagePercentage)
          : 0;

      const totalExposureCents = safeExposureCents + riskExposureCents;
      const safeExposureAmount = safeExposureCents / 100;
      const riskExposureAmount = riskExposureCents / 100;
      const totalExposureAmount = totalExposureCents / 100;

      const riskExposurePercentage =
        totalExposureCents > 0
          ? Math.round((riskExposureCents / totalExposureCents) * 100)
          : 0;

      // Diagnóstico estratégico da carteira do Tubarão
      let diagnosisTitle = "Gruta Vazia (Sem Presas Marcadas)";
      let diagnosisDescription =
        "Cadastre seus devedores para o Termômetro medir o nível de risco da sua carteira.";
      let riskLevelLabel = "Aguardando Presas";

      if (totalDebtors > 0) {
        if (overallScore >= 70 && defaulterPercentage <= 20) {
          diagnosisTitle = "Mar Calmo: Cardume de Pagadores Exemplares";
          diagnosisDescription =
            "Sua base de clientes é saudável! A maioria das suas presas respeita o vencimento e mantém o dinheiro girando sem dor de cabeça.";
          riskLevelLabel = "Risco Baixo (Carteira Saudável)";
        } else if (overallScore >= 50 && defaulterPercentage < 50) {
          diagnosisTitle = "Águas Turvas: Base no Meio-Termo (Exige Vigilância)";
          diagnosisDescription =
            "Você tem bons pagadores, mas parte da gruta está na linha amarela ou começando a dar desculpas. Use o score para filtrar quem merece novos empréstimos.";
          riskLevelLabel = "Risco Moderado (Sob Observação)";
        } else {
          diagnosisTitle = "Alerta de Cardume Tóxico: Alto Risco de Calote!";
          diagnosisDescription =
            "Mais da metade do seu risco vem de Caloteiros em Treinamento ou Profissionais. Pare de soltar dinheiro para quem tem Score abaixo de 50 e concentre sua carteira na Elite da Gruta!";
          riskLevelLabel = "Risco Crítico (Exposição Alta)";
        }
      }

      return {
        overallScore,
        overallTier,
        overallTierLabel: overallTierMeta.label,
        overallColorHex: overallTierMeta.colorHex,
        overallBadgeClass: overallTierMeta.badgeClass,
        diagnosisTitle,
        diagnosisDescription,
        riskLevelLabel,
        totalDebtors,
        eliteCount,
        averageCount,
        defaulterCount,
        elitePercentage,
        averagePercentage,
        defaulterPercentage,
        safeExposureAmount,
        riskExposureAmount,
        totalExposureAmount,
        formattedSafeExposure: formatBRL(safeExposureAmount),
        formattedRiskExposure: formatBRL(riskExposureAmount),
        formattedTotalExposure: formatBRL(totalExposureAmount),
        riskExposurePercentage,
        debtorsRanked,
      };
    },
    ["grotto-thermometer", userId, todayStr],
    {
      revalidate: ttlSeconds,
      tags: [CACHE_TAGS.userData(userId)],
    }
  );

  const thermometerData = await getCachedThermometer(userId);

  return ApiResponse.Ok({
    data: thermometerData,
    message: "Termômetro da Gruta calculado com sucesso.",
  });
};

