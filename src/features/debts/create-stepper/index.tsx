"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DebtorItemFormatted } from "@/commons/models/debtor";
import type { UserPermissions, UserPlanLimits } from "@/commons/models/subscription";
import type { InterestType } from "@/commons/models/debt";
import { createDebtAction } from "@/actions/debts";
import { useStepper } from "./utils/stepper-definition";
import { StepperNav } from "./components/stepper-nav";
import { StepTargetDebtor } from "./steps/step-target-debtor";
import {
  StepTermsAndInterest,
  type DebtTermsFormData,
} from "./steps/step-terms-and-interest";
import { StepReviewAndConfirm } from "./steps/step-review-and-confirm";

interface CreateDebtStepperFeatureProps {
  debtors: DebtorItemFormatted[];
  permissions: UserPermissions;
  defaultSettings?: {
    defaultInterestRate: number;
    defaultInterestType: string;
  } | null;
  preselectedDebtorId?: string;
  planLimits?: UserPlanLimits | null;
}

export function CreateDebtStepperFeature({
  debtors,
  permissions,
  defaultSettings,
  preselectedDebtorId,
  planLimits,
}: CreateDebtStepperFeatureProps) {
  const router = useRouter();
  const stepper = useStepper();

  // Devedor selecionado
  const [selectedDebtor, setSelectedDebtor] = React.useState<DebtorItemFormatted | null>(
    () => {
      if (preselectedDebtorId) {
        return debtors.find((d) => d.id === preselectedDebtorId) || null;
      }
      return null;
    }
  );

  // Data atual padrão no formato YYYY-MM-DD
  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  // 1 mês à frente como sugestão inicial do 1º vencimento
  const defaultDueDateStr = React.useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Dados do acordo
  const [formData, setFormData] = React.useState<DebtTermsFormData>({
    title: "",
    category: "personal_loan",
    original_amount: 0,
    interest_type: (defaultSettings?.defaultInterestType as InterestType) || "none",
    interest_rate: defaultSettings?.defaultInterestRate || 0,
    installments_count: 1,
    loan_date: todayStr,
    first_due_date: defaultDueDateStr,
    payment_method: "pix",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Se já houver devedor pré-selecionado via URL, avança automaticamente para a etapa 2
  React.useEffect(() => {
    if (preselectedDebtorId && selectedDebtor && stepper.current.id === "target") {
      stepper.next();
    }
  }, [preselectedDebtorId, selectedDebtor]);

  const handleUpdateFormData = (updated: Partial<DebtTermsFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const canNavigateTo = (stepId: "target" | "terms" | "review") => {
    if (stepId === "target") return true;
    if (stepId === "terms") return !!selectedDebtor;
    if (stepId === "review") {
      return (
        !!selectedDebtor &&
        formData.original_amount > 0 &&
        formData.installments_count > 0 &&
        !!formData.first_due_date &&
        !!formData.title.trim()
      );
    }
    return false;
  };

  const handleFinalConfirm = async (totalAmount: number) => {
    if (!selectedDebtor) {
      toast.error("Selecione um devedor para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createDebtAction({
        debtor_id: selectedDebtor.id,
        title: formData.title.trim() || "Empréstimo Pessoal",
        category: formData.category,
        original_amount: formData.original_amount,
        installments_count: formData.installments_count,
        payment_method: formData.payment_method,
        loan_date: formData.loan_date,
        first_due_date: formData.first_due_date,
        interest_type: formData.interest_type,
        interest_rate: formData.interest_rate,
        total_amount: totalAmount,
        notes: formData.notes.trim() || null,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || "Não foi possível registrar o acordo de dívida.");
        setIsSubmitting(false);
        return;
      }

      toast.success(
        "Acordo firmado com sucesso! O cronograma de cobrança foi ativado no tanque."
      );
      router.push(`/painel/dividas/${res.data.debtId}`);
    } catch {
      toast.error("Erro inesperado ao registrar a dívida.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Tela (Solto, sem card, sem ícones no título h2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Nova Dívida
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Formalize o empréstimo, configure valores e prazos, e ative o rastreio do Tubarão.
          </p>
        </div>
      </div>

      {/* Navegador das 3 Etapas (@stepperize/react) */}
      <StepperNav
        currentStepId={stepper.current.id}
        onStepClick={(id) => stepper.goTo(id)}
        canNavigateTo={canNavigateTo}
      />

      {/* Conteúdo Renderizado da Etapa Atual */}
      <div className="pt-2">
        {stepper.current.id === "target" && (
          <StepTargetDebtor
            debtors={debtors}
            selectedDebtor={selectedDebtor}
            onSelectDebtor={(debtor) => setSelectedDebtor(debtor)}
            onNext={() => stepper.next()}
            planLimits={planLimits}
          />
        )}

        {stepper.current.id === "terms" && (
          <StepTermsAndInterest
            formData={formData}
            permissions={permissions}
            onChange={handleUpdateFormData}
            onPrev={() => stepper.prev()}
            onNext={() => stepper.next()}
          />
        )}

        {stepper.current.id === "review" && selectedDebtor && (
          <StepReviewAndConfirm
            debtor={selectedDebtor}
            formData={formData}
            isSubmitting={isSubmitting}
            onPrev={() => stepper.prev()}
            onConfirm={handleFinalConfirm}
          />
        )}
      </div>
    </div>
  );
}

