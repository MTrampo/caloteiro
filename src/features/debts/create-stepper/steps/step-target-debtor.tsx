"use client";

import * as React from "react";
import Link from "next/link";
import type { DebtorItemFormatted } from "@/commons/models/debtor";
import { getNameInitials } from "@/commons/utils/format";
import {
  FaMagnifyingGlass,
  FaUserPlus,
  FaCheck,
  FaArrowRight,
  FaUser,
  FaPhone,
  FaKey,
} from "react-icons/fa6";

interface StepTargetDebtorProps {
  debtors: DebtorItemFormatted[];
  selectedDebtor: DebtorItemFormatted | null;
  onSelectDebtor: (debtor: DebtorItemFormatted) => void;
  onNext: () => void;
}

export function StepTargetDebtor({
  debtors,
  selectedDebtor,
  onSelectDebtor,
  onNext,
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

        {/* Link para página de novo devedor com retorno automático */}
        <Link
          href="/painel/devedores/novo?returnTo=/painel/dividas/nova"
          className="inline-flex items-center justify-center h-10 px-4 text-xs font-mono font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all gap-2 shrink-0 cursor-pointer"
        >
          <FaUserPlus className="size-3.5 text-emerald-400" />
          <span>Cadastrar Novo Devedor</span>
        </Link>
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
                          "{debtor.formattedNickname}"
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

                {/* Dados de Contato e Chave Pix */}
                <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] font-mono text-zinc-400">
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
          <Link
            href="/painel/devedores/novo?returnTo=/painel/dividas/nova"
            className="inline-flex items-center justify-center h-10 px-5 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all cursor-pointer"
          >
            <FaUserPlus className="size-3.5" />
            <span>Cadastrar Meu Primeiro Devedor</span>
          </Link>
        </div>
      ) : (
        /* Busca Sem Resultados */
        <div className="py-12 text-center space-y-2 max-w-md mx-auto">
          <p className="text-xs font-mono text-zinc-400">
            Nenhum devedor encontrado para o termo "{searchTerm}".
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Barra de Ação Inferior (Avançar para Etapa 2) */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs font-mono text-zinc-400">
          {selectedDebtor ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <FaCheck className="size-3" />
              Alvo selecionado: <strong>{selectedDebtor.formattedName}</strong>
            </span>
          ) : (
            <span>Clique no card do devedor para selecioná-lo</span>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedDebtor}
          onClick={onNext}
          className="inline-flex items-center justify-center h-11 px-6 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Avançar para o Acordo</span>
          <FaArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}

