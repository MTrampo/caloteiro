"use client"

import { Debtor } from "../types"
import { Button } from "@/components/ui/button"
import {
  FaWhatsapp,
  FaCopy,
  FaArrowRight,
  FaCircleCheck,
  FaTriangleExclamation,
  FaClock,
} from "react-icons/fa6"
import Link from "next/link"
import * as React from "react"

type DebtorCardProps = {
  debtor: Debtor
  onCopyPix?: (key: string) => void
}

export function DebtorCard({ debtor }: DebtorCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    if (debtor.pixKey) {
      navigator.clipboard.writeText(debtor.pixKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getWhatsAppUrl = () => {
    const cleanPhone = debtor.phone.replace(/\D/g, "")
    const text = `Fala ${debtor.name}, tudo bem? Passando para ver como estão as pendências que combinamos.`
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`
  }

  const getRiskBadge = () => {
    switch (debtor.riskLevel) {
      case "extreme":
        return { label: "Risco Extremo", color: "bg-rose-500/15 border-rose-500/40 text-rose-400" }
      case "high":
        return { label: "Risco Alto", color: "bg-amber-500/15 border-amber-500/40 text-amber-400" }
      case "medium":
        return { label: "Risco Médio", color: "bg-zinc-800 border-zinc-700 text-zinc-300" }
      default:
        return { label: "Risco Baixo", color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" }
    }
  }

  const getStatusBadge = () => {
    switch (debtor.status) {
      case "critico":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
            <FaTriangleExclamation className="size-2.5" />
            Sumido
          </span>
        )
      case "atraso_leve":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
            <FaClock className="size-2.5" />
            Em Atraso
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
            <FaCircleCheck className="size-2.5" />
            Em Dia
          </span>
        )
    }
  }

  const risk = getRiskBadge()

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-zinc-700 transition-all flex flex-col justify-between gap-4">
      {/* Cabeçalho do Card */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-bold text-white truncate">
                {debtor.name}
              </h3>
              {debtor.nickname && (
                <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                  {debtor.nickname}
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-zinc-400">
              {debtor.phone}
              {debtor.relationship && (
                <span className="text-zinc-500"> • {debtor.relationship}</span>
              )}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {getStatusBadge()}
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${risk.color}`}>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Desculpa Clássica / Observação */}
        {debtor.classicExcuses && (
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-2.5 text-xs font-mono text-zinc-400 italic">
            <span className="text-zinc-500 not-italic font-bold">Dossiê: </span>
            &ldquo;{debtor.classicExcuses}&rdquo;
          </div>
        )}

        {/* Informações adicionais (CPF / Endereço) se existirem */}
        {(debtor.cpf || debtor.address) && (
          <div className="text-[11px] font-mono text-zinc-500 space-y-0.5 pt-1">
            {debtor.cpf && <div>CPF: {debtor.cpf}</div>}
            {debtor.address && <div className="truncate">Endereço: {debtor.address}</div>}
          </div>
        )}

        {/* Contadores de Promessas */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/60 text-xs font-mono">
          <span className="text-zinc-400">
            Pendências ativas:{" "}
            <strong className="text-white">{debtor.activeDebtsCount}</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400">
            Honradas:{" "}
            <strong className="text-emerald-300">{debtor.paidDebtsCount}</strong>
          </span>
        </div>
      </div>

      {/* Ações Rápidas no Rodapé */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xs"
            render={
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <FaWhatsapp className="size-3.5 mr-1" />
            <span>WhatsApp</span>
          </Button>

          {debtor.pixKey && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              <FaCopy className="size-3 mr-1" />
              <span>{copied ? "Copiado!" : "Pix"}</span>
            </Button>
          )}
        </div>

        <Link
          href="/painel/dividas/acompanhamento"
          className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Dívidas</span>
          <FaArrowRight className="size-2.5" />
        </Link>
      </div>
    </div>
  )
}
