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
import { MobileFloatingAction } from "@/components/buttons/mobile-floating-action";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaHandHoldingDollar,
  FaCalendarDays,
  FaFileInvoiceDollar,
  FaEye,
  FaLink,
  FaWhatsapp,
  FaArrowUpRightFromSquare,
  FaLock,
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
  const [isPortalModalOpen, setIsPortalModalOpen] = React.useState(false);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] =
    React.useState<InstallmentFormatted | null>(null);
  const [selectedInstallmentForExcuse, setSelectedInstallmentForExcuse] =
    React.useState<InstallmentFormatted | null>(null);
  const [selectedInstallmentForReceipt, setSelectedInstallmentForReceipt] =
    React.useState<InstallmentFormatted | null>(null);
  const [isAttachReceiptModalOpen, setIsAttachReceiptModalOpen] = React.useState(false);
  const [viewerImageUrl, setViewerImageUrl] = React.useState<string | null>(null);

  const handleOpenGeneralPayment = () => {
    if (debt.isLocked) {
      toast.error("Esta presa está trancada na jaula! Faça upgrade para registrar pagamentos.");
      return;
    }
    setSelectedInstallmentForPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenInstallmentPayment = (installment: InstallmentFormatted) => {
    if (debt.isLocked) {
      toast.error("Esta presa está trancada na jaula! Faça upgrade para registrar pagamentos.");
      return;
    }
    setSelectedInstallmentForPayment(installment);
    setIsPaymentModalOpen(true);
  };

  const handleOpenExcuseModal = (installment: InstallmentFormatted) => {
    if (debt.isLocked) {
      toast.error("Esta presa está trancada na jaula! Faça upgrade para registrar desculpas.");
      return;
    }
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
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full pb-32 sm:pb-6">
      {/* Banner da Jaula do Tubarão (quando a dívida estiver trancada por cota do plano) */}
      {debt.isLocked && (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-black/40">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <FaLock className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                Presa Trancada na Jaula do Tubarão
              </h4>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                {debt.lockedReason || "Esta dívida possui maior valor em aberto e foi bloqueada pelo limite do seu plano atual. Você não pode dar baixa no Pix, enviar recados nem editar este acordo até fazer o upgrade."}
              </p>
            </div>
          </div>
          <Link
            href="/painel/planos"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs shrink-0 transition-colors cursor-pointer w-full sm:w-auto"
          >
            Destravar Presa Agora
          </Link>
        </div>
      )}

      {/* Cabeçalho da Dívida (Solto, sem card, sem ícones no título h2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/painel/dividas"
                className="text-zinc-400 hover:text-white transition-colors p-1.5 -ml-1 rounded-xl hover:bg-zinc-800 shrink-0"
                title="Voltar para a lista de dívidas"
              >
                <FaArrowLeft className="size-4" />
              </Link>
              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {debt.title}
              </h2>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border w-fit ${debt.statusBadgeClass}`}
            >
              {debt.statusLabel}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Acordo firmado com {debt.debtor.formattedName} em {debt.formattedLoanDate} • Primeiro vencimento: {debt.formattedFirstDueDate}
          </p>
        </div>

        {/* Menu do Link da Fatura + Botão de Ação CTA Principal */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 sm:pt-0 w-full sm:w-auto">
          <DebtPortalMenu
            debtId={debt.id}
            debtTitle={debt.title}
            debtorName={debt.debtor.formattedName}
            initialEnabled={debt.publicLinkEnabled}
            initialAccessCode={debt.publicAccessCode}
            canDebtorPortal={permissions.canDebtorPortal}
            onUpdated={handleDataRefresh}
            isMobileDialogOpen={isPortalModalOpen}
            onMobileDialogOpenChange={setIsPortalModalOpen}
          />

          {!debt.isFullySettled && !debt.isLocked && (
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleOpenGeneralPayment}
              className="hidden sm:inline-flex"
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

      {/* Ações Flutuantes no Mobile (FAB Multi-Ações com 3 pontinhos e transição para ✕) */}
      <MobileFloatingAction
        ariaLabel="Ações da dívida"
        actions={[
          ...(!debt.isFullySettled
            ? [
                {
                  label: "Pingou o Pix!",
                  icon: <FaHandHoldingDollar className="size-4 text-emerald-400" />,
                  onClick: handleOpenGeneralPayment,
                  variant: "emerald" as const,
                },
              ]
            : []),
          {
            label: "Configurar Link da Fatura",
            icon: <FaLink className="size-4 text-amber-400" />,
            onClick: () => setIsPortalModalOpen(true),
          },
          ...(debt.publicLinkEnabled
            ? [
                {
                  label: "Copiar Convite p/ WhatsApp",
                  icon: <FaWhatsapp className="size-4 text-emerald-400" />,
                  onClick: () => {
                    const url = `${window.location.origin}/fatura/${debt.id}`;
                    const firstName =
                      debt.debtor.formattedName.split(" ")[0] ||
                      debt.debtor.formattedName;
                    const message =
                      `Olá, ${firstName}! Segue o link privado para você acompanhar os valores e parcelas do nosso acordo (${debt.title}):\n\n` +
                      `Link da fatura: ${url}\n` +
                      `Código de acesso exclusivo: *${debt.publicAccessCode}*\n\n` +
                      `Pode ficar tranquilo(a), a página é protegida por código e somente quem tem esse código consegue visualizar.`;
                    navigator.clipboard.writeText(message);
                    toast.success("Convite com link e código copiado!");
                  },
                },
              ]
            : []),
          {
            label: "Abrir Fatura da Presa",
            icon: <FaArrowUpRightFromSquare className="size-4 text-zinc-300" />,
            href: `/fatura/${debt.id}`,
          },
        ]}
      />
    </div>
  );
}

