import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/header/dashboard";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getDebtorsApi } from "@/server/debtors/service/debtor.api";
import { getCreditorSettingsApi } from "@/server/account/service/creditor-settings.api";
import { presentDebtorsList } from "@/commons/utils/format";
import { CreateDebtStepperFeature } from "@/features/debts/create-stepper";

export const metadata: Metadata = {
  title: "Nova Dívida — Caloteiro",
  description: "Criação e formalização de acordo de dívida com cronograma de parcelas.",
};

interface NovaDividaPageProps {
  searchParams?: Promise<{
    debtorId?: string;
  }>;
}

export default async function NovaDividaPage({ searchParams }: NovaDividaPageProps) {
  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;
  if (!userId) {
    redirect("/signin");
  }

  const query = searchParams ? await searchParams : undefined;
  const preselectedDebtorId = query?.debtorId;

  // Busca todos os devedores do usuário para seleção no passo 1
  const [debtorsResult, settingsResult] = await Promise.all([
    getDebtorsApi({ userId, limit: 100, page: 1 }),
    getCreditorSettingsApi(userId),
  ]);

  const debtorsFormatted = presentDebtorsList(debtorsResult.items);

  const permissions = settingsResult.data?.permissions || {
    maxDebtors: 2,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
    isSubscriptionActive: false,
  };

  const defaultSettings = settingsResult.data?.settings
    ? {
        defaultInterestRate: Number(settingsResult.data.settings.default_interest_rate || 0),
        defaultInterestType: settingsResult.data.settings.default_interest_type || "none",
      }
    : null;

  return (
    <>
      <Header title="Nova Dívida" />
      <CreateDebtStepperFeature
        debtors={debtorsFormatted}
        permissions={permissions}
        defaultSettings={defaultSettings}
        preselectedDebtorId={preselectedDebtorId}
      />
    </>
  );
}

