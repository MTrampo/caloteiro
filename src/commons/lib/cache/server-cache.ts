import { updateTag, revalidateTag, revalidatePath } from "next/cache";

export const CACHE_TAGS = {
  userData: (userId: string) => `user-data:${userId}`,
  userSettings: (userId: string) => `user-settings:${userId}`,
  debtDetails: (debtId: string) => `debt-details:${debtId}`,
  debtReceipts: (debtId: string) => `debt-receipts:${debtId}`,
  debtorDetails: (debtorId: string) => `debtor-details:${debtorId}`,
} as const;

export interface InvalidateUserDataCacheParams {
  userId: string;
  debtId?: string;
  debtorId?: string;
}

/**
 * Invalida o cache mestre de dados do Tubarão e tags granulares relacionadas.
 * Utiliza updateTag para garantia estrita de read-your-own-writes no Next.js 16 (Server Actions),
 * com fallback seguro para revalidateTag e revalidatePath do layout do painel.
 */
export function invalidateUserDataCache(params: InvalidateUserDataCacheParams): void {
  const { userId, debtId, debtorId } = params;
  if (!userId) return;

  const masterTag = CACHE_TAGS.userData(userId);

  try {
    // 1. Invalidação imediata para Server Actions (read-your-own-writes no Next.js 16)
    if (typeof updateTag === "function") {
      updateTag(masterTag);
      if (debtId) {
        updateTag(CACHE_TAGS.debtDetails(debtId));
        updateTag(CACHE_TAGS.debtReceipts(debtId));
      }
      if (debtorId) {
        updateTag(CACHE_TAGS.debtorDetails(debtorId));
      }
    }
  } catch {
    // Caso chamado fora de uma Server Action direta (ex: rotas de API/webhook),
    // aplicamos revalidateTag com expiração imediata
    try {
      if (typeof revalidateTag === "function") {
        revalidateTag(masterTag, { expire: 0 });
        if (debtId) {
          revalidateTag(CACHE_TAGS.debtDetails(debtId), { expire: 0 });
          revalidateTag(CACHE_TAGS.debtReceipts(debtId), { expire: 0 });
        }
        if (debtorId) {
          revalidateTag(CACHE_TAGS.debtorDetails(debtorId), { expire: 0 });
        }
      }
    } catch {
      // Ignora em ambientes de teste sem mock do next/cache
    }
  }

  // 2. Revalida o layout do painel para o Router Cache do App Router
  try {
    if (typeof revalidatePath === "function") {
      revalidatePath("/painel", "layout");
      if (debtId) {
        revalidatePath(`/painel/dividas/${debtId}`, "page");
        revalidatePath(`/fatura/${debtId}`, "page");
      }
      if (debtorId) {
        revalidatePath(`/painel/devedores/${debtorId}`, "page");
      }
    }
  } catch {
    // Ignora em testes unitários sem contexto de requisição
  }
}

