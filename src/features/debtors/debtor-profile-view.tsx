"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { DebtorRaioXData } from "@/commons/models/risk-score";
import { formatBRL, formatDate } from "@/commons/utils/format";
import { maskCpf } from "@/commons/utils/masks";
import { Button } from "@/components/ui/button";
import { SectionTabs, type SectionTabItem } from "@/components/ui/section-tabs";
import { RiskSpeedometerChart } from "./components/risk-speedometer-chart";
import { RiskScoreRulesDialog } from "./components/risk-score-rules-dialog";
import { EditDebtorDialog } from "./components/edit-debtor-dialog";
import { DeleteDebtorDialog } from "./components/delete-debtor-dialog";
import {
  FaArrowLeft,
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaPhone,
  FaIdCard,
  FaLocationDot,
  FaKey,
  FaNoteSticky,
  FaCalendarDays,
  FaArrowRight,
  FaFileCirclePlus,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaCommentDots,
  FaPenToSquare,
  FaTrashCan,
} from "react-icons/fa6";

interface DebtorProfileViewProps {
  data: DebtorRaioXData;
}

type DebtorSectionTab = "extrato" | "promessas" | "caos";

export function DebtorProfileView({ data }: DebtorProfileViewProps) {
  const { riskScore, debts, excuses } = data;
  const [currentDebtor, setCurrentDebtor] = React.useState(data.debtor);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [copiedPix, setCopiedPix] = React.useState(false);
  const [activeSectionTab, setActiveSectionTab] =
    React.useState<DebtorSectionTab>("extrato");

  const sectionTabs: SectionTabItem<DebtorSectionTab>[] = [
    {
      id: "extrato",
      label: "Extrato do Score",
      count: riskScore.factors.length,
      accent: "text-zinc-300",
    },
    {
      id: "promessas",
      label: "Promessas da Presa",
      count: debts.length,
      accent: "text-emerald-400",
    },
    {
      id: "caos",
      label: "Mural de Caôs",
      count: excuses.length,
      accent: excuses.length > 0 ? "text-amber-400" : "text-zinc-400",
    },
  ];

  const handleCopyPix = () => {
    if (!currentDebtor.pix_key) return;
    navigator.clipboard.writeText(currentDebtor.pix_key);
    setCopiedPix(true);
    toast.success("Chave Pix copiada com sucesso!");
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full pb-24 sm:pb-6">
      {/* Cabeçalho Solto da Página (Sem Card, sem ícone no h2, sem pílula acima do título) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/painel/devedores"
              className="text-zinc-400 hover:text-white transition-colors p-1.5 -ml-1 rounded-xl hover:bg-zinc-800 shrink-0"
              title="Voltar para Devedores"
            >
              <FaArrowLeft className="size-4" />
            </Link>
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
              {currentDebtor.formattedName}
            </h2>
            <span
              className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 whitespace-nowrap"
              title={currentDebtor.relationshipDesc}
            >
              {currentDebtor.relationshipLabel}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            {currentDebtor.formattedNickname
              ? `Conhecido na praça como "${currentDebtor.formattedNickname}" • Raio-X comportamental e histórico na gruta.`
              : "Raio-X comportamental, pontuação de risco e histórico completo na sua gruta."}
          </p>
        </div>

        {/* Ações Rápidas no Topo */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <RiskScoreRulesDialog
            triggerLabel="Como funciona a pontuação?"
            triggerClassName="w-full sm:w-auto h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-center cursor-pointer"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="w-full sm:w-auto h-9 px-3 text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-center cursor-pointer"
            title="Editar dados da presa"
          >
            <FaPenToSquare className="size-3 text-zinc-400 mr-1.5" />
            <span>Editar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="w-full sm:w-auto h-9 px-3 text-xs font-mono font-bold bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 justify-center cursor-pointer"
            title="Excluir presa da gruta"
          >
            <FaTrashCan className="size-3 mr-1.5" />
            <span>Excluir</span>
          </Button>

          <Button
            render={<Link href={`/painel/dividas/nova?debtorId=${currentDebtor.id}`} />}
            size="sm"
            className="w-full sm:w-auto h-9 px-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold rounded-xl justify-center"
          >
            <FaFileCirclePlus className="size-3.5 mr-1.5" />
            <span>Nova Dívida</span>
          </Button>
        </div>
      </div>

      {/* 4 KPIs Comportamentais da Presa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Taxa de Pontualidade
          </span>
          <div className="font-heading text-xl sm:text-2xl font-black text-white tabular-nums">
            {riskScore.punctualityRate}%
          </div>
          <p className="text-[11px] font-mono text-zinc-400 leading-snug">
            {riskScore.paidOnTimeCount} de {riskScore.totalInstallmentsCount} parcelas honradas no prazo
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Tempo até o Pix
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight tabular-nums">
            {riskScore.averageDaysToPay}{" "}
            <span className="text-xs sm:text-sm font-mono font-normal text-zinc-400">
              {riskScore.averageDaysToPay === 1 ? "dia" : "dias"}
            </span>
          </div>
          <p className="text-[11px] font-mono text-emerald-400 leading-snug">
            {riskScore.averageDaysToPay === 0
              ? "Pagamentos dentro do vencimento"
              : "Média de atraso até quitar a parcela"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Dinheiro na Pista
          </span>
          <div className="font-heading text-xl sm:text-2xl font-black text-white tabular-nums whitespace-nowrap">
            {formatBRL(riskScore.openExposureAmount)}
          </div>
          <p className="text-[11px] font-mono text-zinc-400 leading-snug">
            Já devolveu {formatBRL(riskScore.totalPaidAmount)} na sua mão
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Meteção de Louco
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight tabular-nums">
            {riskScore.excusesCount}{" "}
            <span className="text-xs sm:text-sm font-mono font-normal text-zinc-400">
              {riskScore.excusesCount === 1 ? "caô" : "caôs"}
            </span>
          </div>
          <p className="text-[11px] font-mono text-amber-400 leading-snug">
            {riskScore.overdueInstallmentsCount > 0
              ? `${riskScore.overdueInstallmentsCount} parcela(s) vencida(s) hoje`
              : "Nenhuma parcela atrasada hoje"}
          </p>
        </div>
      </div>

      {/* Grid Principal: Velocímetro Biológico (Esquerda) + Dados Cadastrais do Modal (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Velocímetro Biológico + Arma Automática + Insígnias */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col justify-between gap-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Categorização Biológica da Presa
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Termômetro calculado pelo algoritmo da Mordida Exploratória.
            </p>
          </div>

          {/* Velocímetro Recharts */}
          <RiskSpeedometerChart
            score={riskScore.score}
            tier={riskScore.tier}
            recentDelta={riskScore.recentDelta}
            recentDeltaLabel={riskScore.recentDeltaLabel}
          />

          {/* Insígnias de Gamificação da Presa */}
          {riskScore.badges.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border/50">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Insígnias Conquistadas na Gruta
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {riskScore.badges.map((badge) => {
                  const badgeColors =
                    badge.variant === "emerald"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : badge.variant === "amber"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      : badge.variant === "rose"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      : "border-zinc-700 bg-zinc-900/80 text-zinc-300";

                  return (
                    <div
                      key={badge.id}
                      className={`rounded-xl border p-2.5 space-y-0.5 font-mono ${badgeColors}`}
                    >
                      <div className="text-xs font-bold">{badge.label}</div>
                      <p className="text-[11px] text-zinc-300/90 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ação Automática: Arma Engatilhada no WhatsApp pelo Score */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Arma Engatilhada Automaticamente pelo Score
              </span>
              <p className="text-xs font-mono font-bold text-white">
                {riskScore.weaponLabel}
              </p>
            </div>

            {currentDebtor.cleanPhone && (
              <Button
                render={
                  <a
                    href={riskScore.recommendedWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                size="sm"
                className="w-full sm:w-auto h-9 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold rounded-xl shrink-0 justify-center cursor-pointer"
              >
                <FaWhatsapp className="size-3.5 mr-1.5" />
                <span>Disparar no WhatsApp</span>
              </Button>
            )}
          </div>
        </div>

        {/* Card 2: Dados Cadastrais da Presa na Gruta (Mesmos dados do Modal) */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Dados da Presa na Gruta
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Informações cadastrais, chaves e anotações registradas.
            </p>
          </div>

          <div className="space-y-3 text-xs font-mono flex-1">
            {/* Contato & WhatsApp */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-zinc-300 min-w-0">
                <FaPhone className="size-3.5 text-emerald-400 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase">
                    WhatsApp / Telefone
                  </span>
                  <span className="font-medium text-white truncate block">
                    {currentDebtor.displayPhone || "Sem telefone registrado"}
                  </span>
                </div>
              </div>

              {currentDebtor.cleanPhone && (
                <a
                  href={riskScore.recommendedWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 cursor-pointer w-full sm:w-auto"
                >
                  <FaWhatsapp className="size-3.5" />
                  <span>Conversar</span>
                </a>
              )}
            </div>

            {/* CPF & Endereço */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                  <FaIdCard className="size-3" />
                  <span>CPF / Documento</span>
                </div>
                <p className="font-medium text-zinc-200 truncate">
                  {currentDebtor.document ? maskCpf(currentDebtor.document) : "Não informado"}
                </p>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                  <FaLocationDot className="size-3" />
                  <span>Endereço / Referência</span>
                </div>
                <p
                  className="font-medium text-zinc-200 break-words"
                  title={currentDebtor.address || undefined}
                >
                  {currentDebtor.address || "Não informado"}
                </p>
              </div>
            </div>

            {/* Chave Pix */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <FaKey className="size-3.5 text-amber-400 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase">
                      Chave Pix
                    </span>
                    {currentDebtor.pix_key_type && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {currentDebtor.pix_key_type}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-zinc-200 truncate block">
                    {currentDebtor.pix_key || "Não cadastrada"}
                  </span>
                </div>
              </div>

              {currentDebtor.pix_key && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPix}
                  className="h-8 text-xs font-mono shrink-0 w-full sm:w-auto justify-center"
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

            {/* Observações / Notas */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase">
                <FaNoteSticky className="size-3 text-zinc-400" />
                <span>Observações do Tubarão</span>
              </div>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {currentDebtor.notes || "Nenhuma anotação registrada para esta presa."}
              </p>
            </div>
          </div>

          {currentDebtor.created_at && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 pt-2 border-t border-border/50">
              <FaCalendarDays className="size-3" />
              <span>Marcada na gruta desde {formatDate(currentDebtor.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seção Unificada por SectionTabs: Extrato do Score | Promessas da Presa | Mural de Caôs (Anti-Card Inception) */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              {activeSectionTab === "extrato" &&
                "Extrato de Cicatrização e Sangramento do Score"}
              {activeSectionTab === "promessas" &&
                `Promessas desta Presa (${debts.length})`}
              {activeSectionTab === "caos" &&
                `Mural de Caôs e Desculpas (${excuses.length})`}
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              {activeSectionTab === "extrato" &&
                "Eventos reais desta presa que somaram ou descontaram pontos a partir dos 50 pts iniciais."}
              {activeSectionTab === "promessas" &&
                "Acordos ativos e quitados vinculados a este devedor."}
              {activeSectionTab === "caos" &&
                "Todas as vezes que esta presa pediu mais prazo na gruta."}
            </p>
          </div>

          <SectionTabs<DebtorSectionTab>
            items={sectionTabs}
            value={activeSectionTab}
            onChange={setActiveSectionTab}
            ariaLabel="Histórico detalhado da presa"
            className="lg:w-auto"
          />
        </div>

        {/* Aba 1: Extrato de Cicatrização e Sangramento do Score */}
        {activeSectionTab === "extrato" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {riskScore.factors.map((factor) => {
              const isPositive = factor.type === "healing";
              const isNegative = factor.type === "bleeding";
              return (
                <div
                  key={factor.id}
                  className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isPositive ? (
                      <FaArrowTrendUp className="size-3.5 text-emerald-400 shrink-0" />
                    ) : isNegative ? (
                      <FaArrowTrendDown className="size-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <span className="size-2.5 rounded-full bg-yellow-400 shrink-0" />
                    )}
                    <span className="text-zinc-200 text-xs leading-snug">
                      {factor.label}
                    </span>
                  </div>
                  <span
                    className={`font-bold whitespace-nowrap shrink-0 px-2 py-0.5 rounded-lg border text-[11px] ${
                      isPositive
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                        : isNegative
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
                        : "text-yellow-400 bg-yellow-500/10 border-yellow-500/25"
                    }`}
                  >
                    {factor.points > 0 && factor.type !== "base"
                      ? `+${factor.points} pts`
                      : `${factor.points} pts`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Aba 2: Promessas desta Presa */}
        {activeSectionTab === "promessas" &&
          (debts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {debts.map((debt) => (
                <Link
                  key={debt.id}
                  href={`/painel/dividas/${debt.id}`}
                  className="rounded-2xl border border-border bg-card p-4 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {debt.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${debt.statusBadgeClass}`}
                      >
                        {debt.statusLabel}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400">
                      Firmado em {debt.formattedLoanDate} •{" "}
                      {debt.paidInstallmentsCount}/{debt.installmentsCount}{" "}
                      parcelas pagas
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[10px] text-zinc-500 block">
                        Restante
                      </span>
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        {debt.formattedRemainingAmount}
                      </span>
                    </div>
                    <FaArrowRight className="size-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <p className="text-xs sm:text-sm font-mono text-zinc-400">
                Nenhuma dívida registrada para esta presa ainda.
              </p>
              <Button
                render={
                  <Link href={`/painel/dividas/nova?debtorId=${currentDebtor.id}`} />
                }
                size="sm"
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold rounded-xl"
              >
                Registrar Primeira Dívida
              </Button>
            </div>
          ))}

        {/* Aba 3: Mural de Caôs e Desculpas */}
        {activeSectionTab === "caos" &&
          (excuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {excuses.map((exc) => (
                <div
                  key={exc.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs font-mono"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                    <span className="font-bold text-zinc-300">
                      {exc.debtTitle} (Parcela {exc.installmentNumber})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        exc.wasHonored
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {exc.wasHonored
                        ? "Promessa Cumprida"
                        : `Prometeu p/ ${exc.formattedPromisedDate}`}
                    </span>
                  </div>
                  <p className="text-zinc-200 italic leading-relaxed">
                    &ldquo;{exc.excuseText}&rdquo;
                  </p>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                    <FaCommentDots className="size-3 text-amber-400" />
                    <span>Anotado em {exc.formattedCreatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 max-w-md mx-auto">
              <p className="text-xs sm:text-sm font-mono text-zinc-400">
                Nenhum caô registrado para esta presa até o momento.
              </p>
            </div>
          ))}
      </div>

      {/* Modal de Edição de Dados */}
      <EditDebtorDialog
        debtor={currentDebtor}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={setCurrentDebtor}
      />

      {/* Modal de Exclusão da Presa com Redirecionamento */}
      <DeleteDebtorDialog
        debtor={currentDebtor}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        redirectTo="/painel/devedores"
      />
    </div>
  );
}

