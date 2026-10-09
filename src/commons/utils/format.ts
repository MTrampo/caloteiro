export function formatCaseName(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatCurrency(valueInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

export const formatCurrencyBRL = formatCurrency;

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  } catch {
    return dateString;
  }
}

