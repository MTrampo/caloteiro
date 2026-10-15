import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAcompanhamentoDataApi,
  buildSummaryCards,
} from "../service/acompanhamento.api";
import * as acompanhamentoSupabase from "../repository/acompanhamento.supabase";
import type { DebtWithRelationsRow } from "../repository/acompanhamento.supabase";
import type { InstallmentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";
import { DebtorRelationshipEnum } from "@/commons/models/debtor";

vi.mock("../repository/acompanhamento.supabase");

describe("Serviço de Acompanhamento e KPIs (acompanhamento.api.ts)", () => {
  const userId = "tubarao-kpi-user-1";

  beforeEach(() => {
    vi.clearAllMocks();
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
            gravity: "EM_DIA",
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
            gravity: "ATRASO_LEVE",
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
            gravity: "ACORDO_ROMPIDO",
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
            gravity: "DESGULPA_PADRAO",
            url: "/4",
          },
          nextDueDate: "2026-03-02",
          maxLateDays: 3,
        },
      ]);

      // Total de 4 dívidas
      expect(summary.emAberto.amount).toBe("4 suspeitos");
      expect(summary.emAberto.changePercent).toBe(100);

      // 1 em dia (1/4 = 25%)
      expect(summary.emDia.amount).toBe("1 milagreiro");
      expect(summary.emDia.changePercent).toBe(25);

      // 2 em atraso: 1 leve + 1 com caô (2/4 = 50%)
      expect(summary.emAtraso.amount).toBe("2 sumidos");
      expect(summary.emAtraso.changePercent).toBe(50);

      // 1 caloteiro (1/4 = 25%)
      expect(summary.caloteiros.amount).toBe("1 lenda");
      expect(summary.caloteiros.changePercent).toBe(25);
    });

    it("deve lidar com carteira zerada sem divisão por zero ou NaN", () => {
      const summary = buildSummaryCards([]);

      expect(summary.emAberto.amount).toBe("0 suspeitos");
      expect(summary.emAberto.changePercent).toBe(0);

      expect(summary.emDia.amount).toBe("0 milagreiros");
      expect(summary.emDia.changePercent).toBe(0);

      expect(summary.emAtraso.amount).toBe("0 sumidos");
      expect(summary.emAtraso.changePercent).toBe(0);

      expect(summary.caloteiros.amount).toBe("0 lendas");
      expect(summary.caloteiros.changePercent).toBe(0);
    });
  });

  describe("getAcompanhamentoDataApi (Classificação de Gravidade e Inteligência)", () => {
    it("deve classificar como EM_DIA quando não há parcelas em atraso", async () => {
      const futureDate = "2026-12-31";
      const debt: DebtWithRelationsRow = {
        id: "debt-future",
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Empréstimo Pontual",
        category: "personal_loan",
        original_amount: 100,
        total_amount: 100,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: futureDate,
        interest_type: "none",
        interest_rate: 0,
        payment_method: "pix",
        status: "pending",
        settled_at: null,
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        debtor: createFakeDebtor("debtor-1", "Carlos Pontual"),
        installments: [
          createFakeInstallment("inst-1", "debt-future", 1, 100, 0, futureDate, "pending"),
        ],
      };

      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const result = await getAcompanhamentoDataApi({ userId });

      expect(result.paginated.items).toHaveLength(1);
      const item = result.paginated.items[0];
      expect(item.gravity).toBe("EM_DIA");
      expect(item.debtorName).toBe("Carlos Pontual");
      expect(item.paidInstallments).toBe(0);
      expect(item.totalInstallments).toBe(1);
      expect(result.paginated.counts.emDia).toBe(1);
      expect(result.paginated.counts.caloteiros).toBe(0);
    });

    it("deve classificar como DESGULPA_PADRAO quando parcela atrasada tem caô anotado e atraso <= 15 dias", async () => {
      // 3 dias atrás (atraso leve <= 15 dias com desculpa)
      const recentPastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const debt: DebtWithRelationsRow = {
        id: "debt-excuse",
        user_id: userId,
        debtor_id: "debtor-2",
        title: "Empréstimo com Caô",
        category: "personal_loan",
        original_amount: 200,
        total_amount: 200,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: recentPastDate,
        interest_type: "none",
        interest_rate: 0,
        payment_method: "pix",
        status: "pending",
        settled_at: null,
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        debtor: createFakeDebtor("debtor-2", "Roberto Enrolador"),
        installments: [
          createFakeInstallment("inst-cao-1", "debt-excuse", 1, 200, 0, recentPastDate, "pending"),
        ],
      };

      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      // Parcela possui desculpa registrada no Set
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set(["inst-cao-1"]));

      const result = await getAcompanhamentoDataApi({ userId });

      expect(result.paginated.items).toHaveLength(1);
      const item = result.paginated.items[0];
      expect(item.gravity).toBe("DESGULPA_PADRAO");
      expect(item.dueStatusText).toContain("(com caô)");
    });

    it("deve classificar como ACORDO_ROMPIDO quando houver >= 2 parcelas atrasadas acumuladas", async () => {
      const pastDate1 = "2026-01-10";
      const pastDate2 = "2026-02-10";
      const debt: DebtWithRelationsRow = {
        id: "debt-rompido",
        user_id: userId,
        debtor_id: "debtor-3",
        title: "Caloteiro Crítico",
        category: "personal_loan",
        original_amount: 300,
        total_amount: 300,
        installments_count: 2,
        loan_date: "2026-01-01",
        first_due_date: pastDate1,
        interest_type: "none",
        interest_rate: 0,
        payment_method: "pix",
        status: "pending",
        settled_at: null,
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        debtor: createFakeDebtor("debtor-3", "Fabio Sumido"),
        installments: [
          createFakeInstallment("inst-p1", "debt-rompido", 1, 150, 0, pastDate1, "pending"),
          createFakeInstallment("inst-p2", "debt-rompido", 2, 150, 0, pastDate2, "pending"),
        ],
      };

      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const result = await getAcompanhamentoDataApi({ userId });

      expect(result.paginated.items).toHaveLength(1);
      const item = result.paginated.items[0];
      expect(item.gravity).toBe("ACORDO_ROMPIDO");
      expect(item.dueStatusText).toBe("2 parcelas acumuladas");
      expect(result.paginated.counts.caloteiros).toBe(1);
    });

    it("deve classificar como quitada quando todas as parcelas foram pagas", async () => {
      const debt: DebtWithRelationsRow = {
        id: "debt-quitada",
        user_id: userId,
        debtor_id: "debtor-4",
        title: "Dívida Paga",
        category: "personal_loan",
        original_amount: 100,
        total_amount: 100,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        interest_type: "none",
        interest_rate: 0,
        payment_method: "pix",
        status: "settled",
        settled_at: "2026-02-01T12:00:00Z",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        debtor: createFakeDebtor("debtor-4", "Ana Honrada"),
        installments: [
          createFakeInstallment("inst-paga", "debt-quitada", 1, 100, 100, "2026-02-01", "paid"),
        ],
      };

      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue([debt]);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const result = await getAcompanhamentoDataApi({ userId });

      const item = result.paginated.items[0];
      expect(item.dueStatusText).toBe("Totalmente quitada");
      expect(item.paidInstallments).toBe(1);
      expect(item.totalInstallments).toBe(1);
    });
  });

  describe("Filtros de Aba, Busca e Ordenação", () => {
    const pastDate = "2026-01-10";
    const futureDate = "2026-12-31";

    const mockDebtsList: DebtWithRelationsRow[] = [
      {
        id: "d-em-dia",
        user_id: userId,
        debtor_id: "deb-1",
        title: "Empréstimo Pessoal",
        category: "personal_loan",
        original_amount: 100,
        total_amount: 100,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: futureDate,
        interest_type: "none",
        interest_rate: 0,
        payment_method: "pix",
        status: "pending",
        settled_at: null,
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        debtor: createFakeDebtor("deb-1", "Beatriz Lima", "Bia"),
        installments: [createFakeInstallment("i1", "d-em-dia", 1, 100, 0, futureDate, "pending")],
      },
      {
        id: "d-caloteiro",
        user_id: userId,
        debtor_id: "deb-2",
        title: "Conserto do Carro",
        category: "car_repair",
        original_amount: 500,
        total_amount: 500,
        installments_count: 2,
        loan_date: "2026-01-01",
        first_due_date: pastDate,
        interest_type: "none",
        interest_rate: 0,
        payment_method: "pix",
        status: "defaulted",
        settled_at: null,
        notes: null,
        created_at: "2026-01-02T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
        debtor: createFakeDebtor("deb-2", "Carlos Santana", "Carlinhos"),
        installments: [
          createFakeInstallment("i2", "d-caloteiro", 1, 250, 0, pastDate, "pending"),
          createFakeInstallment("i3", "d-caloteiro", 2, 250, 0, pastDate, "pending"),
        ],
      },
    ];

    it("deve filtrar estritamente pela aba selecionada (CALOTEIROS)", async () => {
      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const result = await getAcompanhamentoDataApi({
        userId,
        tab: "CALOTEIROS",
      });

      expect(result.paginated.items).toHaveLength(1);
      expect(result.paginated.items[0].id).toBe("d-caloteiro");
      expect(result.paginated.total).toBe(1);
    });

    it("deve filtrar por termo de busca no apelido do devedor", async () => {
      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const result = await getAcompanhamentoDataApi({
        userId,
        search: "Carlinhos",
      });

      expect(result.paginated.items).toHaveLength(1);
      expect(result.paginated.items[0].debtorNickname).toBe("Carlinhos");
    });

    it("deve ordenar caloteiros mais graves primeiro quando sortBy for late_first", async () => {
      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const result = await getAcompanhamentoDataApi({
        userId,
        sortBy: "late_first",
      });

      expect(result.paginated.items).toHaveLength(2);
      // Caloteiro mais crítico (ACORDO_ROMPIDO) deve ser o primeiro da lista
      expect(result.paginated.items[0].gravity).toBe("ACORDO_ROMPIDO");
      expect(result.paginated.items[1].gravity).toBe("EM_DIA");
    });

    it("deve respeitar a paginação e o indicador hasMore", async () => {
      vi.mocked(acompanhamentoSupabase.getActiveDebtsWithRelationsSupabase).mockResolvedValue(mockDebtsList);
      vi.mocked(acompanhamentoSupabase.getInstallmentIdsWithExcusesSupabase).mockResolvedValue(new Set());

      const page1 = await getAcompanhamentoDataApi({
        userId,
        page: 1,
        limit: 1,
      });

      expect(page1.paginated.items).toHaveLength(1);
      expect(page1.paginated.hasMore).toBe(true);

      const page2 = await getAcompanhamentoDataApi({
        userId,
        page: 2,
        limit: 1,
      });

      expect(page2.paginated.items).toHaveLength(1);
      expect(page2.paginated.hasMore).toBe(false);
    });
  });
});
