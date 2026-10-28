export const ROUTE_ENTRAR = "/entrar";
export const ROUTE_CADASTRAR = "/cadastrar";
export const ROUTE_PAINEL = "/painel";
export const ROUTE_ASSINATURA = "/assinatura";
export const ROUTE_CONVITE = "/convite";
export const ROUTE_FATURA = "/fatura";
export const ROUTE_DOCUMENTOS = "/documentos";


export const PUBLIC_PATHS = [
  "/",
  ROUTE_ENTRAR,
  ROUTE_CADASTRAR,
  "/esqueci-senha",
  "/redefinir-senha",
  "/auth/callback",
] as const;

export const AUTH_PATHS = [
  ROUTE_ENTRAR,
  ROUTE_CADASTRAR,
] as const;

export const PUBLIC_API_ROUTES = [
  "/api/webhooks",
  "/api/health",
] as const;

export const SUBSCRIPTION_GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 dias de tolerância
export const PROFILE_STORAGE_KEY = "caloteiro_profile_storage";
export const DEFAULT_BRAND_NAME = "Caloteiro";
export const INVITATION_COOKIE_KEY = "caloteiro_invite_token";
export const INVITATION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const DEBT_INVOICE_COOKIE_PREFIX = "caloteiro_fatura_access_";
export const DEBT_INVOICE_COOKIE_MAX_AGE_SECONDS = 2 * 60 * 60; // 2 horas
export const MERCADOPAGO_TIMESTAMP_TOLERANCE_SECONDS = 300;

