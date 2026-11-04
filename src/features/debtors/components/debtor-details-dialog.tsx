"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { DebtorItemFormatted } from "../types";
import { getNameInitials, formatDate } from "@/commons/utils/format";
import { maskCpf } from "@/commons/utils/masks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  FaLock,
  FaGaugeHigh,
  FaPenToSquare,
  FaTrashCan,
} from "react-icons/fa6";
import { EditDebtorDialog } from "./edit-debtor-dialog";
import { DeleteDebtorDialog } from "./delete-debtor-dialog";

interface DebtorDetailsDialogProps {
  debtor: DebtorItemFormatted | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDebtorUpdated?: (updatedDebtor: DebtorItemFormatted) => void;
  onDebtorDeleted?: (deletedDebtorId: string) => void;
}

export function DebtorDetailsDialog({
  debtor,
  open,
  onOpenChange,
  onDebtorUpdated,
  onDebtorDeleted,
}: DebtorDetailsDialogProps) {
  const [copiedPix, setCopiedPix] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  if (!debtor) return null;

  const handleCopyPix = () => {
    if (!debtor.pix_key) return;
    navigator.clipboard.writeText(debtor.pix_key);
    setCopiedPix(true);
    toast.success("Chave Pix copiada com sucesso!");
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const initials = getNameInitials(debtor.name);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg bg-zinc-900 border-zinc-800 p-4 sm:p-6 space-y-4 max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
          {/* Cabeçalho do Devedor */}
          <DialogHeader className="text-left space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="size-12 rounded-2xl bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-base border border-zinc-700 shrink-0 shadow-xs">
                {initials}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <DialogTitle className="font-heading text-lg font-bold text-white truncate min-w-0">
                    {debtor.formattedName}
                  </DialogTitle>
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0 whitespace-nowrap"
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
                  <DialogDescription className="text-xs font-mono text-zinc-400">
                    Informações cadastrais completas da presa.
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

            {/* Teaser do Velocímetro de Score para planos Lixa e Branco */}
            {!debtor.riskScore && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <FaGaugeHigh className="size-3.5 shrink-0" />
                    <span>Velocímetro de Score &amp; Raio-X Completo</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Descubra se esta presa é um Peixe Voador ou um Caloteiro Profissional com o plano Tubarão Cabeça Chata.
                  </p>
                </div>
                <Button
                  render={<Link href="/painel/conta/assinatura" />}
                  size="sm"
                  className="w-full sm:w-auto h-8 px-3 bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold rounded-xl shrink-0 justify-center"
                >
                  <FaLock className="size-3 mr-1" />
                  <span>Desbloquear</span>
                </Button>
              </div>
            )}

            {/* Ações de Gestão da Presa (Editar e Excluir) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="h-9 px-3 text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/15 border-rose-500/30 rounded-xl justify-center cursor-pointer"
              >
                <FaTrashCan className="size-3 mr-1.5" />
                <span>Excluir Presa</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="h-9 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl justify-center cursor-pointer"
              >
                <FaPenToSquare className="size-3 mr-1.5" />
                <span>Editar Presa</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modais de Edição e Exclusão */}
      <EditDebtorDialog
        debtor={debtor}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={(updated) => {
          onDebtorUpdated?.(updated);
          setIsEditOpen(false);
        }}
      />

      <DeleteDebtorDialog
        debtor={debtor}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={(deletedId) => {
          onDebtorDeleted?.(deletedId);
          setIsDeleteOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
