"use client";

import * as React from "react";
import type { InstallmentFormatted } from "@/commons/models/debt";
import { InstallmentCard } from "./installment-card";
import { FaArrowDownWideShort } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type InstallmentSortOption =
  | "late_first"
  | "installment_number_asc"
  | "due_date_desc"
  | "only_pending";

const SORT_OPTIONS: { value: InstallmentSortOption; label: string }[] = [
  { value: "late_first", label: "Atrasadas no topo" },
  { value: "installment_number_asc", label: "Ordem cronológica" },
  { value: "due_date_desc", label: "Mais recentes" },
  { value: "only_pending", label: "Apenas em aberto" },
];

const SORT_LABELS: Record<InstallmentSortOption, string> = {
  late_first: "Atrasadas no topo",
  installment_number_asc: "Ordem cronológica",
  due_date_desc: "Mais recentes",
  only_pending: "Apenas em aberto",
};

interface InstallmentsListProps {
  installments: InstallmentFormatted[];
  onPayInstallment: (installment: InstallmentFormatted) => void;
  onAddExcuse: (installment: InstallmentFormatted) => void;
  onViewReceipt?: (url: string) => void;
  onAttachReceipt?: (installment: InstallmentFormatted) => void;
}

const PAGE_SIZE = 12;

export function InstallmentsList({
  installments,
  onPayInstallment,
  onAddExcuse,
  onViewReceipt,
  onAttachReceipt,
}: InstallmentsListProps) {
  const [sortBy, setSortBy] = React.useState<InstallmentSortOption>("late_first");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Ordenação e Filtragem das Parcelas
  const processedInstallments = React.useMemo(() => {
    let list = [...installments];

    if (sortBy === "only_pending") {
      list = list.filter((inst) => inst.status !== "paid");
    }

    list.sort((a, b) => {
      if (sortBy === "late_first") {
        const getScore = (inst: InstallmentFormatted) => {
          if (inst.status === "paid") return 1;
          if (inst.isLate) return 4;
          if (Number(inst.paid_amount) > 0) return 3;
          return 2;
        };

        const scoreDiff = getScore(b) - getScore(a);
        if (scoreDiff !== 0) return scoreDiff;

        // Se ambos estão em atraso, o com mais dias de atraso vem primeiro
        if (b.lateDays !== a.lateDays) {
          return b.lateDays - a.lateDays;
        }

        return a.installment_number - b.installment_number;
      }

      if (sortBy === "due_date_desc") {
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }

      // Default: installment_number_asc
      return a.installment_number - b.installment_number;
    });

    return list;
  }, [installments, sortBy]);

  const hasMore = visibleCount < processedInstallments.length;
  const visibleInstallments = processedInstallments.slice(0, visibleCount);

  // Infinite Scroll com IntersectionObserver
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, processedInstallments.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, processedInstallments.length]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, processedInstallments.length));
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho da Seção com Seletor de Ordenação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h3 className="font-heading text-lg font-bold text-white">
              Cronograma de Parcelas
            </h3>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 whitespace-nowrap w-fit">
              {processedInstallments.length} {processedInstallments.length === 1 ? "parcela" : "parcelas"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Acompanhamento individual de vencimentos, saldos e histórico de promessas.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {/* Seletor de Ordenação Shadcn UI */}
          <Select
            value={sortBy}
            onValueChange={(val) => {
              if (val) {
                setSortBy(val as InstallmentSortOption);
                setVisibleCount(PAGE_SIZE);
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-full sm:w-auto min-w-0 sm:min-w-[175px] bg-zinc-900 border-border text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer rounded-xl"
            >
              <div className="flex items-center gap-1.5 truncate">
                <FaArrowDownWideShort className="size-3 text-zinc-400 shrink-0" />
                <SelectValue placeholder="Ordenar parcelas">
                  {(val) =>
                    val ? SORT_LABELS[val as InstallmentSortOption] || val : "Ordenar parcelas"
                  }
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs font-mono py-1.5 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300 focus:text-white"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Cards de Parcelas */}
      {visibleInstallments.length > 0 ? (
        <div className="space-y-3">
          {visibleInstallments.map((installment) => (
            <InstallmentCard
              key={installment.id}
              installment={installment}
              totalInstallments={installments.length}
              onPayInstallment={onPayInstallment}
              onAddExcuse={onAddExcuse}
              onViewReceipt={onViewReceipt}
              onAttachReceipt={onAttachReceipt}
            />
          ))}

          {/* Elemento Sentinela para o Infinite Scroll */}
          <div ref={sentinelRef} className="h-4 w-full" />

          {/* Fallback de Botão para Carregar Mais Parcelas */}
          {hasMore && (
            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                className="h-8 px-4 text-xs font-mono text-zinc-400 hover:text-white border-zinc-800 cursor-pointer"
              >
                Carregar mais parcelas ({visibleCount} de {processedInstallments.length})
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State caso filtre por 'only_pending' e tudo esteja quitado */
        <div className="py-12 text-center space-y-2 font-mono">
          <p className="text-sm font-bold text-emerald-400">
            Nenhuma parcela pendente!
          </p>
          <p className="text-xs text-zinc-400">
            Todas as parcelas desta dívida já foram totalmente quitadas pelo devedor.
          </p>
        </div>
      )}
    </div>
  );
}
