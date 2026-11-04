import "server-only";

import { randomUUID } from "crypto";
import { unstable_cache } from "next/cache";
import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";

const RECEIPTS_BUCKET = "receipts";
// 24 horas de validade para manter a estabilidade no cache diário
export const SIGNED_URL_EXPIRES_IN_SECONDS = 86400;

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
 * Cria URLs assinadas em lote diretamente com o cliente interno do Supabase.
 */
export async function createSignedReceiptUrlsSupabase(
  paths: string[]
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const validPaths = Array.from(new Set(paths.filter(Boolean)));
  if (validPaths.length === 0) return urlMap;

  const supabase = internalSupabase();
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
 * Versão cacheada para obtenção de URLs assinadas.
 * Evita chamadas repetidas de assinatura de comprovantes durante o ciclo diário.
 */
export async function getCachedSignedReceiptUrlsSupabase(
  scopeId: string,
  paths: string[],
  tags: string[] = []
): Promise<Map<string, string>> {
  const validPaths = Array.from(new Set(paths.filter(Boolean))).sort();
  if (validPaths.length === 0) return new Map();

  const serializedPaths = validPaths.join("|");
  const cacheKey = ["signed-receipt-urls", scopeId, serializedPaths];

  const fetcher = unstable_cache(
    async () => {
      const supabase = internalSupabase();
      const { data, error } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .createSignedUrls(validPaths, SIGNED_URL_EXPIRES_IN_SECONDS);

      if (error || !data) {
        console.error("[getCachedSignedReceiptUrlsSupabase] Erro ao assinar URLs:", error);
        return {} as Record<string, string>;
      }

      const mapObj: Record<string, string> = {};
      for (const item of data) {
        if (item.path && item.signedUrl) {
          mapObj[item.path] = item.signedUrl;
        }
      }
      return mapObj;
    },
    cacheKey,
    {
      revalidate: SIGNED_URL_EXPIRES_IN_SECONDS,
      tags,
    }
  );

  const obj = await fetcher();
  const resultMap = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    resultMap.set(k, v);
  }
  return resultMap;
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
