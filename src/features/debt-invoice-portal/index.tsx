"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FaLock,
  FaShieldHalved,
  FaKey,
  FaCopy,
  FaCheck,
  FaWhatsapp,
  FaCalendarDays,
  FaReceipt,
  FaCircleCheck,
  FaClock,
  FaBuildingColumns,
  FaUserCheck,
  FaSpinner,
  FaCoins,
  FaCheckDouble,
  FaClockRotateLeft,
  FaArrowTrendUp,
  FaArrowRight,
  FaMoneyBillWave,
} from "react-icons/fa6";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  verifyDebtInvoiceAccessAction,
  lockDebtInvoiceAction,
} from "@/actions/debts";
import type { PublicDebtInvoiceViewData } from "@/commons/models/debt";

interface DebtInvoicePortalFeatureProps {
  debtId: string;
  initialInvoice: PublicDebtInvoiceViewData | null;
}

export function DebtInvoicePortalFeature({
  debtId,
  initialInvoice,
}: DebtInvoicePortalFeatureProps) {
  const [invoice, setInvoice] = React.useState<PublicDebtInvoiceViewData | null>(
    initialInvoice
  );
  const [accessCode, setAccessCode] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [copiedPix, setCopiedPix] = React.useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("Digite o código de acesso enviado para você.");
      return;
    }

    startTransition(async () => {
      const res = await verifyDebtInvoiceAccessAction({
        debtId,
        accessCode: cleanCode,
      });

      if (res.success && res.data) {
        setInvoice(res.data);
        toast.success("Código validado! Fatura desbloqueada.");
      } else {
        setErrorMsg(
          res.error || "Código de acesso inválido. Confira o código recebido."
        );
      }
    });
  };

  const handleLockInvoice = () => {
    startTransition(async () => {
      await lockDebtInvoiceAction(debtId);
      setInvoice(null);
      setAccessCode("");
      toast.info("Fatura trancada com segurança.");
    });
  };

  const handleCopyPix = () => {
    if (!invoice?.pixKey) {
      toast.info("Chave Pix ainda não informada pelo credor.");
      return;
    }
    navigator.clipboard.writeText(invoice.pixKey);
    setCopiedPix(true);
    toast.success("Chave Pix copiada! Agora é só colar no aplicativo do seu banco.");
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // ============================================================================
  // ESTADO 1: COFRE PROTEGIDO (TELA DE CÓDIGO DE ACESSO — ZERO LEAK)
  // ============================================================================
  if (!invoice) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Cabeçalho Padronizado da Plataforma (idêntico a /assinatura e /painel) */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto">
            <div className="select-none">
              <Logo size="md" showText />
            </div>

            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
              <FaLock className="size-3 text-emerald-400" />
              <span>Ambiente Criptografado</span>
            </span>
          </div>
        </header>

        {/* Card Central de Desbloqueio (Padronizado com SignInFlow / Auth Forms) */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Cabeçalho do Card (Sem ícones flutuantes no topo — Regra #7) */}
              <div className="space-y-1 text-left border-b border-zinc-800/80 pb-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Fatura Protegida por Código
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                  Digite o código de acesso que você recebeu para visualizar os detalhes, parcelas e chave Pix deste acordo.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="invoice-access-code">
                    Código de Acesso
                  </FieldLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <FaKey className="size-3.5" />
                    </div>
                    <Input
                      id="invoice-access-code"
                      type="text"
                      maxLength={16}
                      autoFocus
                      autoComplete="off"
                      value={accessCode}
                      onChange={(e) => {
                        setAccessCode(e.target.value.toUpperCase());
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Ex: 7K9M2P"
                      disabled={isPending}
                      className="pl-9 h-11 font-mono text-sm font-bold tracking-widest uppercase bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                    />
                  </div>
                  {errorMsg && (
                    <p className="text-xs font-mono text-rose-400 pt-1">
                      {errorMsg}
                    </p>
                  )}
                </Field>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl transition-all duration-200 shadow-lg shadow-white/5 cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  {isPending ? (
                    <>
                      <FaSpinner className="size-4 animate-spin text-zinc-950" />
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <>
                      <span>Visualizar Fatura</span>
                      <FaArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Aviso Tranquilizador de Sigilo e Privacidade */}
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/90 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                  <FaShieldHalved className="size-3.5 shrink-0" />
                  <span>Sua privacidade está 100% garantida</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                  Pode ficar tranquilo(a)! Esta página é trancada e protegida. Ninguém na internet consegue ver seu nome, valores ou saber que existe um acordo aqui — somente quem possui o código acima tem acesso.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/40 py-6 text-center text-xs font-mono text-zinc-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            Caloteiro • O combinado não sai caro: transparência e parceria nas contas.
          </div>
        </footer>
      </div>
    );
  }

  // ============================================================================
  // ESTADO 2: FATURA DESBLOQUEADA (ACOMPANHAMENTO COMPLETO PARA O DEVEDOR)
  // ============================================================================
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Cabeçalho Padronizado da Plataforma */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex w-full items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="select-none">
            <Logo size="md" showText />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLockInvoice}
            disabled={isPending}
            className="h-8 text-xs font-mono bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <FaLock className="size-3 text-emerald-400" />
            <span>Trancar Fatura</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full max-w-6xl mx-auto">
        {/* Cabeçalho Solto da Fatura (Idêntico a /painel/dividas/[id] — Regra #7) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                {invoice.title}
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  invoice.isFullySettled
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {invoice.statusLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Olá, {invoice.debtorFirstName}! O combinado não sai caro: acompanhe aqui cada centavo do seu acordo com {invoice.creditorDisplayName}.
            </p>
          </div>
        </div>

        {/* 4 KPIs de Resumo Transparente (Idênticos ao padrão visual de DebtKpis) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Valor Original */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Valor Original</span>
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                <FaCoins className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {invoice.formattedOriginalAmount}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
                Acordo firmado em {invoice.formattedLoanDate}
              </p>
            </div>
          </div>

          {/* KPI 2: Total Combinado (com Juros) */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Total Combinado</span>
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                <FaArrowTrendUp className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {invoice.formattedTotalAmount}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
                {invoice.interestLabel}{" "}
                {invoice.hasInterest && (
                  <span className="text-amber-400">
                    ({invoice.formattedTotalInterestAmount})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* KPI 3: Quanto Já Pagou */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Quanto Já Pagou</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FaCheckDouble className="size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                {invoice.formattedPaidAmount}
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${invoice.progressPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-zinc-400 text-right">
                  {invoice.paidInstallmentsCount} de {invoice.totalInstallmentsCount} parcelas ({invoice.progressPercentage}% quitado)
                </p>
              </div>
            </div>
          </div>

          {/* KPI 4: Quanto Falta Pagar */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Quanto Falta Pagar</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <FaClockRotateLeft className="size-4" />
              </div>
            </div>
            <div>
              <div
                className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                  invoice.isFullySettled ? "text-emerald-400" : "text-white"
                }`}
              >
                {invoice.formattedRemainingAmount}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
                {invoice.isFullySettled
                  ? "Tudo quitado! Parceria honrada."
                  : `${invoice.remainingInstallmentsCount} de ${invoice.totalInstallmentsCount} parcelas restantes`}
              </p>
            </div>
          </div>
        </div>

        {/* Seção Principal de Ação: Próximo Vencimento + Chave Pix do Credor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Coluna Esquerda (5 cols): Próxima Parcela da Vez */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
            {invoice.isFullySettled || !invoice.nextInstallment ? (
              <div className="my-auto py-4 text-center space-y-3">
                <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <FaCircleCheck className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Compromisso 100% Quitado!
                </h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Todas as parcelas deste acordo foram liquidadas. Quando o combinado é cumprido, a amizade e a confiança continuam blindadas!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-zinc-400">
                      Próxima Parcela da Vez
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${invoice.nextInstallment.statusBadgeClass}`}
                    >
                      {invoice.nextInstallment.statusLabel}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-white">
                    Parcela {invoice.nextInstallment.installmentNumber} de{" "}
                    {invoice.totalInstallmentsCount}
                  </h3>

                  <p className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <FaClock className="size-3 text-amber-400 shrink-0" />
                    <span>
                      Vencimento:{" "}
                      <strong className="text-white">
                        {invoice.nextInstallment.formattedDueDate}
                      </strong>{" "}
                      ({invoice.nextInstallment.relativeDueDateLabel})
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-950/70 border border-zinc-800 p-4 space-y-1.5">
                  <span className="text-[11px] font-mono text-zinc-400 block">
                    Valor para quitar esta parcela:
                  </span>
                  <p className="font-mono text-2xl font-bold text-white">
                    {invoice.nextInstallment.formattedRemainingAmount}
                  </p>
                  {invoice.nextInstallment.paidAmount > 0 && (
                    <p className="text-[11px] font-mono text-emerald-400">
                      Valor original da parcela:{" "}
                      {invoice.nextInstallment.formattedNominalAmount} (já abatido:{" "}
                      {invoice.nextInstallment.formattedPaidAmount})
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Coluna Direita (7 cols): Pagamento Rápido via Pix + Dados de Conferência */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-white">
                Dados para Pagamento via Pix
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Copie a chave Pix abaixo e confira o nome do titular no aplicativo do seu banco antes de confirmar.
              </p>
            </div>

            {invoice.pixKey ? (
              <div className="space-y-3">
                {/* Caixa da Chave Pix */}
                <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                        Chave Pix de {invoice.creditorDisplayName}
                      </span>
                      {invoice.pixKeyType && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {invoice.pixKeyType}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm sm:text-base font-bold text-white truncate">
                      {invoice.pixKey}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCopyPix}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs rounded-xl h-10 px-4 shrink-0 cursor-pointer"
                  >
                    {copiedPix ? (
                      <>
                        <FaCheck className="size-3.5 text-emerald-600" />
                        <span>Chave Copiada!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="size-3.5" />
                        <span>Copiar Chave Pix</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Dados Bancários para Conferência Segura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="rounded-xl bg-background/50 border border-border/50 p-3 flex items-center gap-2.5">
                    <FaUserCheck className="size-3.5 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 uppercase block">
                        Titular da Conta
                      </span>
                      <span className="text-zinc-200 font-medium truncate block">
                        {invoice.pixHolderName || invoice.creditorDisplayName}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-background/50 border border-border/50 p-3 flex items-center gap-2.5">
                    <FaBuildingColumns className="size-3.5 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 uppercase block">
                        Instituição / Banco
                      </span>
                      <span className="text-zinc-200 font-medium truncate block">
                        {invoice.pixBankName || "Conferir no app do banco"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-4 text-xs font-mono text-zinc-400">
                A chave Pix não foi cadastrada aqui. Solicite diretamente pelo WhatsApp abaixo.
              </div>
            )}

            {/* Botão para Avisar / Enviar Comprovante no WhatsApp */}
            {invoice.creditorWhatsAppUrl && (
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/50">
                <span className="text-[11px] font-mono text-zinc-400">
                  Fez a transferência? Envie o comprovante para dar baixa na hora:
                </span>
                <a
                  href={invoice.creditorWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-semibold transition-all shrink-0 cursor-pointer"
                >
                  <FaWhatsapp className="size-3.5" />
                  <span>Enviar Comprovante no WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Abas: Cronograma Completo de Parcelas e Recibos de Pagamentos Registrados */}
        <Tabs defaultValue="installments" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="installments">
              <FaCalendarDays className="size-3.5" />
              <span>Cronograma de Parcelas</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {invoice.installments.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="payments">
              <FaReceipt className="size-3.5" />
              <span>Extrato de Pix</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {invoice.payments.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Lista de Parcelas (Idêntica ao InstallmentCard de /painel/dividas/[id]) */}
          <TabsContent value="installments" className="space-y-3">
            {invoice.installments.map((inst) => {
              const isPaid = inst.status === "paid";
              const isLate = inst.isLate;

              return (
                <div
                  key={inst.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-4 ${
                    isPaid
                      ? "border-emerald-500/20 bg-card/60 opacity-90"
                      : isLate
                      ? "border-rose-500/30 bg-card shadow-xs"
                      : "border-border bg-card shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isLate
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        }`}
                      >
                        {inst.installmentNumber}ª
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-white">
                            Parcela {inst.installmentNumber} de {invoice.totalInstallmentsCount}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${inst.statusBadgeClass}`}
                          >
                            {inst.statusLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-0.5">
                          <FaCalendarDays className="size-3 text-zinc-500 shrink-0" />
                          <span>Vencimento: {inst.formattedDueDate}</span>
                          <span className={isLate ? "text-rose-400 font-semibold" : "text-zinc-500"}>
                            • {inst.relativeDueDateLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Valores da Parcela (Idêntico ao InstallmentCard) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border/40 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Valor de Tabela</span>
                      <span className="text-white font-bold text-sm">
                        {inst.formattedNominalAmount}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[11px]">Valor Amortizado</span>
                      <span
                        className={`font-bold text-sm ${
                          inst.paidAmount > 0 ? "text-emerald-400" : "text-zinc-400"
                        }`}
                      >
                        {inst.formattedPaidAmount}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-zinc-500 block text-[11px]">Saldo em Aberto</span>
                      <span
                        className={`font-bold text-sm ${
                          isPaid ? "text-zinc-500 line-through" : "text-amber-400"
                        }`}
                      >
                        {inst.formattedRemainingAmount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Histórico / Recibos de Pagamentos Já Registrados (Idêntico ao PaymentsHistory) */}
          <TabsContent value="payments" className="space-y-3">
            {invoice.payments.length > 0 ? (
              invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FaMoneyBillWave className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-emerald-400">
                          +{payment.formattedAmount}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Pix Confirmado
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">
                        Recebido em: {payment.formattedPaidAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State Limpo e Solto (Sem Borda Pontilhada — Regra 4B) */
              <div className="py-12 text-center space-y-2 max-w-md mx-auto">
                <FaReceipt className="size-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-mono text-zinc-300 font-medium">
                  Nenhum pagamento registrado ainda
                </p>
                <p className="text-xs font-mono text-zinc-500">
                  Assim que os pagamentos forem realizados e confirmados, eles aparecerão listados aqui como comprovante de abatimento.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          Caloteiro • O combinado não sai caro: transparência e parceria nas contas.
        </div>
      </footer>
    </div>
  );
}
