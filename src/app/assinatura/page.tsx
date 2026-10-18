import { redirect } from "next/navigation";
import { SubscriptionFlow } from "@/features/subscription";
import {
  getActivePlansSupabase,
  getSubscriptionByUserIdSupabase,
} from "@/server/account/repository/subscription.supabase";
import { getUserLogged } from "@/server/account/repository/auth.supabase";
import { isSubscriptionActive } from "@/commons/lib/http/security";
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

  // 1. Se voltou do Mercado Pago com preapproval_id para /assinatura, encaminha direto para a página de boas-vindas
  if (query?.preapproval_id) {
    redirect(`/assinatura/sucesso?preapproval_id=${query.preapproval_id}`);
  }

  const [plans, currentSubscription] = await Promise.all([
    getActivePlansSupabase(),
    getSubscriptionByUserIdSupabase(user.id),
  ]);

  // 2. Se o usuário já possui assinatura ativa no banco e não pediu para trocar (?trocar=true), vai direto para o painel
  if (currentSubscription && !query?.trocar) {
    const cookiePayload: SubscriptionPayloadCookie = {
      subscriptionId: currentSubscription.id,
      status: currentSubscription.mp_status,
      currentPeriodEnd: currentSubscription.current_period_end,
      userId: user.id,
      planSlug: currentSubscription.plan?.slug || null,
    };

    if (isSubscriptionActive(cookiePayload)) {
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
