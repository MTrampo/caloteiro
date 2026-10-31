export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const SUB_SECRET_KEY = process.env.SUB_SECRET || "caloteiro_sub_secret";
export const COOKIE_SIGNING_SECRET = process.env.COOKIE_SIGNING_SECRET || "caloteiro_cookie_secret";
export const IS_DEV = process.env.NODE_ENV === "development" || process.env.ENVIRONMENT === "development";
export const MP_EMAIL_COMPRADOR_TEST = process.env.MP_EMAIL_COMPRADOR_TEST;
export const DEV_TUNNEL_URL = process.env.DEV_TUNNEL_URL;
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_placeholder_for_build";
export const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Caloteiro <naoresponda@meutrampo.dev.br>";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

