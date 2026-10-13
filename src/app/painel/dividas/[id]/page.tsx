import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getDebtDetailsApi } from "@/server/debts/service/debt.api";
import { DebtDetailsFeature } from "@/features/debts/details/debt-details-feature";

interface DebtDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DebtDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Dossiê da Dívida — Caloteiro`,
    description: "Acompanhamento minucioso de parcelas, amortizações e desculpas registradas.",
  };
}

export default async function DebtDetailsPage({ params }: DebtDetailsPageProps) {
  const { id } = await params;

  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;
  if (!userId) {
    redirect("/signin");
  }

  const response = await getDebtDetailsApi(id, userId);
  if (!response.data) {
    notFound();
  }

  return <DebtDetailsFeature initialDebt={response.data} />;
}

