"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatShortName } from "@/commons/utils/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaEye,
  FaLock,
  FaGaugeHigh,
  FaEllipsisVertical,
  FaPenToSquare,
  FaFileCirclePlus,
  FaTrashCan,
  FaCrosshairs,
} from "react-icons/fa6";
import type { DebtorItemFormatted } from "../types";
import { DebtorDetailsDialog } from "./debtor-details-dialog";
import { EditDebtorDialog } from "./edit-debtor-dialog";
import { DeleteDebtorDialog } from "./delete-debtor-dialog";

type DebtorCardProps = {
  debtor: DebtorItemFormatted;
  onDebtorUpdated?: (updatedDebtor: DebtorItemFormatted) => void;
  onDebtorDeleted?: (deletedDebtorId: string) => void;
};

export function DebtorCard({
  debtor,
  onDebtorUpdated,
  onDebtorDeleted,
}: DebtorCardProps) {
  const [currentDebtor, setCurrentDebtor] = React.useState<DebtorItemFormatted>(debtor);
  const [copied, setCopied] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    setCurrentDebtor(debtor);
  }, [debtor]);

  const handleCopyPix = () => {
    if (currentDebtor.pix_key) {
      navigator.clipboard.writeText(currentDebtor.pix_key);
      setCopied(true);
      toast.success("Chave Pix copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateSuccess = (updated: DebtorItemFormatted) => {
    setCurrentDebtor(updated);
    onDebtorUpdated?.(updated);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    onDebtorDeleted?.(deletedId);
  };

  const riskScore = currentDebtor.riskScore;
  const displayName = React.useMemo(
    () => formatShortName(currentDebtor.formattedName),
    [currentDebtor.formattedName]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs hover:border-zinc-700 transition-all flex flex-col justify-between gap-4">
      {/* Cabeçalho do Card (Nome Curto, Apelido, Telefone, Relacionamento Separado e Menu de Ações) */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            {/* Linha 1: Nome Curto (Primeiro e Segundo) + Apelido da Presa */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3
                className="font-heading text-sm sm:text-base font-bold text-white truncate max-w-[170px] sm:max-w-none"
                title={currentDebtor.formattedName}
              >
                {displayName}
              </h3>
              {currentDebtor.formattedNickname && (
                <span
                  className="text-[11px] sm:text-xs font-mono text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700 truncate max-w-[110px] sm:max-w-[160px]"
                  title={`Apelido: ${currentDebtor.formattedNickname}`}
                >
                  “{currentDebtor.formattedNickname}”
                </span>
              )}
            </div>

            {/* Linha 2: Telefone de Contato e Badge de Relacionamento Separados (Sem Conflito Visual) */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <p className="text-xs font-mono text-zinc-400">
                {currentDebtor.displayPhone}
              </p>
              {currentDebtor.relationshipLabel && (
                <>
                  <span className="text-zinc-600 text-xs select-none">•</span>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 whitespace-nowrap"
                    title={currentDebtor.relationshipDesc}
                  >
                    {currentDebtor.relationshipLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Menu de Ações (...) Pinoso no Topo Direito com Área de Toque Generosa */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-2 -mr-1.5 -mt-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer outline-none shrink-0"
              title="Ações da presa"
            >
              <FaEllipsisVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-zinc-900 border-zinc-800 text-zinc-200 font-mono text-xs shadow-xl rounded-xl p-1 z-50"
            >
              <DropdownMenuItem
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white text-zinc-300"
              >
                <FaPenToSquare className="size-3.5 text-zinc-400" />
                <span>Editar Presa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/painel/dividas/nova?debtorId=${currentDebtor.id}`} />}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white text-zinc-300"
              >
                <FaFileCirclePlus className="size-3.5 text-zinc-400" />
                <span>Nova Dívida</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800 my-1" />
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-400 text-rose-400"
              >
                <FaTrashCan className="size-3.5 text-rose-400" />
                <span>Excluir Presa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Faixa de Score Biológico (Tubarão Cabeça Chata) ou Teaser Bloqueado (Lixa / Branco) */}
        {riskScore ? (
          <Link
            href={`/painel/devedores/${currentDebtor.id}`}
            className="flex flex-col min-[350px]:flex-row min-[350px]:items-center justify-between gap-2 rounded-xl border border-zinc-800/90 bg-zinc-950/60 hover:border-zinc-700 px-3 py-2 transition-colors group"
            title={riskScore.tierDescription}
          >
            <div className="flex items-center gap-2 shrink-0">
              <FaGaugeHigh
                className="size-3.5 shrink-0"
                style={{ color: riskScore.colorHex }}
              />
              <span className="text-xs font-mono font-bold text-white whitespace-nowrap shrink-0">
                {riskScore.score}/100
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${riskScore.badgeClass}`}
              >
                {riskScore.tierShortLabel}
              </span>
            </div>

            {/* Nova Inteligência Exclusiva TCC: Arma Engatilhada no Score */}
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 shrink-0 self-start min-[350px]:self-auto"
              title={riskScore.weaponLabel}
            >
              <FaCrosshairs className="size-2.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-400 shrink-0 text-[10px]">
                Nv.{riskScore.weaponLevel}
              </span>
              <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                {riskScore.weaponLevel === 3
                  ? "Tio Patinhas"
                  : riskScore.weaponLevel === 2
                  ? "Cobrança Ácida"
                  : "Lembrete"}
              </span>
            </div>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 px-3 py-2 text-left transition-colors cursor-pointer"
            title="Exclusivo do plano Tubarão Cabeça Chata"
          >
            <div className="flex items-center gap-2 text-zinc-400 min-w-0">
              <FaLock className="size-3 text-amber-400 shrink-0" />
              <span className="text-[11px] font-mono font-bold text-zinc-300 whitespace-nowrap">
                Score ??/100
              </span>
              <span className="text-[10px] font-mono text-zinc-500 truncate">
                • Velocímetro Cabeça Chata
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0 whitespace-nowrap">
              Liberar
            </span>
          </button>
        )}
      </div>

      {/* Ações Rápidas no Rodapé: Empilhadas no Mobile e Flex no Desktop */}
      <div className="pt-2 border-t border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
          {riskScore ? (
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/painel/devedores/${currentDebtor.id}`} />}
              className="h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer touch-manipulation w-full sm:w-auto justify-center"
              title="Abrir Raio-X e Velocímetro da Presa"
            >
              <FaEye className="size-3.5 text-zinc-400 mr-1.5 shrink-0" />
              <span>Raio-X</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsDetailsOpen(true)}
              className="h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer touch-manipulation w-full sm:w-auto justify-center"
              title="Verificar Detalhes do Devedor"
            >
              <FaEye className="size-3.5 text-zinc-400 mr-1.5 shrink-0" />
              <span>Detalhes</span>
            </Button>
          )}

          <Button
            size="sm"
            className="h-9 px-3 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xs cursor-pointer touch-manipulation w-full sm:w-auto justify-center"
            render={
              <a
                href={currentDebtor.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <FaWhatsapp className="size-3.5 mr-1.5 shrink-0" />
            <span>WhatsApp</span>
          </Button>

          {currentDebtor.pix_key && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyPix}
              className="h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer touch-manipulation w-full sm:w-auto justify-center"
            >
              {copied ? (
                <FaCheck className="size-3.5 mr-1.5 text-emerald-400 shrink-0" />
              ) : (
                <FaCopy className="size-3.5 mr-1.5 shrink-0" />
              )}
              <span>{copied ? "Copiado!" : "Copiar Pix"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Devedor (Planos Lixa e Branco) */}
      <DebtorDetailsDialog
        debtor={currentDebtor}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onDebtorUpdated={handleUpdateSuccess}
        onDebtorDeleted={handleDeleteSuccess}
      />

      {/* Modal de Edição Rápida */}
      <EditDebtorDialog
        debtor={currentDebtor}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleUpdateSuccess}
      />

      {/* Modal de Exclusão Segura */}
      <DeleteDebtorDialog
        debtor={currentDebtor}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
