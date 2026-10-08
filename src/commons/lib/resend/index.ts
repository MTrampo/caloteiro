import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder_for_build'
export const resend = new Resend(resendApiKey)
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || 'Luluzinha <notificacoes@meutrampo.dev.br>'
