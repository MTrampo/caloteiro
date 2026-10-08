"use client"

import { TriageKPIs } from "../types"
import { FaClock, FaCircleCheck, FaTriangleExclamation, FaArrowRight } from "react-icons/fa6"
import Link from "next/link"

type TriageKPIsProps = {
  kpis: TriageKPIs
}

export function TriageKPIsGrid({ kpis }: TriageKPIsProps) {
  const { dueSoonCount, recentlyPaidCount, criticalOverdueCount } = kpis

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Mini-Card 1: Atenção Redobrada */}
      <Link
        href="/painel/dividas/acompanhamento"
        className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-zinc-700 transition-all flex flex-col justify-between gap-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FaClock className="size-3 text-amber-400" />
            Vencem Esta Semana
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
            Fique de Olho
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            {dueSoonCount}{" "}
            <span className="text-sm font-mono font-normal text-zinc-400">
              {dueSoonCount === 1 ? "cobrança" : "cobranças"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            No prazo, mas merecem vigilância matinal.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200 pt-1 border-t border-zinc-800/60 transition-colors">
          <span>Ver quem vence</span>
          <FaArrowRight className="size-2.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Mini-Card 2: Pix Recentes */}
      <Link
        href="/painel/dividas/acompanhamento"
        className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-zinc-700 transition-all flex flex-col justify-between gap-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FaCircleCheck className="size-3 text-emerald-400" />
            Pix nos Últimos 7 Dias
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
            Milagres Recentes
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            {recentlyPaidCount}{" "}
            <span className="text-sm font-mono font-normal text-zinc-400">
              {recentlyPaidCount === 1 ? "parcela" : "parcelas"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Promessas cumpridas que saíram da sua cabeça.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200 pt-1 border-t border-zinc-800/60 transition-colors">
          <span>Ver histórico honrado</span>
          <FaArrowRight className="size-2.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Mini-Card 3: Casos em Risco Crítico */}
      <Link
        href="/painel/dividas/acompanhamento"
        className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-zinc-700 transition-all flex flex-col justify-between gap-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FaTriangleExclamation className="size-3 text-rose-500" />
            Risco Crítico (&gt; 30d)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
            Alerta Vermelho
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            {criticalOverdueCount}{" "}
            <span className="text-sm font-mono font-normal text-zinc-400">
              {criticalOverdueCount === 1 ? "sumido" : "sumidos"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Passou do limite da cara de pau. Hora de agir.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200 pt-1 border-t border-zinc-800/60 transition-colors">
          <span>Ver casos críticos</span>
          <FaArrowRight className="size-2.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  )
}

