import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import type { CreditorSettings } from "@/commons/models/user";

/**
 * Busca as configurações do credor vinculadas ao user_id
 */
export const getCreditorSettingsByUserIdSupabase = async (
  userId: string
): Promise<CreditorSettings | null> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("creditor_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as CreditorSettings;
};

/**
 * Cria ou atualiza as configurações do credor (upsert por user_id)
 */
export const upsertCreditorSettingsSupabase = async (
  payload: Partial<CreditorSettings> & { user_id: string }
) => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("creditor_settings")
    .upsert(
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  return { data, error };
};

