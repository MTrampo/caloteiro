"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DebtDetailsFormatted, InstallmentFormatted } from "@/commons/models/debt";
import { DebtKpis } from "./debt-kpis";
import { DebtorSummaryCard } from "./debtor-summary-card";
import { InstallmentsList } from "./installments-list";
import { PaymentsHistory } from "./payments-history";
import { PaymentModal } from "./payment-modal";
import { ExcuseModal } from "./excuse-modal";
import { FaArrowLeft, FaHandHoldingDollar } from "react-icons/fa6";

interface DebtDetailsFeatureProps {
  initialDebt: DebtDetailsFormatted;
}

export function DebtDetailsFeature({ initialDebt }: DebtDetailsFeatureProps) {
  const router = useRouter();

  const [debt, setDebt] = React.useState<DebtDetailsFormatted>(initialDebt);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = React.useState(false);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] =
    React.useState<InstallmentFormatted | null>(null);
  const [selectedInstallmentForExcuse, setSelectedInstallmentForExcuse] =
    React.useState<InstallmentFormatted | null>(null);

  // Sincroniza se o Server Component atualizar initialDebt
  React.useEffect(() => {
    setDebt(initialDebt);
  }, [initialDebt]);

  const handleOpenGeneralPayment = () => {
    setSelectedInstallmentForPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenInstallmentPayment = (installment: InstallmentFormatted) => {
    setSelectedInstallmentForPayment(installment);
    setIsPaymentModalOpen(true);
  };

  const handleOpenExcuseModal = (installment: InstallmentFormatted) => {
    setSelectedInstallmentForExcuse(installment);
    setIsExcuseModalOpen(true);
  };

  const handleDataRefresh = () => {
    router.refresh();
  };

  const paymentDefaultAmount = selectedInstallmentForPayment
    ? Math.max(
        0,
        Number(selectedInstallmentForPayment.nominal_amount) -
          Number(selectedInstallmentForPayment.paid_amount)
      )
    : undefined;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Dívida (Solto, sem card, sem ícones no título h2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/painel/dividas"
              className="text-zinc-400 hover:text-white transition-colors p-1.5 -ml-1 rounded-xl hover:bg-zinc-800"
              title="Voltar para a lista de dívidas"
            >
              <FaArrowLeft className="size-4" />
            </Link>
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
              {debt.title}
            </h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${debt.statusBadgeClass}`}
            >
              {debt.statusLabel}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Acordo firmado com {debt.debtor.formattedName} em {debt.formattedLoanDate} • Primeiro vencimento: {debt.formattedFirstDueDate}
          </p>
        </div>

        {/* Botão de Ação CTA Principal (Branco) */}
        {!debt.isFullySettled && (
          <button
            type="button"
            onClick={handleOpenGeneralPayment}
            className="inline-flex items-center justify-center h-9 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
          >
            <FaHandHoldingDollar className="size-3.5" />
            <span>Pingou o Pix!</span>
          </button>
        )}
      </div>

      {/* 4 Cards de Métricas e KPIs Financeiros */}
      <DebtKpis debt={debt} />

      {/* Ficha Resumida do Devedor */}
      <DebtorSummaryCard debtor={debt.debtor} />

      {/* Cronograma Individual de Parcelas em Cards (Sem tabelas) */}
      <InstallmentsList
        installments={debt.installments}
        onPayInstallment={handleOpenInstallmentPayment}
        onAddExcuse={handleOpenExcuseModal}
      />

      {/* Extrato de Pagamentos e Pix Recebidos */}
      <PaymentsHistory payments={debt.payments} />

      {/* Modal: Pingou o Pix! */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debtId={debt.id}
        defaultAmount={paymentDefaultAmount}
        remainingDebtAmount={debt.formattedRemainingAmount}
        onSuccess={handleDataRefresh}
      />

      {/* Modal: Anotar Caô / Desculpa */}
      <ExcuseModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        installment={selectedInstallmentForExcuse}
        onSuccess={handleDataRefresh}
      />
    </div>
  );
}

