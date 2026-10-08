import { COOKIE_SIGNING_SECRET } from '@/commons/constants/env'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

/**
 * Gera a chave secreta dinâmica combinando a chave do servidor com o ID do usuário.
 * O userId é estritamente obrigatório.
 */
export function getUserCookieSecret(userId?: string | null): string {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    throw new Error('[SECURITY_ERROR] Identificador de usuário (userId) obrigatório para derivação do segredo de cookie.')
  }
  return `${COOKIE_SIGNING_SECRET}:uid:${userId.trim()}`
}



function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const keyData = textEncoder.encode(secret)
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Assina um payload qualquer gerando um token HMAC-SHA256 no formato `payloadEncoded.signatureEncoded`
 */
export async function signSecureCookie<T>(payload: T, secret: string): Promise<string> {
  const payloadJson = JSON.stringify(payload)
  const payloadEncoded = base64UrlEncode(textEncoder.encode(payloadJson))
  const key = await getHmacKey(secret)
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(payloadEncoded)
  )
  const signatureEncoded = base64UrlEncode(signatureBuffer)
  return `${payloadEncoded}.${signatureEncoded}`
}

/**
 * Verifica a assinatura HMAC-SHA256 de um token de cookie e retorna o payload decodificado se válido.
 * Retorna null se a assinatura for inválida, expirada ou adulterada.
 */
export async function verifySecureCookie<T>(token: string | null | undefined, secret: string): Promise<T | null> {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadEncoded, signatureEncoded] = parts
  if (!payloadEncoded || !signatureEncoded) return null

  try {
    const key = await getHmacKey(secret)
    const signatureBytes = base64UrlDecode(signatureEncoded)
    const dataBytes = textEncoder.encode(payloadEncoded)
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    )

    if (!isValid) {
      return null
    }

    const payloadBytes = base64UrlDecode(payloadEncoded)
    const payloadJson = textDecoder.decode(payloadBytes)
    return JSON.parse(payloadJson) as T
  } catch {
    return null
  }
}

