import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusEnum } from "@/commons/enums/http";
import {
  webhookSubscriptionPreapprovalApi,
  webhookSubscriptionAuthorizedPaymentApi,
} from "../service/webhook.subscription.api";
import * as paymentService from "@/server/payment/service/payment.api";
import * as webhookSupabase from "../repository/webhook.subscription.supabase";
import * as emailService from "@/server/email";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { InvoiceResponse } from "mercadopago/dist/clients/invoice/commonTypes";
import type { Database } from "@/commons/types/database.types";
import type { Subscription } from "@/commons/models/subscription";

type SubscriptionRow = Subscription;
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

vi.mock("@/server/payment/service/payment.api");
vi.mock("../repository/webhook.subscription.supabase");
vi.mock("@/server/email");
vi.mock("@/commons/lib/supabase/internal", () => ({
  internalSupabase: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data:
              table === "profiles"
                ? { name: "Tubarão Teste", email: "tubarao.fallback@exemplo.com" }
                : {
                    id: "plan-branco-id",
                    name: "Tubarão Branco",
                    price: 29.9,
                    config_plan: {
                      max_debtors: 10,
                      can_debtor_portal: true,
                      can_access_financial: true,
                      custom_templates: true,
                    },
                  },
            error: null,
          }),
        }),
        ilike: () => ({
          maybeSingle: async () => ({
            data: {
              id: "plan-branco-id",
              name: "Tubarão Branco",
              price: 29.9,
              config_plan: {
                max_debtors: 10,
                can_debtor_portal: true,
                can_access_financial: true,
                custom_templates: true,
              },
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

describe("Serviço de Webhooks de Assinatura (webhook.subscription.api.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("webhookSubscriptionPreapprovalApi (Sincronização de Status e Upgrade)", () => {
    it("deve sincronizar status para authorized e registrar next_payment_date disparando e-mail de upgrade com benefícios e valor cobrado", async () => {
      const preapprovalId = "mp-pre-123";
      const subscriptionId = "sub-local-abc";

      const mockPreapproval = {
        id: preapprovalId,
        external_reference: subscriptionId,
        payer_email: "cliente@tubarao.com",
        payer_id: 998877,
        status: "authorized",
        reason: "Tubarão Branco",
        next_payment_date: "2026-11-15T12:00:00Z",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockPreapproval,
        message: "OK",
      });

      const mockLocalSub: SubscriptionRow = {
        id: subscriptionId,
        user_id: "user-1",
        plan_id: null,
        mp_subscription_id: null,
        mp_payer_id: null,
        mp_payer_email: null,
        mp_status: "pending",
        base_value: 29.9,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockLocalSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockLocalSub.id,
      });

      const response = await webhookSubscriptionPreapprovalApi(preapprovalId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.message).toContain("Preapproval processado com sucesso");

      // Deve ter sincronizado no repositório promovendo plan_id e novos dados
      expect(webhookSupabase.webhookSyncSubscriptionSupabase).toHaveBeenCalledWith(
        expect.objectContaining({
          mp_subscription_id: preapprovalId,
          mp_status: "authorized",
          plan_id: "plan-branco-id",
          base_value: 29.9,
          current_period_end: "2026-11-15T12:00:00.000Z",
        }),
        subscriptionId
      );

      // Deve ter disparado o e-mail de confirmação de upgrade com benefícios e valor cobrado
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledWith(
        "cliente@tubarao.com",
        expect.objectContaining({
          recipientName: "Tubarão Teste",
          newPlanName: "Tubarão Branco",
          isUpgrade: true,
          chargedNow: true,
          newPrice: 29.9,
          benefits: expect.any(Array),
        })
      );
    });

    it("REGRESSÃO: deve disparar e-mail de upgrade quando usuário já estava com mp_status 'authorized' no plano gratuito (Tubarão Lixa) e migra para plano pago", async () => {
      const preapprovalId = "mp-pre-from-free";
      const subscriptionId = "sub-from-lixa";

      const mockPreapproval = {
        id: preapprovalId,
        external_reference: subscriptionId,
        payer_email: "",
        payer_id: 3774263922,
        status: "authorized",
        reason: "Tubarão Branco",
        next_payment_date: "2026-11-17T22:47:00Z",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockPreapproval,
        message: "OK",
      });

      // Usuário estava no Tubarão Lixa (que já tem mp_status = 'authorized')
      const mockLocalSub = {
        id: subscriptionId,
        user_id: "user-1",
        plan_id: "plan-lixa-id",
        mp_subscription_id: preapprovalId,
        mp_payer_id: null,
        mp_payer_email: "vinnicius4@hotmail.com",
        mp_status: "authorized",
        base_value: 0,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan: {
          id: "plan-lixa-id",
          name: "Tubarão Lixa",
          slug: "tubarao-lixa",
          price: 0,
        },
      } as unknown as SubscriptionRow;

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockLocalSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockLocalSub.id,
      });

      const response = await webhookSubscriptionPreapprovalApi(preapprovalId);

      expect(response.status).toBe(HttpStatusEnum.Ok);

      // Mesmo previousStatus sendo 'authorized', como o plan_id mudou de plan-lixa-id -> plan-branco-id, DEVE enviar o e-mail!
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledTimes(1);
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledWith(
        "vinnicius4@hotmail.com",
        expect.objectContaining({
          recipientName: "Tubarão Teste",
          previousPlanName: "Tubarão Lixa",
          newPlanName: "Tubarão Branco",
          isUpgrade: true,
          chargedNow: true,
          newPrice: 29.9,
        })
      );
    });

    it("REGRESSÃO: não deve enviar e-mail duplicado se a assinatura já estiver sincronizada com o mesmo plan_id e status authorized", async () => {
      const preapprovalId = "mp-pre-already-synced";
      const subscriptionId = "sub-already-synced";

      const mockPreapproval = {
        id: preapprovalId,
        external_reference: subscriptionId,
        payer_email: "vinnicius4@hotmail.com",
        status: "authorized",
        reason: "Tubarão Branco",
        next_payment_date: "2026-11-17T22:47:00Z",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockPreapproval,
        message: "OK",
      });

      // Já está no Tubarão Branco (plan-branco-id) e com mp_status 'authorized'
      const mockAlreadySyncedSub: SubscriptionRow = {
        id: subscriptionId,
        user_id: "user-1",
        plan_id: "plan-branco-id",
        mp_subscription_id: preapprovalId,
        mp_payer_id: 123,
        mp_payer_email: "vinnicius4@hotmail.com",
        mp_status: "authorized",
        base_value: 29.9,
        current_period_start: null,
        current_period_end: "2026-11-17T22:47:00.000Z",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockAlreadySyncedSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockAlreadySyncedSub.id,
      });

      const response = await webhookSubscriptionPreapprovalApi(preapprovalId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      // Não deve disparar e-mail de upgrade repetido
      expect(emailService.sendPlanChangeEmailApi).not.toHaveBeenCalled();
    });

    it("REGRESSÃO: deve deduplicar chamadas concorrentes simultâneas para o mesmo preapprovalId", async () => {
      const preapprovalId = "mp-pre-concurrent";
      const subscriptionId = "sub-concurrent";

      const mockPreapproval = {
        id: preapprovalId,
        external_reference: subscriptionId,
        payer_email: "cliente@tubarao.com",
        status: "authorized",
        reason: "Tubarão Branco",
        next_payment_date: "2026-11-15T12:00:00Z",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockPreapproval,
        message: "OK",
      });

      const mockLocalSub: SubscriptionRow = {
        id: subscriptionId,
        user_id: "user-1",
        plan_id: "plan-lixa-id",
        mp_subscription_id: preapprovalId,
        mp_payer_id: null,
        mp_payer_email: "cliente@tubarao.com",
        mp_status: "authorized",
        base_value: 0,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockLocalSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockLocalSub.id,
      });

      // Dispara 3 chamadas em paralelo no mesmo milissegundo (simulando webhook 1 + webhook 2 + retorno)
      const [res1, res2, res3] = await Promise.all([
        webhookSubscriptionPreapprovalApi(preapprovalId),
        webhookSubscriptionPreapprovalApi(preapprovalId),
        webhookSubscriptionPreapprovalApi(preapprovalId),
      ]);

      expect(res1.status).toBe(HttpStatusEnum.Ok);
      expect(res2.status).toBe(HttpStatusEnum.Ok);
      expect(res3.status).toBe(HttpStatusEnum.Ok);

      // O Mercado Pago e o envio de e-mail devem ter sido acionados APENAS 1 VEZ!
      expect(paymentService.getPreapprovalApi).toHaveBeenCalledTimes(1);
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledTimes(1);
    });

    it("REGRESSÃO: deve usar o email do profile como fallback quando payer_email vier vazio do Mercado Pago", async () => {
      const preapprovalId = "mp-pre-empty-email";
      const subscriptionId = "sub-local-empty";

      const mockPreapproval = {
        id: preapprovalId,
        external_reference: subscriptionId,
        payer_email: "", // Mercado Pago retornou string vazia
        payer_id: 3610123978,
        status: "authorized",
        reason: "Tubarão Branco",
        next_payment_date: "2026-11-15T12:00:00Z",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockPreapproval,
        message: "OK",
      });

      const mockLocalSub: SubscriptionRow = {
        id: subscriptionId,
        user_id: "user-1",
        plan_id: null,
        mp_subscription_id: null,
        mp_payer_id: null,
        mp_payer_email: null,
        mp_status: "pending",
        base_value: 29.9,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockLocalSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockLocalSub.id,
      });

      const response = await webhookSubscriptionPreapprovalApi(preapprovalId);

      expect(response.status).toBe(HttpStatusEnum.Ok);

      // Deve ter usado o email vindo do profile mockado
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledWith(
        "tubarao.fallback@exemplo.com",
        expect.objectContaining({
          recipientName: "Tubarão Teste",
          newPlanName: "Tubarão Branco",
        })
      );
    });

    it("deve retornar NotFound se a assinatura local não existir para a referência", async () => {
      const mockPreapproval = {
        id: "mp-inexistente",
        external_reference: "sub-nao-encontrada",
        payer_email: "fantasma@teste.com",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockPreapproval,
        message: "OK",
      });

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(null);
      vi.mocked(webhookSupabase.webhookGetSubscriptionByPayerEmailSupabase).mockResolvedValue(null);
      vi.mocked(webhookSupabase.webhookGetSubscriptionByMpSubscriptionIdSupabase).mockResolvedValue(null);

      const response = await webhookSubscriptionPreapprovalApi("mp-inexistente");

      expect(response.status).toBe(HttpStatusEnum.NotFound);
      expect(response.message).toContain("não encontrada");
    });
  });

  describe("webhookSubscriptionAuthorizedPaymentApi (Faturas e Recorrência)", () => {
    it("deve salvar fatura aprovada com valor formatado corretamente em Reais (R$ 29,90) e sincronizar preapproval", async () => {
      const authorizedPaymentId = "auth-pay-999";
      const preapprovalId = "mp-pre-456";

      const mockPayment = {
        id: 123456,
        preapproval_id: preapprovalId,
        transaction_amount: 29.9,
        currency_id: "BRL",
        status: "approved",
        debit_date: "2026-10-15T10:00:00Z",
        payment: { status: "approved" },
      } as unknown as InvoiceResponse;

      vi.mocked(paymentService.getAuthorizedPaymentApi).mockResolvedValue({
        status: 200,
        data: mockPayment,
        message: "OK",
      });

      const mockSub: SubscriptionRow = {
        id: "sub-recorrente",
        user_id: "user-tubarao-2",
        plan_id: "plan-branco-id",
        mp_subscription_id: preapprovalId,
        mp_payer_id: null,
        mp_payer_email: "rec@tubarao.com",
        mp_status: "authorized",
        base_value: 29.9,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInvoice: InvoiceRow = {
        id: "inv-1",
        user_id: "user-tubarao-2",
        subscription_id: "sub-recorrente",
        mp_invoice_id: "123456",
        mp_subscription_id: preapprovalId,
        amount: 29.9,
        currency: "BRL",
        status: "approved",
        paid_at: "2026-10-15T10:00:00.000Z",
        raw_payload: null,
        created_at: new Date().toISOString(),
      };

      vi.mocked(webhookSupabase.webhookGetSubscriptionByMpSubscriptionIdSupabase).mockResolvedValue(mockSub);
      vi.mocked(webhookSupabase.webhookUpsertInvoiceSupabase).mockResolvedValue({
        data: mockInvoice,
        error: null,
        previousStatus: null,
      });

      // Mock da chamada encadeada do preapproval
      const mockChainPreapproval = {
        id: preapprovalId,
        external_reference: "sub-recorrente",
        status: "authorized",
        reason: "Tubarão Branco",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockChainPreapproval,
        message: "OK",
      });
      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue(mockSub);

      const response = await webhookSubscriptionAuthorizedPaymentApi(authorizedPaymentId);

      expect(response.status).toBe(HttpStatusEnum.Ok);

      // Deve ter criado a fatura no banco
      expect(webhookSupabase.webhookUpsertInvoiceSupabase).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-tubarao-2",
          subscription_id: "sub-recorrente",
          amount: 29.9,
          status: "approved",
        })
      );

      // Deve ter enviado e-mail de renovação com o valor R$ 29,90 (e não R$ 0,30)
      expect(emailService.sendRenewalSuccessEmailApi).toHaveBeenCalledWith(
        "rec@tubarao.com",
        expect.objectContaining({
          recipientName: "Tubarão Teste",
          amountFormatted: expect.stringMatching(/29,90/),
        })
      );
    });

    it("REGRESSÃO: não deve reenviar e-mail de renovação quando a fatura já existia no banco com status approved", async () => {
      const authorizedPaymentId = "auth-pay-duplicated-webhook";
      const preapprovalId = "mp-pre-existing-789";

      const mockPayment = {
        id: 7033055325,
        preapproval_id: preapprovalId,
        transaction_amount: 29.9,
        currency_id: "BRL",
        status: "approved",
        debit_date: "2026-10-17T21:14:00Z",
        payment: { status: "approved" },
      } as unknown as InvoiceResponse;

      vi.mocked(paymentService.getAuthorizedPaymentApi).mockResolvedValue({
        status: 200,
        data: mockPayment,
        message: "OK",
      });

      const mockSub: SubscriptionRow = {
        id: "sub-recorrente-dup",
        user_id: "user-tubarao-2",
        plan_id: "plan-branco-id",
        mp_subscription_id: preapprovalId,
        mp_payer_id: null,
        mp_payer_email: "rec@tubarao.com",
        mp_status: "authorized",
        base_value: 29.9,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(webhookSupabase.webhookGetSubscriptionByMpSubscriptionIdSupabase).mockResolvedValue(mockSub);
      vi.mocked(webhookSupabase.webhookUpsertInvoiceSupabase).mockResolvedValue({
        data: { id: "inv-existing" },
        error: null,
        previousStatus: "approved", // Fatura já processada anteriormente com status approved
      });

      const mockChainPreapproval = {
        id: preapprovalId,
        external_reference: "sub-recorrente-dup",
        status: "authorized",
        reason: "Tubarão Branco",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockChainPreapproval,
        message: "OK",
      });
      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockSub);
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockSub.id,
      });

      const response = await webhookSubscriptionAuthorizedPaymentApi(authorizedPaymentId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      // Não deve reenviar e-mail de renovação para a mesma fatura já aprovada
      expect(emailService.sendRenewalSuccessEmailApi).not.toHaveBeenCalled();
    });

    it("REGRESSÃO: não deve enviar e-mail de renovação redundante no ato do upgrade inicial quando o e-mail de evolução de plano acabou de ser disparado", async () => {
      const authorizedPaymentId = "auth-pay-initial-upgrade";
      const preapprovalId = "mp-pre-initial-upgrade-001";

      const mockPayment = {
        id: 7033055999,
        preapproval_id: preapprovalId,
        transaction_amount: 29.9,
        currency_id: "BRL",
        status: "approved",
        debit_date: "2026-10-17T21:14:00Z",
        payment: { status: "approved" },
      } as unknown as InvoiceResponse;

      vi.mocked(paymentService.getAuthorizedPaymentApi).mockResolvedValue({
        status: 200,
        data: mockPayment,
        message: "OK",
      });

      // Usuário estava no Tubarão Lixa (plan-lixa-id) fazendo upgrade para Tubarão Branco
      const mockSubBeforeUpgrade = {
        id: "sub-upgrade-init",
        user_id: "user-tubarao-2",
        plan_id: "plan-lixa-id",
        mp_subscription_id: preapprovalId,
        mp_payer_id: null,
        mp_payer_email: "vinnicius4@hotmail.com",
        mp_status: "authorized",
        base_value: 0,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan: {
          id: "plan-lixa-id",
          name: "Tubarão Lixa",
          slug: "tubarao-lixa",
          price: 0,
        },
      } as unknown as SubscriptionRow;

      vi.mocked(webhookSupabase.webhookGetSubscriptionByIdSupabase).mockResolvedValue(mockSubBeforeUpgrade);
      vi.mocked(webhookSupabase.webhookGetSubscriptionByMpSubscriptionIdSupabase).mockResolvedValue(
        mockSubBeforeUpgrade
      );
      vi.mocked(webhookSupabase.webhookSyncSubscriptionSupabase).mockResolvedValue({
        id: mockSubBeforeUpgrade.id,
      });
      vi.mocked(webhookSupabase.webhookUpsertInvoiceSupabase).mockResolvedValue({
        data: { id: "inv-init-1" },
        error: null,
        previousStatus: null,
      });

      const mockChainPreapproval = {
        id: preapprovalId,
        external_reference: "sub-upgrade-init",
        status: "authorized",
        reason: "Tubarão Branco",
        next_payment_date: "2026-11-17T21:14:00Z",
      } as unknown as PreApprovalResponse;

      vi.mocked(paymentService.getPreapprovalApi).mockResolvedValue({
        status: 200,
        data: mockChainPreapproval,
        message: "OK",
      });

      const response = await webhookSubscriptionAuthorizedPaymentApi(authorizedPaymentId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      // Deve ter disparado APENAS o e-mail de Evolução de Plano (PlanChange) e NÃO o de Renovação (RenewalSuccess)
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledTimes(1);
      expect(emailService.sendRenewalSuccessEmailApi).not.toHaveBeenCalled();
    });
  });
});
