export function toIsoOrNull(date: unknown): string | null {
  if (!date) return null;
  try {
    const d = new Date(date as string | number | Date);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nowBrazilIso(): string {
  return new Date().toISOString();
}
