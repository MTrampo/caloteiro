import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  nickname: z.string().min(2, "Informe seu apelido ou vulgo na praça"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de serviço e a política de privacidade.",
  }),
});

export const sendEmailSchema = z.object({
  email: z.string().email("Informe um e-mail válido para recuperar o acesso"),
});

export const forgotPasswordSchema = z.object({
  code: z.string().length(6, "O código de verificação tem 6 dígitos"),
  password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a nova senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const otpSchema = z.object({
  code: z.string().length(6, "O código de confirmação tem exatamente 6 dígitos"),
});

export const creditorSettingsSchema = z.object({
  pix_key_type: z.enum(["cpf", "cnpj", "email", "phone", "random", "celular", "aleatoria"]).optional().nullable(),
  pix_key: z.string().min(1, "Informe sua chave Pix").optional().nullable(),
  pix_holder_name: z.string().optional().nullable(),
  pix_bank_name: z.string().optional().nullable(),
  template_friendly: z.string().optional().nullable(),
  template_acid: z.string().optional().nullable(),
  template_critical: z.string().optional().nullable(),
});

export type UserSignInFormInputs = z.infer<typeof signInSchema>;
export type UserSignUpFormInputs = z.infer<typeof signUpSchema>;
export type SendEmailFormInputs = z.infer<typeof sendEmailSchema>;
export type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;
export type OtpFormInputs = z.infer<typeof otpSchema>;
export type CreditorSettingsFormInputs = z.infer<typeof creditorSettingsSchema>;

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
