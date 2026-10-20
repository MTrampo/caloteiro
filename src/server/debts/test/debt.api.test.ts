import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusEnum } from "@/commons/enums/http";
import { formatBRL } from "@/commons/utils/format";
import { DebtorRelationshipEnum } from "@/commons/models/debtor";
import type {
  DebtRow,
  InstallmentRow,
  InstallmentInsert,
  DebtExcuseRow,
} from "@/commons/models/debt";
import type { DebtorItem } from "@/commons/models/debtor";
import type { UserPermissions } from "@/commons/models/subscription";
import {
  createDebtApi,
  registerDebtPaymentApi,
  registerDebtExcuseApi,
  getDebtDetailsApi,
  generateRandomAccessCode,
  updateDebtPortalConfigApi,
  checkPublicDebtGateApi,
  verifyPublicDebtInvoiceAccessApi,
  getPublicDebtInvoiceDataApi,
} from "../service/debt.api";
import * as debtSupabase from "../repository/debt.supabase";
import * as debtorSupabase from "@/server/debtors/repository/debtor.supabase";
import * as subscriptionService from "@/server/account/service/subscription.api";

// Mocks dos Repositories e Serviços externos
vi.mock("../repository/debt.supabase");
vi.mock("@/server/debtors/repository/debtor.supabase");
vi.mock("@/server/account/service/subscription.api");

