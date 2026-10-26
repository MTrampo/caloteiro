"use client"

import * as React from "react"
import { toast } from "sonner"
import type { DebtorItemFormatted } from "../types"
import { getNameInitials, formatDate } from "@/commons/utils/format"
import { maskCpf } from "@/commons/utils/masks"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaPhone,
  FaIdCard,
  FaLocationDot,
  FaKey,
  FaNoteSticky,
  FaCalendarDays,
} from "react-icons/fa6"

interface DebtorDetailsDialogProps {
  debtor: DebtorItemFormatted | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DebtorDetailsDialog({
  debtor,
  open,
  onOpenChange,
}: DebtorDetailsDialogProps) {
  const [copiedPix, setCopiedPix] = React.useState(false)

  if (!debtor) return null

  const handleCopyPix = () => {
    if (!debtor.pix_key) return
    navigator.clipboard.writeText(debtor.pix_key)
    setCopiedPix(true)
    toast.success("Chave Pix copiada com sucesso!")
    setTimeout(() => setCopiedPix(false), 2000)
  }

  const initials = getNameInitials(debtor.name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full bg-zinc-900 border-zinc-800 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho do Devedor */}
        <DialogHeader className="text-left space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="size-12 rounded-2xl bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-base border border-zinc-700 shrink-0 shadow-xs">
              {initials}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="font-heading text-lg font-bold text-white truncate">
                  {debtor.formattedName}
                </DialogTitle>
                <span
                  className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                  title={debtor.relationshipDesc}
                >
                  {debtor.relationshipLabel}
                </span>
              </div>

              {debtor.formattedNickname ? (
                <p className="text-xs font-mono text-zinc-400">
                  Vulgo na praça:{" "}
                  <strong className="text-zinc-200">
                    &quot;{debtor.formattedNickname}&quot;
                  </strong>
                </p>
              ) : (
                <DialogDescription>
                  Informações cadastrais completas do devedor.
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Informações Estruturadas em Blocos Limpos */}
        <div className="space-y-3 text-xs font-mono pt-1">
          {/* Contato & WhatsApp */}
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-zinc-300 min-w-0">
              <FaPhone className="size-3.5 text-emerald-400 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase">
                  WhatsApp / Telefone
                </span>
                <span className="font-medium text-white truncate block">
                  {debtor.displayPhone || "Sem telefone registrado"}
                </span>
              </div>
            </div>

            {debtor.cleanPhone && (
              <a
                href={debtor.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
              >
                <FaWhatsapp className="size-3.5" />
                <span>Conversar</span>
              </a>
            )}
          </div>

          {/* Documento & Endereço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CPF */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                <FaIdCard className="size-3" />
                <span>CPF / Documento</span>
              </div>
              <p className="font-medium text-zinc-200 truncate">
                {debtor.document ? maskCpf(debtor.document) : "Não informado"}
              </p>
            </div>

            {/* Endereço */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                <FaLocationDot className="size-3" />
                <span>Endereço / Referência</span>
              </div>
              <p className="font-medium text-zinc-200 truncate" title={debtor.address || undefined}>
                {debtor.address || "Não informado"}
              </p>
            </div>
          </div>

          {/* Chave Pix para Recebimento/Devolução */}
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FaKey className="size-3.5 text-amber-400 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Chave Pix
                  </span>
                  {debtor.pix_key_type && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {debtor.pix_key_type}
                    </span>
                  )}
                </div>
                <span className="font-medium text-zinc-200 truncate block">
                  {debtor.pix_key || "Não cadastrada"}
                </span>
              </div>
            </div>

            {debtor.pix_key && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPix}
                className="h-8 text-xs font-mono shrink-0"
              >
                {copiedPix ? (
                  <>
                    <FaCheck className="size-3 text-emerald-400" />
                    <span>Copiada!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="size-3" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Observações / Notas do Devedor */}
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
              <FaNoteSticky className="size-3 text-zinc-400" />
              <span>Observações &amp; Notas do Devedor</span>
            </div>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {debtor.notes || "Nenhuma anotação registrada para este devedor."}
            </p>
          </div>

          {/* Data de Registro */}
          {debtor.created_at && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
              <FaCalendarDays className="size-3" />
              <span>Marcada na gruta desde {formatDate(debtor.created_at)}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

