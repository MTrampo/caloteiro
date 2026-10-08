"use client"

import * as React from "react"
import { FeedOccurrence } from "../types"
import { Button } from "@/components/ui/button"
import {
  FaArrowRight,
  FaCheck,
  FaCopy,
  FaWhatsapp,
  FaTriangleExclamation,
  FaClock,
  FaCircleCheck,
} from "react-icons/fa6"
import Link from "next/link"

type DailyFeedProps = {
  feed: FeedOccurrence[]
  pixKeyDefault?: string
}

export function DailyFeed({ feed, pixKeyDefault = "11999998888" }: DailyFeedProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [paidIds, setPaidIds] = React.useState<string[]>([])

  const handleCopyPix = (id: string, key?: string) => {
    const keyToCopy = key || pixKeyDefault
    navigator.clipboard.writeText(keyToCopy)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleConfirmPix = (id: string) => {
    setPaidIds((prev) => [...prev, id])
  }

  const getWhatsAppUrl = (item: FeedOccurrence) => {
    const phone = item.debtorPhone.replace(/\D/g, "")
    let text = ""

    if (item.type === "urgent_overdue") {
      text = `E aí, ${item.debtorName}! Passando pra avisar que aquela nossa pendência (${item.installmentText}) venceu há alguns dias e o Pix ainda não caiu. Segue a chave Pix: ${item.pixKey || pixKeyDefault}. Valeu!`
    } else if (item.type === "due_today") {
      text = `Fala ${item.debtorName}, bom dia! Só lembrando que aquela nossa parcela (${item.installmentText}) vence hoje. Segue a chave Pix pra facilitar: ${item.pixKey || pixKeyDefault}. Valeu!`
    } else {
      text = `Opa ${item.debtorName}, tudo bem? Passando pra lembrar da nossa promessa (${item.installmentText}) que vence em breve. Chave Pix: ${item.pixKey || pixKeyDefault}.`
    }

    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Ocorrências &amp; Ações do Dia
          </h3>
          <p className="text-xs sm:text-[13px] text-zinc-400 font-mono">
            Linha do tempo dos alvos prioritários que exigem sua atenção ou atitude imediata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
            {feed.length} eventos pendentes
          </span>
        </div>
      </div>

      {/* Lista de Ocorrências */}
      <div className="space-y-3">
        {feed.map((item) => {
          const isPaid = paidIds.includes(item.id) || item.type === "recently_paid"

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                isPaid
                  ? "bg-zinc-950/40 border-zinc-800/60 opacity-80"
                  : item.type === "urgent_overdue"
                  ? "bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50"
                  : item.type === "due_today"
                  ? "bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50"
                  : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Informações da Ocorrência */}
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Ícone de Estado */}
                <div className="pt-0.5 shrink-0">
                  {isPaid ? (
                    <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FaCircleCheck className="size-4" />
                    </div>
                  ) : item.type === "urgent_overdue" ? (
                    <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <FaTriangleExclamation className="size-4" />
                    </div>
                  ) : (
                    <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FaClock className="size-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-bold text-sm sm:text-base text-white truncate">
                      {item.debtorName}
                    </span>

                    {item.debtorNickname && (
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                        {item.debtorNickname}
                      </span>
                    )}

                    {/* Tag de Urgência */}
                    {item.type === "urgent_overdue" && !isPaid && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-mono font-extrabold uppercase">
                        Cobrar Urgente
                      </span>
                    )}

                    {item.type === "due_today" && !isPaid && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-extrabold uppercase">
                        Vence Hoje
                      </span>
                    )}

                    {isPaid && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-extrabold uppercase">
                        Pix no Bolso
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-zinc-400">
                    <strong className={item.type === "urgent_overdue" && !isPaid ? "text-rose-400 font-bold" : "text-zinc-200"}>
                      {item.relativeTimeText}
                    </strong>{" "}
                    • {item.installmentText}
                    {item.lastExcuseNote && (
                      <span className="italic text-zinc-500 hidden lg:inline">
                        {" "}
                        (Última desculpa: &ldquo;{item.lastExcuseNote}&rdquo;)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
                {isPaid ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <FaCheck className="size-3" />
                    Milagre Confirmado
                  </span>
                ) : (
                  <>
                    {/* Botão Copiar Pix */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyPix(item.id, item.pixKey)}
                      className="h-8.5 text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200"
                    >
                      {copiedId === item.id ? (
                        <>
                          <FaCheck className="size-3 text-emerald-400 mr-1" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <FaCopy className="size-3 mr-1 text-zinc-400" />
                          <span>Copiar Pix</span>
                        </>
                      )}
                    </Button>

                    {/* Botão WhatsApp */}
                    <Button
                      size="sm"
                      className="h-8.5 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xs"
                      render={
                        <a
                          href={getWhatsAppUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <FaWhatsapp className="size-3.5 mr-1" />
                      <span>{item.type === "urgent_overdue" ? "Cobrar no Zap" : "Mandar Recado"}</span>
                    </Button>

                    {/* Botão Dar Baixa */}
                    {item.type === "urgent_overdue" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleConfirmPix(item.id)}
                        className="h-8.5 text-xs font-mono font-bold text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        Pingou?
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Atalho Inteligente para o Acompanhamento Completo */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
        <p className="text-xs font-mono text-zinc-500">
          Visualização enxuta para ações imediatas do dia a dia.
        </p>

        <Link
          href="/painel/dividas/acompanhamento"
          className="text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group"
        >
          <span>Ver acompanhamento completo de todas as promessas</span>
          <FaArrowRight className="size-3 transition-transform group-hover:translate-x-1 text-zinc-400 group-hover:text-white" />
        </Link>
      </div>
    </div>
  )
}

