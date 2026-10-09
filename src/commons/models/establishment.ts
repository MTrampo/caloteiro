export interface Establishment {
  id: string;
  name: string;
  slug?: string;
}

export function establishmentsFormatter(data: unknown): Establishment[] {
  if (Array.isArray(data)) {
    return data as Establishment[];
  }
  return [];
}

