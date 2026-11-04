import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getUserPermissionsByUserIdSupabase } from "../repository/subscription.supabase";
import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import * as authSupabase from "../repository/auth.supabase";
import type { Subscription, Plan } from "@/commons/models/subscription";

vi.mock("@/commons/lib/supabase/server", () => ({
  serverSupabase: vi.fn(),
}));
vi.mock("@/commons/lib/supabase/internal", () => ({
  internalSupabase: vi.fn(),
}));
vi.mock("../repository/auth.supabase", () => ({
  updateProfileAvatarSupabase: vi.fn(),
}));

describe("Resolução Lazy de Permissões e Agendamento de Downgrade (getUserPermissionsByUserIdSupabase)", () => {
  const userId = "tubarao-lazy-user-1";

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockSupabase(subscription: Subscription | null, updateMock?: Mock) {
    return {
      from: vi.fn((table: string) => {
        if (table === "subscriptions") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: subscription,
                  error: null,
                }),
              }),
            }),
            update: updateMock || vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: subscription?.id },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "plans") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: freePlan,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
  }

  it("deve MANTER os benefícios do plano pago se houver scheduled_plan_id mas o ciclo vigente NÃO tiver expirado", async () => {
    const futurePeriodEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 dias no futuro

    const activeSubWithScheduledDowngrade: Subscription = {
      id: "sub-scheduled-1",
      user_id: userId,
      plan_id: paidPlanBranco.id,
      scheduled_plan_id: freePlan.id,
      base_value: 29.90,
      mp_status: "cancelled",
      mp_subscription_id: null,
      current_period_end: futurePeriodEnd,
      plan: paidPlanBranco,
      scheduled_plan: freePlan,
    };

    const updateMock = vi.fn();
    const mockClient = createMockSupabase(activeSubWithScheduledDowngrade, updateMock);
    vi.mocked(serverSupabase).mockResolvedValue(mockClient as never);
    vi.mocked(internalSupabase).mockReturnValue(mockClient as never);

    const permissions = await getUserPermissionsByUserIdSupabase(userId);

    // O período ainda não expirou: NÃO deve atualizar no banco ainda
    expect(updateMock).not.toHaveBeenCalled();
    expect(authSupabase.updateProfileAvatarSupabase).not.toHaveBeenCalled();

    // Deve retornar permissões do plano pago (Tubarão Branco: 10 presas, financeiro liberado)
    expect(permissions.maxDebtors).toBe(10);
    expect(permissions.canAccessFinancial).toBe(true);
    expect(permissions.isFreePlan).toBe(false);
    expect(permissions.isSubscriptionActive).toBe(true);
  });

  it("deve APLICAR LAZY TRANSITION no banco quando scheduled_plan_id existir e o ciclo tiver expirado", async () => {
    const expiredPeriodEnd = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // Expirou há 2 horas

    const expiredSubWithScheduledDowngrade: Subscription = {
      id: "sub-scheduled-2",
      user_id: userId,
      plan_id: paidPlanBranco.id,
      scheduled_plan_id: freePlan.id,
      base_value: 29.90,
      mp_status: "cancelled",
      mp_subscription_id: null,
      current_period_end: expiredPeriodEnd,
      plan: paidPlanBranco,
      scheduled_plan: freePlan,
    };

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "sub-scheduled-2" },
            error: null,
          }),
        }),
      }),
    });

    const mockClient = createMockSupabase(expiredSubWithScheduledDowngrade, updateMock);
    vi.mocked(serverSupabase).mockResolvedValue(mockClient as never);
    vi.mocked(internalSupabase).mockReturnValue(mockClient as never);

    const permissions = await getUserPermissionsByUserIdSupabase(userId);

    // Deve efetivar a migração lazy no banco de dados
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_id: freePlan.id,
        scheduled_plan_id: null,
        base_value: 0,
        mp_status: "authorized",
        current_period_end: null,
      })
    );

    // Deve atualizar o avatar do usuário para o novo plano
    expect(authSupabase.updateProfileAvatarSupabase).toHaveBeenCalledWith(userId, freePlan.slug);

    // Deve retornar permissões do novo plano (Tubarão Lixa: 2 presas, isFreePlan: true)
    expect(permissions.maxDebtors).toBe(2);
    expect(permissions.canAccessFinancial).toBe(false);
    expect(permissions.isFreePlan).toBe(true);
  });
});
