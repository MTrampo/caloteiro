import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { ResponseProps } from "@/commons/models/api";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";
import { compressReceiptImage } from "./receipt-image.api";
import { uploadReceiptWebpSupabase } from "../repository/receipt-storage.supabase";

const MAX_UPLOAD_FILE_BYTES = 8 * 1024 * 1024; // 8MB na entrada bruta

export interface ProcessReceiptUploadParams {
  userId: string;
  folder: "loan" | "payment";
  file: File;
}

export interface ProcessReceiptUploadResult {
  receiptPath: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * Orquestra o upload seguro de comprovante:
 * 1. Verifica plano do Tubarão (exclusivo para planos com canAttachReceipts / não-grátis).
 * 2. Valida tipo de arquivo e tamanho máximo de 8MB.
 * 3. Converte e comprime para WebP de ~35KB com sharp.
 * 4. Faz upload para o bucket seguro 'receipts'.
 */
export async function uploadDebtReceiptApi(
  params: ProcessReceiptUploadParams
): Promise<ResponseProps<ProcessReceiptUploadResult>> {
  // 1. Verificação de permissões do plano
  const permissions = await getUserPermissionsOrCacheApi(params.userId);
  const canAttach = !permissions.isFreePlan || Boolean(permissions.canAttachReceipts);

  if (!canAttach) {
    return ApiResponse.Forbidden({
      message:
        "O arquivo de provas (anexo de comprovantes) é exclusivo dos planos Tubarão Branco e Tubarão Cabeça Chato! Faça o upgrade para liberar.",
      error: "RECEIPTS_NOT_ALLOWED_ON_PLAN",
    });
  }

  // 2. Validação do arquivo
  if (!params.file || !(params.file instanceof File)) {
    return ApiResponse.BadRequest({
      message: "Nenhum arquivo de imagem foi enviado.",
    });
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(params.file.type.toLowerCase().trim())) {
    return ApiResponse.BadRequest({
      message: "Formato de imagem inválido. Apenas comprovantes em PNG, JPG ou JPEG são permitidos.",
    });
  }

  if (params.file.size > MAX_UPLOAD_FILE_BYTES) {
    return ApiResponse.BadRequest({
      message: "O comprovante deve ter no máximo 8MB.",
    });
  }

  try {
    const arrayBuffer = await params.file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 3. Compressão com sharp
    const compressed = await compressReceiptImage(inputBuffer, params.file.type);

    // 4. Upload no bucket Supabase
    const { path, error } = await uploadReceiptWebpSupabase({
      userId: params.userId,
      folder: params.folder,
      buffer: compressed.buffer,
    });

    if (error || !path) {
      return ApiResponse.InternalError({
        message: "Erro ao salvar o comprovante na Gruta.",
        error: error || undefined,
      });
    }

    return ApiResponse.Ok({
      data: {
        receiptPath: path,
        originalSize: params.file.size,
        compressedSize: compressed.sizeBytes,
      },
      message: "Comprovante otimizado e anexado com sucesso!",
    });
  } catch (err) {
    console.error("[uploadDebtReceiptApi] Erro ao processar comprovante:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao processar imagem do comprovante.";
    return ApiResponse.BadRequest({
      message,
    });
  }
}

