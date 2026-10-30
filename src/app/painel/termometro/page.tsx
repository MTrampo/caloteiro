import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/header/dashboard";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getGrottoThermometerDataApi } from "@/server/debtors/service/risk-score.api";
import { RiskThermometerFeature } from "@/features/risk-thermometer";

export const metadata: Metadata = {
  title: "Termômetro da Gruta — Caloteiro",
  description: "Acompanhamento geral do Score de Risco de todos os devedores e diagnóstico da carteira do Tubarão.",
};

export default async function TermometroPage() {
  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;

  if (!userId) {
    redirect("/entrar");
  }

  const res = await getGrottoThermometerDataApi(userId);

  if (res.error === "PLAN_UPGRADE_REQUIRED" || !res.data) {
    redirect("/painel/devedores");
  }

  return (
    <>
      <Header title="Termômetro" />
      <RiskThermometerFeature data={res.data} />
    </>
  );
}

