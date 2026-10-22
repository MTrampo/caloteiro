import "server-only";

import { randomUUID } from "crypto";
import { serverSupabase } from "@/commons/lib/supabase/server";

const RECEIPTS_BUCKET = "receipts";
const SIGNED_URL_EXPIRES_IN_SECONDS = 3600; // 1 hora de acesso seguro

export interface UploadReceiptStorageParams {
  userId: string;
  folder: "loan" | "payment";
  buffer: Buffer;
}

/**
 * Faz o upload de um comprovante já comprimido em WebP para o bucket seguro 'receipts'.
 * O caminho é isolado pelo UID do usuário: `${userId}/${folder}/${uuid}.webp`.
 */
export async function uploadReceiptWebpSupabase(
  params: UploadReceiptStorageParams
): Promise<{ path: string | null; error: string | null }> {
  const supabase = await serverSupabase();
  const fileId = randomUUID();
  const path = `${params.userId}/${params.folder}/${fileId}.webp`;

  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, params.buffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    console.error("[uploadReceiptWebpSupabase] Erro no upload:", error);
    return { path: null, error: error.message };
  }

  return { path, error: null };
}

/**
 * Cria URLs assinadas em lote para um conjunto de caminhos no bucket de comprovantes.
 * Retorna um Map<caminho, signedUrl>.
 */
export async function createSignedReceiptUrlsSupabase(
  paths: string[]
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const validPaths = Array.from(new Set(paths.filter(Boolean)));
  if (validPaths.length === 0) return urlMap;

  const supabase = await serverSupabase();
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrls(validPaths, SIGNED_URL_EXPIRES_IN_SECONDS);

  if (error || !data) {
    console.error("[createSignedReceiptUrlsSupabase] Erro ao assinar URLs:", error);
    return urlMap;
  }

  for (const item of data) {
    if (item.path && item.signedUrl) {
      urlMap.set(item.path, item.signedUrl);
    }
  }

  return urlMap;
}

/**
 * Remove um comprovante do storage quando substituído ou descartado
 */
export async function deleteReceiptFileSupabase(
  path: string
): Promise<{ success: boolean; error: string | null }> {
  if (!path) return { success: true, error: null };

  const supabase = await serverSupabase();
  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).remove([path]);

  if (error) {
    console.error("[deleteReceiptFileSupabase] Erro ao deletar arquivo:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
