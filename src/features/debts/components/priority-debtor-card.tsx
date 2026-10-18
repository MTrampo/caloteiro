"use client"

import { useState } from "react"
import Link from "next/link"
import { PriorityDebtor } from "../types"
import { formatRelativeDueDate, formatCurrencyBRL } from "@/commons/utils/date-formatter"
import { Button } from "@/components/ui/button"
import {
  FaArrowRight,
  FaCalendarDays,
  FaCheck,
  FaCopy,
  FaCrosshairs,
  FaWhatsapp,
} from "react-icons/fa6"
import { cn } from "@/commons/lib/utils"

type PriorityDebtorCardProps = {
  debtor?: PriorityDebtor | null
}

export function PriorityDebtorCard({ debtor }: PriorityDebtorCardProps) {
  const [copiedPix, setCopiedPix] = useState(false)

  if (!debtor) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCrosshairs className="size-4 text-zinc-500" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight">
              Próxima Cobrança (Alvo Imediato)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            Mar Calmo
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs text-center space-y-1.5">
          <p className="font-heading text-sm sm:text-base font-bold text-white">
            Nenhum devedor na mira imediata!
          </p>
          <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
            Todas as promessas estão quitadas ou em dia, sem nenhuma cobrança de emergência necessária no momento.
          </p>
        </div>
      </div>
    )
  }

  const relativeDate = formatRelativeDueDate(debtor.dueDate)

  const isCritical = relativeDate.isPast || debtor.urgency === "CRITICO"

  const handleCopyPix = () => {
    if (debtor.pixKey) {
      navigator.clipboard.writeText(debtor.pixKey)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2500)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Fala ${debtor.debtorName}, tudo bem? Passando pra lembrar da parcela de ${formatCurrencyBRL(
      debtor.installmentAmount
    )} do acordo "${debtor.debtTitle}". Segue minha chave Pix: ${debtor.pixKey}. Manda o comprovante assim que transferir!`
  )

  return (
    <div className="space-y-2.5">
      {/* Título da Seção do Alvo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaCrosshairs className="size-4 text-rose-400" />
          <h3 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight">
            Próxima Cobrança (Alvo Imediato)
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-zinc-400">
          Prioridade: {isCritical ? "Atraso Crítico" : "Vencimento Iminente"}
        </span>
      </div>

      {/* Card Principal em Destaque */}
      <div
        className={cn(
          "rounded-2xl border bg-card p-5 sm:p-6 shadow-md transition-all duration-200 relative overflow-hidden",
          isCritical
            ? "border-rose-500/40 border-l-4 border-l-rose-500 bg-rose-500/[0.03]"
            : "border-amber-500/40 border-l-4 border-l-amber-500 bg-amber-500/[0.03]"
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Bloco 1: Devedor, Iniciais & Motivo (5 Colunas) */}
          <div className="lg:col-span-5 flex items-start gap-3.5">
            <div
              className={cn(
                "size-12 sm:size-14 rounded-2xl flex items-center justify-center font-mono font-black text-sm sm:text-base shrink-0 border shadow-md",
                isCritical
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              )}
            >
              {debtor.debtorInitials || debtor.debtorName.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md border",
                    isCritical
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  )}
                >
                  {isCritical ? "ALERTA VERMELHO" : "ATENÇÃO IMEDIATA"}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Parcela {debtor.currentInstallment} de {debtor.totalInstallments}
                </span>
              </div>

              <h4 className="font-heading text-lg sm:text-xl font-bold text-white truncate">
                {debtor.debtorName}
              </h4>

              <p className="text-xs text-zinc-300 font-mono font-medium truncate">
                {debtor.debtTitle}
              </p>

              {debtor.reasonText && (
                <p className="text-xs text-zinc-400 line-clamp-2 pt-0.5 italic">
                  &ldquo;{debtor.reasonText}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Bloco 2: Valor da Parcela & Data de Vencimento com date-fns (3 Colunas) */}
          <div className="lg:col-span-3 lg:border-x lg:border-border lg:px-6 space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Valor da Parcela
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-white tabular-nums tracking-tight">
                {formatCurrencyBRL(debtor.installmentAmount)}
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Total acumulado: {formatCurrencyBRL(debtor.totalDebtAmount)}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-border/70">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FaCalendarDays className="size-3 text-zinc-400" />
                Situação do Vencimento
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-mono font-black",
                    isCritical ? "text-rose-400" : "text-amber-400"
                  )}
                >
                  {relativeDate.formatted}
                </span>
                <span className="text-xs text-zinc-300 font-mono">
                  ({relativeDate.detail})
                </span>
              </div>
            </div>
          </div>

          {/* Bloco 3: Ações Rápidas de Cobrança (4 Colunas) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {/* Botão Baixa Imediata */}
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-xs shadow-emerald-500/20 h-9 justify-center"
                onClick={() => alert(`Milagre confirmado! Baixa registrada para ${debtor.debtorName}.`)}
              >
                <FaCheck className="size-3.5 mr-1.5" />
                Pingou o Pix! (Dar Baixa)
              </Button>

              {/* Botão Cobrar no WhatsApp */}
              <Button
                render={
                  <a
                    href={`https://wa.me/${debtor.debtorPhone.replace(/\D/g, "")}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold border border-zinc-700 h-9 justify-center"
              >
                <FaWhatsapp className="size-3.5 mr-1.5 text-emerald-400" />
                Cobrar no WhatsApp
              </Button>
            </div>

            {/* Links Auxiliares: Copiar Pix & Ver Detalhes */}
            <div className="flex items-center justify-between text-xs font-mono font-semibold pt-1">
              <button
                type="button"
                onClick={handleCopyPix}
                className="text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPix ? (
                  <>
                    <FaCheck className="size-3 text-emerald-400" />
                    <span className="text-emerald-400">Chave Pix Copiada!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="size-3" />
                    <span>Copiar Chave Pix</span>
                  </>
                )}
              </button>

              <Link
                href={`/painel/dividas/${debtor.id}`}
                className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Ver Dívida</span>
                <FaArrowRight className="size-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
