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

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

vi.mock("@/server/payment/service/payment.api");
vi.mock("../repository/webhook.subscription.supabase");
vi.mock("@/server/email");
vi.mock("@/commons/lib/supabase/internal", () => ({
  internalSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { name: "Tubarão Teste" }, error: null }),
        }),
      }),
    }),
  }),
}));

describe("Serviço de Webhooks de Assinatura (webhook.subscription.api.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("webhookSubscriptionPreapprovalApi (Sincronização de Status)", () => {
    it("deve sincronizar status para authorized e registrar next_payment_date", async () => {
      const preapprovalId = "mp-pre-123";
      const subscriptionId = "sub-local-abc";

      const mockPreapproval = {
        id: preapprovalId,
        external_reference: subscriptionId,
        payer_email: "cliente@tubarao.com",
        payer_id: 998877,
        status: "authorized",
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
        base_value: 49.9,
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

      // Deve ter sincronizado no repositório com os novos dados
      expect(webhookSupabase.webhookSyncSubscriptionSupabase).toHaveBeenCalledWith(
        expect.objectContaining({
          mp_subscription_id: preapprovalId,
          mp_status: "authorized",
          current_period_end: "2026-11-15T12:00:00.000Z",
        }),
        subscriptionId
      );

      // Deve ter disparado o e-mail de boas-vindas na primeira autorização
      expect(emailService.sendWelcomeSubscriptionEmailApi).toHaveBeenCalledWith(
        "cliente@tubarao.com",
        expect.objectContaining({
          recipientName: "Tubarão Teste",
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
    it("deve salvar fatura aprovada e sincronizar preapproval", async () => {
      const authorizedPaymentId = "auth-pay-999";
      const preapprovalId = "mp-pre-456";

      const mockPayment = {
        id: 123456,
        preapproval_id: preapprovalId,
        transaction_amount: 39.9,
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
        plan_id: null,
        mp_subscription_id: preapprovalId,
        mp_payer_id: null,
        mp_payer_email: "rec@tubarao.com",
        mp_status: "authorized",
        base_value: 39.9,
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
        amount: 39.9,
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
      });

      // Mock da chamada encadeada do preapproval
      const mockChainPreapproval = {
        id: preapprovalId,
        external_reference: "sub-recorrente",
        status: "authorized",
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
          amount: 39.9,
          status: "approved",
        })
      );

      // Deve ter enviado e-mail de renovação com sucesso
      expect(emailService.sendRenewalSuccessEmailApi).toHaveBeenCalledWith(
        "rec@tubarao.com",
        expect.objectContaining({
          recipientName: "Tubarão Teste",
        })
      );
    });
  });
});

