import { describe, it, expect, vi, beforeEach } from "vitest";
import { isSubscriptionActive } from "@/commons/lib/http/security";
import { MercadoPagoStatusEnum } from "@/commons/enums/subscription";
import type { SubscriptionPayloadCookie } from "@/commons/models/subscription";
import {
  signSecureCookie,
  verifySecureCookie,
  getUserCookieSecret,
} from "@/commons/lib/crypto/secure-cookie";
import { createDebtApi, registerDebtPaymentApi } from "@/server/debts/service/debt.api";
import * as debtSupabase from "@/server/debts/repository/debt.supabase";
import * as debtorSupabase from "@/server/debtors/repository/debtor.supabase";
import * as subscriptionService from "@/server/account/service/subscription.api";
import type { DebtRow, InstallmentRow } from "@/commons/models/debt";
import { HttpStatusEnum } from "@/commons/enums/http";

vi.mock("@/server/debts/repository/debt.supabase");
vi.mock("@/server/debtors/repository/debtor.supabase");
vi.mock("@/server/account/service/subscription.api");

describe("Blindagem de Segurança, Anti-Bypass e Zero Trust", () => {
  const userIdA = "user-tubarao-legitimo";
  const userIdB = "user-atacante-malicioso";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Regra de Carência e Status da Assinatura (isSubscriptionActive)", () => {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    it("deve manter acesso ativo se o status for Authorized dentro da vigência", () => {
      const activeSub: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: MercadoPagoStatusEnum.Authorized,
        currentPeriodEnd: new Date(Date.now() + 10 * ONE_DAY_MS).toISOString(),
      };

      expect(isSubscriptionActive(activeSub)).toBe(true);
    });

    it("deve conceder período de carência de até 3 dias para assinaturas canceladas", () => {
      // Cancelado há 1 dia (dentro dos 3 dias de tolerância)
      const withinGracePeriod: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: MercadoPagoStatusEnum.Cancelled,
        currentPeriodEnd: new Date(Date.now() - 1 * ONE_DAY_MS).toISOString(),
      };

      expect(isSubscriptionActive(withinGracePeriod)).toBe(true);
    });

    it("deve bloquear acesso se a assinatura cancelada ultrapassou os 3 dias de tolerância", () => {
      // Cancelado há 5 dias (ultrapassou os 3 dias de tolerância)
      const expiredGracePeriod: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: MercadoPagoStatusEnum.Cancelled,
        currentPeriodEnd: new Date(Date.now() - 5 * ONE_DAY_MS).toISOString(),
      };

      expect(isSubscriptionActive(expiredGracePeriod)).toBe(false);
    });

    it("deve bloquear acesso imediatamente se o status for Paused ou Rejected", () => {
      const pausedSub: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: MercadoPagoStatusEnum.Paused,
        currentPeriodEnd: new Date(Date.now() + 10 * ONE_DAY_MS).toISOString(),
      };

      const rejectedSub: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: MercadoPagoStatusEnum.Rejected,
        currentPeriodEnd: new Date(Date.now() + 10 * ONE_DAY_MS).toISOString(),
      };

      expect(isSubscriptionActive(pausedSub)).toBe(false);
      expect(isSubscriptionActive(rejectedSub)).toBe(false);
    });
  });

  describe("Integridade Criptográfica do Cookie de Sessão (Anti-Tampering)", () => {
    it("deve validar com sucesso cookie gerado legitimamente com HMAC-SHA256", async () => {
      const payload: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: "authorized",
        planSlug: "tubarao-lixa",
      };

      const secret = getUserCookieSecret(userIdA);
      const secureToken = await signSecureCookie(payload, secret);

      const verified = await verifySecureCookie<SubscriptionPayloadCookie>(secureToken, secret);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(userIdA);
      expect(verified?.planSlug).toBe("tubarao-lixa");
    });

    it("deve rejeitar cookie quando o payload for adulterado (tentativa de escalada de privilégios)", async () => {
      const payload: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: "authorized",
        planSlug: "tubarao-lixa",
      };

      const secret = getUserCookieSecret(userIdA);
      const secureToken = await signSecureCookie(payload, secret);

      // Atacante tenta mudar 'tubarao-lixa' para 'megalodonte' no payload base64
      const [payloadEncoded, signatureEncoded] = secureToken.split(".");
      const decodedPayloadJson = Buffer.from(payloadEncoded, "base64url").toString("utf-8");
      const tamperedJson = decodedPayloadJson.replace("tubarao-lixa", "megalodonte");
      const tamperedPayloadEncoded = Buffer.from(tamperedJson).toString("base64url");
      const tamperedToken = `${tamperedPayloadEncoded}.${signatureEncoded}`;

      // A verificação da assinatura criptográfica deve falhar retornando null
      const result = await verifySecureCookie(tamperedToken, secret);
      expect(result).toBeNull();
    });

    it("deve impedir reutilização do cookie de um usuário em outra sessão (divergência de tenant)", async () => {
      const payload: SubscriptionPayloadCookie = {
        userId: userIdA,
        status: "authorized",
        planSlug: "megalodonte",
      };

      // Usuário A assina seu cookie com seu segredo próprio
      const secretA = getUserCookieSecret(userIdA);
      const tokenUserA = await signSecureCookie(payload, secretA);

      // Usuário B tenta verificar o token do Usuário A com seu próprio segredo
      const secretB = getUserCookieSecret(userIdB);
      const result = await verifySecureCookie(tokenUserA, secretB);
      expect(result).toBeNull();
    });
  });

  describe("Travas Anti-Bypass em Regras de Negócio de Dívidas", () => {
    it("deve rejeitar criação de dívida vinculando devedor de outro usuário (Prevenção de IDOR)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue({
        maxDebtors: null,
        canCustomTemplates: true,
        canExportReports: true,
        canAccessFinancial: true,
        canDebtorPortal: true,
        canRiskScore: true,
        canAttachReceipts: true,
        isFreePlan: false,
        isSubscriptionActive: true,
      });

      // Devedor não pertence ao usuário que está tentando cadastrar
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(null);

      const response = await createDebtApi(userIdA, {
        debtor_id: "debtor-alheio-123",
        title: "Tentativa de Fraude",
        original_amount: 100,
        total_amount: 100,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 1,
        interest_type: "none",
        interest_rate: 0,
        category: "personal_loan",
      });

      expect(response.status).toBe(HttpStatusEnum.BadRequest);
      expect(response.message).toContain("Devedor não encontrado");
    });

    it("deve barrar parcelamento acima de 12x no plano Lixa mesmo injetado por payload direto", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue({
        maxDebtors: 3,
        canCustomTemplates: false,
        canExportReports: false,
        canAccessFinancial: false,
        canDebtorPortal: false,
        canRiskScore: false,
        canAttachReceipts: false,
        isFreePlan: true,
        isSubscriptionActive: true,
      });

      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(0);

      const response = await createDebtApi(userIdA, {
        debtor_id: "debtor-1",
        title: "Tentativa 24x no Plano Lixa",
        original_amount: 1000,
        total_amount: 1000,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 24, // Burlar parcelas
        interest_type: "none",
        interest_rate: 0,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("INSTALLMENTS_LIMIT_REACHED");
    });

    it("deve barrar juros compostos ao mês (% a.m.) se o plano não for ilimitado (Megalodonte)", async () => {
      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue({
        maxDebtors: 10, // Plano intermediário (Martelo)
        canCustomTemplates: true,
        canExportReports: true,
        canAccessFinancial: true,
        canDebtorPortal: true,
        canRiskScore: false,
        canAttachReceipts: false,
        isFreePlan: false,
        isSubscriptionActive: true,
      });

      vi.mocked(debtSupabase.countActiveDebtsByUserIdSupabase).mockResolvedValue(2);

      const response = await createDebtApi(userIdA, {
        debtor_id: "debtor-1",
        title: "Tentativa Juros Mensal",
        original_amount: 500,
        total_amount: 600,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
        installments_count: 3,
        interest_type: "monthly_percentage",
        interest_rate: 5,
        category: "other",
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("INTEREST_TYPE_NOT_ALLOWED");
      expect(response.message).toContain("exclusiva do plano");
    });

    it("deve rejeitar pagamento de valor negativo ou zero (tentativa de forjar estorno)", async () => {
      const mockDebt: DebtRow = {
        id: "debt-1",
        user_id: userIdA,
        debtor_id: "debtor-1",
        title: "Dívida Teste",
        original_amount: 100,
        total_amount: 100,
        installments_count: 1,
        loan_date: "2026-01-01",
        first_due_date: "2026-02-01",
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
      vi.mocked(debtSupabase.getDebtByIdSupabase).mockResolvedValue(mockDebt);

      const mockInstallment: InstallmentRow = {
        id: "i1",
        debt_id: "debt-1",
        debtor_id: "debtor-1",
        user_id: userIdA,
        installment_number: 1,
        nominal_amount: 100,
        paid_amount: 0,
        due_date: "2026-02-01",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(debtSupabase.getInstallmentsByDebtIdSupabase).mockResolvedValue([mockInstallment]);

      const responseNegative = await registerDebtPaymentApi("debt-1", userIdA, {
        amount: -100,
      });

      const responseZero = await registerDebtPaymentApi("debt-1", userIdA, {
        amount: 0,
      });

      expect(responseNegative.status).toBe(HttpStatusEnum.BadRequest);
      expect(responseNegative.message).toContain("superior a zero");

      expect(responseZero.status).toBe(HttpStatusEnum.BadRequest);
      expect(responseZero.message).toContain("superior a zero");
    });
  });
});
