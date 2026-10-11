import { HttpStatusEnum } from "@/commons/enums/http";

export function resolveAuthError(errorCode?: string): { message: string; status: HttpStatusEnum } {
  switch (errorCode) {
    case "invalid_credentials":
    case "invalid_grant":
      return {
        message: "E-mail ou senha incorretos. Confere aí ou recupera a senha antes de acusar o sistema.",
        status: HttpStatusEnum.Unauthorized,
      };
    case "user_not_found":
      return {
        message: "Nenhuma conta encontrada com este e-mail. Quer criar uma nova?",
        status: HttpStatusEnum.NotFound,
      };
    case "user_already_exists":
      return {
        message: "Esse e-mail já está cadastrado. Que tal fazer login?",
        status: HttpStatusEnum.Conflict,
      };
    case "weak_password":
      return {
        message: "Senha muito fraca! Coloque pelo menos 6 caracteres para proteger seu radar de calotes.",
        status: HttpStatusEnum.BadRequest,
      };
    case "over_request_rate_limit":
      return {
        message: "Calma aí, afobado! Muitas tentativas em pouco tempo. Espere alguns instantes.",
        status: HttpStatusEnum.Forbidden,
      };
    case "otp_expired":
    case "invalid_otp":
      return {
        message: "Código de confirmação inválido ou expirado. Solicite um novo.",
        status: HttpStatusEnum.BadRequest,
      };
    case "email_not_confirmed":
      return {
        message: "Seu e-mail ainda não foi confirmado. Digite o código de 8 dígitos para validar seu acesso.",
        status: HttpStatusEnum.Forbidden,
      };
    default:
      return {
        message: "Não foi possível concluir a autenticação. Tente novamente em instantes.",
        status: HttpStatusEnum.InternalServerError,
      };
  }
}

