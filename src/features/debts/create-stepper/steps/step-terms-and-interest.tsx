"use client";

import * as React from "react";
import Link from "next/link";
import { formatBRL } from "@/commons/utils/format";
import {
  DEBT_CATEGORY_LABELS,
  INTEREST_TYPE_LABELS,
  type DebtCategory,
  type InterestType,
} from "@/commons/models/debt";
import type { UserPermissions } from "@/commons/models/subscription";
import { calculateDebtTotals } from "../utils/debt-calculator";
import {
  FaArrowLeft,
  FaArrowRight,
  FaPercent,
  FaBolt,
  FaScaleBalanced,
  FaLock,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";
import { ReceiptAttachmentField } from "@/components/forms/receipt-attachment-field";
import { maskCurrency, parseCurrencyToNumber } from "@/commons/utils/masks";

export interface DebtTermsFormData {
  title: string;
  category: DebtCategory;
  original_amount: number;
  interest_type: InterestType;
  interest_rate: number;
  installments_count: number;
  loan_date: string;
  first_due_date: string;
  payment_method: string;
  notes: string;
  max_late_installments: number | null;
  show_notes_on_invoice: boolean;
  loan_receipt_path?: string | null;
}

interface StepTermsAndInterestProps {
  formData: DebtTermsFormData;
  permissions: UserPermissions;
  onChange: (updated: Partial<DebtTermsFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

const QUICK_TITLES = [
  "Empréstimo Pessoal",
  "Acordo Judicial",
  "Ajuda Familiar",
  "Conserto do Carro",
  "Divisão de Conta",
  "Fiado do Mês",
  "Socorro Emergencial",
];

const QUICK_CLAUSE_TEMPLATES = [
  {
    label: "Quebra na 3ª parcela",
    text: "Se 2 parcelas não forem pagas (seguidas ou alternadas), na 3ª parcela vencida o acordo é quebrado, ocorrendo vencimento antecipado das demais com acréscimo de juros e encaminhamento ao fórum.",
    suggestedMaxLate: 3,
  },
  {
    label: "Acordo Judicial / Fórum",
    text: "Acordo Judicial homologado (Processo nº ___). O atraso ou descumprimento das parcelas acarretará multa contratual e execução imediata nos autos.",
    suggestedMaxLate: 2,
  },
  {
    label: "Perda de Desconto",
    text: "O pagamento pontual garante as condições deste acordo. Em caso de atraso acumulado, o desconto concedido será cancelado e o valor original reestabelecido.",
    suggestedMaxLate: 1,
  },
];

export function StepTermsAndInterest({
  formData,
  permissions,
  onChange,
  onPrev,
  onNext,
}: StepTermsAndInterestProps) {
  // Limites de parcelas do plano
  const maxInstallmentsAllowed = permissions.isFreePlan
    ? 12
    : permissions.maxDebtors !== null && permissions.maxDebtors <= 10
    ? 36
    : 120;

  // Cálculo reativo em tempo real
  const calculation = calculateDebtTotals({
    principalAmount: formData.original_amount,
    interestType: formData.interest_type,
    interestRate: formData.interest_rate,
    installmentsCount: formData.installments_count,
  });

  const availableInstallmentChips = React.useMemo(() => {
    const list = [1, 2, 3, 6, 10, 12];
    if (maxInstallmentsAllowed >= 24) list.push(24);
    if (maxInstallmentsAllowed >= 36) list.push(36);
    return list.filter((n) => n <= maxInstallmentsAllowed);
  }, [maxInstallmentsAllowed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.original_amount <= 0) return;
    if (formData.installments_count <= 0) return;
    if (!formData.first_due_date) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bloco 1: Título & Categoria */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
            Motivo e Categoria da Dívida
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Dê um nome claro para o acordo e classifique a natureza do débito.
          </p>
        </div>

        <div className="space-y-3">
          <Field>
            <FieldLabel>
              Título do Acordo <span className="text-rose-400">*</span>
            </FieldLabel>
            <Input
              type="text"
              required
              value={formData.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Ex: Empréstimo para reforma, Conserto da roda..."
              className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
            />
          </Field>

          {/* Sugestões Rápidas de Título */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500">Sugestões:</span>
            {QUICK_TITLES.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onChange({ title: chip })}
                className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-border/40 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <Field className="pt-1">
            <FieldLabel>
              Categoria <span className="text-rose-400">*</span>
            </FieldLabel>
            <select
              value={formData.category}
              onChange={(e) => onChange({ category: e.target.value as DebtCategory })}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-hidden focus:border-zinc-700 shadow-xs cursor-pointer h-11"
            >
              {Object.entries(DEBT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-zinc-900 text-white">
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Bloco 2: Valores & Juros/Acréscimo */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5 shadow-xs">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
            Capital Emprestado e Juros / Acréscimo
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Defina o montante entregue e se haverá taxa de retorno do Tubarão.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Capital Principal (R$) */}
          <Field>
            <FieldLabel>
              Capital Emprestado <span className="text-rose-400">*</span>
            </FieldLabel>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                R$
              </span>
              <Input
                type="text"
                required
                value={formData.original_amount ? maskCurrency(formData.original_amount) : ""}
                onChange={(e) =>
                  onChange({ original_amount: parseCurrencyToNumber(e.target.value) })
                }
                placeholder="0,00"
                className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
              />
            </div>
          </Field>

          {/* Modalidade de Juros */}
          <Field>
            <FieldLabel>
              Tipo de Juros / Acréscimo
            </FieldLabel>
            <select
              value={formData.interest_type}
              onChange={(e) =>
                onChange({ interest_type: e.target.value as InterestType })
              }
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-hidden focus:border-zinc-700 shadow-xs cursor-pointer h-11"
            >
              <option value="none" className="bg-zinc-900 text-white">
                {INTEREST_TYPE_LABELS.none}
              </option>
              <option value="total_percentage" className="bg-zinc-900 text-white">
                {INTEREST_TYPE_LABELS.total_percentage}
              </option>

              {/* Disponível a partir do Tubarão Branco */}
              {permissions.isFreePlan ? (
                <option value="fixed" disabled className="bg-zinc-900 text-zinc-500">
                  {INTEREST_TYPE_LABELS.fixed} (Liberado no Tubarão Branco)
                </option>
              ) : (
                <option value="fixed" className="bg-zinc-900 text-white">
                  {INTEREST_TYPE_LABELS.fixed}
                </option>
              )}

              {/* Exclusivo Tubarão Cabeça Chato */}
              {permissions.maxDebtors !== null ? (
                <option value="monthly_percentage" disabled className="bg-zinc-900 text-zinc-500">
                  {INTEREST_TYPE_LABELS.monthly_percentage} (Exclusivo Tubarão Cabeça Chato)
                </option>
              ) : (
                <option value="monthly_percentage" className="bg-zinc-900 text-white">
                  {INTEREST_TYPE_LABELS.monthly_percentage}
                </option>
              )}
            </select>
          </Field>
        </div>

        {/* Input da Taxa de Juros (caso diferente de 'none') */}
        {formData.interest_type !== "none" && (
          <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                <FaPercent className="size-3 text-amber-400" />
                <span>
                  {formData.interest_type === "fixed"
                    ? "Valor da Taxa Fixa em Reais (R$):"
                    : formData.interest_type === "monthly_percentage"
                    ? "Taxa Mensal (% ao mês):"
                    : "Taxa Percentual sobre o Total (%):"}
                </span>
              </label>

              <div className="max-w-xs w-full">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.interest_rate || ""}
                  onChange={(e) =>
                    onChange({ interest_rate: parseFloat(e.target.value) || 0 })
                  }
                  placeholder={
                    formData.interest_type === "fixed" ? "Ex: 200.00" : "Ex: 5.0"
                  }
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-zinc-700"
                />
              </div>
            </div>

            <p className="text-[11px] font-mono text-zinc-400">
              {formData.interest_type === "fixed" &&
                `Acréscimo fixo de ${formatBRL(formData.interest_rate)} adicionado diretamente ao montante contratado.`}
              {formData.interest_type === "total_percentage" &&
                `Acréscimo de ${formData.interest_rate}% sobre o capital (${formatBRL(calculation.interestAmount)}).`}
              {formData.interest_type === "monthly_percentage" &&
                `Taxa de ${formData.interest_rate}% a.m. aplicada sobre as ${formData.installments_count} parcelas (${formatBRL(calculation.interestAmount)} de acréscimo total).`}
            </p>
          </div>
        )}

        {/* Card de Simulação Reativa em Tempo Real */}
        {formData.original_amount > 0 && (
          <div className="p-4 rounded-xl bg-background/80 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-zinc-400 block text-[11px]">Resumo do Montante:</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-300">
                  Capital: {formatBRL(formData.original_amount)}
                </span>
                {calculation.interestAmount > 0 && (
                  <span className="text-amber-400 font-medium">
                    + Juros: {formatBRL(calculation.interestAmount)}
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-zinc-400 block text-[11px]">Total a Receber:</span>
              <span className="font-heading font-bold text-base sm:text-lg text-emerald-400">
                {formatBRL(calculation.totalAmount)}
              </span>
              <span className="text-[10px] text-zinc-400 block">
                {formData.installments_count}x de aprox. {formatBRL(calculation.baseInstallmentNominal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bloco 3: Parcelamento & Calendário */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
            Cronograma de Pagamento
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Defina em quantas vezes combinaram de pagar e a data do 1º vencimento.
          </p>
        </div>

        {/* Quantidade de Parcelas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-zinc-300 block">
              Número de Parcelas <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-zinc-500">
              Máximo do seu plano: <strong>{maxInstallmentsAllowed}x</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              max={maxInstallmentsAllowed}
              required
              value={formData.installments_count || ""}
              onChange={(e) =>
                onChange({
                  installments_count: Math.min(
                    maxInstallmentsAllowed,
                    Math.max(1, parseInt(e.target.value) || 1)
                  ),
                })
              }
              className="w-24 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11"
            />

            {/* Chips Rápidos de Parcelamento */}
            <div className="flex flex-wrap items-center gap-1.5">
              {availableInstallmentChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onChange({ installments_count: chip })}
                  className={`text-xs font-mono px-3 h-11 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                    formData.installments_count === chip
                      ? "bg-white text-zinc-950 font-bold border-white"
                      : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                  }`}
                >
                  {chip}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datas: Empréstimo e 1º Vencimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Data do Empréstimo */}
          <Field>
            <FieldLabel>
              Data em que a grana saiu da mão:
            </FieldLabel>
            <DatePicker
              value={formData.loan_date}
              onChange={(val) => onChange({ loan_date: val })}
              placeholder="Selecione a data do empréstimo"
            />
          </Field>

          {/* Primeiro Vencimento (Âncora do Calendário) */}
          <Field>
            <FieldLabel>
              Data do 1º Vencimento <span className="text-rose-400">*</span>
            </FieldLabel>
            <DatePicker
              value={formData.first_due_date}
              onChange={(val) => onChange({ first_due_date: val })}
              placeholder="Selecione a data de vencimento"
            />
          </Field>
        </div>

        {/* AVISO EXPLÍCITO DO CALENDÁRIO RECORRENTE */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-start gap-2.5 text-xs font-mono text-zinc-400">
          <FaBolt className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-zinc-200">Aviso do Tanque:</strong> Os demais vencimentos seguirão rigorosamente o mesmo dia do mês subsequente (ex: se escolher dia 15, as próximas parcelas vencerão dia 15 de cada mês).
          </p>
        </div>

        {/* Anexo de Comprovante de Empréstimo / Transferência Inicial */}
        <div className="pt-2 border-t border-zinc-800/60">
          <ReceiptAttachmentField
            label="Comprovante de Transferência do Empréstimo (Opcional)"
            description="Guarde a prova do Pix/transferência enviada para o devedor."
            folder="loan"
            isLocked={permissions.isFreePlan}
            value={formData.loan_receipt_path || null}
            onChange={(path) => onChange({ loan_receipt_path: path })}
          />
        </div>
      </div>

      {/* Bloco 4: Cláusulas do Acordo e Gatilho de Quebra (Exclusivo Planos Pagos) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FaScaleBalanced className="size-3.5 text-amber-400 shrink-0" />
              <span>Cláusulas do Acordo e Gatilho de Quebra (Opcional)</span>
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Defina condições específicas, número de processo e o limite de parcelas vencidas para disparar o alerta de quebra de acordo.
            </p>
          </div>
        </div>

        {permissions.isFreePlan ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <FaLock className="size-3 shrink-0" />
                <span>Recurso exclusivo dos planos Tubarão Branco e Tubarão Cabeça Chato</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Registre cláusulas de acordos judiciais ou formais, configure alertas automáticos quando X parcelas vencerem e exiba as regras diretamente na fatura da presa.
              </p>
            </div>
            <Link
              href="/painel/assinatura"
              className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs shrink-0 transition-colors"
            >
              Liberar Recurso
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* 1. Gatilho de Tolerância de Atraso */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-mono text-zinc-300 font-medium">
                  Alerta de Quebra por Parcelas Vencidas (seguidas ou acumuladas):
                </label>
                <span className="text-[11px] font-mono text-zinc-500">
                  Avisa na zona de risco e dispara alerta vermelho ao atingir o limite
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ max_late_installments: null })}
                  className={`text-xs font-mono px-3 h-10 rounded-xl border transition-colors cursor-pointer ${
                    formData.max_late_installments === null
                      ? "bg-white text-zinc-950 font-bold border-white"
                      : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                  }`}
                >
                  Sem gatilho
                </button>

                {[1, 2, 3, 4, 5]
                  .filter((n) => n <= Math.max(1, formData.installments_count))
                  .map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onChange({ max_late_installments: count })}
                      className={`text-xs font-mono px-3 h-10 rounded-xl border transition-colors cursor-pointer ${
                        formData.max_late_installments === count
                          ? "bg-amber-400 text-zinc-950 font-bold border-amber-400"
                          : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                      }`}
                    >
                      {count} {count === 1 ? "parcela vencida" : "parcelas vencidas"}
                    </button>
                  ))}
              </div>

              {formData.max_late_installments !== null && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs font-mono text-amber-300">
                  <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    {formData.max_late_installments > 1 ? (
                      <>
                        Se <strong>{formData.max_late_installments - 1}</strong>{" "}
                        {formData.max_late_installments - 1 === 1 ? "parcela atrasar" : "parcelas atrasarem"}, a dívida entrará em{" "}
                        <strong>Zona de Risco</strong>. Na{" "}
                        <strong>{formData.max_late_installments}ª parcela vencida</strong>, o sistema disparará o{" "}
                        <strong>Alerta de Quebra de Acordo</strong>.
                      </>
                    ) : (
                      <>
                        Basta <strong>1 parcela vencer</strong> sem pagamento para o sistema disparar imediatamente o{" "}
                        <strong>Alerta de Quebra de Acordo</strong>.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Descrição das Regras / Cláusulas / Processo (notes) */}
            <Field className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel>
                  Regras, Condições ou Nº do Processo (Termos do Acordo)
                </FieldLabel>
                <span className="text-[10px] font-mono text-zinc-500">
                  {formData.notes.length}/1000
                </span>
              </div>

              <textarea
                rows={3}
                maxLength={1000}
                value={formData.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="Ex: Processo nº 0012345-88.2026 — Se 2 parcelas atrasarem (seguidas ou não), na 3ª o acordo vence antecipadamente com acréscimo de juros e retorna ao fórum..."
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 p-3.5 text-xs sm:text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors resize-y"
              />

              {/* Modelos Rápidos de Cláusulas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-zinc-500">
                  Modelos rápidos:
                </span>
                {QUICK_CLAUSE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() =>
                      onChange({
                        notes: tpl.text,
                        max_late_installments: Math.min(
                          tpl.suggestedMaxLate,
                          Math.max(1, formData.installments_count)
                        ),
                      })
                    }
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-border/50 transition-colors cursor-pointer"
                  >
                    + {tpl.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* 3. Switch para exibir na Fatura Pública da Presa */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.show_notes_on_invoice}
                onChange={(e) =>
                  onChange({ show_notes_on_invoice: e.target.checked })
                }
                className="mt-0.5 size-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
              />
              <div className="space-y-0.5 text-xs font-mono">
                <span className="font-bold text-white block">
                  Exibir regras e cláusulas na Fatura Pública do devedor (/fatura)
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Quando ativado, o devedor verá essas condições destacadas ao abrir o link da fatura para pagar o Pix.
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Botões de Ação Inferiores (Voltar e Avançar) */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onPrev}
          className="w-full sm:w-auto"
        >
          <FaArrowLeft className="size-3" />
          <span>Voltar para O Alvo</span>
        </Button>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full sm:w-auto"
        >
          <span>Avançar para o Resumo</span>
          <FaArrowRight className="size-3" />
        </Button>
      </div>
    </form>
  );
}

