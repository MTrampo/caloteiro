import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { CreditorSettings } from "@/commons/models/user";
import {
  encryptSensitiveData,
  decryptSensitiveData,
} from "@/server/account/service/encryption.api";

/**
 * Busca as configurações do credor vinculadas ao user_id
 */
export const getCreditorSettingsByUserIdSupabase = async (
  userId: string
): Promise<CreditorSettings | null> => {
  const supabase = internalSupabase();

  const { data, error } = await supabase
    .from("creditor_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const settings = data as unknown as CreditorSettings;

  return {
    ...settings,
    pix_key: decryptSensitiveData(settings.pix_key),
  };
};

/**
 * Cria ou atualiza as configurações do credor (upsert por user_id)
 */
export const upsertCreditorSettingsSupabase = async (
  payload: Partial<CreditorSettings> & { user_id: string }
) => {
  const supabase = await serverSupabase();

  const dataToSave = {
    ...payload,
    ...(payload.pix_key !== undefined
      ? { pix_key: encryptSensitiveData(payload.pix_key) }
      : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("creditor_settings")
    .upsert(dataToSave, { onConflict: "user_id" })
    .select()
    .single();

  if (data) {
    const saved = data as unknown as CreditorSettings;
    return {
      data: {
        ...saved,
        pix_key: decryptSensitiveData(saved.pix_key),
      },
      error: null,
    };
  }

  return { data, error };
};

