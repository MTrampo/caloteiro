import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildHomeCommandKPIs,
  buildHomeCommandFeed,
  getHomeCommandDataApi,
} from "../service/home-command.api";
import * as homeCommandSupabase from "../repository/home-command.supabase";
import * as creditorSettingsSupabase from "@/server/account/repository/creditor-settings.supabase";
import type {
  HomeCommandDebtRow,
  RecentDebtPaymentRow,
} from "../repository/home-command.supabase";
import type { InstallmentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";
import { DebtorRelationshipEnum } from "@/commons/models/debtor";

vi.mock("../repository/home-command.supabase");
vi.mock("@/server/account/repository/creditor-settings.supabase");

describe("Serviço do Painel Principal / Central de Comando (home-command.api.ts)", () => {
  const userId = "tubarao-home-user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getRelativeDate = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const createFakeDebtor = (
    id: string,
    name: string,
    nickname: string | null = null,
    phone: string = "11987654321"
  ): DebtorRow => ({
    id,
    user_id: userId,
    name,
    nickname,
    relationship: DebtorRelationshipEnum.FRIEND,
    phone,
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
    status: "pending" | "paid" | "partially_paid" | "late" = "pending",
    updatedAt: string = new Date().toISOString()
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
    updated_at: updatedAt,
  });

  const createFakeDebt = (
    id: string,
    debtor: DebtorRow,
    installments: InstallmentRow[],
    status = "active"
  ): HomeCommandDebtRow => ({
    id,
    user_id: userId,
    debtor_id: debtor.id,
    title: "Dívida Teste",
    category: "personal_loan",
    original_amount: 500,
    total_amount: 500,
    installments_count: installments.length,
    first_due_date: getRelativeDate(0),
    loan_date: getRelativeDate(-10),
    payment_method: "pix",
    status,
    interest_rate: 0,
    interest_type: "none",
    notes: null,
    settled_at: status === "settled" ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    debtor,
    installments,
  });

  describe("buildHomeCommandKPIs (Cálculo dos 3 KPIs de Triagem)", () => {
    it("deve calcular corretamente parcelas vencendo na semana e atrasos críticos (> 30 dias)", () => {
      const debts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-1",
          createFakeDebtor("d1", "Carlos Caloteiro"),
          [
            // Parcela 1: Vencendo em 2 dias (dueSoon)
            createFakeInstallment("inst-1", "debt-1", 1, 100, 0, getRelativeDate(2), "pending"),
            // Parcela 2: Vencendo hoje (dueSoon)
            createFakeInstallment("inst-2", "debt-1", 2, 100, 0, getRelativeDate(0), "pending"),
            // Parcela 3: Vencida há 35 dias (criticalOverdue)
            createFakeInstallment("inst-3", "debt-1", 3, 100, 0, getRelativeDate(-35), "late"),
          ]
        ),
        createFakeDebt(
          "debt-2",
          createFakeDebtor("d2", "Renato Sumido"),
          [
            // Parcela atrasada há 5 dias (atraso comum, não crítico)
            createFakeInstallment("inst-4", "debt-2", 1, 300, 0, getRelativeDate(-5), "late"),
          ]
        ),
      ];

      const recentPayments: RecentDebtPaymentRow[] = [
        {
          id: "pay-1",
          debt_id: "debt-1",
          debtor_id: "d1",
          amount: 100,
          notes: "Pix do vale",
          paid_at: new Date().toISOString(),
        },
        {
          id: "pay-2",
          debt_id: "debt-2",
          debtor_id: "d2",
          amount: 50,
          notes: "Adiantamento",
          paid_at: new Date().toISOString(),
        },
      ];

      const kpis = buildHomeCommandKPIs(debts, recentPayments);

      expect(kpis.dueSoonCount).toBe(2); // inst-1 (em 2 dias) e inst-2 (hoje)
      expect(kpis.criticalOverdueCount).toBe(1); // inst-3 (> 30 dias)
      expect(kpis.recentlyPaidCount).toBe(2); // 2 pagamentos nos últimos 7 dias
    });

    it("não deve computar parcelas de dívidas já quitadas ou canceladas", () => {
      const debts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-settled",
          createFakeDebtor("d1", "Honrado"),
          [
            createFakeInstallment("inst-1", "debt-settled", 1, 100, 100, getRelativeDate(1), "paid"),
          ],
          "settled"
        ),
      ];

      const kpis = buildHomeCommandKPIs(debts, []);

      expect(kpis.dueSoonCount).toBe(0);
      expect(kpis.criticalOverdueCount).toBe(0);
      expect(kpis.recentlyPaidCount).toBe(0);
    });
  });

  describe("buildHomeCommandFeed (Priorização e Formatação do Feed)", () => {
    it("deve ordenar ocorrências com prioridade para atrasos urgentes, hoje e próximos dias", () => {
      const debts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-1",
          createFakeDebtor("d1", "Beto Silva", "Beto do Açougue", "11987654321"),
          [
            createFakeInstallment("inst-due-soon", "debt-1", 1, 100, 0, getRelativeDate(2)),
            createFakeInstallment("inst-overdue-10", "debt-1", 2, 100, 0, getRelativeDate(-10), "late"),
            createFakeInstallment("inst-today", "debt-1", 3, 100, 0, getRelativeDate(0)),
            createFakeInstallment("inst-overdue-2", "debt-1", 4, 100, 0, getRelativeDate(-2), "late"),
          ]
        ),
      ];

      const excusesMap = {
        "inst-overdue-10": "Disse que o aplicativo do banco travou",
      };

      const feed = buildHomeCommandFeed(debts, excusesMap, "11999998888");

      expect(feed.length).toBe(4);

      // 1º e 2º devem ser urgent_overdue (as mais atrasadas primeiro)
      expect(feed[0].type).toBe("urgent_overdue");
      expect(feed[0].category).toBe("overdue");
      expect(feed[0].id).toBe("inst-overdue-10");
      expect(feed[0].relativeTimeText).toBe("Venceu há 10 dias");
      expect(feed[0].lastExcuseNote).toBe("Disse que o aplicativo do banco travou");
      expect(feed[0].debtorNickname).toBe("Beto do Açougue");
      expect(feed[0].pixKey).toBe("11999998888");

      expect(feed[1].type).toBe("urgent_overdue");
      expect(feed[1].category).toBe("overdue");
      expect(feed[1].id).toBe("inst-overdue-2");
      expect(feed[1].relativeTimeText).toBe("Venceu há 2 dias");

      // 3º deve ser due_today
      expect(feed[2].type).toBe("due_today");
      expect(feed[2].category).toBe("upcoming");
      expect(feed[2].id).toBe("inst-today");
      expect(feed[2].relativeTimeText).toBe("Vence Hoje");

      // 4º deve ser due_soon
      expect(feed[3].type).toBe("due_soon");
      expect(feed[3].category).toBe("upcoming");
      expect(feed[3].id).toBe("inst-due-soon");
      expect(feed[3].relativeTimeText).toBe("Vence em 2 dias");
    });

    it("deve incluir parcelas vencendo em até 7 dias na categoria upcoming", () => {
      const debts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-semana",
          createFakeDebtor("d1", "Carlos Prazo"),
          [
            createFakeInstallment("inst-5d", "debt-semana", 1, 100, 0, getRelativeDate(5)),
            createFakeInstallment("inst-7d", "debt-semana", 2, 100, 0, getRelativeDate(7)),
            createFakeInstallment("inst-8d", "debt-semana", 3, 100, 0, getRelativeDate(8)),
          ]
        ),
      ];

      const feed = buildHomeCommandFeed(debts, {});

      // 5 dias e 7 dias devem ser incluídos; 8 dias não
      expect(feed.length).toBe(2);
      expect(feed[0].id).toBe("inst-5d");
      expect(feed[0].category).toBe("upcoming");
      expect(feed[1].id).toBe("inst-7d");
      expect(feed[1].category).toBe("upcoming");
    });

    it("deve limitar a exibição a no máximo 10 ocorrências para manter o layout executivo", () => {
      const installments: InstallmentRow[] = [];
      for (let i = 1; i <= 15; i++) {
        installments.push(
          createFakeInstallment(`inst-${i}`, "debt-long", i, 50, 0, getRelativeDate(-i), "late")
        );
      }

      const debts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-long",
          createFakeDebtor("d1", "Marcio Vários"),
          installments
        ),
      ];

      const feed = buildHomeCommandFeed(debts, {});
      expect(feed.length).toBe(10);
    });

    it("deve diferenciar corretamente pagamentos realizados hoje de pagamentos de ontem pelo calendário (regressão de fuso/janela deslizante)", () => {
      const now = new Date();
      // Criar timestamp de ontem às 19:00 (há ~20 horas atrás, que antes caía erroneamente em diffHours <= 24)
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      yesterdayDate.setHours(19, 0, 0, 0);

      const todayDate = new Date(now);
      todayDate.setHours(9, 0, 0, 0);

      const debts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-paid-yesterday",
          createFakeDebtor("d-yesterday", "Cleide Ferreira"),
          [
            createFakeInstallment(
              "inst-cleide-1",
              "debt-paid-yesterday",
              1,
              300,
              300,
              getRelativeDate(-5),
              "paid",
              yesterdayDate.toISOString()
            ),
          ]
        ),
        createFakeDebt(
          "debt-paid-today",
          createFakeDebtor("d-today", "Marcos Pagador"),
          [
            createFakeInstallment(
              "inst-marcos-1",
              "debt-paid-today",
              1,
              150,
              150,
              getRelativeDate(0),
              "paid",
              todayDate.toISOString()
            ),
          ]
        ),
      ];

      const recentPayments: RecentDebtPaymentRow[] = [
        {
          id: "pay-cleide-1",
          debt_id: "debt-paid-yesterday",
          debtor_id: "d-yesterday",
          amount: 300,
          notes: "Pix Nubank",
          paid_at: yesterdayDate.toISOString(),
        },
        {
          id: "pay-marcos-1",
          debt_id: "debt-paid-today",
          debtor_id: "d-today",
          amount: 150,
          notes: null,
          paid_at: todayDate.toISOString(),
        },
      ];

      const feed = buildHomeCommandFeed(debts, {}, undefined, recentPayments);

      const cleideItem = feed.find((item) => item.id === "inst-cleide-1");
      const marcosItem = feed.find((item) => item.id === "inst-marcos-1");

      expect(cleideItem).toBeDefined();
      expect(cleideItem?.relativeTimeText).toBe("Pagou ontem");

      expect(marcosItem).toBeDefined();
      expect(marcosItem?.relativeTimeText).toBe("Pagou hoje");
    });

    it("REGRESSÃO: em dívida com múltiplas parcelas, o pagamento de uma parcela não deve vazar data para parcelas antigas", () => {
      const now = new Date();
      const elevenDaysAgo = new Date(now);
      elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

      const todayDate = new Date(now);

      // Simula o caso real da Cleide com 23 parcelas:
      // Parcelas 1 a 4 foram quitadas há 11 dias (updated_at antigo).
      // Parcela 5 foi quitada hoje (updated_at de hoje).
      // Parcela 6 vence daqui a 4 dias (upcoming).
      const cleideDebtor = createFakeDebtor("d-cleide", "Cleide Ferreira Silva");
      const cleideDebt = createFakeDebt("debt-cleide-23", cleideDebtor, [
        createFakeInstallment("inst-c-1", "debt-cleide-23", 1, 300, 300, getRelativeDate(-40), "paid", elevenDaysAgo.toISOString()),
        createFakeInstallment("inst-c-2", "debt-cleide-23", 2, 300, 300, getRelativeDate(-30), "paid", elevenDaysAgo.toISOString()),
        createFakeInstallment("inst-c-3", "debt-cleide-23", 3, 300, 300, getRelativeDate(-20), "paid", elevenDaysAgo.toISOString()),
        createFakeInstallment("inst-c-4", "debt-cleide-23", 4, 300, 300, getRelativeDate(-10), "paid", elevenDaysAgo.toISOString()),
        createFakeInstallment("inst-c-5", "debt-cleide-23", 5, 300, 300, getRelativeDate(0), "paid", todayDate.toISOString()),
        createFakeInstallment("inst-c-6", "debt-cleide-23", 6, 300, 0, getRelativeDate(4), "pending"),
      ]);

      const recentPayments: RecentDebtPaymentRow[] = [
        {
          id: "pay-c-5",
          debt_id: "debt-cleide-23",
          debtor_id: "d-cleide",
          amount: 300,
          notes: "Baixa da parcela 5",
          paid_at: todayDate.toISOString(),
        },
      ];

      const feed = buildHomeCommandFeed([cleideDebt], {}, undefined, recentPayments);

      // Apenas a parcela 5 deve aparecer como paga recentemente (Pagou hoje)
      const paidItemsInFeed = feed.filter((item) => item.category === "paid");
      expect(paidItemsInFeed.length).toBe(1);
      expect(paidItemsInFeed[0].id).toBe("inst-c-5");
      expect(paidItemsInFeed[0].installmentText).toBe("Parcela 5 de 6");
      expect(paidItemsInFeed[0].relativeTimeText).toBe("Pagou hoje");

      // As parcelas 1 a 4 NUNCA devem aparecer no feed
      const oldPaidItems = feed.filter((item) =>
        ["inst-c-1", "inst-c-2", "inst-c-3", "inst-c-4"].includes(item.id)
      );
      expect(oldPaidItems.length).toBe(0);

      // A parcela 6 pendente a vencer em 4 dias deve aparecer na categoria upcoming
      const upcomingItem = feed.find((item) => item.id === "inst-c-6");
      expect(upcomingItem).toBeDefined();
      expect(upcomingItem?.category).toBe("upcoming");
      expect(upcomingItem?.relativeTimeText).toBe("Vence em 4 dias");
    });
  });

  describe("getHomeCommandDataApi (Integração e Empty States)", () => {
    it("deve retornar empty state geral quando não houver dívidas cadastradas", async () => {
      vi.mocked(homeCommandSupabase.getHomeCommandDebtsSupabase).mockResolvedValue([]);
      vi.mocked(homeCommandSupabase.getRecentExcusesByInstallmentIdsSupabase).mockResolvedValue({});
      vi.mocked(homeCommandSupabase.getRecentDebtPaymentsSupabase).mockResolvedValue([]);
      vi.mocked(creditorSettingsSupabase.getCreditorSettingsByUserIdSupabase).mockResolvedValue(null);

      const result = await getHomeCommandDataApi(userId, "Vinicius");

      expect(result.userName).toBe("Vinicius");
      expect(result.totalDebtsCount).toBe(0);
      expect(result.feed).toEqual([]);
      expect(result.kpis.dueSoonCount).toBe(0);
      expect(result.kpis.criticalOverdueCount).toBe(0);
      expect(result.kpis.recentlyPaidCount).toBe(0);
      expect(result.counts.totalCount).toBe(0);
    });

    it("deve carregar dados completos com chave Pix do credor e desculpas associadas", async () => {
      const fakeDebts: HomeCommandDebtRow[] = [
        createFakeDebt(
          "debt-1",
          createFakeDebtor("d1", "Rodrigo Cunhado"),
          [
            createFakeInstallment("inst-1", "debt-1", 1, 200, 0, getRelativeDate(0), "pending"),
          ]
        ),
      ];

      vi.mocked(homeCommandSupabase.getHomeCommandDebtsSupabase).mockResolvedValue(fakeDebts);
      vi.mocked(homeCommandSupabase.getRecentExcusesByInstallmentIdsSupabase).mockResolvedValue({});
      vi.mocked(homeCommandSupabase.getRecentDebtPaymentsSupabase).mockResolvedValue([]);
      vi.mocked(creditorSettingsSupabase.getCreditorSettingsByUserIdSupabase).mockResolvedValue({
        id: "cs-1",
        user_id: userId,
        pix_key: "chave-pix-tubarao@banco.com",
        pix_key_type: "email",
        pix_holder_name: "Vinicius Tubarão",
        pix_bank_name: "Nubank",
        template_friendly: null,
        template_acid: null,
        template_critical: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await getHomeCommandDataApi(userId, "Vinicius");

      expect(result.totalDebtsCount).toBe(1);
      expect(result.creditorPixKey).toBe("chave-pix-tubarao@banco.com");
      expect(result.feed.length).toBe(1);
      expect(result.feed[0].type).toBe("due_today");
      expect(result.feed[0].pixKey).toBe("chave-pix-tubarao@banco.com");
      expect(result.counts.dueSoonCount).toBe(1);
    });
  });
});
