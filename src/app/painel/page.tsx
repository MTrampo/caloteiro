import Header from "@/components/header/dashboard";
import { HomeCommandFeature } from "@/features/home-command";
import {
  generateDynamicPunchline,
  getTimeGreeting,
} from "@/features/home-command/utils/greeting-helper";
import { getCurrentUserSessionProfileApi } from "@/server/account/service/auth.api";
import { getHomeCommandDataApi } from "@/server/debts/service/home-command.api";
import { getPlanLimitsApi } from "@/server/account/service/subscription.api";
import type { Metadata } from "next";
import { formatProperName } from "@/commons/utils/format";

export const metadata: Metadata = {
  title: "Painel — Central de Comando",
};

export default async function PainelPage() {
  const { user, profile, permissions } = await getCurrentUserSessionProfileApi();

  let userName = "Tubarão";
  if (user) {
    const rawName =
      profile?.nickname ||
      profile?.name ||
      (user.user_metadata?.name as string | undefined) ||
      "Tubarão";
    userName = formatProperName(rawName) || "Tubarão";
  }

  // Busca dados reais consolidados de dívidas, parcelas e limites de plano do Tubarão
  const [commandData, planLimits] = user?.id
    ? await Promise.all([
        getHomeCommandDataApi(user.id, userName),
        getPlanLimitsApi(user.id),
      ])
    : [
        {
          userName,
          kpis: { dueSoonCount: 0, recentlyPaidCount: 0, criticalOverdueCount: 0 },
          feed: [],
          totalDebtsCount: 0,
          wisdomQuote: {
            quote:
              "Quem tem vergonha de cobrar passa o fim de semana comendo pão com ovo enquanto o devedor faz Stories no open bar.",
            author: "Tio Patinhas",
            subtext: "Lembre-se: o dinheiro era seu antes de sair da sua conta.",
          },
          counts: {
            overdueCount: 0,
            criticalCount: 0,
            dueSoonCount: 0,
            totalCount: 0,
          },
        },
        null,
      ];

  // Gerado uma única vez no servidor para paridade absoluta entre SSR e Client com números reais
  const initialPunchline = generateDynamicPunchline(commandData.counts);
  const initialTimeGreeting = getTimeGreeting();

  return (
    <>
      <Header title="Painel" />
      <HomeCommandFeature
        initialData={commandData}
        initialPunchline={initialPunchline}
        initialTimeGreeting={initialTimeGreeting}
        canCopyPix={permissions?.canCustomTemplates ?? false}
        canAttachReceipts={permissions?.canAttachReceipts ?? false}
        planLimits={planLimits}
      />
    </>
  );
}