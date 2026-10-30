import { redirect } from "next/navigation";
import { getUserLogged } from "@/server/account/repository/auth.supabase";
import {
  getActivePlansSupabase,
  getSubscriptionByUserIdSupabase,
} from "@/server/account/repository/subscription.supabase";
import { getPreapprovalApi } from "@/server/payment/service/payment.api";
import { isSubscriptionActive } from "@/commons/lib/http/security";
import type { SubscriptionPayloadCookie } from "@/commons/models/subscription";
import { SubscriptionSuccessScreen } from "@/features/subscription";
import { Logo } from "@/components/ui/logo";
import { SignOutButton } from "@/components/buttons/sign-out-button";
import { toIsoOrNull } from "@/commons/utils/helper";
import { getPlanBenefits } from "@/commons/constants/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolução Confirmada — Caloteiro",
  description: "Sua nova espécie de tubarão e sua gruta estão liberadas para a caça.",
};

interface AssinaturaSucessoPageProps {
  searchParams?: Promise<{
    preapproval_id?: string;
    status?: string;
  }>;
}

export default async function AssinaturaSucessoPage({
  searchParams,
}: AssinaturaSucessoPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const {
    data: { user },
  } = await getUserLogged();

  if (!user) {
    redirect("/entrar");
  }

  const subscription = await getSubscriptionByUserIdSupabase(user.id);

  if (!subscription || !subscription.plan) {
    redirect("/assinatura");
  }

  const cookiePayload: SubscriptionPayloadCookie = {
    subscriptionId: subscription.id,
    status: subscription.mp_status,
    currentPeriodEnd: subscription.current_period_end,
    userId: user.id,
    planSlug: subscription.plan.slug || null,
  };

  if (!isSubscriptionActive(cookiePayload)) {
    redirect("/assinatura");
  }

  let plan = subscription.plan;
  let currentPeriodEnd = subscription.current_period_end;

  // Fallback 100% Somente Leitura (Read-Only):
  // Caso o navegador do usuário chegue do Mercado Pago alguns milissegundos antes do Webhook
  // terminar de atualizar o banco (ou seja, o banco ainda exibe o plano gratuito price === 0),
  // consultamos o preapproval apenas em memória para exibir os dados exatos na tela de boas-vindas,
  // deixando a gravação no banco e o envio do e-mail 100% exclusivos para o Webhook.
  if (query?.preapproval_id && Number(plan.price ?? 0) === 0) {
    const preapprovalRes = await getPreapprovalApi(query.preapproval_id);
    if (
      preapprovalRes.data &&
      preapprovalRes.data.status === "authorized" &&
      preapprovalRes.data.reason
    ) {
      const activePlans = await getActivePlansSupabase();
      const matchedPlan = activePlans.find(
        (p) => p.name.toLowerCase() === preapprovalRes.data!.reason!.toLowerCase()
      );
      if (matchedPlan) {
        plan = matchedPlan;
        currentPeriodEnd =
          toIsoOrNull(preapprovalRes.data.next_payment_date) || currentPeriodEnd;
      }
    }
  }

  const config = plan.config_plan;
  const planName = plan.name;
  const planPrice = Number(plan.price ?? subscription.base_value ?? 0);
  const maxDebtors = config?.max_debtors ?? null;

  const benefits = getPlanBenefits(planName, config);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Cabeçalho Limpo */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex w-full items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="select-none">
            <Logo size="md" showText />
          </div>

          <div className="flex items-center gap-3">
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <SubscriptionSuccessScreen
          planName={planName}
          planPrice={planPrice}
          maxDebtors={maxDebtors}
          benefits={benefits}
          currentPeriodEnd={currentPeriodEnd}
        />
      </main>
    </div>
  );
}
