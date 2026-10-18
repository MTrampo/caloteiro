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
  changeSubscriptionPlanApi,
  getPlanLimitsApi,
} from "../service/subscription.api";
import * as subscriptionSupabase from "../repository/subscription.supabase";
import * as debtorSupabase from "@/server/debtors/repository/debtor.supabase";
import * as debtSupabase from "@/server/debts/repository/debt.supabase";
import * as paymentService from "@/server/payment/service/payment.api";
import * as subscriptionCookie from "@/commons/lib/auth/subscription";
import * as emailService from "@/server/email/service/email.api";

vi.mock("../repository/subscription.supabase");
vi.mock("@/server/debtors/repository/debtor.supabase");
vi.mock("@/server/debts/repository/debt.supabase");
vi.mock("@/server/payment/service/payment.api");
vi.mock("@/commons/lib/auth/subscription");
vi.mock("@/server/email/service/email.api");

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

    it("deve desativar trial de 30 dias (includeTrial: false) e NÃO promover plan_id prematuramente ao solicitar upgrade do plano gratuito", async () => {
      const targetPaidPlan: Plan = {
        id: "plan-branco-id",
        name: "Tubarão Branco",
        slug: "tubarao-branco",
        price: 29.90,
      };

      const existingFreeSub: Subscription = {
        id: "sub-free-existing",
        user_id: userId,
        plan_id: "plan-lixa-id",
        base_value: 0,
        mp_status: "authorized",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        mp_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        plan: {
          id: "plan-lixa-id",
          name: "Tubarão Lixa",
          slug: "tubarao-lixa",
          price: 0,
        },
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(targetPaidPlan);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(existingFreeSub);
      vi.mocked(subscriptionSupabase.hasActiveSubscriptionHistorySupabase).mockResolvedValue(true);
      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });

      vi.mocked(paymentService.createPreApprovalSubscriptionApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: {
          initPoint: "https://mercadopago.com/checkout/branco",
          preapprovalId: "mp-preapproval-branco",
        },
      });

      const response = await createCheckoutSessionApi({
        userId,
        userEmail,
        planId: "plan-branco-id",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.initPoint).toBe("https://mercadopago.com/checkout/branco");

      // Regra 1: includeTrial DEVE ser false para quem já tem/teve plano gratuito
      expect(paymentService.createPreApprovalSubscriptionApi).toHaveBeenCalledWith(
        expect.objectContaining({
          includeTrial: false,
          planName: "Tubarão Branco",
          planPrice: 29.90,
        })
      );

      // Regra 2: updateSubscriptionByIdSupabase NÃO deve promover plan_id para o plano pago antes da confirmação do MP
      expect(subscriptionSupabase.updateSubscriptionByIdSupabase).not.toHaveBeenCalledWith(
        "sub-free-existing",
        expect.objectContaining({
          plan_id: "plan-branco-id",
        })
      );
    });
  });

  describe("getPlanLimitsApi (Limites de Plano e Travas)", () => {
    it("deve acusar limite atingido de devedores e dívidas no plano grátis com 2 cadastros", async () => {
      const freePermissions: UserPermissions = {
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

      vi.mocked(subscriptionCookie.getCookieSubscriptionPayload).mockResolvedValue({
        permissions: freePermissions,
      });
      vi.mocked(debtorSupabase.countDebtorsByUserIdSupabase).mockResolvedValue(2);
      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(2);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);

      const limits = await getPlanLimitsApi(userId);

      expect(limits.maxDebtors).toBe(2);
      expect(limits.currentDebtorsCount).toBe(2);
      expect(limits.currentActiveDebtsCount).toBe(2);
      expect(limits.isDebtorLimitReached).toBe(true);
      expect(limits.isDebtLimitReached).toBe(true);
      expect(limits.canCreateDebtor).toBe(false);
      expect(limits.canCreateDebt).toBe(false);
      expect(limits.isFreePlan).toBe(true);
    });

    it("deve permitir novos cadastros quando usuário estiver abaixo do limite", async () => {
      const freePermissions: UserPermissions = {
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

      vi.mocked(subscriptionCookie.getCookieSubscriptionPayload).mockResolvedValue({
        permissions: freePermissions,
      });
      vi.mocked(debtorSupabase.countDebtorsByUserIdSupabase).mockResolvedValue(1);
      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(0);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);

      const limits = await getPlanLimitsApi(userId);

      expect(limits.isDebtorLimitReached).toBe(false);
      expect(limits.isDebtLimitReached).toBe(false);
      expect(limits.canCreateDebtor).toBe(true);
      expect(limits.canCreateDebt).toBe(true);
    });

    it("deve liberar ilimitado quando maxDebtors for null em planos avançados", async () => {
      const proPermissions: UserPermissions = {
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
        permissions: proPermissions,
      });
      vi.mocked(debtorSupabase.countDebtorsByUserIdSupabase).mockResolvedValue(50);
      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(50);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);

      const limits = await getPlanLimitsApi(userId);

      expect(limits.maxDebtors).toBeNull();
      expect(limits.isDebtorLimitReached).toBe(false);
      expect(limits.isDebtLimitReached).toBe(false);
      expect(limits.canCreateDebtor).toBe(true);
      expect(limits.canCreateDebt).toBe(true);
    });
  });

  describe("changeSubscriptionPlanApi (Mudança de Plano, Upgrades e Downgrades)", () => {
    const freePlan: Plan = {
      id: "plan-lixa-id",
      name: "Tubarão Lixa",
      slug: "tubarao-lixa",
      price: 0,
      config_plan: {
        id: "cfg-lixa",
        name: "Tubarão Lixa",
        max_debtors: 2,
        custom_templates: false,
        export_reports: false,
        can_access_financial: false,
        can_debtor_portal: false,
        can_risk_score: false,
        can_attach_receipts: false,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const paidPlanBranco: Plan = {
      id: "plan-branco-id",
      name: "Tubarão Branco",
      slug: "tubarao-branco",
      price: 29.90,
      config_plan: {
        id: "cfg-branco",
        name: "Tubarão Branco",
        max_debtors: 10,
        custom_templates: true,
        export_reports: false,
        can_access_financial: true,
        can_debtor_portal: true,
        can_risk_score: false,
        can_attach_receipts: false,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const paidPlanCabecaChato: Plan = {
      id: "plan-chato-id",
      name: "Tubarão Cabeça Chato",
      slug: "tubarao-cabeca-chato",
      price: 49.90,
      config_plan: {
        id: "cfg-chato",
        name: "Tubarão Cabeça Chato",
        max_debtors: null,
        custom_templates: true,
        export_reports: false,
        can_access_financial: true,
        can_debtor_portal: true,
        can_risk_score: true,
        can_attach_receipts: true,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    it("deve retornar NotFound quando o plano selecionado não existir", async () => {
      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(null);

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: "plano-inexistente",
      });

      expect(response.status).toBe(HttpStatusEnum.NotFound);
      expect(response.message).toContain("Plano selecionado inválido");
    });

    it("deve processar downgrade para o plano gratuito cancelando preapproval no Mercado Pago", async () => {
      const activePaidSub: Subscription = {
        id: "sub-pago-ativo",
        user_id: userId,
        plan_id: paidPlanBranco.id,
        base_value: 29.90,
        mp_status: "authorized",
        mp_subscription_id: "mp-sub-12345",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: new Date(Date.now() + 86400000).toISOString(),
        plan: paidPlanBranco,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(freePlan);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(activePaidSub);
      vi.mocked(paymentService.cancelPreApprovalApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: null,
      });
      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });
      vi.mocked(subscriptionSupabase.getUserPermissionsByUserIdSupabase).mockResolvedValue({
        maxDebtors: 2,
        canCustomTemplates: false,
        canExportReports: false,
        canAccessFinancial: false,
        canDebtorPortal: false,
        canRiskScore: false,
        canAttachReceipts: false,
        isFreePlan: true,
        isSubscriptionActive: true,
      });
      vi.mocked(emailService.sendPlanChangeEmailApi).mockResolvedValue({
        success: true,
        id: "email-change-1",
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: freePlan.id,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.isUpgrade).toBe(false);
      expect(response.data?.isFreePlan).toBe(true);
      expect(response.data?.newPlanName).toBe("Tubarão Lixa");

      // Deve ter cancelado no Mercado Pago
      expect(paymentService.cancelPreApprovalApi).toHaveBeenCalledWith("mp-sub-12345");

      // Deve ter atualizado para plano gratuito no banco
      expect(subscriptionSupabase.updateSubscriptionByIdSupabase).toHaveBeenCalledWith(
        "sub-pago-ativo",
        expect.objectContaining({
          plan_id: freePlan.id,
          base_value: 0,
          mp_status: "authorized",
        })
      );

      // Deve ter disparado e-mail de alteração
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledWith(
        userEmail,
        expect.objectContaining({
          isUpgrade: false,
          newPlanName: "Tubarão Lixa",
          newPrice: 0,
        })
      );
    });

    it("deve processar migração entre planos pagos chamando updatePreApprovalPlanOrPriceApi e enviando e-mail de faturamento", async () => {
      const activePaidSub: Subscription = {
        id: "sub-branco-ativo",
        user_id: userId,
        plan_id: paidPlanBranco.id,
        base_value: 29.90,
        mp_status: "authorized",
        mp_subscription_id: "mp-sub-branco-id",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: new Date(Date.now() + 86400000).toISOString(),
        plan: paidPlanBranco,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(paidPlanCabecaChato);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(activePaidSub);
      vi.mocked(paymentService.updatePreApprovalPlanOrPriceApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: null,
      });
      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });
      vi.mocked(subscriptionSupabase.getUserPermissionsByUserIdSupabase).mockResolvedValue({
        maxDebtors: null,
        canCustomTemplates: true,
        canExportReports: false,
        canAccessFinancial: true,
        canDebtorPortal: true,
        canRiskScore: true,
        canAttachReceipts: true,
        isFreePlan: false,
        isSubscriptionActive: true,
      });
      vi.mocked(emailService.sendPlanChangeEmailApi).mockResolvedValue({
        success: true,
        id: "email-change-2",
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: paidPlanCabecaChato.id,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.isUpgrade).toBe(true);
      expect(response.data?.effectiveNextBilling).toBe(true);
      expect(response.data?.newPrice).toBe(49.90);
      expect(response.data?.newPlanName).toBe("Tubarão Cabeça Chato");

      // Deve ter chamado a API do MP para alterar o valor na recorrência
      expect(paymentService.updatePreApprovalPlanOrPriceApi).toHaveBeenCalledWith(
        "mp-sub-branco-id",
        49.90,
        "Tubarão Cabeça Chato"
      );

      // Deve ter atualizado banco local
      expect(subscriptionSupabase.updateSubscriptionByIdSupabase).toHaveBeenCalledWith(
        "sub-branco-ativo",
        expect.objectContaining({
          plan_id: paidPlanCabecaChato.id,
          base_value: 49.90,
        })
      );

      // Deve ter enviado e-mail
      expect(emailService.sendPlanChangeEmailApi).toHaveBeenCalledWith(
        userEmail,
        expect.objectContaining({
          isUpgrade: true,
          newPlanName: "Tubarão Cabeça Chato",
          newPrice: 49.90,
        })
      );
    });

    it("deve delegar para createCheckoutSessionApi com initPoint quando usuário no plano gratuito faz upgrade para plano pago", async () => {
      const activeFreeSub: Subscription = {
        id: "sub-lixa-ativo",
        user_id: userId,
        plan_id: freePlan.id,
        base_value: 0,
        mp_status: "authorized",
        mp_subscription_id: null, // Sem assinatura prévia no MP!
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: null,
        plan: freePlan,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(paidPlanBranco);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(activeFreeSub);
      vi.mocked(subscriptionSupabase.hasActiveSubscriptionHistorySupabase).mockResolvedValue(true);
      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });
      vi.mocked(paymentService.createPreApprovalSubscriptionApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: {
          initPoint: "https://mercadopago.com/checkout/upgrade-branco",
          preapprovalId: "mp-upgrade-branco-id",
        },
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: paidPlanBranco.id,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.isUpgrade).toBe(true);
      expect(response.data?.initPoint).toBe("https://mercadopago.com/checkout/upgrade-branco");
      expect(response.data?.effectiveNextBilling).toBe(false); // Cobrança no ato!

      // Regra dos 30 dias: Não concede trial para quem já usou o plano gratuito
      expect(paymentService.createPreApprovalSubscriptionApi).toHaveBeenCalledWith(
        expect.objectContaining({
          includeTrial: false,
          planName: "Tubarão Branco",
        })
      );
    });

    it("deve retornar InternalError se a atualização no Mercado Pago falhar ao migrar entre planos pagos", async () => {
      const activePaidSub: Subscription = {
        id: "sub-branco-ativo",
        user_id: userId,
        plan_id: paidPlanBranco.id,
        base_value: 29.90,
        mp_status: "authorized",
        mp_subscription_id: "mp-sub-branco-id",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: new Date(Date.now() + 86400000).toISOString(),
        plan: paidPlanBranco,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(paidPlanCabecaChato);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(activePaidSub);
      vi.mocked(paymentService.updatePreApprovalPlanOrPriceApi).mockResolvedValue({
        status: 500,
        message: "Erro no MP",
        error: "Gateway error",
        data: null,
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: paidPlanCabecaChato.id,
      });

      expect(response.status).toBe(HttpStatusEnum.InternalServerError);
      expect(response.message).toContain("Não foi possível atualizar o plano no Mercado Pago");
    });

    it("REGRESSÃO: deve redirecionar para checkout com initPoint quando usuário no plano gratuito possui mp_subscription_id residual de tentativa anterior", async () => {
      // Cenário real do bug: usuário tentou upgrade antes, fechou checkout sem pagar,
      // e ficou com mp_subscription_id gravado no banco enquanto ainda está no Tubarão Lixa
      const freeSubWithStaleMpId: Subscription = {
        id: "sub-lixa-stale",
        user_id: userId,
        plan_id: freePlan.id,
        base_value: 0,
        mp_status: "authorized",
        mp_subscription_id: "mp-checkout-abandonado-id",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: null,
        plan: freePlan,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(paidPlanBranco);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(freeSubWithStaleMpId);
      vi.mocked(subscriptionSupabase.hasActiveSubscriptionHistorySupabase).mockResolvedValue(true);
      vi.mocked(paymentService.createPreApprovalSubscriptionApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: {
          initPoint: "https://mercadopago.com/checkout/upgrade-branco-novo",
          preapprovalId: "mp-novo-id",
        },
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: paidPlanBranco.id,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      // NUNCA pode chamar updatePreApprovalPlanOrPriceApi para quem vem do plano gratuito!
      expect(paymentService.updatePreApprovalPlanOrPriceApi).not.toHaveBeenCalled();
      // DEVE gerar nova sessão de checkout com initPoint para pagamento obrigatório
      expect(response.data?.initPoint).toBe("https://mercadopago.com/checkout/upgrade-branco-novo");
      expect(paymentService.createPreApprovalSubscriptionApi).toHaveBeenCalled();
    });

    it("REGRESSÃO: deve redirecionar para checkout quando assinatura anterior estava com status cancelled", async () => {
      const cancelledSub: Subscription = {
        id: "sub-cancelled",
        user_id: userId,
        plan_id: freePlan.id,
        base_value: 0,
        mp_status: "cancelled",
        mp_subscription_id: "mp-cancelled-sub-id",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: new Date(Date.now() - 3600000).toISOString(),
        plan: freePlan,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(paidPlanBranco);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(cancelledSub);
      vi.mocked(subscriptionSupabase.hasActiveSubscriptionHistorySupabase).mockResolvedValue(true);
      vi.mocked(paymentService.createPreApprovalSubscriptionApi).mockResolvedValue({
        status: 200,
        message: "OK",
        data: {
          initPoint: "https://mercadopago.com/checkout/recontratacao",
          preapprovalId: "mp-recontratacao-id",
        },
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: paidPlanBranco.id,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(paymentService.updatePreApprovalPlanOrPriceApi).not.toHaveBeenCalled();
      expect(response.data?.initPoint).toBe("https://mercadopago.com/checkout/recontratacao");
    });

    it("REGRESSÃO: downgrade para plano gratuito deve zerar mp_subscription_id e current_period_end no banco", async () => {
      const activePaidSub: Subscription = {
        id: "sub-pago-ativo",
        user_id: userId,
        plan_id: paidPlanBranco.id,
        base_value: 29.90,
        mp_status: "authorized",
        mp_subscription_id: "mp-sub-to-cancel",
        mp_payer_email: userEmail,
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: new Date(Date.now() + 86400000).toISOString(),
        plan: paidPlanBranco,
      };

      vi.mocked(subscriptionSupabase.getPlanByIdSupabase).mockResolvedValue(freePlan);
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(activePaidSub);
      vi.mocked(paymentService.cancelPreApprovalApi).mockResolvedValue({
        status: 200,
        message: "Assinatura cancelada",
        data: null,
      });
      vi.mocked(subscriptionSupabase.updateSubscriptionByIdSupabase).mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await changeSubscriptionPlanApi({
        userId,
        userEmail,
        targetPlanId: freePlan.id,
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(paymentService.cancelPreApprovalApi).toHaveBeenCalledWith("mp-sub-to-cancel");
      // Limpeza estrita de estado: zera mp_subscription_id e current_period_end
      expect(subscriptionSupabase.updateSubscriptionByIdSupabase).toHaveBeenCalledWith(
        activePaidSub.id,
        expect.objectContaining({
          plan_id: freePlan.id,
          base_value: 0,
          mp_status: "authorized",
          mp_subscription_id: null,
          current_period_end: null,
        })
      );
    });
  });
});
