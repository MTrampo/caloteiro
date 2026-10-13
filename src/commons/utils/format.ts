/**
 * Partículas e preposições que devem permanecer em caixa baixa em nomes próprios em português
 * exceto quando são a primeira palavra.
 */
const LOWERCASE_PARTICLES = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "para",
  "por",
  "com",
]);

/**
 * Formata nomes próprios e apelidos seguindo as regras da língua portuguesa:
 * - Primeira letra de cada nome em maiúscula
 * - Partículas de ligação (da, de, do, dos, das, e, etc.) em minúsculo
 * - Preserva acentuação (ex: Ramon Antônio da Silva, Leticia de Oliveira, Rafaela dos Santos)
 */
export function formatProperName(name?: string | null): string {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";

  const words = trimmed.split(/\s+/);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      // Se não for a primeira palavra e estiver no conjunto de partículas, mantém em minúsculo
      if (index > 0 && LOWERCASE_PARTICLES.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * Alias mantido para compatibilidade com partes existentes do sistema
 */
export const formatCaseName = formatProperName;

/**
 * Extrai as iniciais do nome de forma limpa para exibição em avatares (máx 2 caracteres)
 * Ex: "Vinicius Lopes" -> "VL", "Ramon Antônio da Silva" -> "RS", "Tubarão" -> "TU"
 */
export function getNameInitials(name?: string | null, fallback = "TB"): string {
  if (!name || typeof name !== "string") return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCurrency(valueInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

export const formatCurrencyBRL = formatCurrency;

/**
 * Formata um valor numérico em reais (ex: 1200.50 -> R$ 1.200,50)
 */
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Formata datas garantindo que strings ISO YYYY-MM-DD não sofram desvio de fuso horário
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  try {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  } catch {
    return dateString;
  }
}

/**
 * Formata data e hora para extratos e histórico de auditoria
 */
export function formatDateTime(dateTimeString?: string | null): string {
  if (!dateTimeString) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateTimeString));
  } catch {
    return dateTimeString;
  }
}

/**
 * Formata telefone brasileiro para exibição amigável
 * Ex: "11987654321" -> "(11) 98765-4321"
 */
export function formatDisplayPhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

import type {
  DebtorItem,
  DebtorItemFormatted,
  DebtorRelationshipEnum,
} from "@/commons/models/debtor";
import { DEBTOR_RELATIONSHIP_METADATA } from "@/commons/models/debtor";
import type { Profile, ProfileFormatted } from "@/commons/models/user";

/**
 * Presenter que transforma uma entidade pura de devedor em DebtorItemFormatted,
 * antecipando todas as formatações para evitar processamento na UI.
 */
export function presentDebtorItem(debtor: DebtorItem): DebtorItemFormatted {
  const formattedName = formatProperName(debtor.name);
  const formattedNickname = debtor.nickname ? formatProperName(debtor.nickname) : null;
  const cleanPhone = (debtor.phone || "").replace(/\D/g, "");
  const displayPhone = formatDisplayPhone(debtor.phone);

  const whatsAppMessage = `Fala ${formattedName}, tudo bem? Passando para ver como estão as pendências que combinamos.`;
  const whatsAppUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsAppMessage)}`;

  const rel = debtor.relationship as DebtorRelationshipEnum;
  const relationshipMeta = DEBTOR_RELATIONSHIP_METADATA[rel] || {
    label: "Outro",
    desc: "Indivíduo avulso na praça",
  };

  return {
    ...debtor,
    formattedName,
    formattedNickname,
    cleanPhone,
    displayPhone,
    whatsAppUrl,
    relationshipLabel: relationshipMeta.label,
    relationshipDesc: relationshipMeta.desc,
  };
}

/**
 * Presenter para coleções de devedores
 */
export function presentDebtorsList(debtors: DebtorItem[]): DebtorItemFormatted[] {
  return debtors.map(presentDebtorItem);
}

/**
 * Presenter que higieniza e formata o perfil do usuário para UI
 */
export function presentProfile(
  profile: Profile,
  planName = "Tubarão Lixa",
  planSlug = "tubarao-lixa"
): ProfileFormatted {
  const formattedName = formatProperName(profile.name || "Tubarão");
  const formattedNickname = profile.nickname ? formatProperName(profile.nickname) : null;

  // Nome prioritário para exibição: Apelido > Nome Completo formatado > "Tubarão"
  const displayName = formattedNickname || formattedName || "Tubarão";

  return {
    id: profile.id,
    email: profile.email || "",
    name: formattedName,
    nickname: formattedNickname,
    displayName,
    avatarUrl: profile.avatar_url || null,
    phone: formatDisplayPhone(profile.phone),
    planName,
    planSlug,
  };
}
