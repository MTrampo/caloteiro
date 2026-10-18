"use client";

import { SummaryCard } from "@/components/cards/summary-card";
import { SUMMARY_CARD_CONFIGS } from "@/commons/utils/status-map";
import type { TrackingSummaryData } from "@/commons/models/tracking";
import { cn } from "@/commons/lib/utils";

export type DashboardSummaryData = TrackingSummaryData;

const defaultSummaryData: DashboardSummaryData = {
  open: {
    amount: "0 suspeitos",
    description: "Promessas e pendências na praça",
    last: "Dívidas ativas na gruta",
    changePercent: 0,
  },
  onTime: {
    amount: "0 milagreiros",
    description: "Pagando sem drama nem desculpa",
    last: "Raros e pontuais",
    changePercent: 0,
  },
  overdue: {
    amount: "0 sumidos",
    description: "Passou do prazo combinado",
    last: "Hora do 'bom dia, sumido'",
    changePercent: 0,
  },
  defaulted: {
    amount: "0 lendas",
    description: "Deram o perdido no mês",
    last: "Alerta vermelho de golpe",
    changePercent: 0,
  },
};

export function SummaryCardsGrid({
  data = defaultSummaryData,
}: {
  data?: DashboardSummaryData;
}) {
  const openConfig = SUMMARY_CARD_CONFIGS.OPEN;
  const onTimeConfig = SUMMARY_CARD_CONFIGS.ON_TIME;
  const overdueConfig = SUMMARY_CARD_CONFIGS.OVERDUE;
  const defaultedConfig = SUMMARY_CARD_CONFIGS.DEFAULTED;

  const OpenIcon = openConfig.icon;
  const OnTimeIcon = onTimeConfig.icon;
  const OverdueIcon = overdueConfig.icon;
  const DefaultedIcon = defaultedConfig.icon;

  const openBadge = (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60">
      {data.open.changePercent}% na gruta
    </span>
  );

  const onTimeBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border",
        data.onTime.changePercent > 0
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-zinc-400 bg-zinc-800/80 border-zinc-700/60"
      )}
    >
      {data.onTime.changePercent}% em dia
    </span>
  );

  const overdueBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border",
        data.overdue.changePercent > 0
          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      )}
    >
      {data.overdue.changePercent}% em atraso
    </span>
  );

  const defaultedBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border",
        data.defaulted.changePercent > 0
          ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      )}
    >
      {data.defaulted.changePercent}% crítico
    </span>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1º Em Aberto */}
      <SummaryCard
        title={openConfig.title}
        amount={data.open.amount}
        accent={openConfig.accent}
        icon={<OpenIcon className="size-4" />}
        helpText={openConfig.helpText}
        description={data.open.description}
        last={data.open.last}
        percentage={openBadge}
      />

      {/* 2º Em Dia */}
      <SummaryCard
        title={onTimeConfig.title}
        amount={data.onTime.amount}
        accent={onTimeConfig.accent}
        icon={<OnTimeIcon className="size-4" />}
        helpText={onTimeConfig.helpText}
        description={data.onTime.description}
        last={data.onTime.last}
        percentage={onTimeBadge}
      />

      {/* 3º Em Atraso */}
      <SummaryCard
        title={overdueConfig.title}
        amount={data.overdue.amount}
        accent={overdueConfig.accent}
        icon={<OverdueIcon className="size-4" />}
        helpText={overdueConfig.helpText}
        description={data.overdue.description}
        last={data.overdue.last}
        percentage={overdueBadge}
      />

      {/* 4º Caloteiros */}
      <SummaryCard
        title={defaultedConfig.title}
        amount={data.defaulted.amount}
        accent={defaultedConfig.accent}
        icon={<DefaultedIcon className="size-4" />}
        helpText={defaultedConfig.helpText}
        description={data.defaulted.description}
        last={data.defaulted.last}
        percentage={defaultedBadge}
      />
    </div>
  );
}
