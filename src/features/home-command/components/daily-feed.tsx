"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { FeedOccurrence } from "../types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FaArrowRight,
  FaCheck,
  FaCopy,
  FaWhatsapp,
  FaTriangleExclamation,
  FaClock,
  FaCircleCheck,
} from "react-icons/fa6";
import Link from "next/link";
import { SegmentedTabs, type SegmentedTabItem } from "@/components/ui/segmented-tabs";
import { RegisterExcuseDialog } from "@/features/debts/components/register-excuse-dialog";
import { PayInstallmentDialog } from "@/features/debts/components/pay-installment-dialog";

interface DailyFeedProps {
  feed: FeedOccurrence[];
  pixKeyDefault?: string;
  canCopyPix?: boolean;
  canAttachReceipts?: boolean;
}

export function DailyFeed({
  feed,
  pixKeyDefault = "",
  canCopyPix = false,
  canAttachReceipts = false,
}: DailyFeedProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "overdue" | "upcoming">("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [paidIds, setPaidIds] = React.useState<string[]>([]);

  // Filtra IDs otimistas que ainda não vieram como "recently_paid" do servidor
  const effectivePaidIds = React.useMemo(() => {
    return paidIds.filter((id) => {
      const current = feed.find((item) => item.id === id);
      return current && current.type !== "recently_paid";
    });
  }, [paidIds, feed]);

  const handleCopyPix = (id: string, key?: string) => {
    if (!canCopyPix) return;
    const keyToCopy = key || pixKeyDefault;
    if (!keyToCopy) {
      toast.info("Nenhuma chave Pix configurada na sua conta.");
      return;
    }
    navigator.clipboard.writeText(keyToCopy);
    setCopiedId(id);
    toast.success("Chave Pix copiada para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getWhatsAppUrl = (item: FeedOccurrence) => {
    const phone = item.debtorPhone.replace(/\D/g, "");
    let text = "";

    const activePix = item.pixKey || pixKeyDefault;
    const pixSuffix = canCopyPix && activePix
      ? ` Segue a chave Pix: ${activePix}.`
      : "";

    if (item.type === "urgent_overdue") {
      text = `E aí, ${item.debtorName}! Passando pra avisar que aquela nossa pendência (${item.installmentText}) venceu há alguns dias e o Pix ainda não caiu.${pixSuffix} Valeu!\n\n_(Disparo automático de cobrança • Sistema Caloteiro)_`;
    } else if (item.type === "due_today") {
      text = `Fala ${item.debtorName}, bom dia! Só lembrando que aquela nossa parcela (${item.installmentText}) vence hoje.${pixSuffix} Valeu!\n\n_(Notificação automática de vencimento • Sistema Caloteiro)_`;
    } else {
      text = `Opa ${item.debtorName}, tudo bem? Passando pra lembrar da nossa promessa (${item.installmentText}) que vence em breve.${pixSuffix}\n\n_(Lembrete automático de pendência • Sistema Caloteiro)_`;
    }

    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
  };

  // Contadores dinâmicos por categoria (descontando quem já foi baixado na sessão)
  const overdueItems = feed.filter(
    (i) => i.category === "overdue" && !effectivePaidIds.includes(i.id)
  );
  const upcomingItems = feed.filter(
    (i) => i.category === "upcoming" && !effectivePaidIds.includes(i.id)
  );

  const displayedItems = feed.filter((item) => {
    if (effectivePaidIds.includes(item.id)) return true; // Mantém exibido com status "Milagre Confirmado"
    if (selectedFilter === "overdue") return item.category === "overdue";
    if (selectedFilter === "upcoming") return item.category === "upcoming";
    return true;
  });

  const tabItems: SegmentedTabItem<"all" | "overdue" | "upcoming">[] = [
    {
      id: "all",
      label: "Todas",
      count: feed.length,
    },
    {
      id: "overdue",
      label: "Atrasadas",
      count: overdueItems.length > 0 ? overdueItems.length : undefined,
      countVariant: "danger",
    },
    {
      id: "upcoming",
      label: "A Vencer",
      count: upcomingItems.length > 0 ? upcomingItems.length : undefined,
      countVariant: "warning",
    },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Ocorrências
          </h3>
          <p className="text-xs sm:text-[13px] text-zinc-400 font-mono">
            Linha do tempo das presas prioritárias que exigem sua atenção ou atitude imediata.
          </p>
        </div>

        {/* Filtros por Categoria (SegmentedTabs Unificado) */}
        {feed.length > 0 && (
          <SegmentedTabs<"all" | "overdue" | "upcoming">
            items={tabItems}
            value={selectedFilter}
            onChange={setSelectedFilter}
            ariaLabel="Filtro de ocorrências diárias"
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {/* Lista de Ocorrências ou Empty States Contextuais */}
      {feed.length === 0 ? (
        <div className="py-12 sm:py-16 text-center space-y-3 max-w-md mx-auto">
          <div className="size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-emerald-400">
            <FaCircleCheck className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading text-base font-bold text-white">
              Nenhuma ocorrência para hoje
            </h4>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Todas as suas presas estão sob controle ou você já cobrou quem precisava. Um verdadeiro milagre da praça!
            </p>
          </div>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="py-10 text-center space-y-2 max-w-md mx-auto">
          <div className="size-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <FaCircleCheck className="size-4 text-emerald-400" />
          </div>
          <p className="text-xs font-mono text-zinc-400">
            {selectedFilter === "overdue"
              ? "Nenhuma presa atrasada no momento. Cardume em ordem!"
              : "Nenhum vencimento previsto para os próximos 7 dias."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((item) => {
            const isPaid = effectivePaidIds.includes(item.id) || item.type === "recently_paid";

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
                {/* Informações da Ocorrência (Clicável direto para a Dívida) */}
                <Link
                  href={`/painel/dividas/${item.debtId}`}
                  className="flex items-start gap-3.5 min-w-0 flex-1 group/link cursor-pointer"
                  title="Ver detalhes da dívida"
                >
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
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-heading font-bold text-sm sm:text-base text-white group-hover/link:text-emerald-400 transition-colors truncate">
                        {item.debtorName}
                      </span>

                      {item.debtorNickname && (
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700 whitespace-nowrap shrink-0">
                          {item.debtorNickname}
                        </span>
                      )}

                      {/* Tag de Urgência */}
                      {item.type === "urgent_overdue" && !isPaid && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-mono font-extrabold uppercase whitespace-nowrap shrink-0">
                          Cobrar Urgente
                        </span>
                      )}

                      {item.type === "due_today" && !isPaid && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-extrabold uppercase whitespace-nowrap shrink-0">
                          Vence Hoje
                        </span>
                      )}

                      {isPaid && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-extrabold uppercase whitespace-nowrap shrink-0">
                          Pix no Bolso
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-zinc-400">
                      <strong
                        className={
                          item.type === "urgent_overdue" && !isPaid
                            ? "text-rose-400 font-bold"
                            : "text-zinc-200"
                        }
                      >
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
                </Link>

                {/* Ações Rápidas de Cobrança, Registro de Caô e Baixa */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60 w-full sm:w-auto">
                  {isPaid ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-full sm:w-auto">
                      <FaCheck className="size-3" />
                      Milagre Confirmado
                    </span>
                  ) : (
                    <>
                      {/* Linha 1 no Mobile: Contato e Atalho de Navegação */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        {/* 1. Botão Copiar Pix */}
                        {canCopyPix && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyPix(item.id, item.pixKey)}
                            className="flex-1 sm:flex-initial h-8.5 px-2 sm:px-3 text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 cursor-pointer min-w-0"
                          >
                            {copiedId === item.id ? (
                              <>
                                <FaCheck className="size-3 text-emerald-400 mr-1 shrink-0" />
                                <span className="whitespace-nowrap">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <FaCopy className="size-3 mr-1 text-zinc-400 shrink-0" />
                                <span className="hidden sm:inline whitespace-nowrap">Copiar Pix</span>
                                <span className="sm:hidden whitespace-nowrap">Copiar</span>
                              </>
                            )}
                          </Button>
                        )}

                        {/* 2. Botão WhatsApp */}
                        {item.debtorPhone && (
                          <Button
                            size="sm"
                            className="flex-1 sm:flex-initial h-8.5 px-2 sm:px-3 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xs cursor-pointer min-w-0"
                            render={
                              <a
                                href={getWhatsAppUrl(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <FaWhatsapp className="size-3.5 mr-1 shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">
                              {item.type === "urgent_overdue"
                                ? "Cobrar no Zap"
                                : "Mandar Recado"}
                            </span>
                            <span className="sm:hidden whitespace-nowrap">
                              {item.type === "urgent_overdue" ? "Cobrar" : "Recado"}
                            </span>
                          </Button>
                        )}

                        {/* 3. Atalho no Mobile para a Dívida */}
                        <Link
                          href={`/painel/dividas/${item.debtId}`}
                          title="Ver detalhes da dívida"
                          className="sm:hidden size-8.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
                        >
                          <FaArrowRight className="size-3" />
                        </Link>
                      </div>

                      {/* Ações Principais da Gruta (Mobile: empilhados com Pingou o Pix por último; Desktop: linha única) */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                        {/* 4. Anotar Caô / Desculpa */}
                        <RegisterExcuseDialog
                          installmentId={item.id}
                          debtorName={item.debtorName}
                          installmentText={item.installmentText}
                          dueDateText={item.relativeTimeText}
                          className="w-full sm:w-auto"
                        />

                        {/* 5. Pingou o Pix? (Último no Mobile / Destaque Principal em Branco) */}
                        <PayInstallmentDialog
                          debtId={item.debtId}
                          defaultAmount={Math.max(
                            0,
                            Number(item.nominalAmount) - Number(item.paidAmount ?? 0)
                          )}
                          contextSubtitle={`${item.debtorName} • ${item.installmentText}`}
                          isReceiptLocked={!canAttachReceipts}
                          onSuccess={() => {
                            setPaidIds((prev) => [...prev, item.id]);
                            router.refresh();
                          }}
                          className="w-full sm:w-auto"
                        />

                        {/* 6. Atalho no Desktop para a Dívida */}
                        <Link
                          href={`/painel/dividas/${item.debtId}`}
                          title="Ver detalhes da dívida"
                          className="hidden sm:flex size-8.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
                        >
                          <FaArrowRight className="size-3" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
