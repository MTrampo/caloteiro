import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusEnum } from "@/commons/enums/http";
import type { UserPermissions } from "@/commons/models/subscription";
import {
  INITIAL_RISK_SCORE,
  calculateDebtorRiskScore,
  resolveBiologicalTier,
  resolveWhatsappWeaponLevel,
  getDebtorRaioXApi,
  getGrottoThermometerDataApi,
  enrichDebtorsWithRiskScoreApi,
} from "../service/risk-score.api";
import * as riskScoreSupabase from "../repository/risk-score.supabase";
import * as subscriptionService from "@/server/account/service/subscription.api";

vi.mock("../repository/risk-score.supabase");
vi.mock("@/server/account/service/subscription.api");

describe("Motor de Score de Risco e Termômetro da Gruta (risk-score.api.ts)", () => {
  const userId = "tubarao-user-1";
  const referenceDate = new Date("2026-10-20T12:00:00Z");

  const cabecaChataPermissions: UserPermissions = {
    maxDebtors: null,
    canCustomTemplates: true,
    canExportReports: true,
    canAccessFinancial: true,
    canDebtorPortal: true,
    canRiskScore: true,
    canAttachReceipts: true,
    isFreePlan: false,
    isSubscriptionActive: true,
  };

  const lixaPermissions: UserPermissions = {
    maxDebtors: 2,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
    isSubscriptionActive: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Escada Biológica de 5 Níveis e Início no Meio (50 pts)", () => {
    it("deve iniciar toda presa sem histórico exatamente em 50 pontos (Peixe Ensaboado) com arma Nível 1", () => {
      const result = calculateDebtorRiskScore({
        debtorId: "debtor-1",
        debtorName: "Carlos Silva",
        debtorPhone: "11999999999",
        referenceDate,
        debts: [],
        installments: [],
        payments: [],
        excuses: [],
      });

      expect(result.score).toBe(INITIAL_RISK_SCORE);
      expect(result.score).toBe(50);
      expect(result.tier).toBe("slippery_fish");
      expect(result.tierLabel).toBe("Peixe Ensaboado");
      expect(result.weaponLevel).toBe(1);
      expect(result.badges.some((b) => b.id === "fresh_prey")).toBe(true);
    });

    it("deve cair imediatamente para Caloteiro em Treinamento (35 a 49 pts) ao ter 1 parcela vencida ou 1 caô registrado", () => {
      // 1 parcela vencida há 2 dias (-8 pts): 50 - 8 = 42 pts
      const resultWithLightOverdue = calculateDebtorRiskScore({
        debtorId: "debtor-2",
        debtorName: "Marcos Atrasado",
        debtorPhone: "11988888888",
        referenceDate,
        debts: [
          {
            id: "debt-1",
            title: "Empréstimo",
            status: "open",
            original_amount: 500,
            total_amount: 500,
          },
        ],
        installments: [
          {
            id: "inst-1",
            debt_id: "debt-1",
            installment_number: 1,
            due_date: "2026-10-18",
            nominal_amount: 500,
            paid_amount: 0,
            status: "pending",
          },
        ],
        payments: [],
        excuses: [],
      });

      expect(resultWithLightOverdue.score).toBe(42);
      expect(resultWithLightOverdue.tier).toBe("trainee_defaulter");
      expect(resultWithLightOverdue.tierLabel).toBe("Caloteiro em Treinamento");
      expect(resultWithLightOverdue.weaponLevel).toBe(2);
    });

    it("deve classificar corretamente nas 5 faixas biológicas (Peixe Voador, Ensaboado, Caloteiro em Treinamento, Caloteiro, Caloteiro Profissional)", () => {
      expect(resolveBiologicalTier(100)).toBe("flying_fish");
      expect(resolveBiologicalTier(85)).toBe("flying_fish");
      expect(resolveBiologicalTier(84)).toBe("slippery_fish");
      expect(resolveBiologicalTier(50)).toBe("slippery_fish");
      expect(resolveBiologicalTier(49)).toBe("trainee_defaulter");
      expect(resolveBiologicalTier(35)).toBe("trainee_defaulter");
      expect(resolveBiologicalTier(34)).toBe("defaulter");
      expect(resolveBiologicalTier(15)).toBe("defaulter");
      expect(resolveBiologicalTier(14)).toBe("professional_defaulter");
      expect(resolveBiologicalTier(0)).toBe("professional_defaulter");
    });

    it("deve engatilhar automaticamente o nível correto de WhatsApp por faixa de score", () => {
      expect(resolveWhatsappWeaponLevel(85).level).toBe(1);
      expect(resolveWhatsappWeaponLevel(50).level).toBe(1);
      expect(resolveWhatsappWeaponLevel(49).level).toBe(2);
      expect(resolveWhatsappWeaponLevel(35).level).toBe(2);
      expect(resolveWhatsappWeaponLevel(34).level).toBe(3);
      expect(resolveWhatsappWeaponLevel(5).level).toBe(3);
    });
  });

  describe("2. Cicatrização (+), Sangramento (-) e Insígnias de Gamificação", () => {
    it("deve subir para Peixe Voador (85+ pts) e conceder insígnia 'Relógio Suíço' quando pagar adiantado e quitar acordos", () => {
      // Base 50 + 4 parcelas pagas adiantadas (4 * 6 = +24) + 2 acordos quitados (2 * 10 = +20) = 94 pts
      const result = calculateDebtorRiskScore({
        debtorId: "debtor-elite",
        debtorName: "Ana Pontual",
        debtorPhone: "11977776666",
        referenceDate,
        debts: [
          {
            id: "d1",
            title: "Acordo 1",
            status: "settled",
            original_amount: 1000,
            total_amount: 1000,
          },
          {
            id: "d2",
            title: "Acordo 2",
            status: "settled",
            original_amount: 1000,
            total_amount: 1000,
          },
        ],
        installments: [
          {
            id: "i1",
            debt_id: "d1",
            installment_number: 1,
            due_date: "2026-08-10",
            nominal_amount: 500,
            paid_amount: 500,
            status: "paid",
            updated_at: "2026-08-05T10:00:00Z",
          },
          {
            id: "i2",
            debt_id: "d1",
            installment_number: 2,
            due_date: "2026-09-10",
            nominal_amount: 500,
            paid_amount: 500,
            status: "paid",
            updated_at: "2026-09-08T10:00:00Z",
          },
          {
            id: "i3",
            debt_id: "d2",
            installment_number: 1,
            due_date: "2026-09-15",
            nominal_amount: 500,
            paid_amount: 500,
            status: "paid",
            updated_at: "2026-09-10T10:00:00Z",
          },
          {
            id: "i4",
            debt_id: "d2",
            installment_number: 2,
            due_date: "2026-10-15",
            nominal_amount: 500,
            paid_amount: 500,
            status: "paid",
            updated_at: "2026-10-12T10:00:00Z",
          },
        ],
        payments: [],
        excuses: [],
      });

      expect(result.score).toBe(94);
      expect(result.tier).toBe("flying_fish");
      expect(result.badges.some((b) => b.id === "swiss_watch")).toBe(true);
    });

    it("deve afundar para Caloteiro Profissional (0 a 14 pts) e ganhar 'Rei do Caô' e 'Fantasma do WhatsApp' em casos graves", () => {
      const result = calculateDebtorRiskScore({
        debtorId: "debtor-pro-caloteiro",
        debtorName: "Beto Sumido",
        debtorPhone: "11955554444",
        referenceDate,
        debts: [
          {
            id: "d-bad",
            title: "Socorro urgente",
            status: "defaulted",
            original_amount: 2000,
            total_amount: 2400,
          },
        ],
        installments: [
          {
            id: "i-bad-1",
            debt_id: "d-bad",
            installment_number: 1,
            due_date: "2026-09-20", // 30 dias atrasado (> 15d -> -25 pts)
            nominal_amount: 1200,
            paid_amount: 0,
            status: "overdue",
          },
        ],
        payments: [],
        excuses: [
          {
            id: "e1",
            installment_id: "i-bad-1",
            excuse_text: "O cachorro comeu o token do banco",
            promised_date: "2026-09-25",
            was_honored: false,
          },
          {
            id: "e2",
            installment_id: "i-bad-1",
            excuse_text: "Caiu a internet no dia do Pix",
            promised_date: "2026-10-01",
            was_honored: false,
          },
          {
            id: "e3",
            installment_id: "i-bad-1",
            excuse_text: "Sexta-feira sem falta",
            promised_date: "2026-10-10",
            was_honored: false,
          },
        ],
      });

      expect(result.score).toBe(0);
      expect(result.tier).toBe("professional_defaulter");
      expect(result.tierLabel).toBe("Caloteiro Profissional");
      expect(result.weaponLevel).toBe(3);
      expect(result.badges.some((b) => b.id === "excuse_king")).toBe(true);
      expect(result.badges.some((b) => b.id === "whatsapp_ghost")).toBe(true);
    });
  });

  describe("3. Proteção Zero Trust por Plano (Exclusividade Tubarão Cabeça Chata)", () => {
    it("deve bloquear o acesso ao Raio-X da Presa para planos sem canRiskScore (Lixa e Branco)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(
        lixaPermissions
      );

      const res = await getDebtorRaioXApi("debtor-1", userId);

      expect(res.status).toBe(HttpStatusEnum.Forbidden);
      expect(res.error).toBe("PLAN_UPGRADE_REQUIRED");
      expect(riskScoreSupabase.getDebtorRiskContextByIdSupabase).not.toHaveBeenCalled();
    });

    it("deve retornar o Raio-X completo para assinantes Tubarão Cabeça Chata", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(
        cabecaChataPermissions
      );
      vi.mocked(riskScoreSupabase.getDebtorRiskContextByIdSupabase).mockResolvedValue({
        debtor: {
          id: "debtor-1",
          user_id: userId,
          name: "Cleide Ferreira",
          nickname: "Cleidinha",
          phone: "11999998888",
          relationship: 1,
          document: null,
          address: null,
          pix_key: "cleide@pix.com",
          pix_key_type: "email",
          notes: "Sempre pede até sexta",
          is_archived: false,
          created_at: "2026-01-10T00:00:00Z",
          updated_at: "2026-01-10T00:00:00Z",
        },
        debts: [],
        installments: [],
        payments: [],
        excuses: [],
        creditorPixKey: "tubarao@pix.com",
      });

      const res = await getDebtorRaioXApi("debtor-1", userId);

      expect(res.status).toBe(HttpStatusEnum.Ok);
      expect(res.data?.debtor.formattedName).toBe("Cleide Ferreira");
      expect(res.data?.riskScore.score).toBe(50);
      expect(res.data?.riskScore.tier).toBe("slippery_fish");
    });

    it("deve consolidar o Termômetro da Gruta separando Melhores (Elite), Na Média e Zona de Calote", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(
        cabecaChataPermissions
      );
      vi.mocked(riskScoreSupabase.getBatchDebtorsRiskContextSupabase).mockResolvedValue({
        debtors: [
          {
            id: "d-avg",
            user_id: userId,
            name: "João Médio",
            nickname: null,
            phone: "11911112222",
            relationship: 1,
            document: null,
            address: null,
            pix_key: null,
            pix_key_type: null,
            notes: null,
            is_archived: false,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: null,
          },
        ],
        debts: [],
        installments: [],
        payments: [],
        excuses: [],
        creditorPixKey: null,
      });

      const res = await getGrottoThermometerDataApi(userId);

      expect(res.status).toBe(HttpStatusEnum.Ok);
      expect(res.data?.totalDebtors).toBe(1);
      expect(res.data?.averageCount).toBe(1);
      expect(res.data?.overallScore).toBe(50);
    });

    it("enrichDebtorsWithRiskScoreApi deve retornar riskScore null quando canRiskScore for false", async () => {
      const enriched = await enrichDebtorsWithRiskScoreApi(
        userId,
        [
          {
            id: "d1",
            user_id: userId,
            name: "Teste",
            nickname: null,
            phone: "11999999999",
            relationship: 0,
            document: null,
            address: null,
            pix_key: null,
            pix_key_type: null,
            notes: null,
            is_archived: false,
            created_at: null,
            updated_at: null,
            formattedName: "Teste",
            formattedNickname: null,
            displayPhone: "(11) 99999-9999",
            cleanPhone: "11999999999",
            whatsAppUrl: "https://wa.me/5511999999999",
            relationshipLabel: "Parente",
            relationshipDesc: "",
          },
        ],
        false
      );

      expect(enriched[0].riskScore).toBeNull();
    });
  });
});
