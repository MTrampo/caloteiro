import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/header/dashboard";
import {
  getUserLoggedApi,
  getCurrentUserSessionProfileApi,
} from "@/server/account/service/auth.api";
import { getDebtDetailsApi } from "@/server/debts/service/debt.api";
import { enrichDebtorsWithRiskScoreApi } from "@/server/debtors/service/risk-score.api";
import { DebtDetailsFeature } from "@/features/debts/details/debt-details-feature";

interface DebtDetailsPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Detalhes da Dívida — Caloteiro",
  description: "Acompanhamento minucioso de parcelas, amortizações e desculpas registradas.",
};

export default async function DebtDetailsPage({ params }: DebtDetailsPageProps) {
  const { id } = await params;

  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;
  if (!userId) {
    redirect("/signin");
  }

  const [response, sessionProfile] = await Promise.all([
    getDebtDetailsApi(id, userId),
    getCurrentUserSessionProfileApi(),
  ]);

  if (!response.data) {
    notFound();
  }

  const [enrichedDebtor] = await enrichDebtorsWithRiskScoreApi(
    userId,
    [response.data.debtor],
    Boolean(sessionProfile.permissions?.canRiskScore)
  );
  if (enrichedDebtor) {
    response.data.debtor = enrichedDebtor;
  }

  return (
    <>
      <Header title="Detalhes da Dívida" />
      <DebtDetailsFeature
        initialDebt={response.data}
        permissions={sessionProfile.permissions}
      />
    </>
  );
}

