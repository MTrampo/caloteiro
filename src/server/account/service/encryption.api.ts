import "server-only";

import crypto from "node:crypto";

const ENCRYPTION_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Obtém a chave de criptografia de 256 bits (32 bytes) de forma determinística
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.DATA_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "caloteiro-production-encryption-secret-default-seed-32b";

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Verifica se um valor já está criptografado no formato padrão da aplicação
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  return value.startsWith(ENCRYPTION_PREFIX);
}

/**
 * Criptografa um dado sensível (CPF/CNPJ, Chave Pix, etc.) utilizando AES-256-GCM.
 * Retorna null se a entrada for nula ou vazia.
 * Se o dado já estiver criptografado, retorna o próprio valor para evitar dupla encriptação.
 */
export function encryptSensitiveData(
  plaintext: string | null | undefined
): string | null {
  if (!plaintext || typeof plaintext !== "string") {
    return null;
  }

  const trimmed = plaintext.trim();
  if (!trimmed) {
    return null;
  }

  if (isEncrypted(trimmed)) {
    return trimmed;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    let ciphertext = cipher.update(trimmed, "utf8", "hex");
    ciphertext += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");
    const ivHex = iv.toString("hex");

    return `${ENCRYPTION_PREFIX}${ivHex}:${authTag}:${ciphertext}`;
  } catch (error) {
    console.error("[encryptSensitiveData] Erro ao criptografar dado:", error);
    // Em caso de falha crítica na criptografia, não persiste texto puro por segurança
    throw new Error("Falha de segurança ao criptografar dado sensível.");
  }
}

/**
 * Descriptografa um dado sensível utilizando AES-256-GCM.
 * Suporta retrocompatibilidade transparente: se o dado não começar com 'enc:v1:',
 * retorna o próprio valor original (dados legados gravados em texto puro).
 */
export function decryptSensitiveData(
  ciphertext: string | null | undefined
): string | null {
  if (!ciphertext || typeof ciphertext !== "string") {
    return null;
  }

  const trimmed = ciphertext.trim();
  if (!trimmed) {
    return null;
  }

  // Retrocompatibilidade graciosa: dados antigos não criptografados
  if (!isEncrypted(trimmed)) {
    return trimmed;
  }

  try {
    const key = getEncryptionKey();
    const payload = trimmed.slice(ENCRYPTION_PREFIX.length);
    const parts = payload.split(":");

    if (parts.length !== 3) {
      console.warn("[decryptSensitiveData] Formato de encriptação inválido.");
      return trimmed;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[decryptSensitiveData] Falha na descriptografia ou violação de integridade:", error);
    // Retorna string vazia ou valor não-revelado para não expor erro ao usuário
    return null;
  }
}

/**
 * Utilitário de segurança para mascarar CPF/CNPJ em logs ou exibições parciais
 * Ex: '123.456.789-00' -> '***.456.789-**'
 */
export function maskSensitiveDocument(
  doc: string | null | undefined
): string {
  if (!doc) return "Não informado";
  const decrypted = decryptSensitiveData(doc) || doc;
  const digits = decrypted.replace(/\D/g, "");

  if (digits.length === 11) {
    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  }

  if (digits.length === 14) {
    return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/****-**`;
  }

  return "***.***.***-**";
}

