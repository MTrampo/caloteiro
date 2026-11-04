import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/header/dashboard";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getDebtorRaioXApi } from "@/server/debtors/service/risk-score.api";
import { DebtorProfileView } from "@/features/debtors/debtor-profile-view";

interface DebtorProfilePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Raio-X da Presa — Caloteiro",
  description: "Velocímetro biológico, score de risco e histórico comportamental da presa na gruta.",
};

export default async function DebtorProfilePage({ params }: DebtorProfilePageProps) {
  const { id } = await params;

  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;
  if (!userId) {
    redirect("/entrar");
  }

  const res = await getDebtorRaioXApi(id, userId);

  if (res.error === "PLAN_UPGRADE_REQUIRED") {
    redirect("/painel/devedores");
  }

  if (!res.data) {
    notFound();
  }

  return (
    <>
      <Header title="Raio-X da Presa" />
      <DebtorProfileView data={res.data} />
    </>
  );
}

