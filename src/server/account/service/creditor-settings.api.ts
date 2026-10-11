import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { CreditorSettings } from "@/commons/models/user";
import {
  getCreditorSettingsByUserIdSupabase,
  upsertCreditorSettingsSupabase,
} from "../repository/creditor-settings.supabase";
import { getUserPermissionsByUserIdSupabase } from "../repository/subscription.supabase";

/**
 * Obtém as configurações e permissões ativas do credor
 */
export const getCreditorSettingsApi = async (userId: string) => {
  const [settings, permissions] = await Promise.all([
    getCreditorSettingsByUserIdSupabase(userId),
    getUserPermissionsByUserIdSupabase(userId),
  ]);

  return ApiResponse.Ok({
    message: "Configurações carregadas com sucesso.",
    data: {
      settings,
      permissions,
    },
  });
};

/**
 * Salva as configurações do credor respeitando os limites do plano
 */
export const saveCreditorSettingsApi = async (
  userId: string,
  data: Partial<CreditorSettings>
) => {
  const permissions = await getUserPermissionsByUserIdSupabase(userId);

  // Se o plano não permitir customização de templates, não permite alterar as mensagens
  const payloadToSave: Partial<CreditorSettings> & { user_id: string } = {
    user_id: userId,
    pix_key_type: data.pix_key_type,
    pix_key: data.pix_key,
    pix_holder_name: data.pix_holder_name,
    pix_bank_name: data.pix_bank_name,
  };

  if (permissions.canCustomTemplates) {
    payloadToSave.template_friendly = data.template_friendly;
    payloadToSave.template_acid = data.template_acid;
    payloadToSave.template_critical = data.template_critical;
  }

  const { data: saved, error } = await upsertCreditorSettingsSupabase(payloadToSave);

  if (error) {
    return ApiResponse.BadRequest({
      message: "Não foi possível salvar as configurações do credor.",
      error: error.message,
    });
  }

  return ApiResponse.Ok({
    message: "Configurações atualizadas com sucesso no cofre!",
    data: saved,
  });
};

