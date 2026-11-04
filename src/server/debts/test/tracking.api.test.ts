import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTrackingDataApi,
  buildSummaryCards,
} from "../service/tracking.api";
import * as trackingSupabase from "../repository/tracking.supabase";
import type { DebtWithRelationsRow } from "../repository/tracking.supabase";
import type { InstallmentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";
import { DebtorRelationshipEnum } from "@/commons/models/debtor";
import * as subscriptionService from "@/server/account/service/subscription.api";

vi.mock("../repository/tracking.supabase");
vi.mock("@/server/account/service/subscription.api");

describe("Serviço de Acompanhamento e KPIs (tracking.api.ts)", () => {
  const userId = "tubarao-kpi-user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue({
      maxDebtors: null,
      canAttachReceipts: true,
      canAccessFinancial: true,
      canDebtorPortal: true,
      canRiskScore: true,
      canCustomTemplates: true,
      isFreePlan: false,
      isSubscriptionActive: true,
    });
  });

  const createFakeDebtor = (id: string, name: string, nickname: string | null = null): DebtorRow => ({
    id,
    user_id: userId,
    name,
    nickname,
    relationship: DebtorRelationshipEnum.FRIEND,
    phone: "11999999999",
    document: null,
    address: null,
    pix_key: null,
    pix_key_type: null,
    notes: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const createFakeInstallment = (
    id: string,
    debtId: string,
    number: number,
    nominal: number,
    paid: number,
    dueDate: string,
    status: "pending" | "paid" | "partially_paid" | "late" = "pending"
  ): InstallmentRow => ({
    id,
    debt_id: debtId,
    debtor_id: "debtor-1",
    user_id: userId,
    installment_number: number,
    nominal_amount: nominal,
    paid_amount: paid,
    due_date: dueDate,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  describe("buildSummaryCards (Cálculo dos 4 KPI Cards do Tubarão)", () => {
    it("deve calcular valores, contadores e percentuais de uma carteira mista", () => {
      const summary = buildSummaryCards([
        {
          promise: {
            id: "1",
            debtorId: "d1",
            debtorName: "Milagreiro 1",
            debtTitle: "Empréstimo",
            paidInstallments: 1,
            totalInstallments: 2,
            dueStatusText: "Em dia",
            gravity: "ON_TIME",
            url: "/1",
          },
          nextDueDate: "2026-04-01",
          maxLateDays: 0,
        },
        {
          promise: {
            id: "2",
            debtorId: "d2",
            debtorName: "Sumido 1",
            debtTitle: "Fiado",
            paidInstallments: 0,
            totalInstallments: 1,
            dueStatusText: "Venceu há 5 dias",
            gravity: "LIGHT_DELAY",
            url: "/2",
          },
          nextDueDate: "2026-03-01",
          maxLateDays: 5,
        },
        {
          promise: {
            id: "3",
            debtorId: "d3",
            debtorName: "Caloteiro Lenda",
            debtTitle: "Golpe",
            paidInstallments: 0,
            totalInstallments: 3,
            dueStatusText: "2 parcelas acumuladas",
            gravity: "BROKEN_AGREEMENT",
            url: "/3",
          },
          nextDueDate: "2026-01-01",
          maxLateDays: 45,
        },
        {
          promise: {
            id: "4",
            debtorId: "d4",
            debtorName: "Caôzeiro",
            debtTitle: "Aluguel",
            paidInstallments: 0,
            totalInstallments: 1,
            dueStatusText: "Venceu há 3 dias (com caô)",
            gravity: "STANDARD_EXCUSE",
            url: "/4",
          },
          nextDueDate: "2026-03-02",
          maxLateDays: 3,
        },
      ]);

      expect(summary.open.amount).toBe("4 suspeitos");
      expect(summary.open.changePercent).toBe(100);

      expect(summary.onTime.amount).toBe("1 milagreiro");
      expect(summary.onTime.changePercent).toBe(25);

      expect(summary.overdue.amount).toBe("2 sumidos");
      expect(summary.overdue.changePercent).toBe(50);

      expect(summary.defaulted.amount).toBe("1 lenda");
      expect(summary.defaulted.changePercent).toBe(25);
    });

    it("deve retornar zeros com elegância quando a lista estiver vazia", () => {
      const summary = buildSummaryCards([]);

      expect(summary.open.amount).toBe("0 suspeitos");
      expect(summary.open.changePercent).toBe(0);
      expect(summary.onTime.amount).toBe("0 milagreiros");
      expect(summary.onTime.changePercent).toBe(0);
      expect(summary.overdue.amount).toBe("0 sumidos");
      expect(summary.overdue.changePercent).toBe(0);
      expect(summary.defaulted.amount).toBe("0 lendas");
      expect(summary.defaulted.changePercent).toBe(0);
    });
  });

  describe("getTrackingDataApi (Classificação de Gravidade e Status)", () => {
    it("deve classificar como ON_TIME quando todas as parcelas estiverem quitadas", async () => {
      const debt: DebtWithRelationsRow = {
        id: "debt-quitada",
        debtor_id: "debtor-1",
        user_id: userId,
        title: "Empréstimo Amigo",
        category: "personal_loan",
        original_amount: 200,
        total_amount: 200,
        installments_count: 2,
        first_due_date: "2026-02-01",
        loan_date: "2026-01-01",
        payment_method: "pix",
        status: "settled",
        interest_rate: 0,
        interest_type: "none",
        notes: null,
        settled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createFakeDebtor("debtor-1", "Marcos"),
        installments: [
          createFakeInstallment("inst-1", "debt-quitada", 1, 100, 100, "2026-02-01", "paid"),
          createFakeInstallment("inst-2", "debt-quitada", 2, 100, 100, "2026-03-01", "paid"),
        ],
      };

      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId });
      const item = res.paginated.items[0];

      expect(item.gravity).toBe("ON_TIME");
      expect(item.dueStatusText).toBe("Totalmente quitada");
      expect(item.paidInstallments).toBe(2);
      expect(item.totalInstallments).toBe(2);
    });

    it("deve classificar como STANDARD_EXCUSE se a parcela em atraso tiver caô registrado", async () => {
      const recentPastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const debt: DebtWithRelationsRow = {
        id: "debt-cao",
        debtor_id: "debtor-2",
        user_id: userId,
        title: "Churrasco",
        category: "split_bill",
        original_amount: 150,
        total_amount: 150,
        installments_count: 1,
        first_due_date: recentPastDate,
        loan_date: "2026-02-01",
        payment_method: "pix",
        status: "active",
        interest_rate: 0,
        interest_type: "none",
        notes: null,
        settled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createFakeDebtor("debtor-2", "Cleiton"),
        installments: [
          createFakeInstallment("inst-cao-1", "debt-cao", 1, 150, 0, recentPastDate, "late"),
        ],
      };

      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set(["inst-cao-1"]));

      const res = await getTrackingDataApi({ userId });
      const item = res.paginated.items[0];

      expect(item.gravity).toBe("STANDARD_EXCUSE");
      expect(item.dueStatusText).toContain("(com caô)");
    });

    it("deve classificar como BROKEN_AGREEMENT se acumular 2 ou mais parcelas em atraso", async () => {
      const pastDate1 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const pastDate2 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const debt: DebtWithRelationsRow = {
        id: "debt-caloteiro",
        debtor_id: "debtor-3",
        user_id: userId,
        title: "Empréstimo Risco",
        category: "personal_loan",
        original_amount: 600,
        total_amount: 600,
        installments_count: 3,
        first_due_date: pastDate1,
        loan_date: "2025-12-01",
        payment_method: "pix",
        status: "active",
        interest_rate: 0,
        interest_type: "none",
        notes: null,
        settled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createFakeDebtor("debtor-3", "Robson Sumido"),
        installments: [
          createFakeInstallment("inst-1", "debt-caloteiro", 1, 200, 0, pastDate1, "late"),
          createFakeInstallment("inst-2", "debt-caloteiro", 2, 200, 0, pastDate2, "late"),
          createFakeInstallment("inst-3", "debt-caloteiro", 3, 200, 0, futureDate, "pending"),
        ],
      };

      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId });
      const item = res.paginated.items[0];

      expect(item.gravity).toBe("BROKEN_AGREEMENT");
      expect(item.dueStatusText).toBe("2 parcelas acumuladas");
    });

    it("deve classificar como LIGHT_DELAY se tiver 1 parcela com atraso <= 15 dias sem caô", async () => {
      const recentPastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const debt: DebtWithRelationsRow = {
        id: "debt-leve",
        debtor_id: "debtor-4",
        user_id: userId,
        title: "Ajuda Gasolina",
        category: "personal_loan",
        original_amount: 100,
        total_amount: 100,
        installments_count: 1,
        first_due_date: recentPastDate,
        loan_date: "2026-04-01",
        payment_method: "pix",
        status: "active",
        interest_rate: 0,
        interest_type: "none",
        notes: null,
        settled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createFakeDebtor("debtor-4", "Lucas"),
        installments: [
          createFakeInstallment("inst-1", "debt-leve", 1, 100, 0, recentPastDate, "late"),
        ],
      };

      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId });
      const item = res.paginated.items[0];

      expect(item.gravity).toBe("LIGHT_DELAY");
    });
  });

  describe("getTrackingDataApi (Filtros, Busca e Paginação)", () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const mockDebtsList: DebtWithRelationsRow[] = [
      {
        id: "debt-1",
        debtor_id: "d1",
        user_id: userId,
        title: "Empréstimo Banco",
        category: "personal_loan",
        original_amount: 500,
        total_amount: 500,
        installments_count: 1,
        first_due_date: pastDate,
        loan_date: "2025-12-01",
        payment_method: "pix",
        status: "active",
        interest_rate: 0,
        interest_type: "none",
        notes: null,
        settled_at: null,
        created_at: "2026-01-01T10:00:00Z",
        updated_at: "2026-01-01T10:00:00Z",
        debtor: createFakeDebtor("d1", "Zico do Churrasco", "Zico"),
        installments: [
          createFakeInstallment("inst-1", "debt-1", 1, 500, 0, pastDate, "late"),
        ],
      },
      {
        id: "debt-2",
        debtor_id: "d2",
        user_id: userId,
        title: "Fiado Bar",
        category: "fiado",
        original_amount: 80,
        total_amount: 80,
        installments_count: 1,
        first_due_date: futureDate,
        loan_date: "2026-04-01",
        payment_method: "pix",
        status: "active",
        interest_rate: 0,
        interest_type: "none",
        notes: null,
        settled_at: null,
        created_at: "2026-04-01T10:00:00Z",
        updated_at: "2026-04-01T10:00:00Z",
        debtor: createFakeDebtor("d2", "Ana Paula"),
        installments: [
          createFakeInstallment("inst-2", "debt-2", 1, 80, 0, futureDate, "pending"),
        ],
      },
    ];

    it("deve filtrar por termo de busca no nome do devedor, vulgo ou título", async () => {
      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId, search: "Zico" });

      expect(res.paginated.items.length).toBe(1);
      expect(res.paginated.items[0].debtorName).toBe("Zico do Churrasco");
    });

    it("deve filtrar pela aba ON_TIME", async () => {
      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId, tab: "ON_TIME" });

      expect(res.paginated.items.length).toBe(1);
      expect(res.paginated.items[0].debtorName).toBe("Ana Paula");
    });

    it("deve paginar corretamente com limit e offset", async () => {
      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const page1 = await getTrackingDataApi({ userId, page: 1, limit: 1 });
      expect(page1.paginated.items.length).toBe(1);
      expect(page1.paginated.hasMore).toBe(true);

      const page2 = await getTrackingDataApi({ userId, page: 2, limit: 1 });
      expect(page2.paginated.items.length).toBe(1);
      expect(page2.paginated.hasMore).toBe(false);
    });

    it("deve ordenar os casos mais críticos e com maior atraso no topo por padrão", async () => {
      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId, sortBy: "late_first" });

      expect(res.paginated.items[0].debtorName).toBe("Zico do Churrasco");
    });

    it("BLINDAGEM DA JAULA: deve marcar dívidas excedentes de maior valor com isLocked = true e expurgar dos contadores", async () => {
      // Plano com limite de 1 dívida ativa
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

      const debts: DebtWithRelationsRow[] = [
        {
          id: "d-cara",
          user_id: userId,
          debtor_id: "debtor-1",
          title: "Dívida Cara",
          category: "personal_loan",
          original_amount: 5000,
          total_amount: 5000,
          installments_count: 1,
          payment_method: "pix",
          loan_date: "2026-08-01",
          first_due_date: "2026-09-01",
          interest_type: "none",
          interest_rate: 0,
          status: "pending",
          settled_at: null,
          notes: null,
          max_late_installments: null,
          show_notes_on_invoice: false,
          loan_receipt_path: null,
          public_link_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          debtor: createFakeDebtor("debtor-1", "Devedor Rico"),
          installments: [
            createFakeInstallment("inst-cara", "d-cara", 1, 5000, 0, "2026-09-01"),
          ],
        },
        {
          id: "d-barata",
          user_id: userId,
          debtor_id: "debtor-2",
          title: "Dívida Barata",
          category: "personal_loan",
          original_amount: 100,
          total_amount: 100,
          installments_count: 1,
          payment_method: "pix",
          loan_date: "2026-08-01",
          first_due_date: "2026-09-01",
          interest_type: "none",
          interest_rate: 0,
          status: "pending",
          settled_at: null,
          notes: null,
          max_late_installments: null,
          show_notes_on_invoice: false,
          loan_receipt_path: null,
          public_link_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          debtor: createFakeDebtor("debtor-2", "Devedor Barato"),
          installments: [
            createFakeInstallment("inst-barata", "d-barata", 1, 100, 0, "2026-09-01"),
          ],
        },
      ];

      vi.mocked(trackingSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(debts);
      vi.mocked(trackingSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const res = await getTrackingDataApi({ userId });

      // Total de itens na lista paginada = 2 (ambos aparecem)
      expect(res.paginated.items.length).toBe(2);

      const caraItem = res.paginated.items.find((i) => i.id === "d-cara");
      const barataItem = res.paginated.items.find((i) => i.id === "d-barata");

      // A de maior valor DEVE estar trancada na jaula
      expect(caraItem?.isLocked).toBe(true);
      expect(caraItem?.lockedReason).toContain("Presa trancada na jaula");

      // A de menor valor DEVE estar liberada
      expect(barataItem?.isLocked).toBe(false);

      // Os contadores oficiais devem contar APENAS a liberada (1) e ignorar a trancada
      expect(res.paginated.counts.open).toBe(1);
      expect(res.paginated.lockedQuotaSummary?.isOverQuota).toBe(true);
      expect(res.paginated.lockedQuotaSummary?.lockedDebtsCount).toBe(1);
      expect(res.paginated.lockedQuotaSummary?.lockedTotalAmount).toBe(5000);
    });
  });
});

