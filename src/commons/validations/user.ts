import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  nickname: z.string().min(2, "Informe seu apelido ou vulgo na praça"),
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de serviço e a política de privacidade.",
  }),
});

export const sendEmailSchema = z.object({
  email: z.email("Informe um e-mail válido para recuperar o acesso"),
});

export const forgotPasswordSchema = z
  .object({
    code: z.string().length(8, "O código de verificação tem 8 dígitos"),
    password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a nova senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z.string().length(8, "O código de confirmação tem exatamente 8 dígitos"),
});

export const creditorSettingsSchema = z.object({
  pix_key_type: z
    .enum(["cpf", "cnpj", "email", "phone", "random", "celular", "aleatoria"])
    .optional()
    .nullable(),
  pix_key: z.string().min(1, "Informe sua chave Pix").optional().nullable(),
  pix_holder_name: z.string().optional().nullable(),
  pix_bank_name: z.string().optional().nullable(),
  template_friendly: z.string().optional().nullable(),
  template_acid: z.string().optional().nullable(),
  template_critical: z.string().optional().nullable(),
});

