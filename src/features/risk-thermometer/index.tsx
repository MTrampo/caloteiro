"use client";

import * as React from "react";
import Link from "next/link";
import type {
  GrottoThermometerData,
  ThermometerGroup,
} from "@/commons/models/risk-score";
import { Button } from "@/components/ui/button";
import {
  SegmentedTabs,
  type SegmentedTabItem,
} from "@/components/ui/segmented-tabs";
import { RiskSpeedometerChart } from "@/features/debtors/components/risk-speedometer-chart";
import { RiskScoreRulesDialog } from "@/features/debtors/components/risk-score-rules-dialog";
import { GrottoVerdictAlert } from "./components/grotto-verdict-alert";
import {
  FaMagnifyingGlass,
  FaWhatsapp,
  FaEye,
  FaShieldHalved,
  FaTriangleExclamation,
  FaGaugeHigh,
  FaUserPlus,
} from "react-icons/fa6";

interface RiskThermometerFeatureProps {
  data: GrottoThermometerData;
}

type FilterTab = "all" | ThermometerGroup;

export function RiskThermometerFeature({ data }: RiskThermometerFeatureProps) {
  const [selectedTab, setSelectedTab] = React.useState<FilterTab>("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredDebtors = React.useMemo(() => {
    return data.debtorsRanked.filter((item) => {
      if (selectedTab !== "all" && item.group !== selectedTab) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = item.debtor.formattedName.toLowerCase().includes(term);
        const matchNick = item.debtor.formattedNickname
          ?.toLowerCase()
          .includes(term);
        const matchTier = item.riskScore.tierLabel.toLowerCase().includes(term);
        return Boolean(matchName || matchNick || matchTier);
      }
      return true;
    });
  }, [data.debtorsRanked, selectedTab, searchTerm]);

  const tabItems: SegmentedTabItem<FilterTab>[] = [
    {
      id: "all",
      label: "Todas",
      count: data.totalDebtors,
    },
    {
      id: "defaulter",
      label: "Piores",
      count: data.defaulterCount > 0 ? data.defaulterCount : undefined,
      countVariant: "danger",
    },
    {
      id: "average",
      label: "Média",
      count: data.averageCount > 0 ? data.averageCount : undefined,
      countVariant: "warning",
    },
    {
      id: "elite",
      label: "Elite",
      count: data.eliteCount > 0 ? data.eliteCount : undefined,
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full pb-24 sm:pb-6">
      {/* Cabeçalho Solto da Página (Sem Card, sem ícone no h2, sem pílula acima do título) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Termômetro da Gruta
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Raio-X geral da sua base de presas marcadas: descubra o nível de risco que você corre e separe os pagadores da zona de calote.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <RiskScoreRulesDialog
            triggerLabel="Como funciona o Score?"
            triggerClassName="w-full sm:w-auto h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-center cursor-pointer"
          />
        </div>
      </div>

      {/* 3 Cards de Resumo da Qualidade da Base */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Elite da Gruta (Melhores Pagadores) */}
        <div className="rounded-2xl border border-emerald-500/25 bg-card p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Melhores (Elite 70–100 pts)
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
              {data.elitePercentage}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight tabular-nums">
            {data.eliteCount}{" "}
            <span className="text-xs sm:text-sm font-mono font-normal text-zinc-400">
              {data.eliteCount === 1 ? "presa" : "presas"}
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 leading-snug">
            Pagadores exemplares que honram o Pix sem dor de cabeça.
          </p>
        </div>

        {/* Card 2: Na Média / Em Observação */}
        <div className="rounded-2xl border border-yellow-500/25 bg-card p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-yellow-400 font-bold">
              Na Média (50–69 pts)
            </span>
            <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded-full">
              {data.averagePercentage}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight tabular-nums">
            {data.averageCount}{" "}
            <span className="text-xs sm:text-sm font-mono font-normal text-zinc-400">
              {data.averageCount === 1 ? "presa" : "presas"}
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 leading-snug">
            Peixes ensaboados no meio da tabela que exigem rédea curta.
          </p>
        </div>

        {/* Card 3: Zona de Calote (Piores) */}
        <div className="rounded-2xl border border-rose-500/30 bg-card p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
              Zona de Calote (0–49 pts)
            </span>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-full">
              {data.defaulterPercentage}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight tabular-nums">
            {data.defaulterCount}{" "}
            <span className="text-xs sm:text-sm font-mono font-normal text-zinc-400">
              {data.defaulterCount === 1 ? "presa" : "presas"}
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 leading-snug">
            Caloteiros em treinamento ou profissionais que puxam seu risco pra cima.
          </p>
        </div>
      </div>

      {/* Alerta de Veredito da Gruta */}
      <GrottoVerdictAlert data={data} />

      {/* Linha Analítica Principal: Velocímetro Geral da Gruta + Diagnóstico de Risco Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Velocímetro Global da Carteira */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Score Médio da Gruta
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Nota média de confiabilidade de todas as suas presas cadastradas.
            </p>
          </div>

          <RiskSpeedometerChart
            score={data.overallScore}
            tier={data.overallTier}
            recentDeltaLabel={data.riskLevelLabel}
            subtitle={data.diagnosisDescription}
          />
        </div>

        {/* Diagnóstico da Base & Exposição Financeira por Risco */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-1 border-b border-border/60 pb-3">
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              {data.diagnosisTitle}
            </h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              {data.diagnosisDescription}
            </p>
          </div>

          {/* Barra Proporcional da Qualidade da Base */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-bold">
                Distribuição Biológica das Presas
              </span>
              <span className="text-zinc-400">
                {data.totalDebtors} {data.totalDebtors === 1 ? "presa" : "presas"}
              </span>
            </div>

            <div className="h-3.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex">
              {data.elitePercentage > 0 && (
                <div
                  className="bg-emerald-400 h-full transition-all"
                  style={{ width: `${data.elitePercentage}%` }}
                  title={`Elite: ${data.elitePercentage}%`}
                />
              )}
              {data.averagePercentage > 0 && (
                <div
                  className="bg-yellow-400 h-full transition-all"
                  style={{ width: `${data.averagePercentage}%` }}
                  title={`Na Média: ${data.averagePercentage}%`}
                />
              )}
              {data.defaulterPercentage > 0 && (
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${data.defaulterPercentage}%` }}
                  title={`Zona de Calote: ${data.defaulterPercentage}%`}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Elite ({data.elitePercentage}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yellow-400" />
                <span>Na Média ({data.averagePercentage}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500" />
                <span>Caloteiros ({data.defaulterPercentage}%)</span>
              </span>
            </div>
          </div>

          {/* Exposição Financeira (Onde está o dinheiro do Tubarão) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border/50">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3.5 space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-emerald-400 font-bold">
                <FaShieldHalved className="size-3 shrink-0" />
                <span>Capital em Mãos Confiáveis (Score ≥ 50)</span>
              </div>
              <div className="font-heading text-lg sm:text-xl font-black text-white whitespace-nowrap">
                {data.formattedSafeExposure}
              </div>
              <p className="text-[11px] text-zinc-400">
                Dinheiro na mão de Peixes Voadores ou Ensaboados.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/25 bg-rose-950/15 p-3.5 space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-rose-400 font-bold">
                <FaTriangleExclamation className="size-3 shrink-0" />
                <span>Capital em Zona de Calote (Score &lt; 50)</span>
              </div>
              <div className="font-heading text-lg sm:text-xl font-black text-rose-400 whitespace-nowrap">
                {data.formattedRiskExposure}
              </div>
              <p className="text-[11px] text-zinc-400">
                {data.riskExposurePercentage}% do seu dinheiro na pista está sob risco alto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Listagem e Ranking de Presas por Score (Solta no layout, Anti-Card Inception) */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Ranking Comportamental das Presas
            </h3>
            <p className="text-xs sm:text-[13px] text-zinc-400 font-mono">
              Filtre sua base entre os melhores pagadores, os na média e os piores caloteiros.
            </p>
          </div>

          <SegmentedTabs<FilterTab>
            items={tabItems}
            value={selectedTab}
            onChange={setSelectedTab}
            ariaLabel="Filtro do Termômetro por grupo de score"
          />
        </div>

        {/* Busca Rápida de Presas */}
        <div className="relative w-full sm:max-w-sm">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar presa, vulgo ou categoria..."
            className="w-full h-10 bg-zinc-950/60 border border-zinc-800 rounded-xl pl-9 pr-3.5 text-xs sm:text-sm font-mono text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Lista de Cards Individuais das Presas */}
        {data.totalDebtors === 0 ? (
          <div className="py-16 sm:py-24 text-center space-y-4 max-w-md mx-auto">
            <h3 className="font-heading text-lg font-bold text-white">
              Nenhuma presa marcada na sua gruta
            </h3>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
              Cadastre seus devedores para que o Termômetro monitore o score e classifique sua carteira automaticamente.
            </p>
            <Button
              render={<Link href="/painel/devedores/novo" />}
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold rounded-xl"
            >
              <FaUserPlus className="size-3.5 mr-1.5" />
              <span>Cadastrar Primeiro Devedor</span>
            </Button>
          </div>
        ) : filteredDebtors.length === 0 ? (
          <div className="py-12 text-center space-y-2 max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-mono text-zinc-400">
              Nenhuma presa encontrada neste filtro.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDebtors.map(({ debtor, riskScore, formattedExposure }) => (
              <div
                key={debtor.id}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-zinc-700 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Topo: Nome + Pontuação Numérica */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <h4
                        className="font-heading text-base font-bold text-white truncate"
                        title={debtor.formattedName}
                      >
                        {debtor.formattedName}
                      </h4>
                      <p className="text-xs font-mono text-zinc-400 truncate">
                        {debtor.formattedNickname
                          ? `"${debtor.formattedNickname}" • ${debtor.relationshipLabel}`
                          : debtor.relationshipLabel}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className="font-heading text-xl font-black tabular-nums leading-none"
                        style={{ color: riskScore.colorHex }}
                      >
                        {riskScore.score}
                        <span className="text-[10px] font-mono text-zinc-500 font-normal">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso do Score + Categoria */}
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, riskScore.score)}%`,
                          backgroundColor: riskScore.colorHex,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${riskScore.badgeClass}`}
                      >
                        {riskScore.tierLabel}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">
                        {riskScore.recentDeltaLabel}
                      </span>
                    </div>
                  </div>

                  {/* Resumo Rápido da Presa */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px] font-mono">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">
                        Na Pista
                      </span>
                      <span className="font-bold text-white whitespace-nowrap">
                        {formattedExposure}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">
                        Histórico
                      </span>
                      <span className="font-bold text-zinc-300 whitespace-nowrap">
                        {riskScore.overdueInstallmentsCount > 0
                          ? `${riskScore.overdueInstallmentsCount} atrasada(s)`
                          : `${riskScore.excusesCount} caô(s)`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/painel/devedores/${debtor.id}`} />}
                    className="h-8 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white justify-center cursor-pointer"
                  >
                    <FaEye className="size-3 text-zinc-400 mr-1" />
                    <span>Raio-X</span>
                  </Button>

                  <Button
                    size="sm"
                    render={
                      <a
                        href={riskScore.recommendedWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="h-8 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 justify-center cursor-pointer"
                    title={riskScore.weaponLabel}
                  >
                    <FaWhatsapp className="size-3 mr-1" />
                    <span>Arma Nv.{riskScore.weaponLevel}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

