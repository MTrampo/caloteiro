import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteUserAccountApi } from "../service/account.api";
import * as authSupabase from "../repository/auth.supabase";
import * as subscriptionSupabase from "../repository/subscription.supabase";
import * as paymentService from "@/server/payment/service/payment.api";
import * as subscriptionAuthLib from "@/commons/lib/auth/subscription";
import { HttpStatusEnum } from "@/commons/enums/http";
import { AuthError } from "@supabase/supabase-js";

vi.mock("server-only", () => ({}));

vi.mock("../repository/auth.supabase", () => ({
  deleteUserAccountSupabase: vi.fn(),
  killAuthSupabase: vi.fn(),
  updateProfileByUserIdSupabase: vi.fn(),
  updateUserEmailSupabase: vi.fn(),
  updatePassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  confirmCodePasswordReset: vi.fn(),
  verifyEmailChangeCodeSupabase: vi.fn(),
  updateProfileEmailByUserIdSupabase: vi.fn(),
}));

vi.mock("../repository/subscription.supabase", () => ({
  getSubscriptionByUserIdSupabase: vi.fn(),
  getInvoicesByUserIdSupabase: vi.fn(),
}));

vi.mock("@/server/payment/service/payment.api", () => ({
  cancelPreApprovalApi: vi.fn(),
}));

vi.mock("@/commons/lib/auth/subscription", () => ({
  clearCookieSubscription: vi.fn(),
}));

describe("Serviço de Gestão de Conta (account.api.ts)", () => {
  const userId = "user-delete-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteUserAccountApi (Exclusão Definitiva de Conta)", () => {
    it("deve cancelar assinatura no Mercado Pago e deletar conta com sucesso quando o usuário possui assinatura ativa", async () => {
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue({
        id: "sub-123",
        user_id: userId,
        plan_id: "plan-branco",
        base_value: 29.90,
        mp_status: "authorized",
        mp_subscription_id: "mp-sub-to-cancel-456",
        mp_payer_email: "tubarao@mar.com",
        mp_payer_id: null,
        current_period_start: null,
        current_period_end: null,
      });

      vi.mocked(paymentService.cancelPreApprovalApi).mockResolvedValue({
        status: 200,
        message: "Assinatura cancelada",
        data: null,
      });

      vi.mocked(authSupabase.deleteUserAccountSupabase).mockResolvedValue({
        error: null,
      });

      const response = await deleteUserAccountApi(userId);

      expect(paymentService.cancelPreApprovalApi).toHaveBeenCalledWith("mp-sub-to-cancel-456");
      expect(authSupabase.deleteUserAccountSupabase).toHaveBeenCalledWith(userId);
      expect(subscriptionAuthLib.clearCookieSubscription).toHaveBeenCalled();
      expect(authSupabase.killAuthSupabase).toHaveBeenCalled();
      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.message).toContain("Conta excluída com sucesso");
    });

    it("deve excluir a conta normalmente se o usuário não possuir assinatura no Mercado Pago", async () => {
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);
      vi.mocked(authSupabase.deleteUserAccountSupabase).mockResolvedValue({
        error: null,
      });

      const response = await deleteUserAccountApi(userId);

      expect(paymentService.cancelPreApprovalApi).not.toHaveBeenCalled();
      expect(authSupabase.deleteUserAccountSupabase).toHaveBeenCalledWith(userId);
      expect(subscriptionAuthLib.clearCookieSubscription).toHaveBeenCalled();
      expect(authSupabase.killAuthSupabase).toHaveBeenCalled();
      expect(response.status).toBe(HttpStatusEnum.Ok);
    });

    it("deve retornar erro interno se a exclusão do banco falhar", async () => {
      vi.mocked(subscriptionSupabase.getSubscriptionByUserIdSupabase).mockResolvedValue(null);
      vi.mocked(authSupabase.deleteUserAccountSupabase).mockResolvedValue({
        error: new AuthError("Erro de banco de dados", 500),
      });

      const response = await deleteUserAccountApi(userId);

      expect(response.status).toBe(HttpStatusEnum.InternalServerError);
      expect(response.message).toContain("Não foi possível excluir a conta");
    });
  });
});
