import { describe, it, expect } from "vitest";
import {
  encryptSensitiveData,
  decryptSensitiveData,
  isEncrypted,
  maskSensitiveDocument,
} from "../service/encryption.api";

describe("Serviço de Criptografia de Dados Sensíveis (encryption.api.ts)", () => {
  it("deve criptografar e descriptografar um CPF com sucesso via AES-256-GCM", () => {
    const rawCpf = "123.456.789-00";
    const encrypted = encryptSensitiveData(rawCpf);

    expect(encrypted).not.toBeNull();
    expect(encrypted).toContain("enc:v1:");
    expect(encrypted).not.toBe(rawCpf);
    expect(isEncrypted(encrypted)).toBe(true);

    const decrypted = decryptSensitiveData(encrypted);
    expect(decrypted).toBe(rawCpf);
  });

  it("deve criptografar e descriptografar uma chave Pix com sucesso", () => {
    const rawPixKey = "tubarao.financeiro@caloteiro.com.br";
    const encrypted = encryptSensitiveData(rawPixKey);

    expect(encrypted).not.toBeNull();
    expect(encrypted).toContain("enc:v1:");

    const decrypted = decryptSensitiveData(encrypted);
    expect(decrypted).toBe(rawPixKey);
  });

  it("deve gerar ciphertexts diferentes para o mesmo dado (segurança semântica com IV aleatório)", () => {
    const document = "987.654.321-99";
    const enc1 = encryptSensitiveData(document);
    const enc2 = encryptSensitiveData(document);

    expect(enc1).not.toBe(enc2);
    expect(decryptSensitiveData(enc1)).toBe(document);
    expect(decryptSensitiveData(enc2)).toBe(document);
  });

  it("não deve tentar criptografar duplamente um dado que já está criptografado", () => {
    const text = "11987654321";
    const enc1 = encryptSensitiveData(text);
    const enc2 = encryptSensitiveData(enc1);

    expect(enc1).toBe(enc2);
    expect(decryptSensitiveData(enc2)).toBe(text);
  });

  it("deve retornar null de forma segura para entradas nulas, vazias ou indefinidas", () => {
    expect(encryptSensitiveData(null)).toBeNull();
    expect(encryptSensitiveData(undefined)).toBeNull();
    expect(encryptSensitiveData("")).toBeNull();
    expect(encryptSensitiveData("   ")).toBeNull();

    expect(decryptSensitiveData(null)).toBeNull();
    expect(decryptSensitiveData(undefined)).toBeNull();
    expect(decryptSensitiveData("")).toBeNull();
    expect(decryptSensitiveData("   ")).toBeNull();
  });

  it("deve manter retrocompatibilidade com dados legados gravados em texto puro", () => {
    const legacyPlainCpf = "555.444.333-22";
    expect(isEncrypted(legacyPlainCpf)).toBe(false);

    // O decriptador deve retornar o próprio texto puro sem erro
    const result = decryptSensitiveData(legacyPlainCpf);
    expect(result).toBe(legacyPlainCpf);
  });

  it("deve rejeitar e retornar null caso o ciphertext tenha sido adulterado ou corrompido", () => {
    const encrypted = encryptSensitiveData("chave-secreta-pix")!;
    // Altera o último caractere do ciphertext
    const tampered = encrypted.slice(0, -2) + "ff";

    const result = decryptSensitiveData(tampered);
    expect(result).toBeNull();
  });

  it("deve mascarar documento CPF formatando dígitos centrais", () => {
    const cpf = "123.456.789-00";
    const masked = maskSensitiveDocument(cpf);
    expect(masked).toBe("***.456.789-**");

    const encryptedCpf = encryptSensitiveData(cpf);
    const maskedFromEncrypted = maskSensitiveDocument(encryptedCpf);
    expect(maskedFromEncrypted).toBe("***.456.789-**");
  });
});

