import crypto from 'node:crypto';
import { secret } from './server';
import { MERCADOPAGO_TIMESTAMP_TOLERANCE_SECONDS } from '@/commons/constants';

function parseSignature(header: string) {
  const parts = header.split(',').map(p => p.trim());
  const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
  const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];
  return { ts, v1 };
}

export type VerifyResult =
  | { ok: true; dataId: string; requestId: string }
  | { ok: false; status: number; error: string };

/**
 * Verifica a assinatura enviada pelo Mercado Pago.
 * - headers: objeto Headers (request.headers)
 * - rawUrl: request.url (string) para extrair query param `data.id`
 * - secret: seu secret do Mercado Pago
 */
export function verifyMercadoPagoSignature(headers: Headers, rawUrl: string): VerifyResult {
  const xSignature = headers.get('x-signature');
  const requestId = headers.get('x-request-id');

  if (!xSignature || !secret) {
    return { ok: false, status: 401, error: 'Solicitação não autorizada' };
  }

  const url = new URL(rawUrl);
  const dataIdFromUrl = url.searchParams.get('data.id') || url.searchParams.get('id');

  if (!requestId || !dataIdFromUrl) {
    return { ok: false, status: 400, error: 'Missing required webhook identifiers' };
  }

  const { ts, v1 } = parseSignature(xSignature);
  if (!ts || !v1) {
    return { ok: false, status: 400, error: 'Formato de assinatura inválido' };
  }

  // Normaliza timestamp (mp pode enviar ms ou s)
  const now = Math.floor(Date.now() / 1000);
  let tsNum = Number(ts);
  if (Number.isNaN(tsNum)) return { ok: false, status: 400, error: 'Timestamp inválido' };
  if (ts.length > 10) tsNum = Math.floor(tsNum / 1000);
  if (Math.abs(now - tsNum) > MERCADOPAGO_TIMESTAMP_TOLERANCE_SECONDS) {
    return { ok: false, status: 400, error: 'Timestamp fora do intervalo permitido' };
  }

  // Monta manifesto exatamente como o Mercado Pago assinou (usa o ts original como string)
  const manifest = `id:${dataIdFromUrl};request-id:${requestId};ts:${ts};`;

  // Calcula HMAC local
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const localHashHex = hmac.digest('hex');

  // Comparação segura
  let remoteBuf: Buffer;
  try {
    remoteBuf = Buffer.from(v1, 'hex');
  } catch (e) {
    return { ok: false, status: 400, error: 'Hash remoto inválido' };
  }

  const localBuf = Buffer.from(localHashHex, 'hex');
  if (localBuf.length !== remoteBuf.length || !crypto.timingSafeEqual(localBuf, remoteBuf)) {
    return { ok: false, status: 401, error: 'Invalid Signature' };
  }

  return { ok: true, dataId: dataIdFromUrl, requestId };
}
