import type { DebtorItemFormatted } from "./debtor";

/**
 * Escada Biológica de 5 Níveis da Presa (0 a 100 pontos, início no meio em 50 pts)
 */
export type BiologicalTier =
  | "flying_fish"            // 85 a 100 pts: Peixe Voador (Milagreiro)
  | "slippery_fish"          // 50 a 84 pts: Peixe Ensaboado (Início em 50 pts)
  | "trainee_defaulter"      // 35 a 49 pts: Caloteiro em Treinamento
  | "defaulter"              // 15 a 34 pts: Caloteiro
  | "professional_defaulter"; // 0 a 14 pts: Caloteiro Profissional

export type WhatsappWeaponLevel = 1 | 2 | 3;

export type ThermometerGroup = "elite" | "average" | "defaulter";

export interface BiologicalTierMetadata {
  tier: BiologicalTier;
  minScore: number;
  maxScore: number;
  label: string;
  shortLabel: string;
  description: string;
  colorHex: string;
  badgeClass: string;
  textClass: string;
}

export const BIOLOGICAL_TIER_METADATA: Record<BiologicalTier, BiologicalTierMetadata> = {
  flying_fish: {
    tier: "flying_fish",
    minScore: 85,
    maxScore: 100,
    label: "Peixe Voador (Milagreiro)",
    shortLabel: "Peixe Voador",
    description:
      "Espécie raríssima em extinção. Paga em dia ou até adiantado sem precisar cobrar.",
    colorHex: "#34d399", // emerald-400
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    textClass: "text-emerald-400",
  },
  slippery_fish: {
    tier: "slippery_fish",
    minScore: 50,
    maxScore: 84,
    label: "Peixe Ensaboado",
    shortLabel: "Peixe Ensaboado",
    description:
      "Ponto de partida na gruta (50 pts). Escorrega, mas ainda não deu motivos pra levar mordida funda.",
    colorHex: "#facc15", // yellow-400
    badgeClass: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    textClass: "text-yellow-400",
  },
  trainee_defaulter: {
    tier: "trainee_defaulter",
    minScore: 35,
    maxScore: 49,
    label: "Caloteiro em Treinamento",
    shortLabel: "Caloteiro em Treino",
    description:
      "Já começou a atrasar ou contar historinha triste. Fique de olho aberto antes de soltar mais grana.",
    colorHex: "#f59e0b", // amber-500
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    textClass: "text-amber-400",
  },
  defaulter: {
    tier: "defaulter",
    minScore: 15,
    maxScore: 34,
    label: "Caloteiro",
    shortLabel: "Caloteiro",
    description:
      "Já perdeu a vergonha na cara. Visualiza o WhatsApp, posta foto de churrasco e esquece o seu Pix.",
    colorHex: "#ef4444", // red-500
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
    textClass: "text-red-400",
  },
  professional_defaulter: {
    tier: "professional_defaulter",
    minScore: 0,
    maxScore: 14,
    label: "Caloteiro Profissional",
    shortLabel: "Caloteiro Profissional",
    description:
      "PhD em dar perdido. Emprestar dinheiro pra esse sujeito sem garantia é doação filantrópica.",
    colorHex: "#e11d48", // rose-600
    badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    textClass: "text-rose-400",
  },
};

export interface RiskScoreBadge {
  id:
    | "rehabilitation_miracle"
    | "excuse_king"
    | "swiss_watch"
    | "whatsapp_ghost"
    | "fresh_prey";
  label: string;
  description: string;
  variant: "emerald" | "amber" | "rose" | "zinc";
}

export interface RiskScoreFactor {
  id: string;
  label: string;
  points: number; // positivo (cicatrização) ou negativo (sangramento)
  occurrences: number;
  type: "healing" | "bleeding" | "base";
}

export interface DebtorRiskScoreSummary {
  score: number;
  tier: BiologicalTier;
  tierLabel: string;
  tierShortLabel: string;
  tierDescription: string;
  colorHex: string;
  badgeClass: string;
  textClass: string;
  recentDelta: number;
  recentDeltaLabel: string;
  weaponLevel: WhatsappWeaponLevel;
  weaponLabel: string;
  recommendedWhatsappUrl: string;
  overdueInstallmentsCount: number;
  excusesCount: number;
  paidOnTimeCount: number;
  totalInstallmentsCount: number;
  openExposureAmount: number;
  badges: RiskScoreBadge[];
}

export interface DebtorRiskScoreResult extends DebtorRiskScoreSummary {
  factors: RiskScoreFactor[];
  punctualityRate: number;
  averageDaysToPay: number;
  settledDebtsCount: number;
  activeDebtsCount: number;
  breachedDebtsCount: number;
  totalBorrowedAmount: number;
  totalPaidAmount: number;
}

export interface DebtorRaioXDebtItem {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  statusBadgeClass: string;
  originalAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  formattedTotalAmount: string;
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  formattedLoanDate: string;
  installmentsCount: number;
  paidInstallmentsCount: number;
  overdueInstallmentsCount: number;
}

export interface DebtorRaioXExcuseItem {
  id: string;
  excuseText: string;
  promisedDate: string;
  formattedPromisedDate: string;
  formattedCreatedAt: string;
  wasHonored: boolean;
  debtId: string;
  debtTitle: string;
  installmentNumber: number;
}

export interface DebtorRaioXData {
  debtor: DebtorItemFormatted;
  riskScore: DebtorRiskScoreResult;
  debts: DebtorRaioXDebtItem[];
  excuses: DebtorRaioXExcuseItem[];
}

export interface ThermometerDebtorItem {
  debtor: DebtorItemFormatted;
  riskScore: DebtorRiskScoreSummary;
  group: ThermometerGroup;
  formattedExposure: string;
}

export interface GrottoThermometerData {
  overallScore: number;
  overallTier: BiologicalTier;
  overallTierLabel: string;
  overallColorHex: string;
  overallBadgeClass: string;
  diagnosisTitle: string;
  diagnosisDescription: string;
  riskLevelLabel: string;
  totalDebtors: number;
  eliteCount: number;
  averageCount: number;
  defaulterCount: number;
  elitePercentage: number;
  averagePercentage: number;
  defaulterPercentage: number;
  safeExposureAmount: number;
  riskExposureAmount: number;
  totalExposureAmount: number;
  formattedSafeExposure: string;
  formattedRiskExposure: string;
  formattedTotalExposure: string;
  riskExposurePercentage: number;
  debtorsRanked: ThermometerDebtorItem[];
}

/**
 * Input de dados relacionais de um devedor para cálculo determinístico do Score
 */
export interface CalculateDebtorRiskScoreInput {
  debtorId: string;
  debtorName: string;
  debtorPhone: string;
  creditorPixKey?: string | null;
  referenceDate?: Date;
  debts: Array<{
    id: string;
    title: string;
    status: string;
    original_amount: number;
    total_amount: number | null;
    max_late_installments?: number | null;
  }>;
  installments: Array<{
    id: string;
    debt_id: string;
    installment_number: number;
    due_date: string;
    nominal_amount: number;
    paid_amount: number;
    status: string;
    updated_at?: string | null;
  }>;
  payments: Array<{
    id: string;
    debt_id: string;
    amount: number;
    paid_at: string;
  }>;
  excuses: Array<{
    id: string;
    installment_id: string;
    excuse_text: string;
    promised_date: string;
    was_honored?: boolean | null;
    created_at?: string | null;
  }>;
}

