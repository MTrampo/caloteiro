"use server";

import { serverSupabase } from "@/commons/lib/supabase/server";
import {
  creditorSettingsSchema,
  type CreditorSettingsFormInputs,
  type CreditorSettings,
} from "@/commons/models/user";
import type { UserPermissions } from "@/commons/models/subscription";
import {
  getCreditorSettingsApi,
  saveCreditorSettingsApi,
} from "@/server/account/service/creditor-settings.api";
import { HttpStatusEnum } from "@/commons/enums/http";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Obtém as configurações financeiras e permissões do credor logado
 */
export async function getCreditorSettingsAction(): Promise<
  ActionResponse<{
    settings: CreditorSettings | null;
    permissions: UserPermissions;
  }>
> {
  try {
    const supabase = await serverSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Acesso negado. Usuário não autenticado.",
      };
    }

    const response = await getCreditorSettingsApi(user.id);

    if (response.status !== HttpStatusEnum.Ok || !response.data) {
      return {
        success: false,
        error: response.message || "Erro ao carregar configurações.",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    console.error("[getCreditorSettingsAction] Erro inesperado:", err);
    return {
      success: false,
      error: "Falha na comunicação com o servidor.",
    };
  }
}

/**
 * Salva as configurações financeiras do credor logado
 */
export async function saveCreditorSettingsAction(
  data: CreditorSettingsFormInputs
): Promise<ActionResponse<CreditorSettings>> {
  try {
    const supabase = await serverSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Acesso negado. Faça login para continuar.",
      };
    }

    const parsed = creditorSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Dados inválidos.",
      };
    }

    const response = await saveCreditorSettingsApi(user.id, parsed.data as Partial<CreditorSettings>);

    if (response.status !== HttpStatusEnum.Ok || !response.data) {
      return {
        success: false,
        error: response.message || "Erro ao salvar configurações.",
      };
    }

    return {
      success: true,
      data: response.data as CreditorSettings,
    };
  } catch (err) {
    console.error("[saveCreditorSettingsAction] Erro inesperado:", err);
    return {
      success: false,
      error: "Falha ao gravar configurações no servidor.",
    };
  }
}

