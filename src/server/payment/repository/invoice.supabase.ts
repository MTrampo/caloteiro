import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { InvoiceInsertPayload, InvoiceUpdatePayload, Invoice } from "@/commons/models/payment";

async function getClient() {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return internalSupabase();
    }
  } catch {}
  return await serverSupabase();
}

export const upsertInvoiceSupabase = async (payload: InvoiceInsertPayload) => {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("invoices")
    .upsert(payload, { onConflict: "mp_invoice_id" })
    .select("id")
    .single();

  return { data, error };
};

export const getInvoicesByUserIdSupabase = async (userId: string): Promise<Invoice[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("invoices")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as unknown as Invoice[];
};

export const getInvoiceByMpInvoiceIdSupabase = async (mpInvoiceId: string) => {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("invoices")
    .select()
    .eq("mp_invoice_id", mpInvoiceId)
    .single();

  return { data, error };
};

export const updateInvoiceByMpInvoiceIdSupabase = async (
  mpInvoiceId: string,
  payload: InvoiceUpdatePayload
) => {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("invoices")
    .update(payload)
    .eq("mp_invoice_id", mpInvoiceId)
    .select("id")
    .single();

  return { data, error };
};
