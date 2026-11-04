"use client";

import * as React from "react";
import type { DebtorItemFormatted } from "@/commons/models/debtor";
import { getNameInitials } from "@/commons/utils/format";
import {
  FaMagnifyingGlass,
  FaCheck,
  FaArrowRight,
  FaUser,
  FaPhone,
  FaKey,
  FaGaugeHigh,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { NewButton } from "@/components/buttons/new-button";
import type { UserPlanLimits } from "@/commons/models/subscription";

interface StepTargetDebtorProps {
  debtors: DebtorItemFormatted[];
  selectedDebtor: DebtorItemFormatted | null;
  onSelectDebtor: (debtor: DebtorItemFormatted) => void;
  onNext: () => void;
  planLimits?: UserPlanLimits | null;
}

export function StepTargetDebtor({
  debtors,
  selectedDebtor,
  onSelectDebtor,
  onNext,
  planLimits,
}: StepTargetDebtorProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredDebtors = React.useMemo(() => {
    if (!searchTerm.trim()) return debtors;
    const term = searchTerm.toLowerCase().trim();
    return debtors.filter((d) => {
      const matchName = d.name?.toLowerCase().includes(term);
      const matchNick = d.nickname?.toLowerCase().includes(term);
      const matchPhone = d.phone?.replace(/\D/g, "").includes(term);
      const matchDoc = d.document?.replace(/\D/g, "").includes(term);
      return matchName || matchNick || matchPhone || matchDoc;
    });
  }, [debtors, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Topo da Etapa: Título, Busca & Atalho para Cadastro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, apelido, telefone ou CPF..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 shadow-xs"
          />
        </div>

        {/* Botão para página de novo devedor com retorno automático */}
        <NewButton
          href="/painel/devedores/novo?returnTo=/painel/dividas/nova"
          label="Cadastrar Novo Devedor"
          icon="user-plus"
          size="sm"
          variant="outline"
          isLocked={planLimits?.isDebtorLimitReached}
          lockReason="debtor"
          maxAllowed={planLimits?.maxDebtors ?? 2}
          planName={planLimits?.planName ?? "Tubarão Lixa"}
          className="h-10 text-xs font-mono border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
        />
      </div>

      {/* Lista de Cards de Devedores */}
      {filteredDebtors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDebtors.map((debtor) => {
            const isSelected = selectedDebtor?.id === debtor.id;
            const initials = getNameInitials(debtor.name);

            return (
              <div
                key={debtor.id}
                onClick={() => onSelectDebtor(debtor)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer relative space-y-3 ${
                  isSelected
                    ? "bg-zinc-900 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50"
                    : "bg-card border-border hover:border-zinc-700 hover:bg-zinc-900/60"
                }`}
              >
                {/* Header do Card com Avatar e Seleção */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                        isSelected
                          ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-heading text-sm font-bold text-white truncate">
                        {debtor.formattedName}
                      </h4>
                      {debtor.formattedNickname ? (
                        <p className="text-xs font-mono text-zinc-400 truncate">
                          {debtor.formattedNickname}
                        </p>
                      ) : (
                        <p className="text-xs font-mono text-zinc-500 truncate">
                          {debtor.relationshipLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Indicador de Seleção */}
                  <div
                    className={`size-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? "bg-emerald-500 text-zinc-950 shadow-xs"
                        : "border border-zinc-700 bg-zinc-800/50"
                    }`}
                  >
                    {isSelected && <FaCheck className="size-2.5 stroke-[2.5]" />}
                  </div>
                </div>

                {/* Dados de Contato, Chave Pix e Score */}
                <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] font-mono text-zinc-400">
                  {debtor.riskScore && (
                    <div className="flex items-center justify-between gap-2 pb-1">
                      <span className="text-[10px] text-zinc-500 uppercase">
                        Score na Gruta:
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap flex items-center gap-1 ${debtor.riskScore.badgeClass}`}
                      >
                        <FaGaugeHigh className="size-2.5" />
                        <span>
                          {debtor.riskScore.score} pts • {debtor.riskScore.tierShortLabel}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 truncate">
                    <FaPhone className="size-2.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{debtor.displayPhone || "Sem telefone"}</span>
                  </div>
                  {debtor.pix_key && (
                    <div className="flex items-center gap-2 truncate text-zinc-300">
                      <FaKey className="size-2.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Pix: {debtor.pix_key}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : debtors.length === 0 ? (
        /* Empty State Sem Devedores Cadastrados */
        <div className="py-16 sm:py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="size-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <FaUser className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-mono text-white font-bold">
              Nenhum devedor encontrado no tanque!
            </p>
            <p className="text-xs font-mono text-zinc-400">
              Antes de firmar um acordo, você precisa cadastrar quem pegou o seu dinheiro.
            </p>
          </div>
          <NewButton
            href="/painel/devedores/novo?returnTo=/painel/dividas/nova"
            label="Cadastrar Meu Primeiro Devedor"
            icon="user-plus"
          />
        </div>
      ) : (
        /* Busca Sem Resultados */
        <div className="py-12 text-center space-y-2 max-w-md mx-auto">
          <p className="text-xs font-mono text-zinc-400">
            Nenhum devedor encontrado para o termo &quot;{searchTerm}&quot;.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="text-emerald-400"
          >
            Limpar busca
          </Button>
        </div>
      )}

      {/* Alerta Preventivo de Risco (quando a presa selecionada tem Score < 50) */}
      {selectedDebtor?.riskScore && selectedDebtor.riskScore.score < 50 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <FaTriangleExclamation className="size-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-xs sm:text-sm font-bold text-amber-300">
                  Alerta Preventivo da Gruta: {selectedDebtor.riskScore.tierLabel} ({selectedDebtor.riskScore.score}/100 pts)
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
                Esta presa está abaixo da linha de segurança (50 pts)
                {selectedDebtor.riskScore.overdueInstallmentsCount > 0
                  ? `, possui ${selectedDebtor.riskScore.overdueInstallmentsCount} parcela(s) vencida(s)`
                  : ""}
                {selectedDebtor.riskScore.excusesCount > 0
                  ? ` e já deu ${selectedDebtor.riskScore.excusesCount} caô(s)`
                  : ""}
                . Recomendação do Tubarão: aplique juros mensais/taxa fixa na próxima etapa e configure um gatilho curto de quebra de acordo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Ação Inferior (Avançar para Etapa 2) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="text-xs font-mono text-zinc-400 w-full sm:w-auto text-center sm:text-left">
          {selectedDebtor ? (
            <span className="text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <FaCheck className="size-3" />
              Alvo selecionado: <strong>{selectedDebtor.formattedName}</strong>
            </span>
          ) : (
            <span>Clique no card do devedor para selecioná-lo</span>
          )}
        </div>

        <Button
          type="button"
          variant="default"
          size="lg"
          disabled={!selectedDebtor}
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          <span>Avançar para o Acordo</span>
          <FaArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}

