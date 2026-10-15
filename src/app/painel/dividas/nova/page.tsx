import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/header/dashboard";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getDebtorsApi } from "@/server/debtors/service/debtor.api";
import { getCreditorSettingsApi } from "@/server/account/service/creditor-settings.api";
import { presentDebtorsList } from "@/commons/utils/format";
import { CreateDebtStepperFeature } from "@/features/debts/create-stepper";

import Link from "next/link";
import { FaTriangleExclamation } from "react-icons/fa6";
import { getPlanLimitsApi } from "@/server/account/service/subscription.api";

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

  // Busca todos os devedores do usuário, configurações e limites do plano
  const [debtorsResult, settingsResult, planLimits] = await Promise.all([
    getDebtorsApi({ userId, limit: 100, page: 1 }),
    getCreditorSettingsApi(userId),
    getPlanLimitsApi(userId),
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
      {planLimits.isDebtLimitReached ? (
        <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1">
              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                Nova Dívida
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                Formalize o empréstimo, configure valores e prazos, e ative o rastreio do Tubarão.
              </p>
            </div>
          </div>

          <div className="py-16 sm:py-24 text-center space-y-5 max-w-md mx-auto">
            <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
              <FaTriangleExclamation className="size-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-white">
                O Tanque Encheu!
              </h3>
              <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
                Seu plano atual ({planLimits.planName}) permite manter até {planLimits.maxDebtors} dívidas ativas simultaneamente. Finalize uma pendência ou evolua de plano para continuar farejando cada centavo na pista!
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/painel/dividas/acompanhamento"
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 text-xs font-mono rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
              >
                Voltar ao Acompanhamento
              </Link>
              <Link
                href="/painel/conta/assinatura"
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 text-xs sm:text-sm font-bold font-heading rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 shadow-md"
              >
                Fazer Upgrade
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <CreateDebtStepperFeature
          debtors={debtorsFormatted}
          permissions={permissions}
          defaultSettings={defaultSettings}
          preselectedDebtorId={preselectedDebtorId}
          planLimits={planLimits}
        />
      )}
    </>
  );
}

