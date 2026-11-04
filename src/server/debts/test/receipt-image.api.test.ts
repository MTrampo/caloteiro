import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { compressReceiptImage } from "../service/receipt-image.api";

describe("Compressão de Imagens de Comprovantes com sharp (receipt-image.api.ts)", () => {
  it("deve converter e comprimir imagem PNG para WebP reduzindo tamanho", async () => {
    // Cria uma imagem sintética PNG de 500x500 pixels simulando um comprovante
    const testPngBuffer = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await compressReceiptImage(testPngBuffer, "image/png");

    expect(result.contentType).toBe("image/webp");
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.sizeBytes).toBeGreaterThan(0);

    // Valida que o buffer resultante é um WebP legível pelo sharp
    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(500);
    expect(metadata.height).toBe(500);
  });

  it("deve redimensionar imagens grandes acima do limite de 1200x1600 mantendo proporção", async () => {
    // Imagem 2000x3000 (print de celular em alta resolução)
    const largeBuffer = await sharp({
      create: {
        width: 2000,
        height: 3000,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await compressReceiptImage(largeBuffer, "image/jpeg", {
      maxWidth: 1200,
      maxHeight: 1600,
    });

    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBeLessThanOrEqual(1200);
    expect(metadata.height).toBeLessThanOrEqual(1600);
  });

  it("deve rejeitar MIME types não autorizados (ex: application/pdf, text/plain ou image/webp)", async () => {
    const fakeBuffer = Buffer.from("not an image");
    await expect(
      compressReceiptImage(fakeBuffer, "application/pdf")
    ).rejects.toThrow("Formato de imagem inválido");

    // Valida que o upload não aceita WebP direto (apenas PNG, JPG e JPEG na entrada)
    await expect(
      compressReceiptImage(fakeBuffer, "image/webp")
    ).rejects.toThrow("Apenas comprovantes em PNG, JPG ou JPEG são permitidos");
  });
});

