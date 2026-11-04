import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { CreateProfilePayload, UserRequestBody } from "@/commons/models/user";
import { resolveAuthError } from "@/commons/errors/auth";
import { AuthError } from "@supabase/supabase-js";
import { APP_URL } from "@/commons/constants/env";

async function getInternalClient() {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return internalSupabase();
    }
  } catch {}
  return await serverSupabase();
}

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const createAuthSupabase = async (user: UserRequestBody) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        display_name: user.name || user.email.split("@")[0],
        nickname: user.nickname || null,
      },
    },
  });

  return { data, error };
};

export const killAuthSupabase = async () => {
  const supabase = await serverSupabase();
  const { error } = await supabase.auth.signOut();
  return error;
};

export const createProfileSupabase = async (payload: CreateProfilePayload) => {
  const supabase = await getInternalClient();

  const { data, error } = await supabase.from("profiles").upsert({
    id: payload.userId,
    name: payload.name,
    nickname: payload.nickname || null,
    email: payload.email,
    avatar_url: payload.avatarUrl || null,
    phone: payload.phone || null,
    accepted_terms: true,
    updated_at: new Date().toISOString(),
  });

  return { data, error };
};

export const verifyCode = async (email: string, token: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  return { data, error };
};

export const resendOtpCode = async (email: string) => {
  const supabase = await serverSupabase();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${APP_URL}/auth/callback`,
    },
  });

  return error;
};

export const sendPasswordResetEmail = async (email: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const confirmCodePasswordReset = async (email: string, token: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });

  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
};

export const getUserLogged = async () => {
  try {
    const supabase = await serverSupabase();
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("DYNAMIC_SERVER_USAGE")
    ) {
      throw error;
    }

    let errCode: string | undefined;
    if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
      errCode = error.code;
    }

    const resolved = resolveAuthError(errCode);
    const authError = new AuthError(resolved.message);
    authError.status = resolved.status;
    if (errCode) {
      authError.code = errCode;
    }

    return {
      data: { user: null },
      error: authError,
    };
  }
};

export const getProfileByUserIdSupabase = async (userId: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
};

export const updateProfileByUserIdSupabase = async (
  userId: string,
  payload: { name: string; nickname?: string | null; phone?: string | null }
) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: payload.name,
      nickname: payload.nickname ?? null,
      phone: payload.phone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
};

export const updateProfileAvatarSupabase = async (userId: string, avatarUrl: string) => {
  const supabase = await getInternalClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
};

export const updateUserEmailSupabase = async (newEmail: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  return { data, error };
};

export const verifyEmailChangeCodeSupabase = async (newEmail: string, token: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.verifyOtp({
    email: newEmail,
    token,
    type: "email_change",
  });

  return { data, error };
};

export const updateProfileEmailByUserIdSupabase = async (userId: string, email: string) => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update({ email, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return { data, error };
};

export const getProfileStatusByEmailSupabase = async (email: string) => {
  const supabaseInternal = await getInternalClient();
  const { data, error } = await supabaseInternal
    .from("profiles")
    .select("id, email, status, status_reason, deleted_at, retention_until")
    .ilike("email", email.trim())
    .maybeSingle();

  return { data, error };
};

export const quarantineUserAccountSupabase = async (userId: string, reason?: string) => {
  const supabaseInternal = await getInternalClient();
  const now = new Date();
  const retentionUntil = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 dias de guarda legal (Marco Civil/LGPD)

  const { error: profileError } = await supabaseInternal
    .from("profiles")
    .update({
      status: "deleted",
      status_reason: reason || "Auto-exclusão solicitada pelo titular",
      deleted_at: now.toISOString(),
      retention_until: retentionUntil.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", userId);

  return { error: profileError };
};

export const reactivateUserAccountSupabase = async (userId: string) => {
  const supabaseInternal = await getInternalClient();
  const now = new Date();

  const { error: profileError } = await supabaseInternal
    .from("profiles")
    .update({
      status: "active",
      status_reason: null,
      deleted_at: null,
      retention_until: null,
      updated_at: now.toISOString(),
    })
    .eq("id", userId);

  return { error: profileError };
};

export const banUserAccountSupabase = async (userId: string, reason: string) => {
  const supabaseInternal = await getInternalClient();
  const now = new Date();

  const { error: profileError } = await supabaseInternal
    .from("profiles")
    .update({
      status: "banned",
      status_reason: reason,
      deleted_at: now.toISOString(),
      retention_until: null, // Banimento perpétuo: nunca expira a retenção do bloqueio
      updated_at: now.toISOString(),
    })
    .eq("id", userId);

  return { error: profileError };
};

export const deleteUserAccountSupabase = async (userId: string) => {
  const supabaseInternal = await getInternalClient();

  // 1. Deletar do perfil público (cascateia para debts, debtors, subscriptions, invoices, etc.)
  const { error: profileError } = await supabaseInternal
    .from("profiles")
    .delete()
    .eq("id", userId);

  // 2. Deletar do auth.users via admin do Supabase
  const { error: authError } = await supabaseInternal.auth.admin.deleteUser(userId);

  return { error: profileError || authError };
};