describe("Serviço de Dívidas (debt.api.ts)", () => {
  const userId = "tubarao-user-123";

  const unlimitedPermissions: UserPermissions = {
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

  const freePermissions: UserPermissions = {
    maxDebtors: 3,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
    isSubscriptionActive: true,
  };

  const baseDebtor: DebtorItem = {
    id: "debtor-1",
    user_id: userId,
    name: "Caloteiro Silva",
    nickname: null,
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDebtApi (Criação de Dívida e Regras de Negócio)", () => {
    it("deve dividir centavos perfeitamente sem perder frações monetárias (ex: R$ 100 em 3 parcelas)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(unlimitedPermissions);
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(baseDebtor);

      const mockCreatedDebt: DebtRow = {
        id: "debt-abc",
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Empréstimo",
        original_amount: 100,
        total_amount: 100,
        installments_count: 3,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-15",
        interest_type: "none",
        interest_rate: 0,
        category: "personal_loan",
        payment_method: "pix",
        status: "pending",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.createDebtSupabase).mockResolvedValue({
        data: mockCreatedDebt,
        error: null,
      });

      let capturedInstallments: InstallmentInsert[] = [];
      vi.mocked(debtSupabase.createInstallmentsSupabase).mockImplementation(async (installments) => {
        capturedInstallments = installments;
        return { data: [], error: null };
      });

      const response = await createDebtApi(userId, {
        debtor_id: "debtor-1",
        title: "Empréstimo Amigo",
        original_amount: 100,
        total_amount: 100,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-15",
        installments_count: 3,
        interest_type: "none",
        interest_rate: 0,
        category: "personal_loan",
        notes: "Empréstimo sem juros",
      });

      expect(response.status).toBe(HttpStatusEnum.Created);
      expect(response.data?.debtId).toBe("debt-abc");

      // Verificação da divisão exata de centavos:
      // R$ 100,00 / 3 = R$ 33,33 com 1 centavo de sobra
      // 1ª parcela deve absorver o centavo: R$ 33,34
      // 2ª parcela: R$ 33,33
      // 3ª parcela: R$ 33,33
      expect(capturedInstallments).toHaveLength(3);
      expect(capturedInstallments[0].nominal_amount).toBe(33.34);
      expect(capturedInstallments[1].nominal_amount).toBe(33.33);
      expect(capturedInstallments[2].nominal_amount).toBe(33.33);

      const totalCalculado = capturedInstallments.reduce((acc, curr) => acc + curr.nominal_amount, 0);
      expect(Math.round(totalCalculado * 100) / 100).toBe(100.0);

      // Verificação do avanço das datas de vencimento
      expect(capturedInstallments[0].due_date).toBe("2026-02-15");
      expect(capturedInstallments[1].due_date).toBe("2026-03-15");
      expect(capturedInstallments[2].due_date).toBe("2026-04-15");
    });

    it("deve ajustar datas de vencimento no fim do mês sem estourar fevereiro (ex: 31 de janeiro -> 28 de fevereiro)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(unlimitedPermissions);
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(baseDebtor);

      const mockCreatedDebt: DebtRow = {
        id: "debt-dates",
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Dívida",
        original_amount: 200,
        total_amount: 200,
        installments_count: 3,
        loan_date: "2026-01-01",
        first_due_date: "2026-01-31",
        interest_type: "none",
        interest_rate: 0,
        category: "other",
        payment_method: "pix",
        status: "pending",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.createDebtSupabase).mockResolvedValue({
        data: mockCreatedDebt,
        error: null,
      });

      let capturedInstallments: InstallmentInsert[] = [];
      vi.mocked(debtSupabase.createInstallmentsSupabase).mockImplementation(async (installments) => {
        capturedInstallments = installments;
        return { data: [], error: null };
      });

      const response = await createDebtApi(userId, {
        debtor_id: "debtor-1",
        title: "Dívida Fim de Mês",
        original_amount: 200,
        total_amount: 200,
        loan_date: "2026-01-01",
        first_due_date: "2026-01-31",
        installments_count: 3,
        interest_type: "none",
        interest_rate: 0,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.Created);
      expect(capturedInstallments[0].due_date).toBe("2026-01-31");
      expect(capturedInstallments[1].due_date).toBe("2026-02-28"); // Fevereiro em ano não bissexto
      expect(capturedInstallments[2].due_date).toBe("2026-03-31");
    });

    it("deve barrar criação de dívida se o limite de devedores/dívidas do plano for atingido", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(freePermissions);
      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(3);

      const response = await createDebtApi(userId, {
        debtor_id: "debtor-1",
        title: "Dívida Tanque Cheio",
        original_amount: 50,
        total_amount: 50,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 1,
        interest_type: "none",
        interest_rate: 0,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("LIMIT_REACHED");
      expect(response.message).toContain("O tanque encheu!");
    });

    it("deve barrar parcelamento acima de 12x no plano gratuito (Lixa)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(freePermissions);
      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(0);

      const response = await createDebtApi(userId, {
        debtor_id: "debtor-1",
        title: "Dívida 13x",
        original_amount: 600,
        total_amount: 600,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 13,
        interest_type: "none",
        interest_rate: 0,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("INSTALLMENTS_LIMIT_REACHED");
      expect(response.message).toContain("Limite de parcelamento excedido!");
    });

    it("deve barrar taxa fixa de juros no plano gratuito", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(freePermissions);
      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(0);

      const response = await createDebtApi(userId, {
        debtor_id: "debtor-1",
        title: "Dívida Taxa Fixa",
        original_amount: 100,
        total_amount: 120,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 2,
        interest_type: "fixed",
        interest_rate: 20,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("INTEREST_TYPE_NOT_ALLOWED");
    });

    it("deve rejeitar se o devedor não pertencer ao Tubarão logado", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(unlimitedPermissions);
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(null);

      const response = await createDebtApi(userId, {
        debtor_id: "debtor-de-outro-usuario",
        title: "Dívida Alheia",
        original_amount: 100,
        total_amount: 100,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 1,
        interest_type: "none",
        interest_rate: 0,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.BadRequest);
      expect(response.message).toContain("Devedor não encontrado");
    });
  });

  describe("registerDebtPaymentApi (Amortização em Cascata e Quitação)", () => {
    it("deve amortizar em cascata quitando a 1ª parcela e abatendo parcialmente a 2ª", async () => {
      const debtId = "debt-cascata-1";

      const mockDebt: DebtRow = {
        id: debtId,
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Dívida Cascata",
        status: "pending",
        original_amount: 200,
        total_amount: 200,
        installments_count: 2,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        interest_type: "none",
        interest_rate: 0,
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);

      const mockInstallments: InstallmentRow[] = [
        {
          id: "inst-1",
          debt_id: debtId,
          debtor_id: "debtor-1",
          user_id: userId,
          installment_number: 1,
          nominal_amount: 100,
          paid_amount: 0,
          due_date: "2026-02-01",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "inst-2",
          debt_id: debtId,
          debtor_id: "debtor-1",
          user_id: userId,
          installment_number: 2,
          nominal_amount: 100,
          paid_amount: 0,
          due_date: "2026-03-01",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const postUpdateInstallments: InstallmentRow[] = [
        { ...mockInstallments[0], paid_amount: 100, status: "paid" },
        { ...mockInstallments[1], paid_amount: 50, status: "partially_paid" },
      ];

      vi.mocked(debtSupabase.getInstallmentsByDebtIdSupabase)
        .mockResolvedValueOnce(mockInstallments)
        .mockResolvedValueOnce(postUpdateInstallments);

      interface CapturedUpdate {
        id: string;
        uId: string;
        patch: { paid_amount: number; status: string };
      }
      const updatedCalls: CapturedUpdate[] = [];
      vi.mocked(debtSupabase.updateInstallmentSupabase).mockImplementation(async (id, uId, patch) => {
        updatedCalls.push({ id, uId, patch: patch as { paid_amount: number; status: string } });
        return { success: true, error: null };
      });

      vi.mocked(debtSupabase.createPaymentSupabase).mockResolvedValue({ data: null, error: null });

      const response = await registerDebtPaymentApi(debtId, userId, {
        amount: 150,
        notes: "Metade agora, resto depois",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.settled).toBe(false);
      expect(response.data?.amortizedAmount).toBe(150);
      expect(response.message).toContain("Milagre na praça! Caiu o Pix");

      // Parcela 1: quitada com R$ 100
      expect(updatedCalls[0]).toEqual({
        id: "inst-1",
        uId: userId,
        patch: { paid_amount: 100, status: "paid" },
      });

      // Parcela 2: amortizada com R$ 50 restantes
      expect(updatedCalls[1]).toEqual({
        id: "inst-2",
        uId: userId,
        patch: { paid_amount: 50, status: "partially_paid" },
      });

      expect(debtSupabase.updateDebtStatusSupabase).not.toHaveBeenCalled();
    });

    it("deve celebrar e quitar a dívida inteira (settled) se o pagamento cobrir tudo", async () => {
      const debtId = "debt-full-settled";

      const mockDebt: DebtRow = {
        id: debtId,
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Dívida Quitada",
        status: "pending",
        original_amount: 100,
        total_amount: 100,
        installments_count: 2,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        interest_type: "none",
        interest_rate: 0,
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);

      const mockInstallments: InstallmentRow[] = [
        {
          id: "inst-1",
          debt_id: debtId,
          debtor_id: "debtor-1",
          user_id: userId,
          installment_number: 1,
          nominal_amount: 50,
          paid_amount: 0,
          due_date: "2026-02-01",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "inst-2",
          debt_id: debtId,
          debtor_id: "debtor-1",
          user_id: userId,
          installment_number: 2,
          nominal_amount: 50,
          paid_amount: 0,
          due_date: "2026-03-01",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const postUpdateInstallments: InstallmentRow[] = [
        { ...mockInstallments[0], paid_amount: 50, status: "paid" },
        { ...mockInstallments[1], paid_amount: 50, status: "paid" },
      ];

      vi.mocked(debtSupabase.getInstallmentsByDebtIdSupabase)
        .mockResolvedValueOnce(mockInstallments)
        .mockResolvedValueOnce(postUpdateInstallments);

      vi.mocked(debtSupabase.updateInstallmentSupabase).mockResolvedValue({ success: true, error: null });
      vi.mocked(debtSupabase.createPaymentSupabase).mockResolvedValue({ data: null, error: null });
      vi.mocked(debtSupabase.updateDebtStatusSupabase).mockResolvedValue({ success: true, error: null });

      const response = await registerDebtPaymentApi(debtId, userId, {
        amount: 100,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.settled).toBe(true);
      expect(response.message).toContain("CANCELEM O VELÓRIO! Ele pagou tudo!");

      expect(debtSupabase.updateDebtStatusSupabase).toHaveBeenCalledWith(debtId, userId, "settled");
    });

    it("deve impedir registro de pagamento se a dívida já foi liquidada", async () => {
      const mockDebt: DebtRow = {
        id: "debt-already-done",
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Dívida já Liquidada",
        status: "settled",
        original_amount: 100,
        total_amount: 100,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        interest_type: "none",
        interest_rate: 0,
        category: "other",
        payment_method: "pix",
        settled_at: "2026-02-01T10:00:00Z",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);

      const response = await registerDebtPaymentApi("debt-already-done", userId, {
        amount: 50,
      });

      expect(response.status).toBe(HttpStatusEnum.BadRequest);
      expect(response.message).toContain("Esta dívida já foi totalmente quitada");
    });

    it("deve rejeitar valor de pagamento menor ou igual a zero", async () => {
      const mockDebt: DebtRow = {
        id: "debt-zero-val",
        user_id: userId,
        debtor_id: "debtor-1",
        title: "Dívida Zero",
        status: "pending",
        original_amount: 50,
        total_amount: 50,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        interest_type: "none",
        interest_rate: 0,
        category: "other",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);

      const mockInstallments: InstallmentRow[] = [
        {
          id: "inst-1",
          debt_id: "debt-zero-val",
          debtor_id: "debtor-1",
          user_id: userId,
          installment_number: 1,
          nominal_amount: 50,
          paid_amount: 0,
          due_date: "2026-02-01",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      vi.mocked(debtSupabase.getInstallmentsByDebtIdSupabase).mockResolvedValue(mockInstallments);

      const response = await registerDebtPaymentApi("debt-zero-val", userId, {
        amount: 0,
      });

      expect(response.status).toBe(HttpStatusEnum.BadRequest);
      expect(response.message).toContain("superior a zero");
    });
  });

  describe("registerDebtExcuseApi (Anotação de Caô / Promessa)", () => {
    it("deve registrar o caô com nova promessa de pagamento vinculada ao devedor", async () => {
      const mockInstallment: InstallmentRow = {
        id: "inst-excuse-1",
        debt_id: "debt-1",
        debtor_id: "debtor-caloteiro",
        user_id: userId,
        installment_number: 1,
        nominal_amount: 100,
        paid_amount: 0,
        due_date: "2026-02-01",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.getInstallmentByIdSupabase).mockResolvedValue(mockInstallment);

      const mockExcuse: DebtExcuseRow = {
        id: "excuse-99",
        installment_id: "inst-excuse-1",
        debtor_id: "debtor-caloteiro",
        user_id: userId,
        excuse_text: "O banco bloqueou minha conta temporariamente",
        promised_date: "2026-03-01",
        was_honored: null,
        created_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.createExcuseSupabase).mockResolvedValue({
        data: mockExcuse,
        error: null,
      });

      const response = await registerDebtExcuseApi(userId, {
        installment_id: "inst-excuse-1",
        excuse_text: "O banco bloqueou minha conta temporariamente",
        promised_date: "2026-03-01",
      });

      expect(response.status).toBe(HttpStatusEnum.Created);
      expect(response.data?.excuseId).toBe("excuse-99");
      expect(response.message).toContain("Caô devidamente registrado!");

      expect(debtSupabase.createExcuseSupabase).toHaveBeenCalledWith({
        installment_id: "inst-excuse-1",
        debtor_id: "debtor-caloteiro",
        user_id: userId,
        excuse_text: "O banco bloqueou minha conta temporariamente",
        promised_date: "2026-03-01",
      });
    });
  });

  describe("getDebtDetailsApi (Consulta Detalhada & Teste de Regressão de Juros)", () => {
    it("deve calcular corretamente o valor total com juros, o saldo restante e o percentual de progresso (Teste de Regressão: caso Cleiton Lopes)", async () => {
      const debtId = "debt-cleiton-regression";

      const mockDebt: DebtRow = {
        id: debtId,
        user_id: userId,
        debtor_id: "debtor-cleiton",
        title: "Ajuda Familiar",
        status: "pending",
        original_amount: 10000,
        total_amount: 10756,
        installments_count: 12,
        loan_date: "2026-03-13",
        first_due_date: "2026-04-05",
        interest_type: "total_percentage",
        interest_rate: 7.56,
        category: "family_help",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockDebtor: DebtorItem = {
        id: "debtor-cleiton",
        user_id: userId,
        name: "Cleiton Lopes",
        nickname: "Tio",
        phone: "11973642456",
        document: null,
        address: null,
        notes: null,
        pix_key: null,
        pix_key_type: null,
        relationship: DebtorRelationshipEnum.PARENT,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 12 parcelas: 1 a 7 quitadas (6.274,35), 8 parcialmente paga (725,65), 9 a 12 abertas. Total pago: 7.000,00
      const mockInstallments: InstallmentRow[] = [
        {
          id: "inst-1",
          debt_id: debtId,
          debtor_id: "debtor-cleiton",
          user_id: userId,
          installment_number: 1,
          nominal_amount: 896.37,
          paid_amount: 896.37,
          due_date: "2026-04-05",
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...Array.from({ length: 6 }, (_, idx) => ({
          id: `inst-${idx + 2}`,
          debt_id: debtId,
          debtor_id: "debtor-cleiton",
          user_id: userId,
          installment_number: idx + 2,
          nominal_amount: 896.33,
          paid_amount: 896.33,
          due_date: `2026-0${idx + 5}-05`,
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        {
          id: "inst-8",
          debt_id: debtId,
          debtor_id: "debtor-cleiton",
          user_id: userId,
          installment_number: 8,
          nominal_amount: 896.33,
          paid_amount: 725.65,
          due_date: "2026-11-05",
          status: "partially_paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...Array.from({ length: 4 }, (_, idx) => ({
          id: `inst-${idx + 9}`,
          debt_id: debtId,
          debtor_id: "debtor-cleiton",
          user_id: userId,
          installment_number: idx + 9,
          nominal_amount: 896.33,
          paid_amount: 0,
          due_date: `2026-12-05`,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      ];

      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(mockDebtor);
      vi.mocked(debtSupabase.getInstallmentsByDebtIdSupabase).mockResolvedValue(mockInstallments);
      vi.mocked(debtSupabase.getPaymentsByDebtIdSupabase).mockResolvedValue([]);
      vi.mocked(debtSupabase.getExcusesByInstallmentIdsSupabase).mockResolvedValue([]);

      const response = await getDebtDetailsApi(debtId, userId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      const data = response.data!;

      // Verificação do valor total com juros (deve ser R$ 10.756,00 e NUNCA R$ 10.000,00)
      expect(data.formattedTotalAmount).toBe(formatBRL(10756));
      expect(data.formattedOriginalAmount).toBe(formatBRL(10000));

      // Verificação do juros calculado
      expect(data.totalInterestAmount).toBe(756);
      expect(data.formattedTotalInterestAmount).toBe(`+ ${formatBRL(756)}`);
      expect(data.hasInterest).toBe(true);

      // Verificação do total pago
      expect(data.formattedPaidAmount).toBe(formatBRL(7000));

      // Verificação do saldo restante na pista: 10.756 - 7.000 = 3.756 (deve ser R$ 3.756,00 e NUNCA R$ 3.000,00)
      expect(data.formattedRemainingAmount).toBe(formatBRL(3756));

      // Verificação da porcentagem de progresso: 7.000 / 10.756 = 65% (deve ser 65% e NUNCA 70%)
      expect(data.progressPercentage).toBe(65);

      // Verificação da contagem de parcelas
      expect(data.paidInstallmentsCount).toBe(7);
      expect(data.totalInstallmentsCount).toBe(12);
      expect(data.remainingInstallmentsCount).toBe(5);
    });

    it("deve tratar corretamente dívidas sem juros (empréstimo camarada)", async () => {
      const debtId = "debt-sem-juros";

      const mockDebt: DebtRow = {
        id: debtId,
        user_id: userId,
        debtor_id: "debtor-amigo",
        title: "Empréstimo Camarada",
        status: "pending",
        original_amount: 500,
        total_amount: 500,
        installments_count: 1,
        loan_date: "2026-03-01",
        first_due_date: "2026-04-01",
        interest_type: "none",
        interest_rate: 0,
        category: "personal_loan",
        payment_method: "pix",
        settled_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockDebtor: DebtorItem = {
        id: "debtor-amigo",
        user_id: userId,
        name: "Amigo do Peito",
        nickname: null,
        phone: "11999991111",
        document: null,
        address: null,
        notes: null,
        pix_key: null,
        pix_key_type: null,
        relationship: DebtorRelationshipEnum.OTHER,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInstallments: InstallmentRow[] = [
        {
          id: "inst-sem-juros-1",
          debt_id: debtId,
          debtor_id: "debtor-amigo",
          user_id: userId,
          installment_number: 1,
          nominal_amount: 500,
          paid_amount: 200,
          due_date: "2026-04-01",
          status: "partially_paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(mockDebtor);
      vi.mocked(debtSupabase.getInstallmentsByDebtIdSupabase).mockResolvedValue(mockInstallments);
      vi.mocked(debtSupabase.getPaymentsByDebtIdSupabase).mockResolvedValue([]);
      vi.mocked(debtSupabase.getExcusesByInstallmentIdsSupabase).mockResolvedValue([]);

      const response = await getDebtDetailsApi(debtId, userId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      const data = response.data!;

      expect(data.formattedTotalAmount).toBe(formatBRL(500));
      expect(data.formattedOriginalAmount).toBe(formatBRL(500));
      expect(data.totalInterestAmount).toBe(0);
      expect(data.formattedTotalInterestAmount).toBe(formatBRL(0));
      expect(data.hasInterest).toBe(false);
      expect(data.formattedRemainingAmount).toBe(formatBRL(300));
      expect(data.progressPercentage).toBe(40);
      expect(data.remainingInstallmentsCount).toBe(1);
    });
  });

  describe("Link Público da Fatura (/fatura/[id]) e Segurança por Código", () => {
    const debtId = "debt-fatura-publica-1";

    const mockDebtEnabled: DebtRow = {
      id: debtId,
      user_id: userId,
      debtor_id: "debtor-1",
      title: "Acordo Amigável",
      status: "pending",
      original_amount: 1000,
      total_amount: 1200,
      installments_count: 2,
      loan_date: "2026-10-01",
      first_due_date: "2026-11-05",
      interest_type: "total_percentage",
      interest_rate: 20,
      category: "personal_loan",
      payment_method: "pix",
      settled_at: null,
      notes: "SEGREDO INTERNO DO TUBARAO NAO VAZAR",
      public_link_enabled: true,
      public_access_code: "7K9M2P",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("deve gerar código de acesso aleatório com 6 caracteres sem caracteres ambíguos (0, O, 1, I)", () => {
      const code = generateRandomAccessCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    });

    it("deve bloquear configuração do Link da Fatura para usuários no plano gratuito Tubarão Lixa (canDebtorPortal = false)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(
        freePermissions
      );

      const response = await updateDebtPortalConfigApi({
        debtId,
        userId,
        publicLinkEnabled: true,
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("PLAN_NOT_ALLOWED");
      expect(debtSupabase.updateDebtPortalConfigSupabase).not.toHaveBeenCalled();
    });

    it("deve permitir habilitar o link e personalizar ou regenerar o código nos planos Tubarão Branco e Cabeça Chato", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(
        unlimitedPermissions
      );
      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue({
        ...mockDebtEnabled,
        public_link_enabled: false,
      });
      vi.mocked(debtSupabase.updateDebtPortalConfigSupabase).mockImplementation(
        async (payload) => ({
          data: {
            ...mockDebtEnabled,
            public_link_enabled: payload.publicLinkEnabled,
            public_access_code: payload.publicAccessCode,
          },
          error: null,
        })
      );

      const response = await updateDebtPortalConfigApi({
        debtId,
        userId,
        publicLinkEnabled: true,
        publicAccessCode: "pix2026",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.publicLinkEnabled).toBe(true);
      expect(response.data?.publicAccessCode).toBe("PIX2026");
    });

    it("deve rejeitar acesso à fatura pública quando public_link_enabled for false (default desativado)", async () => {
      vi.mocked(debtSupabase.getPublicDebtByIdSupabase).mockResolvedValue({
        ...mockDebtEnabled,
        public_link_enabled: false,
      });

      const gateRes = await checkPublicDebtGateApi(debtId);
      expect(gateRes.status).toBe(HttpStatusEnum.NotFound);

      const verifyRes = await verifyPublicDebtInvoiceAccessApi({
        debtId,
        accessCode: "7K9M2P",
      });
      expect(verifyRes.status).toBe(HttpStatusEnum.NotFound);
    });

    it("deve rejeitar acesso com 401 Unauthorized quando o código informado estiver incorreto", async () => {
      vi.mocked(debtSupabase.getPublicDebtByIdSupabase).mockResolvedValue(
        mockDebtEnabled
      );
      vi.mocked(subscriptionService.getUserPermissionsApi).mockResolvedValue(
        unlimitedPermissions
      );

      const response = await verifyPublicDebtInvoiceAccessApi({
        debtId,
        accessCode: "ERRADO",
      });

      expect(response.status).toBe(HttpStatusEnum.Unauthorized);
      expect(response.message).toContain("Código de acesso incorreto");
    });

    it("deve retornar os dados da fatura pública com juros, pago, restante e Pix, garantindo ZERO vazamento de notas ou caôs", async () => {
      vi.mocked(debtSupabase.getPublicDebtByIdSupabase).mockResolvedValue(
        mockDebtEnabled
      );
      vi.mocked(subscriptionService.getUserPermissionsApi).mockResolvedValue(
        unlimitedPermissions
      );
      vi.mocked(debtSupabase.getPublicDebtContextByIdSupabase).mockResolvedValue({
        debtorName: "Carlos Eduardo Mendes",
        debtorNickname: "Carlinhos",
        creditorName: "Vinicius",
        creditorNickname: "Tubarão",
        creditorPhone: "11988887777",
        pixKey: "pix@tubarao.com",
        pixKeyType: "email",
        pixHolderName: "Vinicius",
        pixBankName: "Nubank",
        installments: [
          {
            id: "inst-pub-1",
            debt_id: debtId,
            debtor_id: "debtor-1",
            user_id: userId,
            installment_number: 1,
            nominal_amount: 600,
            paid_amount: 600,
            due_date: "2026-11-05",
            status: "paid",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "inst-pub-2",
            debt_id: debtId,
            debtor_id: "debtor-1",
            user_id: userId,
            installment_number: 2,
            nominal_amount: 600,
            paid_amount: 150,
            due_date: "2026-12-05",
            status: "partially_paid",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        payments: [
          {
            id: "pay-pub-1",
            amount: 750,
            paid_at: "2026-10-19T14:00:00Z",
            created_at: "2026-10-19T14:00:00Z",
          },
        ],
      });

      const response = await getPublicDebtInvoiceDataApi({
        debtId,
        accessCode: "7k9m2p", // case-insensitive
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      const invoice = response.data!;

      // Verifica cálculos financeiros
      expect(invoice.debtorFirstName).toBe("Carlos");
      expect(invoice.originalAmount).toBe(1000);
      expect(invoice.totalAmount).toBe(1200);
      expect(invoice.totalInterestAmount).toBe(200);
      expect(invoice.paidAmount).toBe(750);
      expect(invoice.remainingAmount).toBe(450);
      expect(invoice.progressPercentage).toBe(63);
      expect(invoice.pixKey).toBe("pix@tubarao.com");
      expect(invoice.pixBankName).toBe("Nubank");
      expect(invoice.nextInstallment?.installmentNumber).toBe(2);
      expect(invoice.nextInstallment?.remainingAmount).toBe(450);

      // GARANTIA ZERO LEAK: segredos internos não devem existir no payload serializado
      const serialized = JSON.stringify(invoice);
      expect(serialized).not.toContain("SEGREDO INTERNO DO TUBARAO NAO VAZAR");
      expect(invoice).not.toHaveProperty("notes");
      expect(invoice).not.toHaveProperty("excuses");
      expect(invoice).not.toHaveProperty("document");
      expect(invoice).not.toHaveProperty("address");
    });
  });
});
