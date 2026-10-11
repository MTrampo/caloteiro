"use client"

import * as React from "react"
import { CommandCenterData } from "./types"
import { GreetingBanner } from "./components/greeting-banner"
import { TriageKPIsGrid } from "./components/triage-kpis"
import { DailyFeed } from "./components/daily-feed"
import { CreditorWisdom } from "./components/creditor-wisdom"

// Mock inicial enriquecido com ocorrências realistas e dinâmicas
const defaultCommandData: CommandCenterData = {
  userName: "Vinicius",
  kpis: {
    dueSoonCount: 3,
    recentlyPaidCount: 5,
    criticalOverdueCount: 2,
  },
  feed: [
    {
      id: "occ-1",
      debtorName: "Marcio Ramos",
      debtorNickname: "Marcio da Oficina",
      debtorPhone: "(11) 98765-4321",
      type: "urgent_overdue",
      relativeTimeText: "Venceu há 3 dias",
      installmentText: "Parcela 2 de 5",
      pixKey: "11987654321",
      lastExcuseNote: "Falou que o banco bloqueou o aplicativo dele",
    },
    {
      id: "occ-2",
      debtorName: "Cleiton Lopes",
      debtorNickname: "Cunhado",
      debtorPhone: "(11) 99888-7766",
      type: "due_today",
      relativeTimeText: "Vence Hoje",
      installmentText: "Parcela única",
      pixKey: "11998887766",
      lastExcuseNote: "Disse que o vale cai às 16h",
    },
    {
      id: "occ-3",
      debtorName: "Ricardo Alvarenga",
      debtorNickname: "Ricardinho",
      debtorPhone: "(11) 97777-6655",
      type: "due_soon",
      relativeTimeText: "Vence em 2 dias",
      installmentText: "Parcela 3 de 6",
      pixKey: "11977776655",
    },
    {
      id: "occ-4",
      debtorName: "Beto Silveira",
      debtorNickname: "Beto do Churrasco",
      debtorPhone: "(11) 96666-5544",
      type: "recently_paid",
      relativeTimeText: "Pagou ontem",
      installmentText: "Parcela 4 de 10 honrada",
      pixKey: "11966665544",
    },
  ],
  wisdomQuote: {
    quote: "Quem tem vergonha de cobrar passa o fim de semana comendo pão com ovo enquanto o devedor faz Stories no open bar.",
    author: "Julius, Pai do Chris",
    subtext: "Lembre-se: o dinheiro era seu antes de sair da sua conta.",
  },
}

export interface HomeCommandFeatureProps {
  initialUserName?: string
  initialPunchline?: string
  initialTimeGreeting?: string
  initialWisdom?: {
    quote: string
    author: string
    subtext: string
  }
}

export function HomeCommandFeature({
  initialUserName,
  initialPunchline,
  initialTimeGreeting,
  initialWisdom,
}: HomeCommandFeatureProps = {}) {
  const [data] = React.useState<CommandCenterData>(() => ({
    ...defaultCommandData,
    userName: initialUserName || defaultCommandData.userName,
    wisdomQuote: initialWisdom || defaultCommandData.wisdomQuote,
  }))

  // Usar valores fornecidos pelo SSR para garantir 100% de paridade na hidratação
  const punchline = initialPunchline ?? "Dia de teste de paciência: 2 devedores já fingiram demência. Hora de mostrar os dentes e mandar a cobrança matinal."
  const timeGreeting = initialTimeGreeting ?? "Olá"
  const wisdom = initialWisdom ?? data.wisdomQuote

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* 1. Faixa de Boas-vindas Ácida com Saudação Dinâmica e Ação Direta */}
      <GreetingBanner
        userName={data.userName}
        timeGreeting={timeGreeting}
        punchline={punchline}
      />

      {/* 2. Triagem Rápida em 3 Mini-Cards (Sem R$ - Modo Seguro) */}
      <TriageKPIsGrid kpis={data.kpis} />

      {/* 3. Feed de Ocorrências / Linha do Tempo com Ações Imediatas */}
      <DailyFeed feed={data.feed} />

      {/* 4. Pílula de Humor & Sabedoria Ácida do Tubarão */}
      <CreditorWisdom initialWisdom={wisdom} />
    </div>
  )
}

