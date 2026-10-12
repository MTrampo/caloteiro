import type { z } from "zod";
import type {
  creditorSettingsSchema,
  forgotPasswordSchema,
  otpSchema,
  sendEmailSchema,
  signInSchema,
  signUpSchema,
} from "@/commons/validations/user";

// Tipos inferidos dos formulários (para React Hook Form e UI)
export type UserSignInFormInputs = z.infer<typeof signInSchema>;
export type UserSignUpFormInputs = z.infer<typeof signUpSchema>;
export type SendEmailFormInputs = z.infer<typeof sendEmailSchema>;
export type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;
export type OtpFormInputs = z.infer<typeof otpSchema>;
export type CreditorSettingsFormInputs = z.infer<typeof creditorSettingsSchema>;

// Contratos e Entidades de Domínio / Banco de Dados
export interface Profile {
  id: string;
  name?: string | null;
  nickname?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  accepted_terms?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Perfil higienizado e formatado para a UI (Nav, Configurações, Conta)
 */
export interface ProfileFormatted {
  id: string;
  email: string;
  name: string;
  nickname: string | null;
  displayName: string; // Apelido se existir, senão primeiro nome, senão "Tubarão"
  avatarUrl: string | null;
  phone: string | null;
  planName?: string;
  planSlug?: string;
}

export interface CreditorSettings {
  id: string;
  user_id: string;
  pix_key_type?: "cpf" | "cnpj" | "email" | "phone" | "random" | null;
  pix_key?: string | null;
  pix_holder_name?: string | null;
  pix_bank_name?: string | null;
  template_friendly?: string | null;
  template_acid?: string | null;
  template_critical?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// DTOs e Payloads de Entrada para Actions, Services e Repositories
export interface CreateProfilePayload {
  userId: string;
  name: string;
  email: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
}

export interface SignInRequestBody {
  email: string;
  password: string;
}

export interface UserRequestBody {
  email: string;
  password: string;
  name: string;
  nickname?: string;
  accepted_terms?: boolean;
}

export interface ResetPasswordRequestBody {
  email: string;
  code: string;
  password: string;
}
