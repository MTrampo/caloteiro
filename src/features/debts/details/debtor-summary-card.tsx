import * as React from "react";
import { toast } from "sonner";
import type { DebtorItemFormatted } from "@/commons/models/debtor";
import { getNameInitials } from "@/commons/utils/format";
import {
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaEye,
  FaPhone,
  FaIdCard,
  FaLocationDot,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { DebtorDetailsDialog } from "@/features/debtors/components/debtor-details-dialog";

interface DebtorSummaryCardProps {
  debtor: DebtorItemFormatted;
}

export function DebtorSummaryCard({ debtor }: DebtorSummaryCardProps) {
  const [copiedPix, setCopiedPix] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const handleCopyPix = () => {
    if (!debtor.pix_key) return;
    navigator.clipboard.writeText(debtor.pix_key);
    setCopiedPix(true);
    toast.success("Chave Pix copiada para a área de transferência!");
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const initials = getNameInitials(debtor.name);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        {/* Identificação do Devedor */}
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-sm border border-zinc-700 shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h4 className="font-heading text-base font-bold text-white">
                {debtor.formattedName}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 whitespace-nowrap w-fit">
                {debtor.relationshipLabel}
              </span>
            </div>
            {debtor.formattedNickname && (
              <p className="text-xs font-mono text-zinc-400">
                Conhecido na praça como: <span className="text-zinc-200">&ldquo;{debtor.formattedNickname}&rdquo;</span>
              </p>
            )}
          </div>
        </div>

        {/* Ações Rápidas (WhatsApp e Detalhes do Devedor) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          {debtor.cleanPhone && (
            <a
              href={debtor.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-8 px-3 text-xs font-mono font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer w-full sm:w-auto"
            >
              <FaWhatsapp className="size-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDetailsOpen(true)}
            className="h-9 sm:h-8 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <FaEye className="size-3 text-zinc-400" />
            <span>Verificar</span>
          </Button>
        </div>
      </div>

      {/* Grid de Detalhes de Contato e Chaves */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        {/* Telefone */}
        <div className="flex items-center gap-2 text-zinc-300 bg-background/50 p-2.5 rounded-xl border border-border/50">
          <FaPhone className="size-3 text-zinc-500 shrink-0" />
          <span className="truncate">{debtor.displayPhone || "Sem telefone registrado"}</span>
        </div>

        {/* Documento / CPF */}
        <div className="flex items-center gap-2 text-zinc-300 bg-background/50 p-2.5 rounded-xl border border-border/50">
          <FaIdCard className="size-3 text-zinc-500 shrink-0" />
          <span className="truncate">{debtor.document || "CPF não informado"}</span>
        </div>

        {/* Chave Pix com 1-clique para cópia */}
        <div className="flex items-center justify-between gap-2 text-zinc-300 bg-background/50 p-2.5 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">PIX:</span>
            <span className="truncate text-zinc-200">
              {debtor.pix_key || "Não cadastrada"}
            </span>
          </div>
          {debtor.pix_key && (
            <button
              type="button"
              onClick={handleCopyPix}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
              title="Copiar Chave Pix"
            >
              {copiedPix ? (
                <FaCheck className="size-3 text-emerald-400" />
              ) : (
                <FaCopy className="size-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {debtor.address && (
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pt-1">
          <FaLocationDot className="size-3 text-zinc-500 shrink-0" />
          <span className="truncate">Endereço do Alvo: {debtor.address}</span>
        </div>
      )}

      {/* Modal de Detalhes do Devedor */}
      <DebtorDetailsDialog
        debtor={debtor}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}

