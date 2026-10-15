import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusEnum } from "@/commons/enums/http";
import type {
  UserPermissions,
  Subscription,
  Plan,
} from "@/commons/models/subscription";
import {
  getUserPermissionsOrCacheApi,
  cancelSubscriptionApi,
  createCheckoutSessionApi,
} from "../service/subscription.api";
import * as subscriptionSupabase from "../repository/subscription.supabase";
import * as paymentService from "@/server/payment/service/payment.api";
import * as subscriptionCookie from "@/commons/lib/auth/subscription";

vi.mock("../repository/subscription.supabase");
vi.mock("@/server/payment/service/payment.api");
vi.mock("@/commons/lib/auth/subscription");

describe("Serviço de Assinaturas (subscription.api.ts)", () => {
  const userId = "tubarao-sub-user-1";
  const userEmail = "tubarao@mar.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserPermissionsOrCacheApi (Cache e Permissões)", () => {
    it("deve retornar permissões direto do cookie seguro quando presente", async () => {
      const mockCookiePermissions: UserPermissions = {
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

      vi.mocked(subscriptionCookie.getCookieSubscriptionPayload).mockResolvedValue({
        permissions: mockCookiePermissions,
      });

      const result = await getUserPermissionsOrCacheApi(userId);

      expect(result).toEqual(mockCookiePermissions);
      expect(subscriptionSupabase.getUserPermissionsByUserIdSupabase).not.toHaveBeenCalled();
    });

    it("deve buscar no banco e regenerar cookie se não houver cookie em cache", async () => {
      vi.mocked(subscriptionCookie.getCookieSubscriptionPayload).mockResolvedValue(null);

      const dbPermissions: UserPermissions = {
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

      const mockSub: Subscription = {
        id: "sub-1",
        user_id: userId,
        mp_status: "authorized",
        base_value: 0,
        current_period_end: null,
        plan: {
          id: "plan-lixa",
          slug: "tubarao-lixa",
          name: "Tubarão Lixa",
          price: 0,
        },
      };

      vi.mocked(subscriptionSupabase.getUserPermissionsByUserIdSupabase).mockResolvedValue(dbPermissions);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(mockSub);

      const result = await getUserPermissionsOrCacheApi(userId);

      expect(result).toEqual(dbPermissions);
      expect(subscriptionCookie.setCookieSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: "sub-1",
          planSlug: "tubarao-lixa",
        }),
        userId
      );
    });
  });

  describe("cancelSubscriptionApi (Cancelamento e Feedback)", () => {
    it("deve registrar o motivo e marcar status como cancelled", async () => {
      const mockSub: Subscription = {
        id: "sub-active",
        user_id: userId,
        mp_subscription_id: "mp-sub-999",
        mp_status: "authorized",
        base_value: 29.9,
      };

      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(mockSub);
      vi.mocked(subscriptionSupabase.insertCancellationReasonSupabase).mockResolvedValue({
        data: null,
        error: null,
      });
      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await cancelSubscriptionApi({
        userId,
        reason: "too_expensive",
        reasonDetails: "Cobranças diminuíram este mês",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.message).toContain("Cancelamento registrado");

      expect(subscriptionSupabase.insertCancellationReasonSupabase).toHaveBeenCalledWith({
        user_id: userId,
        subscription_id: "sub-active",
        mp_subscription_id: "mp-sub-999",
        reason: "too_expensive",
        reason_details: "Cobranças diminuíram este mês",
      });

      expect(subscriptionSupabase.updateSubscriptionByIdSupabase).toHaveBeenCalledWith(
        "sub-active",
        { mp_status: "cancelled" }
      );
    });

    it("deve retornar NotFound se o usuário não possuir assinatura ativa", async () => {
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);

      const response = await cancelSubscriptionApi({
        userId,
        reason: "not_using",
      });

      expect(response.status).toBe(HttpStatusEnum.NotFound);
      expect(response.message).toContain("Nenhuma assinatura ativa encontrada");
    });
  });

  describe("createCheckoutSessionApi (Planos Free vs Pagos)", () => {
    it("deve ativar o plano gratuito imediatamente sem redirecionar para gateway de pagamento", async () => {
      const freePlan: Plan = {
        id: "plan-lixa-id",
        name: "Tubarão Lixa",
        slug: "tubarao-lixa",
        price: 0,
      };

      const createdSub = {
        id: "created-sub-free",
        user_id: userId,
        plan_id: freePlan.id,
        base_value: 0,
        mp_status: "authorized",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        mp_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(freePlan);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);
      vi.mocked(subscriptionSupabase.upsertSubscriptionSupabase).mockResolvedValue({
        data: createdSub,
        error: null,
      });

      const response = await createCheckoutSessionApi({
        userId,
        userEmail,
        planId: "plan-lixa-id",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.isFree).toBe(true);
      expect(response.data?.initPoint).toBeNull();
      expect(paymentService.createPreApprovalSubscriptionApi).not.toHaveBeenCalled();
    });

    it("deve chamar Mercado Pago e retornar initPoint para plano pago", async () => {
      const paidPlan: Plan = {
        id: "plan-megalodonte-id",
        name: "Tubarão Megalodonte",
        slug: "megalodonte",
        price: 97,
      };

      const createdSub = {
        id: "sub-paid-created",
        user_id: userId,
        plan_id: paidPlan.id,
        base_value: 97,
        mp_status: "pending",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        mp_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(paidPlan);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);
      vi.mocked(subscriptionSupabase.upsertSubscriptionSupabase).mockResolvedValue({
        data: createdSub,
        error: null,
      });

      vi.mocked(paymentService.createPreApprovalSubscriptionApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: {
          initPoint: "https://mercadopago.com/checkout/123",
          preapprovalId: "mp-preapproval-123",
        },
      });

      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await createCheckoutSessionApi({
        userId,
        userEmail,
        planId: "plan-megalodonte-id",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.isFree).toBe(false);
      expect(response.data?.initPoint).toBe("https://mercadopago.com/checkout/123");
    });
  });
});
