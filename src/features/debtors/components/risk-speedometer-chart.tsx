"use client";

import * as React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { BiologicalTier } from "@/commons/models/risk-score";
import { BIOLOGICAL_TIER_METADATA } from "@/commons/models/risk-score";

interface RiskSpeedometerChartProps {
  score: number;
  tier: BiologicalTier;
  recentDelta?: number;
  recentDeltaLabel?: string;
  subtitle?: string;
}

const GAUGE_SEGMENTS = [
  { name: "Caloteiro Profissional", value: 15, color: "#e11d48" }, // 0-14
  { name: "Caloteiro", value: 20, color: "#ef4444" },              // 15-34
  { name: "Caloteiro em Treinamento", value: 15, color: "#f59e0b" }, // 35-49
  { name: "Peixe Ensaboado", value: 35, color: "#facc15" },        // 50-84
  { name: "Peixe Voador", value: 15, color: "#34d399" },           // 85-100
];

const chartConfig = {
  score: {
    label: "Faro do Tubarão",
  },
} satisfies ChartConfig;

export function RiskSpeedometerChart({
  score,
  tier,
  recentDelta = 0,
  recentDeltaLabel,
  subtitle,
}: RiskSpeedometerChartProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const tierMeta = BIOLOGICAL_TIER_METADATA[tier];

  // Dados do arco ativo do score (de 0 até clampedScore) + restante transparente
  const activePointerData = [
    { name: "active", value: Math.max(2, clampedScore), color: tierMeta.colorHex },
    { name: "rest", value: Math.max(0, 100 - Math.max(2, clampedScore)), color: "rgba(39, 39, 42, 0.35)" },
  ];

  // Ângulo do ponteiro do velocímetro (180 graus = 0 pts na esquerda, 0 graus = 100 pts na direita)
  const needleRotationDeg = (clampedScore / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Container do Velocímetro Semicircular (Shadcn ChartContainer + Recharts) */}
      <div className="relative w-full max-w-[260px] sm:max-w-[300px] h-[155px] sm:h-[175px] flex items-center justify-center overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[260px] sm:h-[300px] aspect-square -mb-24 sm:-mb-28"
        >
          <PieChart>
            {/* Trilha Externa: As 5 Faixas da Escada Biológica */}
            <Pie
              data={GAUGE_SEGMENTS}
              dataKey="value"
              cx="50%"
              cy="55%"
              startAngle={180}
              endAngle={0}
              innerRadius="76%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {GAUGE_SEGMENTS.map((entry, index) => (
                <Cell key={`track-${index}`} fill={entry.color} fillOpacity={0.28} />
              ))}
            </Pie>

            {/* Arco Principal Preenchido até o Score Atual */}
            <Pie
              data={activePointerData}
              dataKey="value"
              cx="50%"
              cy="55%"
              startAngle={180}
              endAngle={0}
              innerRadius="58%"
              outerRadius="72%"
              cornerRadius={6}
              stroke="none"
            >
              {activePointerData.map((entry, index) => (
                <Cell key={`val-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Ponteiro Indicador Minimalista 100% Livre + Pivô Central */}
        <div className="absolute inset-x-0 bottom-3 flex flex-col items-center justify-end pointer-events-none">
          {/* Agulha livre apontando para a faixa atual */}
          <div className="relative flex items-end justify-center">
            <div
              className="w-1 sm:w-1.5 h-14 sm:h-16 rounded-t-full origin-bottom transition-transform duration-500"
              style={{
                transform: `rotate(${needleRotationDeg}deg)`,
                background: `linear-gradient(to top, ${tierMeta.colorHex} 15%, ${tierMeta.colorHex} 100%)`,
                boxShadow: `0 0 10px ${tierMeta.colorHex}55`,
              }}
            />
            {/* Pivô circular na base da agulha */}
            <div
              className="absolute -bottom-1.5 size-3.5 sm:size-4 rounded-full bg-zinc-950 border-2 shadow-md"
              style={{ borderColor: tierMeta.colorHex }}
            />
          </div>
        </div>
      </div>

      {/* Marcadores da Escala (0 — 50 Meio — 100) */}
      <div className="w-full max-w-[240px] sm:max-w-[270px] flex items-center justify-between text-[10px] font-mono text-zinc-500 px-2 -mt-1">
        <span>0 (Caloteiro)</span>
        <span className="text-yellow-400/80 font-bold">50 (Início)</span>
        <span>100 (Elite)</span>
      </div>

      {/* Pontuação Numérica Fora do Arco + Categoria Biológica + Variação Recente */}
      <div className="mt-3 text-center space-y-2.5 w-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Pílula da Pontuação Numérica (Sem colidir com o ponteiro) */}
          <div className="inline-flex items-baseline gap-0.5 px-3 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 whitespace-nowrap">
            <span
              className="font-heading text-lg sm:text-xl font-black tracking-tight tabular-nums leading-none"
              style={{ color: tierMeta.colorHex }}
            >
              {clampedScore}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 font-bold">
              /100 pts
            </span>
          </div>

          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border whitespace-nowrap ${tierMeta.badgeClass}`}
          >
            {tierMeta.label}
          </span>

          {recentDeltaLabel && (
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                recentDelta > 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : recentDelta < 0
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {recentDeltaLabel}
            </span>
          )}
        </div>

        <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto leading-relaxed">
          {subtitle || tierMeta.description}
        </p>
      </div>
    </div>
  );
}

