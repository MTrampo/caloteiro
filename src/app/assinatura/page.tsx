import { redirect } from "next/navigation";
import { SubscriptionFlow } from "@/features/subscription";
import {
  getActivePlansSupabase,
  getSubscriptionByUserIdSupabase,
  updateSubscriptionByIdSupabase,
} from "@/server/account/repository/subscription.supabase";
import { getUserLogged } from "@/server/account/repository/auth.supabase";
import { getPreapprovalApi } from "@/server/payment/service/payment.api";
import { setCookieSubscription } from "@/commons/lib/auth/subscription";
import { isSubscriptionActive } from "@/commons/lib/http/security";
import { toIsoOrNull } from "@/commons/utils/helper";
import type { SubscriptionPayloadCookie } from "@/commons/models/subscription";
import { Logo } from "@/components/ui/logo";
import { SignOutButton } from "@/components/buttons/sign-out-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gruta dos Tubarões — Caloteiro",
  description: "Selecione sua espécie de tubarão para caçar seus devedores na praça.",
};

interface AssinaturaPageProps {
  searchParams?: Promise<{
    preapproval_id?: string;
    status?: string;
    trocar?: string;
  }>;
}

export default async function AssinaturaPage({ searchParams }: AssinaturaPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const {
    data: { user },
  } = await getUserLogged();

  if (!user) {
    redirect("/entrar");
  }

  // 1. Se voltou do Mercado Pago com preapproval_id, sincroniza com o Mercado Pago e libera o painel
  if (query?.preapproval_id) {
    const mpRes = await getPreapprovalApi(query.preapproval_id);
    const existingSub = await getSubscriptionByUserIdSupabase(user.id);

    if (mpRes.data && existingSub) {
      const nextStatus = mpRes.data.status || "authorized";
      const periodEnd = toIsoOrNull(mpRes.data.next_payment_date);

      await updateSubscriptionByIdSupabase(existingSub.id, {
        mp_subscription_id: query.preapproval_id,
        mp_status: nextStatus,
        current_period_end: periodEnd,
      });

      const cookiePayload: SubscriptionPayloadCookie = {
        subscriptionId: existingSub.id,
        status: nextStatus,
        currentPeriodEnd: periodEnd,
        userId: user.id,
        planSlug: existingSub.plan?.slug || null,
      };

      await setCookieSubscription(cookiePayload);

      if (isSubscriptionActive(cookiePayload)) {
        redirect("/painel");
      }
    }
  }

  const [plans, currentSubscription] = await Promise.all([
    getActivePlansSupabase(),
    getSubscriptionByUserIdSupabase(user.id),
  ]);

  // 2. Se o usuário já possui assinatura ativa no banco de dados
  if (currentSubscription) {
    const cookiePayload: SubscriptionPayloadCookie = {
      subscriptionId: currentSubscription.id,
      status: currentSubscription.mp_status,
      currentPeriodEnd: currentSubscription.current_period_end,
      userId: user.id,
      planSlug: currentSubscription.plan?.slug || null,
    };

    // Garante que o cookie seguro de assinatura esteja atualizado no navegador
    await setCookieSubscription(cookiePayload);

    // Se a assinatura está ativa e ele não solicitou explicitamente trocar de plano (?trocar=true), vai para o painel
    if (isSubscriptionActive(cookiePayload) && !query?.trocar) {
      redirect("/painel");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Cabeçalho Limpo da Assinatura (independente de sidebar) */}
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

      <main className="flex-1">
        <SubscriptionFlow
          plans={plans}
          currentSubscriptionPlanSlug={currentSubscription?.plan?.slug || null}
        />
      </main>
    </div>
  );
}
