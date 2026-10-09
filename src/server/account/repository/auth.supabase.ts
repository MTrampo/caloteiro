import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { UserRequestBody } from "@/commons/models/user";
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

export const createProfileSupabase = async (
  userId: string,
  name: string,
  email: string,
  nickname?: string | null,
  avatarUrl?: string | null,
  phone?: string | null
) => {
  const supabase = await getInternalClient();

  const { data, error } = await supabase.from("profiles").upsert({
    id: userId,
    name,
    nickname: nickname || null,
    email,
    avatar_url: avatarUrl || null,
    phone: phone || null,
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