import "server-only";

import sharp from "sharp";

export interface CompressReceiptOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressedReceipt {
  buffer: Buffer;
  contentType: string;
  sizeBytes: number;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

/**
 * Valida o arquivo de imagem (apenas PNG, JPG, JPEG) e converte/comprime utilizando sharp
 * para WebP altamente otimizado (~35KB). Descarta EXIF/metadados, rotaciona automaticamente
 * e redimensiona preservando a proporção.
 */
export async function compressReceiptImage(
  inputBuffer: Buffer,
  mimeType: string,
  options?: CompressReceiptOptions
): Promise<CompressedReceipt> {
  const normalizedMime = mimeType.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new Error(
      "Formato de imagem inválido. Apenas comprovantes em PNG, JPG ou JPEG são permitidos."
    );
  }

  const maxWidth = options?.maxWidth ?? 1200;
  const maxHeight = options?.maxHeight ?? 1600;
  const quality = options?.quality ?? 75;

  const pipeline = sharp(inputBuffer)
    .rotate() // auto-rotaciona e descarta EXIF / metadados
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 6,
      smartSubsample: true,
      alphaQuality: 80,
    });

  const buffer = await pipeline.toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    sizeBytes: buffer.length,
  };
}

