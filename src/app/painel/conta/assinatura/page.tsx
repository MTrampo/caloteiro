import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/header/dashboard";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import {
  getSubscriptionByUserIdSupabase,
  getActivePlansSupabase,
} from "@/server/account/repository/subscription.supabase";
import { getAccountInvoicesApi } from "@/server/account/service/account.api";
import { SubscriptionPageFeature } from "@/features/subscription/subscription-page-feature";

export const metadata: Metadata = {
  title: "Assinatura — Planos & Pagamentos",
  description: "Controle do plano ativo, limites de devedores e histórico de pagamentos no Mercado Pago.",
};

export default async function AssinaturaPage() {
  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;

  if (!userId) {
    redirect("/entrar");
  }

  const [subscription, plans, invoices] = await Promise.all([
    getSubscriptionByUserIdSupabase(userId),
    getActivePlansSupabase(),
    getAccountInvoicesApi(userId),
  ]);

  return (
    <>
      <Header title="Assinatura" />
      <SubscriptionPageFeature
        subscription={subscription}
        plans={plans}
        invoices={invoices}
      />
    </>
  );
}

