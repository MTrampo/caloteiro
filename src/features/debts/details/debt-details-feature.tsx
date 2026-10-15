"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DebtDetailsFormatted, InstallmentFormatted } from "@/commons/models/debt";
import type { UserPermissions } from "@/commons/models/subscription";
import { DebtKpis } from "./debt-kpis";
import { DebtorSummaryCard } from "./debtor-summary-card";
import { InstallmentsList } from "./installments-list";
import { PaymentsHistory } from "./payments-history";
import { PaymentModal } from "./payment-modal";
import { ExcuseModal } from "./excuse-modal";
import { FaArrowLeft, FaHandHoldingDollar, FaCalendarDays, FaReceipt } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DebtDetailsFeatureProps {
  initialDebt: DebtDetailsFormatted;
  permissions?: UserPermissions;
}

export function DebtDetailsFeature({
  initialDebt,
  permissions = {
    maxDebtors: 2,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
    isSubscriptionActive: false,
  },
}: DebtDetailsFeatureProps) {
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

        {/* Botão de Ação CTA Principal (Shadcn Button) */}
        {!debt.isFullySettled && (
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={handleOpenGeneralPayment}
          >
            <FaHandHoldingDollar className="size-3.5" />
            <span>Pingou o Pix!</span>
          </Button>
        )}
      </div>

      {/* 4 Cards de Métricas e KPIs Financeiros */}
      <DebtKpis debt={debt} />

      {/* Ficha Resumida do Devedor */}
      <DebtorSummaryCard debtor={debt.debtor} />

      {/* Seção Principal: Cronograma de Parcelas e Extrato de Pix */}
      {permissions.canAccessFinancial ? (
        <Tabs defaultValue="installments" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="installments">
              <FaCalendarDays className="size-3.5" />
              <span>Cronograma de Parcelas</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {debt.installments.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="payments">
              <FaReceipt className="size-3.5" />
              <span>Extrato de Pix</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {debt.payments.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installments">
            <InstallmentsList
              installments={debt.installments}
              onPayInstallment={handleOpenInstallmentPayment}
              onAddExcuse={handleOpenExcuseModal}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsHistory payments={debt.payments} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <InstallmentsList
            installments={debt.installments}
            onPayInstallment={handleOpenInstallmentPayment}
            onAddExcuse={handleOpenExcuseModal}
          />
        </div>
      )}

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

