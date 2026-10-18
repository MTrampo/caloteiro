"use client";

import * as React from "react";
import type { CommandCenterData } from "./types";
import { GreetingBanner } from "./components/greeting-banner";
import { TriageKPIsGrid } from "./components/triage-kpis";
import { DailyFeed } from "./components/daily-feed";
import { CreditorWisdom } from "./components/creditor-wisdom";
import { FaFishFins } from "react-icons/fa6";
import { NewButton } from "@/components/buttons/new-button";
import type { UserPlanLimits } from "@/commons/models/subscription";

export interface HomeCommandFeatureProps {
  initialData: CommandCenterData;
  initialPunchline?: string;
  initialTimeGreeting?: string;
  canCopyPix?: boolean;
  planLimits?: UserPlanLimits | null;
}

export function HomeCommandFeature({
  initialData,
  initialPunchline,
  initialTimeGreeting,
  canCopyPix = true,
  planLimits,
}: HomeCommandFeatureProps) {
  const [data] = React.useState<CommandCenterData>(initialData);

  const punchline =
    initialPunchline ??
    "Dia de teste de paciência: hora de mostrar os dentes e recuperar o que é seu.";
  const timeGreeting = initialTimeGreeting ?? "Olá";
  const wisdom = data.wisdomQuote;

  const isAccountEmpty = data.totalDebtsCount === 0;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full min-w-0">
      {/* 1. Faixa de Boas-vindas Ácida com Saudação Dinâmica e Ação Direta */}
      <GreetingBanner
        userName={data.userName}
        timeGreeting={timeGreeting}
        punchline={punchline}
        planLimits={planLimits}
      />

      {isAccountEmpty ? (
        /* Empty State Geral da Conta (Sem Dívidas Cadastradas) - Regra 7 */
        <div className="py-16 sm:py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="size-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 shadow-xs">
            <FaFishFins className="size-6 text-zinc-500" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              O mar está calmo por aqui, Tubarão
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
              Você ainda não trouxe nenhuma presa marcada para a sua gruta. Marque seu primeiro devedor antes que ele gaste o seu dinheiro no fim de semana.
            </p>
          </div>

          <div className="pt-2">
            <NewButton
              href="/painel/dividas/nova"
              label="Cadastrar Primeira Dívida"
              icon="plus"
              isLocked={planLimits?.isDebtLimitReached}
              lockReason="debt"
              maxAllowed={planLimits?.maxDebtors ?? 2}
              planName={planLimits?.planName ?? "Tubarão Lixa"}
            />
          </div>
        </div>
      ) : (
        <>
          {/* 2. Triagem Rápida em 3 Mini-Cards (Sem R$ - Modo Seguro) */}
          <TriageKPIsGrid kpis={data.kpis} />

          {/* 3. Feed de Ocorrências / Linha do Tempo com Ações Imediatas */}
          <DailyFeed
            feed={data.feed}
            pixKeyDefault={data.creditorPixKey}
            canCopyPix={canCopyPix}
          />
        </>
      )}

      {/* 4. Pílula de Humor & Sabedoria Ácida do Tubarão */}
      <CreditorWisdom initialWisdom={wisdom} />
    </div>
  );
}
