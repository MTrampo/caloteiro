import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  nickname: z
    .string()
    .trim()
    .max(50, "Apelido deve ter no máximo 50 caracteres.")
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

export const updateEmailSchema = z.object({
  newEmail: z.email("Digite um e-mail válido para a conta."),
});

export const updatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "A confirmação deve ter pelo menos 6 caracteres."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const confirmUpdatePasswordOtpSchema = z
  .object({
    code: z.string().length(8, "O código de segurança deve ter 8 dígitos."),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "A confirmação deve ter pelo menos 6 caracteres."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const confirmEmailChangeOtpSchema = z.object({
  newEmail: z.email("Digite um e-mail válido para a conta."),
  code: z.string().length(8, "O código de confirmação deve ter 8 dígitos."),
});

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .refine((val) => val.toUpperCase() === "EXCLUIR", {
      message: 'Digite a palavra "EXCLUIR" em maiúsculas para confirmar.',
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ConfirmUpdatePasswordOtpInput = z.infer<typeof confirmUpdatePasswordOtpSchema>;
export type ConfirmEmailChangeOtpInput = z.infer<typeof confirmEmailChangeOtpSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

