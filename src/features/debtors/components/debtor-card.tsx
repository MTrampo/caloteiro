"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaArrowRight,
  FaEye,
} from "react-icons/fa6"
import type { DebtorItemFormatted } from "../types"
import { DebtorDetailsDialog } from "./debtor-details-dialog"

type DebtorCardProps = {
  debtor: DebtorItemFormatted
}

export function DebtorCard({ debtor }: DebtorCardProps) {
  const [copied, setCopied] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  const handleCopyPix = () => {
    if (debtor.pix_key) {
      navigator.clipboard.writeText(debtor.pix_key)
      setCopied(true)
      toast.success("Chave Pix copiada para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-zinc-700 transition-all flex flex-col justify-between gap-4">
      {/* Cabeçalho do Card (Apenas Nome, Apelido, Telefone e Relacionamento) */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-bold text-white truncate" title={debtor.formattedName}>
              {debtor.formattedName}
            </h3>
            {debtor.formattedNickname && (
              <span className="text-xs font-mono text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700 truncate max-w-[160px]" title={debtor.formattedNickname}>
                {debtor.formattedNickname}
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-zinc-400">
            {debtor.displayPhone}
          </p>
        </div>

        {/* Tag de Relacionamento */}
        <div className="shrink-0">
          <span
            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-300"
            title={debtor.relationshipDesc}
          >
            {debtor.relationshipLabel}
          </span>
        </div>
      </div>

      {/* Ações Rápidas no Rodapé */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Botão Olhinho Detalhes do Devedor */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsDetailsOpen(true)}
            className="h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer touch-manipulation"
            title="Verificar Detalhes do Devedor"
          >
            <FaEye className="size-3 text-zinc-400" />
            <span className="hidden sm:inline">Detalhes</span>
          </Button>

          <Button
            size="sm"
            className="h-9 px-3 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xs cursor-pointer touch-manipulation"
            render={
              <a
                href={debtor.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <FaWhatsapp className="size-3.5 mr-1" />
            <span>WhatsApp</span>
          </Button>

          {debtor.pix_key && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyPix}
              className="h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer touch-manipulation"
            >
              {copied ? (
                <FaCheck className="size-3 mr-1 text-emerald-400" />
              ) : (
                <FaCopy className="size-3 mr-1" />
              )}
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

      {/* Modal de Detalhes do Devedor */}
      <DebtorDetailsDialog
        debtor={debtor}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
