import { SubscriptionFlow } from "@/features/subscription";
import { getActivePlansSupabase, getSubscriptionByUserIdSupabase } from "@/server/account/repository/subscription.supabase";
import { serverSupabase } from "@/commons/lib/supabase/server";
import Header from "@/components/header/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arsenal de Planos — Caloteiro",
  description: "Selecione seu plano para gerenciar devedores e cobranças.",
};

export default async function AssinaturaPage() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [plans, currentSubscription] = await Promise.all([
    getActivePlansSupabase(),
    user ? getSubscriptionByUserIdSupabase(user.id) : null,
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Header title="Arsenal de Planos" />
      <main className="flex-1">
        <SubscriptionFlow
          plans={plans}
          currentSubscriptionPlanSlug={currentSubscription?.plan?.slug || null}
        />
      </main>
    </div>
  );
}

