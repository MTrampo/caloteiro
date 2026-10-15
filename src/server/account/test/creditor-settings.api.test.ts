import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusEnum } from "@/commons/enums/http";
import {
  getCreditorSettingsApi,
  saveCreditorSettingsApi,
} from "../service/creditor-settings.api";
import * as creditorSettingsSupabase from "../repository/creditor-settings.supabase";
import * as subscriptionSupabase from "../repository/subscription.supabase";
import type { UserPermissions } from "@/commons/models/subscription";
import type { CreditorSettings } from "@/commons/models/user";

vi.mock("../repository/creditor-settings.supabase");
vi.mock("../repository/subscription.supabase");

describe("Serviço de Configurações do Credor (creditor-settings.api.ts)", () => {
  const userId = "tubarao-settings-user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCreditorSettingsApi", () => {
    it("deve carregar configurações e permissões simultaneamente", async () => {
      const mockSettings: CreditorSettings = {
        id: "settings-1",
        user_id: userId,
        pix_key_type: "cpf",
        pix_key: "123.456.789-00",
        pix_holder_name: "Tubarão Credor",
        pix_bank_name: "Nubank",
        template_friendly: "Olá!",
        template_acid: "Cadê meu dinheiro?",
        template_critical: "Último aviso!",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockPermissions: UserPermissions = {
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

      vi.mocked(creditorSettingsSupabase.getCreditorSettingsByUserIdSupabase).mockResolvedValue(mockSettings);
      vi.mocked(subscriptionSupabase.getUserPermissionsByUserIdSupabase).mockResolvedValue(mockPermissions);

      const response = await getCreditorSettingsApi(userId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.settings).toEqual(mockSettings);
      expect(response.data?.permissions).toEqual(mockPermissions);
    });
  });

  describe("saveCreditorSettingsApi (Regras de Plano e Chaves Pix)", () => {
    it("deve salvar dados bancários/PIX mas ignorar templates se o plano for Free (canCustomTemplates: false)", async () => {
      const freePermissions: UserPermissions = {
        maxDebtors: 3,
        canCustomTemplates: false, // Plano sem customização de mensagens
        canExportReports: false,
        canAccessFinancial: false,
        canDebtorPortal: false,
        canRiskScore: false,
        canAttachReceipts: false,
        isFreePlan: true,
        isSubscriptionActive: true,
      };

      vi.mocked(subscriptionSupabase.getUserPermissionsByUserIdSupabase).mockResolvedValue(freePermissions);

      let capturedPayload: Partial<CreditorSettings> & { user_id: string } = { user_id: userId };
      vi.mocked(creditorSettingsSupabase.upsertCreditorSettingsSupabase).mockImplementation(async (payload) => {
        capturedPayload = payload;
        return {
          data: {
            id: "settings-upsert-1",
            user_id: payload.user_id,
            pix_key_type: payload.pix_key_type ?? null,
            pix_key: payload.pix_key ?? null,
            pix_holder_name: payload.pix_holder_name ?? null,
            pix_bank_name: payload.pix_bank_name ?? null,
            template_friendly: payload.template_friendly ?? null,
            template_acid: payload.template_acid ?? null,
            template_critical: payload.template_critical ?? null,
            default_interest_type: null,
            default_interest_rate: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        };
      });

      const response = await saveCreditorSettingsApi(userId, {
        pix_key_type: "random",
        pix_key: "a1b2c3d4-e5f6",
        pix_holder_name: "Tubarão Dono",
        pix_bank_name: "Banco Inter",
        template_friendly: "Tentativa de trocar mensagem",
        template_acid: "Tentativa de trocar mensagem ácida",
        template_critical: "Tentativa de trocar mensagem crítica",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.message).toContain("Configurações atualizadas");

      // Deve salvar os dados PIX
      expect(capturedPayload.pix_key).toBe("a1b2c3d4-e5f6");
      expect(capturedPayload.pix_holder_name).toBe("Tubarão Dono");
      expect(capturedPayload.pix_bank_name).toBe("Banco Inter");

      // Os templates NÃO devem ter sido incluídos no payload salvo (blindagem de plano)
      expect(capturedPayload.template_friendly).toBeUndefined();
      expect(capturedPayload.template_acid).toBeUndefined();
      expect(capturedPayload.template_critical).toBeUndefined();
    });

    it("deve permitir customização completa de templates quando o plano liberar (canCustomTemplates: true)", async () => {
      const paidPermissions: UserPermissions = {
        maxDebtors: null,
        canCustomTemplates: true, // Plano Pro/Megalodonte
        canExportReports: true,
        canAccessFinancial: true,
        canDebtorPortal: true,
        canRiskScore: true,
        canAttachReceipts: true,
        isFreePlan: false,
        isSubscriptionActive: true,
      };

      vi.mocked(subscriptionSupabase.getUserPermissionsByUserIdSupabase).mockResolvedValue(paidPermissions);

      let capturedPayload: Partial<CreditorSettings> & { user_id: string } = { user_id: userId };
      vi.mocked(creditorSettingsSupabase.upsertCreditorSettingsSupabase).mockImplementation(async (payload) => {
        capturedPayload = payload;
        return {
          data: {
            id: "settings-upsert-2",
            user_id: payload.user_id,
            pix_key_type: payload.pix_key_type ?? null,
            pix_key: payload.pix_key ?? null,
            pix_holder_name: payload.pix_holder_name ?? null,
            pix_bank_name: payload.pix_bank_name ?? null,
            template_friendly: payload.template_friendly ?? null,
            template_acid: payload.template_acid ?? null,
            template_critical: payload.template_critical ?? null,
            default_interest_type: null,
            default_interest_rate: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        };
      });

      const response = await saveCreditorSettingsApi(userId, {
        pix_key_type: "phone",
        pix_key: "11988887777",
        template_acid: "Passou do prazo, o tubarão está farejando!",
      });

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(capturedPayload.template_acid).toBe("Passou do prazo, o tubarão está farejando!");
    });
  });
});
