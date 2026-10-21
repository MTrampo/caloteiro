import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFinancialAnalyticsApi } from "../service/financial.api";
import * as financialSupabase from "../repository/financial.supabase";
import type { FinancialDebtWithRelationsRow } from "../repository/financial.supabase";
import type { InstallmentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";
import { formatRelativeDueDate, parseDateOnly } from "@/commons/utils/date-formatter";

vi.mock("../repository/financial.supabase");

function createMockDebtor(overrides?: Partial<DebtorRow>): DebtorRow {
  return {
    id: "debtor-1",
    user_id: "tubarao-finance-user-1",
    name: "Carlos Caloteiro",
    nickname: "Carlão",
    phone: "11988887777",
    pix_key: "carlos@pix.com",
    pix_key_type: null,
    address: null,
    document: null,
    is_archived: false,
    notes: null,
    relationship: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockInstallment(overrides?: Partial<InstallmentRow>): InstallmentRow {
  return {
    id: "inst-1",
    debt_id: "debt-1",
    debtor_id: "debtor-1",
    user_id: "tubarao-finance-user-1",
    installment_number: 1,
    nominal_amount: 500,
    paid_amount: 0,
    due_date: "2026-09-01T00:00:00Z",
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("financial.api - Inteligência Financeira do Tubarão", () => {
  const userId = "tubarao-finance-user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar estrutura zerada segura quando o usuário não tiver nenhuma dívida cadastrada", async () => {
    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue(undefined);

    const result = await getFinancialAnalyticsApi(userId, "month");

    expect(result.kpis.emAberto.amount).toBe(0);
    expect(result.kpis.emDia.amount).toBe(0);
    expect(result.kpis.emAtraso.amount).toBe(0);
    expect(result.kpis.caloteiros.amount).toBe(0);
    expect(result.priorityDebtor).toBeNull();
    expect(result.portfolio.totalAmount).toBe(0);
    expect(result.portfolio.totalDebtors).toBe(0);
    expect(result.efficiency.series).toHaveLength(4);
  });

  it("deve calcular corretamente KPIs reais de dívidas em aberto, pagas e em atraso", async () => {
    const mockDebts: FinancialDebtWithRelationsRow[] = [
      {
        id: "debt-1",
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Empréstimo da Reforma",
        total_amount: 1000,
        original_amount: 1000,
        installments_count: 2,
        interest_type: "none",
        interest_rate: 0,
        status: "active",
        loan_date: "2026-08-01",
        first_due_date: "2026-09-01",
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor(),
        installments: [
          createMockInstallment({
            id: "inst-1",
            installment_number: 1,
            nominal_amount: 500,
            paid_amount: 500,
            due_date: "2026-09-01T00:00:00Z",
            status: "paid",
          }),
          createMockInstallment({
            id: "inst-2",
            installment_number: 2,
            nominal_amount: 500,
            paid_amount: 0,
            due_date: "2026-09-10T00:00:00Z", // Vencida há mais de 30 dias (Caloteiro)
            status: "open",
          }),
        ],
      },
    ];

    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue(mockDebts);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue("tubarao@pix.com");

    const result = await getFinancialAnalyticsApi(userId, "month");

    expect(result.kpis.emDia.amount).toBe(500);
    expect(result.kpis.emAberto.amount).toBe(500);
    expect(result.kpis.caloteiros.amount).toBe(500);
    expect(result.portfolio.totalDebtors).toBe(1);
    expect(result.portfolio.totalAmount).toBe(1000);

    // Devedor prioritário deve ser Carlos (com atraso crítico)
    expect(result.priorityDebtor).not.toBeNull();
    expect(result.priorityDebtor?.debtorName).toBe("Carlos Caloteiro");
    expect(result.priorityDebtor?.urgency).toBe("CRITICO");
    expect(result.priorityDebtor?.debtorPixKey).toBe("carlos@pix.com"); // Pix da presa!
    expect(result.priorityDebtor?.pixKey).toBe("carlos@pix.com"); // Chave copiada no card
    expect(result.priorityDebtor?.creditorPixKey).toBe("tubarao@pix.com"); // Pix do Tubarão para cobrança
    expect(result.priorityDebtor?.debtId).toBe("debt-1");
    expect(result.priorityDebtor?.remainingAmount).toBe(500);
  });

  it("REGRESSÃO: deve priorizar a chave Pix da presa e calcular o saldo restante em parcelas parcialmente pagas", async () => {
    const mockDebts: FinancialDebtWithRelationsRow[] = [
      {
        id: "debt-partial",
        user_id: userId,
        debtor_id: "debtor-partial-1",
        title: "Empréstimo Parcial",
        total_amount: 1000,
        original_amount: 1000,
        installments_count: 1,
        interest_type: "none",
        interest_rate: 0,
        status: "active",
        loan_date: "2026-10-01",
        first_due_date: "2026-11-05",
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor({
          id: "debtor-partial-1",
          name: "Cleiton Lopes",
          pix_key: "11973642456",
          pix_key_type: "phone",
        }),
        installments: [
          createMockInstallment({
            id: "inst-partial-1",
            nominal_amount: 896.33,
            paid_amount: 725.65, // Parcialmente paga
            due_date: "2026-11-05",
            status: "open",
          }),
        ],
      },
    ];

    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue(mockDebts);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue("tubarao@meupix.com");

    const result = await getFinancialAnalyticsApi(userId, "month");

    expect(result.priorityDebtor).not.toBeNull();
    expect(result.priorityDebtor?.debtorName).toBe("Cleiton Lopes");
    expect(result.priorityDebtor?.debtorPixKey).toBe("11973642456");
    expect(result.priorityDebtor?.pixKey).toBe("11973642456");
    expect(result.priorityDebtor?.installmentAmount).toBe(896.33);
    expect(result.priorityDebtor?.remainingAmount).toBeCloseTo(170.68, 2);
    expect(result.priorityDebtor?.debtId).toBe("debt-partial");
  });

  it("deve selecionar devedor de vencimento próximo caso nenhum esteja em atraso", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const mockDebts: FinancialDebtWithRelationsRow[] = [
      {
        id: "debt-2",
        user_id: userId,
        debtor_id: "debtor-2",
        title: "Dívida em dia",
        total_amount: 300,
        original_amount: 300,
        installments_count: 1,
        interest_type: "none",
        interest_rate: 0,
        status: "active",
        loan_date: new Date().toISOString(),
        first_due_date: futureDate.toISOString(),
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor({
          id: "debtor-2",
          name: "João Pontual",
          nickname: null,
          phone: "11977776666",
          pix_key: null,
        }),
        installments: [
          createMockInstallment({
            id: "inst-future",
            debt_id: "debt-2",
            debtor_id: "debtor-2",
            installment_number: 1,
            nominal_amount: 300,
            paid_amount: 0,
            due_date: futureDate.toISOString(),
            status: "open",
          }),
        ],
      },
    ];

    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue(mockDebts);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue(undefined);

    const result = await getFinancialAnalyticsApi(userId, "month");

    expect(result.priorityDebtor).not.toBeNull();
    expect(result.priorityDebtor?.debtorName).toBe("João Pontual");
    expect(result.priorityDebtor?.urgency).toBe("PROXIMO");
    expect(result.priorityDebtor?.pixKey).toBe("");
  });

  it("deve adaptar a granularidade dos pontos de eficiência de acordo com o período solicitado", async () => {
    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue(undefined);

    const monthResult = await getFinancialAnalyticsApi(userId, "month");
    expect(monthResult.efficiency.series).toHaveLength(4);

    const sixMonthsResult = await getFinancialAnalyticsApi(userId, "six_months");
    expect(sixMonthsResult.efficiency.series).toHaveLength(6);

    const yearResult = await getFinancialAnalyticsApi(userId, "year");
    expect(yearResult.efficiency.series).toHaveLength(12);
  });

  it("REGRESSÃO: formatRelativeDueDate e parseDateOnly devem interpretar '2026-11-05' sem recuo de fuso e sem repetir a data entre parênteses", () => {
    const parsed = parseDateOnly("2026-11-05");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10); // Novembro
    expect(parsed.getDate()).toBe(5);

    const relative = formatRelativeDueDate("2026-11-05");
    expect(relative.formatted).toBe("05/11/2026");
    expect(relative.detail).not.toContain("(05/11)");
  });

  it("REGRESSÃO: deve priorizar a data de vencimento mais próxima (ex: 30/10 antes de 05/11) mesmo que o valor seja menor", async () => {
    const earlierDate = new Date();
    earlierDate.setDate(earlierDate.getDate() + 4); // Ex: 30/10

    const laterDate = new Date();
    laterDate.setDate(laterDate.getDate() + 10); // Ex: 05/11

    const mockDebts: FinancialDebtWithRelationsRow[] = [
      {
        id: "debt-karen-later",
        user_id: userId,
        debtor_id: "debtor-karen",
        title: "Empréstimo Pessoal",
        total_amount: 4781.38,
        original_amount: 4000,
        installments_count: 9,
        interest_type: "none",
        interest_rate: 0,
        status: "pending",
        loan_date: "2026-05-05",
        first_due_date: laterDate.toISOString().split("T")[0],
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor({
          id: "debtor-karen",
          name: "Karen Cristina",
        }),
        installments: [
          createMockInstallment({
            id: "inst-karen-later",
            debt_id: "debt-karen-later",
            debtor_id: "debtor-karen",
            nominal_amount: 531.26,
            paid_amount: 0,
            due_date: laterDate.toISOString().split("T")[0],
            status: "pending",
          }),
        ],
      },
      {
        id: "debt-cleide-earlier",
        user_id: userId,
        debtor_id: "debtor-cleide",
        title: "Acordo Judicial",
        total_amount: 6900,
        original_amount: 6900,
        installments_count: 23,
        interest_type: "none",
        interest_rate: 0,
        status: "pending",
        loan_date: "2026-06-30",
        first_due_date: earlierDate.toISOString().split("T")[0],
        category: "judicial_agreement",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor({
          id: "debtor-cleide",
          name: "Cleide Ferreira Silva",
        }),
        installments: [
          createMockInstallment({
            id: "inst-cleide-earlier",
            debt_id: "debt-cleide-earlier",
            debtor_id: "debtor-cleide",
            installment_number: 5,
            nominal_amount: 300,
            paid_amount: 0,
            due_date: earlierDate.toISOString().split("T")[0],
            status: "pending",
          }),
        ],
      },
    ];

    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue(mockDebts);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue("tubarao@pix.com");

    const result = await getFinancialAnalyticsApi(userId, "month");

    expect(result.priorityDebtor).not.toBeNull();
    expect(result.priorityDebtor?.debtorName).toBe("Cleide Ferreira Silva");
    expect(result.priorityDebtor?.remainingAmount).toBe(300);
    expect(result.priorityDebtor?.debtId).toBe("debt-cleide-earlier");
  });

  it("REGRESSÃO: deve priorizar Karen (saldo restante R$ 531,26) sobre Cleiton (saldo restante R$ 170,68 após amortização parcial de R$ 725,65) no mesmo vencimento", async () => {
    const mockDebts: FinancialDebtWithRelationsRow[] = [
      {
        id: "debt-karen",
        user_id: userId,
        debtor_id: "debtor-karen",
        title: "Empréstimo Pessoal",
        total_amount: 4781.38,
        original_amount: 4000,
        installments_count: 9,
        interest_type: "fixed",
        interest_rate: 19.53,
        status: "active",
        loan_date: "2026-05-05",
        first_due_date: "2026-06-05",
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor({
          id: "debtor-karen",
          name: "Karen Cristina",
        }),
        installments: [
          createMockInstallment({
            id: "inst-karen-6",
            debt_id: "debt-karen",
            debtor_id: "debtor-karen",
            installment_number: 6,
            nominal_amount: 531.26,
            paid_amount: 0,
            due_date: "2026-11-05",
            status: "open",
          }),
        ],
      },
      {
        id: "debt-cleiton",
        user_id: userId,
        debtor_id: "debtor-cleiton",
        title: "Ajuda Familiar",
        total_amount: 10756,
        original_amount: 10000,
        installments_count: 12,
        interest_type: "fixed",
        interest_rate: 7.56,
        status: "active",
        loan_date: "2026-03-13",
        first_due_date: "2026-04-05",
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        debtor: createMockDebtor({
          id: "debtor-cleiton",
          name: "Cleiton Lopes",
        }),
        installments: [
          createMockInstallment({
            id: "inst-cleiton-8",
            debt_id: "debt-cleiton",
            debtor_id: "debtor-cleiton",
            installment_number: 8,
            nominal_amount: 896.33,
            paid_amount: 725.65,
            due_date: "2026-11-05",
            status: "open",
          }),
        ],
      },
    ];

    vi.mocked(financialSupabase.getFinancialDebtsWithRelationsSupabase).mockResolvedValue(mockDebts);
    vi.mocked(financialSupabase.getFinancialPaymentsSupabase).mockResolvedValue([]);
    vi.mocked(financialSupabase.getCreditorPixKeySupabase).mockResolvedValue("tubarao@pix.com");

    const result = await getFinancialAnalyticsApi(userId, "month");

    expect(result.priorityDebtor).not.toBeNull();
    expect(result.priorityDebtor?.debtorName).toBe("Karen Cristina");
    expect(result.priorityDebtor?.remainingAmount).toBe(531.26);
    expect(result.priorityDebtor?.debtId).toBe("debt-karen");

    // Deve contabilizar os 2 acordos ativos com status 'pending' do banco (e não 'active')
    expect(result.kpis.emAberto.footnote).toBe("2 acordos ativos na gruta");
  });
});
