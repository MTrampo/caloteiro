import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateRemainingDebtAmount,
  partitionDebtsByQuota,
  checkDebtLockedStatusApi,
  type QuotaDebtTarget,
} from "../service/debt-quota.api";
import * as trackingRepo from "../repository/tracking.supabase";
import * as subscriptionService from "@/server/account/service/subscription.api";

vi.mock("server-only", () => ({}));
vi.mock("../repository/tracking.supabase");
vi.mock("@/server/account/service/subscription.api");

describe("Serviço de Quota e Jaula do Tubarão (debt-quota.api.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateRemainingDebtAmount", () => {
    it("deve retornar o valor original/total quando não houver parcelas ou amortizações", () => {
      const debt: QuotaDebtTarget = {
        id: "d1",
        status: "pending",
        original_amount: 500,
        total_amount: 500,
      };
      expect(calculateRemainingDebtAmount(debt)).toBe(500);
    });

    it("deve subtrair parcelas amortizadas do valor total", () => {
      const debt: QuotaDebtTarget = {
        id: "d2",
        status: "pending",
        original_amount: 1000,
        total_amount: 1200,
        installments: [
          { nominal_amount: 400, paid_amount: 400, status: "paid" },
          { nominal_amount: 400, paid_amount: 100, status: "partial" },
          { nominal_amount: 400, paid_amount: 0, status: "pending" },
        ],
      };
      // 1200 - 500 = 700
      expect(calculateRemainingDebtAmount(debt)).toBe(700);
    });
  });

  describe("partitionDebtsByQuota (Lógica da Jaula)", () => {
    it("não deve trancar nenhuma dívida se o plano for ilimitado (maxAllowed = null)", () => {
      const debts: QuotaDebtTarget[] = [
        { id: "d1", status: "pending", original_amount: 5000, total_amount: 5000 },
        { id: "d2", status: "pending", original_amount: 10000, total_amount: 10000 },
      ];
      const result = partitionDebtsByQuota(debts, null);
      expect(result.isOverQuota).toBe(false);
      expect(result.lockedDebtsCount).toBe(0);
      expect(result.lockedDebtIds.size).toBe(0);
      expect(result.activeDebtIds.has("d1")).toBe(true);
      expect(result.activeDebtIds.has("d2")).toBe(true);
    });

    it("não deve trancar dívidas se a quantidade de ativas for menor ou igual ao limite do plano", () => {
      const debts: QuotaDebtTarget[] = [
        { id: "d1", status: "pending", original_amount: 200, total_amount: 200 },
        { id: "d2", status: "settled", original_amount: 1000, total_amount: 1000 }, // quitada não consome cota
      ];
      const result = partitionDebtsByQuota(debts, 1);
      expect(result.isOverQuota).toBe(false);
      expect(result.lockedDebtsCount).toBe(0);
      expect(result.activeDebtIds.has("d1")).toBe(true);
      expect(result.lockedDebtIds.has("d1")).toBe(false);
    });

    it("REGRA DE OURO: deve manter liberada a dívida de MENOR valor e trancar as MAIORES na jaula", () => {
      const debts: QuotaDebtTarget[] = [
        { id: "d-cara-1", status: "pending", original_amount: 5000, total_amount: 5000 },
        { id: "d-barata", status: "pending", original_amount: 50, total_amount: 50 },
        { id: "d-cara-2", status: "pending", original_amount: 3000, total_amount: 3000 },
      ];

      // Plano Tubarão Lixa: limite = 1
      const result = partitionDebtsByQuota(debts, 1);

      expect(result.isOverQuota).toBe(true);
      expect(result.lockedDebtsCount).toBe(2);
      expect(result.activeDebtIds.has("d-barata")).toBe(true);
      expect(result.lockedDebtIds.has("d-cara-1")).toBe(true);
      expect(result.lockedDebtIds.has("d-cara-2")).toBe(true);
      // Saldo retido na jaula: 5000 + 3000 = 8000
      expect(result.lockedTotalAmount).toBe(8000);
    });

    it("PROMOÇÃO AUTOMÁTICA: ao excluir a dívida de menor valor, a próxima menor é liberada", () => {
      // Simulação: o usuário excluiu 'd-barata' (50). Restam 'd-cara-1' (5000) e 'd-cara-2' (3000)
      const remainingDebts: QuotaDebtTarget[] = [
        { id: "d-cara-1", status: "pending", original_amount: 5000, total_amount: 5000 },
        { id: "d-cara-2", status: "pending", original_amount: 3000, total_amount: 3000 },
      ];

      const result = partitionDebtsByQuota(remainingDebts, 1);

      expect(result.isOverQuota).toBe(true);
      expect(result.lockedDebtsCount).toBe(1);
      // A de 3000 agora é a menor e foi promovida para liberada!
      expect(result.activeDebtIds.has("d-cara-2")).toBe(true);
      // A de 5000 continua trancada
      expect(result.lockedDebtIds.has("d-cara-1")).toBe(true);
      expect(result.lockedTotalAmount).toBe(5000);
    });

    it("deve desempatar por data de criação (mais antiga ganha a vaga liberada)", () => {
      const debts: QuotaDebtTarget[] = [
        {
          id: "d-recente",
          status: "pending",
          original_amount: 100,
          total_amount: 100,
          created_at: "2026-10-25T10:00:00Z",
        },
        {
          id: "d-antiga",
          status: "pending",
          original_amount: 100,
          total_amount: 100,
          created_at: "2026-10-01T10:00:00Z",
        },
      ];

      const result = partitionDebtsByQuota(debts, 1);
      expect(result.activeDebtIds.has("d-antiga")).toBe(true);
      expect(result.lockedDebtIds.has("d-recente")).toBe(true);
    });
  });

  describe("checkDebtLockedStatusApi", () => {
    it("deve retornar isLocked = true com motivo explicativo quando a dívida estiver trancada", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue({
        maxDebtors: 1,
        canAttachReceipts: false,
        canAccessFinancial: false,
        canDebtorPortal: false,
        canRiskScore: false,
        canCustomTemplates: false,
        isFreePlan: true,
        isSubscriptionActive: true,
      });

      vi.mocked(trackingRepo.getActiveDebtsWithRelationsSupabase).mockResolvedValue([
        {
          id: "d-cara",
          user_id: "user-1",
          status: "pending",
          original_amount: 2000,
          total_amount: 2000,
          debtor: null,
          installments: [],
        } as unknown as Awaited<ReturnType<typeof trackingRepo.getActiveDebtsWithRelationsSupabase>>[0],
        {
          id: "d-barata",
          user_id: "user-1",
          status: "pending",
          original_amount: 100,
          total_amount: 100,
          debtor: null,
          installments: [],
        } as unknown as Awaited<ReturnType<typeof trackingRepo.getActiveDebtsWithRelationsSupabase>>[0],
      ]);

      const caraStatus = await checkDebtLockedStatusApi("d-cara", "user-1");
      expect(caraStatus.isLocked).toBe(true);
      expect(caraStatus.reason).toContain("Presa trancada na jaula");

      const barataStatus = await checkDebtLockedStatusApi("d-barata", "user-1");
      expect(barataStatus.isLocked).toBe(false);
    });
  });
});
