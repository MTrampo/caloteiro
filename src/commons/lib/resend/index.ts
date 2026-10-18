import "server-only";

import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from "@/commons/constants/env";

export const resend = new Resend(RESEND_API_KEY);

export const EMAIL_FROM = RESEND_FROM_EMAIL.includes("<")
  ? RESEND_FROM_EMAIL
  : `Caloteiro <${RESEND_FROM_EMAIL.trim()}>`;
