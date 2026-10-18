import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusEnum } from "@/commons/enums/http";
import { DebtorRelationshipEnum } from "@/commons/models/debtor";
import type { CreateDebtorPayload, DebtorItem } from "@/commons/models/debtor";
import type { UserPermissions } from "@/commons/models/subscription";
import {
  createDebtorApi,
  getDebtorByIdApi,
  deleteDebtorApi,
} from "../service/debtor.api";
import * as debtorSupabase from "../repository/debtor.supabase";
import * as subscriptionService from "@/server/account/service/subscription.api";

vi.mock("../repository/debtor.supabase");
vi.mock("@/server/account/service/subscription.api");

describe("Serviço de Devedores (debtor.api.ts)", () => {
  const userId = "tubarao-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDebtorApi (Cadastro e Regras de Negócio)", () => {
    it("deve cadastrar devedor sanitizando nome e telefone corretamente", async () => {
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

      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(unlimitedPermissions);

      let capturedPayload: CreateDebtorPayload = {
        name: "",
        relationship: DebtorRelationshipEnum.FRIEND,
        phone: "",
      };
      vi.mocked(debtorSupabase.createDebtorSupabase).mockImplementation(async (uId, payload) => {
        capturedPayload = payload;
        const fakeDebtor: DebtorItem = {
          id: "debtor-novo",
          user_id: uId,
          name: payload.name,
          nickname: payload.nickname || null,
          relationship: payload.relationship,
          phone: payload.phone,
          document: payload.document || null,
          address: payload.address || null,
          pix_key: payload.pix_key || null,
          pix_key_type: payload.pix_key_type || null,
          notes: payload.notes || null,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return {
          data: fakeDebtor,
          error: null,
        };
      });

      const response = await createDebtorApi(userId, {
        name: "joão da silva pereira",
        nickname: "  joãozinho  ",
        relationship: DebtorRelationshipEnum.FRIEND,
        phone: "(11) 98765-4321",
        document: "123.456.789-00",
        address: " Rua das Flores, 123 ",
        notes: " Emprestou dinheiro em janeiro ",
      });

      expect(response.status).toBe(HttpStatusEnum.Created);
      expect(response.message).toContain("Devedor cadastrado com sucesso!");

      // Verifica formatação própria do nome (com preposição correta) e sanitização de números
      expect(capturedPayload.name).toBe("João da Silva Pereira");
      expect(capturedPayload.nickname).toBe("Joãozinho");
      expect(capturedPayload.phone).toBe("11987654321");
      expect(capturedPayload.document).toBe("12345678900");
      expect(capturedPayload.address).toBe("Rua das Flores, 123");
      expect(capturedPayload.notes).toBe("Emprestou dinheiro em janeiro");
    });

    it("deve barrar cadastro se o limite de devedores do plano for atingido", async () => {
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

      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(freePermissions);

      // Já atingiu 3 devedores
      vi.mocked(debtorSupabase.countDebtorsByUserIdSupabase).mockResolvedValue(3);

      const response = await createDebtorApi(userId, {
        name: "Novo Caloteiro",
        relationship: DebtorRelationshipEnum.FRIEND,
        phone: "11999999999",
      });

      expect(response.status).toBe(HttpStatusEnum.Forbidden);
      expect(response.error).toBe("LIMIT_REACHED");
      expect(response.message).toContain("Sua gruta encheu!");
      expect(response.message).toContain("presas marcadas");
    });

    it("deve rejeitar cadastro com telefone inválido (menos de 8 dígitos)", async () => {
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

      vi.mocked(subscriptionService.getUserPermissionsOrCacheApi).mockResolvedValue(unlimitedPermissions);

      const response = await createDebtorApi(userId, {
        name: "Devedor Sem Telefone",
        relationship: DebtorRelationshipEnum.PARENT,
        phone: "123", // Inválido
      });

      expect(response.status).toBe(HttpStatusEnum.BadRequest);
      expect(response.message).toContain("Número de telefone inválido");
    });
  });

  describe("getDebtorByIdApi (Isolamento Multi-tenant)", () => {
    it("deve retornar NotFound se o devedor pertencer a outro usuário", async () => {
      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(null);

      const response = await getDebtorByIdApi("debtor-alien", userId);

      expect(response.status).toBe(HttpStatusEnum.NotFound);
      expect(response.message).toContain("não pertence a este Tubarão");
    });

    it("deve retornar dados do devedor quando pertencer legitimamente ao Tubarão", async () => {
      const mockDebtor: DebtorItem = {
        id: "debtor-meu",
        user_id: userId,
        name: "Meu Devedor",
        nickname: null,
        relationship: DebtorRelationshipEnum.FRIEND,
        phone: "11988887777",
        document: null,
        address: null,
        pix_key: null,
        pix_key_type: null,
        notes: null,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(debtorSupabase.getDebtorByIdSupabase).mockResolvedValue(mockDebtor);

      const response = await getDebtorByIdApi("debtor-meu", userId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.data?.id).toBe("debtor-meu");
    });
  });

  describe("deleteDebtorApi", () => {
    it("deve retornar sucesso ao remover devedor respeitando o userId", async () => {
      vi.mocked(debtorSupabase.deleteDebtorSupabase).mockResolvedValue({
        success: true,
        error: null,
      });

      const response = await deleteDebtorApi("debtor-del", userId);

      expect(response.status).toBe(HttpStatusEnum.Ok);
      expect(response.message).toContain("Devedor removido do tanque");
      expect(debtorSupabase.deleteDebtorSupabase).toHaveBeenCalledWith("debtor-del", userId);
    });
  });
});
