import "server-only";

import { unstable_cache } from "next/cache";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import { CACHE_TAGS } from "@/commons/lib/cache/server-cache";
import { getCalendarDateInSaoPaulo, getSecondsUntilMidnightSaoPaulo } from "@/commons/utils/date";
import { decryptSensitiveData } from "@/server/account/service/encryption.api";
import type { DebtRow, InstallmentRow, DebtPaymentRow, DebtExcuseRow } from "@/commons/models/debt";
import type { DebtorItem } from "@/commons/models/debtor";

export interface GrottoDebtWithRelationsRow extends DebtRow {
  debtor: DebtorItem | null;
  installments: InstallmentRow[];
}

export interface UserGrottoDataset {
  debts: GrottoDebtWithRelationsRow[];
  debtors: DebtorItem[];
  payments: DebtPaymentRow[];
  excuses: DebtExcuseRow[];
  creditorPixKey: string | null;
  referenceDateSaoPaulo: string;
}

/**
 * Nível 1: Grafo Base Compartilhado da Gruta do Tubarão.
 * Consulta uma única vez no Supabase as tabelas principais da conta e armazena em cache
 * associado à tag mestre 'user-data:{userId}'.
 * 
 * Este dataset é consumido de forma compartilhada por todas as telas do painel:
 * Central (Ocorrências), Acompanhamento de Dívidas, Inteligência Financeira e Motor de Risco.
 */
export async function getCachedUserGrottoDataset(userId: string): Promise<UserGrottoDataset> {
  const todayStr = getCalendarDateInSaoPaulo(new Date());
  const ttlSeconds = getSecondsUntilMidnightSaoPaulo();

  const fetcher = unstable_cache(
    async (): Promise<UserGrottoDataset> => {
      const supabase = internalSupabase();

      const [debtsRes, debtorsRes, paymentsRes, excusesRes, settingsRes] = await Promise.all([
        supabase
          .from("debts")
          .select(`
            *,
            debtor:debtors(*),
            installments(*)
          `)
          .eq("user_id", userId)
          .neq("status", "cancelled")
          .order("created_at", { ascending: false }),
        supabase
          .from("debtors")
          .select("*")
          .eq("user_id", userId)
          .eq("is_archived", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("debt_payments")
          .select("*")
          .eq("user_id", userId)
          .order("paid_at", { ascending: false }),
        supabase
          .from("debt_excuses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("creditor_settings")
          .select("pix_key")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      const rawDebtors = (debtorsRes.data as DebtorItem[]) || [];
      const sanitizedDebtors: DebtorItem[] = rawDebtors.map((d) => ({
        ...d,
        document: decryptSensitiveData(d.document),
        pix_key: decryptSensitiveData(d.pix_key),
      }));

      // Garante devedores associados às dívidas com dados sensíveis higienizados
      const debtsWithDecryptedDebtors = ((debtsRes.data || []) as unknown as GrottoDebtWithRelationsRow[]).map(
        (debt) => {
          if (!debt.debtor) return debt;
          return {
            ...debt,
            debtor: {
              ...debt.debtor,
              document: decryptSensitiveData(debt.debtor.document),
              pix_key: decryptSensitiveData(debt.debtor.pix_key),
            },
          };
        }
      );

      const creditorPixKey = decryptSensitiveData(settingsRes.data?.pix_key) || null;

      return {
        debts: debtsWithDecryptedDebtors,
        debtors: sanitizedDebtors,
        payments: (paymentsRes.data as DebtPaymentRow[]) || [],
        excuses: (excusesRes.data as DebtExcuseRow[]) || [],
        creditorPixKey,
        referenceDateSaoPaulo: todayStr,
      };
    },
    ["user-grotto-dataset", userId, todayStr],
    {
      revalidate: ttlSeconds,
      tags: [CACHE_TAGS.userData(userId)],
    }
  );

  return fetcher();
}

