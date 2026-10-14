/**
 * Utilitários puros de máscaras e formatação em tempo real para inputs de formulário
 */

/**
 * Remove qualquer caractere que não seja dígito
 */
export function unmaskDigits(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Aplica máscara de telefone brasileiro:
 * - Até 10 dígitos: (XX) XXXX-XXXX (fixo)
 * - 11 dígitos: (XX) XXXXX-XXXX (celular)
 */
export function maskPhone(value?: string | null): string {
  if (!value) return "";
  const digits = unmaskDigits(value).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCpf(value?: string | null): string {
  if (!value) return "";
  const digits = unmaskDigits(value).slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Aplica máscara de CNPJ: 00.000.000/0001-00
 */
export function maskCnpj(value?: string | null): string {
  if (!value) return "";
  const digits = unmaskDigits(value).slice(0, 14);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Aplica máscara inteligente para documento (CPF se <= 11 dígitos, CNPJ se maior)
 */
export function maskDocument(value?: string | null): string {
  if (!value) return "";
  const digits = unmaskDigits(value);
  return digits.length > 11 ? maskCnpj(digits) : maskCpf(digits);
}

/**
 * Aplica máscara contextual de chave Pix de acordo com o tipo selecionado:
 * - "cpf": 000.000.000-00
 * - "cnpj": 00.000.000/0001-00
 * - "phone" | "celular": (XX) XXXXX-XXXX
 * - "email": minúsculas e sem espaços
 * - outros ("random", etc.): texto padrão
 */
export function maskPixKey(value?: string | null, type?: string | null): string {
  if (!value) return "";
  const normalizedType = (type || "").toLowerCase().trim();

  if (normalizedType === "cpf") {
    return maskCpf(value);
  }
  if (normalizedType === "cnpj") {
    return maskCnpj(value);
  }
  if (normalizedType === "phone" || normalizedType === "celular") {
    return maskPhone(value);
  }
  if (normalizedType === "email") {
    return value.trim().toLowerCase();
  }
  return value;
}

/**
 * Formata um valor numérico ou string de dígitos em formato monetário de exibição (ex: "1.250,50")
 */
export function maskCurrency(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "";
  
  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const digits = unmaskDigits(value);
  if (!digits) return "";

  const cents = Number(digits);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte uma string formatada em moeda brasileira (ex: "1.250,50" ou "R$ 1.250,50") em número decimal puro (ex: 1250.50)
 */
export function parseCurrencyToNumber(value?: string | null): number {
  if (!value) return 0;
  const digits = unmaskDigits(value);
  if (!digits) return 0;
  return Number(digits) / 100;
}

