"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DebtDetailsFormatted, InstallmentFormatted } from "@/commons/models/debt";
import type { UserPermissions } from "@/commons/models/subscription";
import { DebtKpis } from "./debt-kpis";
import { DebtorSummaryCard } from "./debtor-summary-card";
import { InstallmentsList } from "./installments-list";
import { PaymentModal } from "./payment-modal";
import { ExcuseModal } from "./excuse-modal";
import { DebtPortalMenu } from "./debt-portal-menu";
import { AgreementRulesCard } from "./agreement-rules-card";
import { ReceiptViewerDialog } from "./receipt-viewer-dialog";
import { AttachInstallmentReceiptModal } from "./attach-installment-receipt-modal";
import {
  FaArrowLeft,
  FaHandHoldingDollar,
  FaCalendarDays,
  FaFileInvoiceDollar,
  FaEye,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";

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
  const debt = initialDebt;

  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = React.useState(false);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] =
    React.useState<InstallmentFormatted | null>(null);
  const [selectedInstallmentForExcuse, setSelectedInstallmentForExcuse] =
    React.useState<InstallmentFormatted | null>(null);
  const [selectedInstallmentForReceipt, setSelectedInstallmentForReceipt] =
    React.useState<InstallmentFormatted | null>(null);
  const [isAttachReceiptModalOpen, setIsAttachReceiptModalOpen] = React.useState(false);
  const [viewerImageUrl, setViewerImageUrl] = React.useState<string | null>(null);

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

        {/* Menu do Link da Fatura + Botão de Ação CTA Principal */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <DebtPortalMenu
            debtId={debt.id}
            debtTitle={debt.title}
            debtorName={debt.debtor.formattedName}
            initialEnabled={debt.publicLinkEnabled}
            initialAccessCode={debt.publicAccessCode}
            canDebtorPortal={permissions.canDebtorPortal}
            onUpdated={handleDataRefresh}
          />

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
      </div>

      {/* 4 Cards de Métricas e KPIs Financeiros */}
      <DebtKpis debt={debt} />

      {/* Comprovante do Empréstimo Inicial (se houver) */}
      {debt.loanReceiptUrl && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FaFileInvoiceDollar className="size-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <span>Comprovante de Transferência Inicial</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Prova da Gruta
                </span>
              </h4>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Comprovante do valor enviado ao devedor na formalização do empréstimo.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewerImageUrl(debt.loanReceiptUrl)}
            className="text-xs font-mono text-zinc-300 hover:text-white border-zinc-800"
          >
            <FaEye className="size-3 text-emerald-400" />
            <span>Ver Comprovante</span>
          </Button>
        </div>
      )}

      {/* Alerta de Quebra de Acordo + Cláusulas e Gatilho de Tolerância */}
      <AgreementRulesCard
        debt={debt}
        isFreePlan={permissions.isFreePlan}
        onUpdated={handleDataRefresh}
      />

      {/* Resumo da Presa Marcada */}
      <DebtorSummaryCard debtor={debt.debtor} />

      {/* Seção Principal: Lista de Parcelas */}
      <InstallmentsList
        installments={debt.installments}
        onPayInstallment={handleOpenInstallmentPayment}
        onAddExcuse={handleOpenExcuseModal}
        onViewReceipt={(url) => setViewerImageUrl(url)}
        onAttachReceipt={(inst) => {
          setSelectedInstallmentForReceipt(inst);
          setIsAttachReceiptModalOpen(true);
        }}
      />

      {/* Modal: Pingou o Pix! */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debtId={debt.id}
        defaultAmount={paymentDefaultAmount}
        remainingDebtAmount={debt.formattedRemainingAmount}
        isReceiptLocked={permissions.isFreePlan}
        onSuccess={handleDataRefresh}
        onPreviewReceipt={(url) => setViewerImageUrl(url)}
      />

      {/* Modal: Anexar Comprovante à Parcela */}
      <AttachInstallmentReceiptModal
        isOpen={isAttachReceiptModalOpen}
        onClose={() => {
          setIsAttachReceiptModalOpen(false);
          setSelectedInstallmentForReceipt(null);
        }}
        debtId={debt.id}
        installment={selectedInstallmentForReceipt}
        totalInstallments={debt.installments.length}
        isReceiptLocked={permissions.isFreePlan}
        onSuccess={handleDataRefresh}
        onPreviewReceipt={(url) => setViewerImageUrl(url)}
      />

      {/* Modal: Anotar Caô / Desculpa */}
      <ExcuseModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        installment={selectedInstallmentForExcuse}
        onSuccess={handleDataRefresh}
      />

      {/* Modal: Visualizador de Comprovante em Alta Resolução */}
      <ReceiptViewerDialog
        open={Boolean(viewerImageUrl)}
        onOpenChange={(open) => !open && setViewerImageUrl(null)}
        imageUrl={viewerImageUrl}
      />
    </div>
  );
}

