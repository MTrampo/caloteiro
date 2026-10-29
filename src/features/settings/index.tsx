"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FaKey,
  FaWhatsapp,
  FaPercent,
  FaCheck,
  FaCopy,
  FaRotateLeft,
  FaCircleInfo,
  FaLock,
} from "react-icons/fa6"
import { saveCreditorSettingsAction } from "@/actions/settings"
import type { CreditorSettings, CreditorSettingsFormInputs } from "@/commons/models/user"
import type { UserPermissions } from "@/commons/models/subscription"
import { type InterestType, INTEREST_TYPE_LABELS } from "@/commons/models/debt"
import { maskPixKey } from "@/commons/utils/masks"
import { formatProperName } from "@/commons/utils/format"

type VariableItem = {
  tag: string
  label: string
  example: string
  desc: string
}

const AVAILABLE_VARIABLES: VariableItem[] = [
  {
    tag: "{nome}",
    label: "Nome do Devedor",
    example: "Marcio",
    desc: "Primeiro nome ou apelido cadastrado.",
  },
  {
    tag: "{chave_pix}",
    label: "Sua Chave Pix",
    example: "123.456.789-00",
    desc: "A chave definida no formulário acima.",
  },
  {
    tag: "{titular}",
    label: "Nome do Titular",
    example: "Vinicius",
    desc: "Nome cadastrado da conta receptora.",
  },
  {
    tag: "{banco}",
    label: "Nome do Banco",
    example: "Nubank",
    desc: "Instituição para conferência do pagador.",
  },
  {
    tag: "{dias_atraso}",
    label: "Dias em Atraso",
    example: "4",
    desc: "Dias corridos decorridos após o vencimento.",
  },
  {
    tag: "{valor}",
    label: "Valor da Parcela",
    example: "R$ 350,00",
    desc: "Valor monetário da pendência atual.",
  },
]

const DEFAULT_TEMPLATES = {
  template1:
    "Fala {nome}, beleza? Passando só pra lembrar que aquela nossa parcela vence hoje. Segue a chave Pix: {chave_pix} ({titular} - {banco}). Valeu!\n\n_(Notificação automática de vencimento • Sistema Caloteiro)_",
  template2:
    "E aí {nome}! O prazo venceu faz {dias_atraso} dias e o Pix não pingou. Meu boleto não espera, meu parceiro! Manda aí: {chave_pix} ({titular}).\n\n_(Disparo automático de cobrança • Sistema Caloteiro)_",
  template3:
    "Alerta vermelho, {nome}. Você sumiu há {dias_atraso} dias. Já posso ligar pra sua mãe ou você vai honrar essa promessa agora? Chave Pix: {chave_pix}.\n\n_(Alerta crítico automático • Sistema Caloteiro)_",
}

const PIX_KEY_TYPES = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "celular", label: "Celular / WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "aleatoria", label: "Chave Aleatória" },
]

const PIX_KEY_LABELS: Record<string, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  celular: "Celular / WhatsApp",
  phone: "Celular / WhatsApp",
  email: "E-mail",
  aleatoria: "Chave Aleatória",
  random: "Chave Aleatória",
}

const normalizePixType = (type?: string | null): string => {
  if (type === "phone") return "celular"
  if (type === "random") return "aleatoria"
  if (type && ["cpf", "cnpj", "celular", "email", "aleatoria"].includes(type)) return type
  return "cpf"
}

interface SettingsFeatureProps {
  initialSettings?: CreditorSettings | null
  permissions?: UserPermissions
}

export function SettingsFeature({
  initialSettings,
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
}: SettingsFeatureProps) {
  // Card 1: Chave Pix
  const [pixType, setPixType] = React.useState<string>(normalizePixType(initialSettings?.pix_key_type))
  const [pixKey, setPixKey] = React.useState(initialSettings?.pix_key || "")
  const [accountOwner, setAccountOwner] = React.useState(initialSettings?.pix_holder_name || "")
  const [bankName, setBankName] = React.useState(initialSettings?.pix_bank_name || "")

  // Card 2: Regras Financeiras e Taxas Padrão
  const [defaultInterestType, setDefaultInterestType] = React.useState<InterestType>(
    (initialSettings?.default_interest_type as InterestType) || "none"
  )
  const [defaultInterestRate, setDefaultInterestRate] = React.useState<string>(
    initialSettings?.default_interest_rate !== undefined && initialSettings?.default_interest_rate !== null
      ? String(initialSettings.default_interest_rate)
      : "0"
  )

  // Card 3: Templates de mensagens do WhatsApp
  const [template1, setTemplate1] = React.useState(
    initialSettings?.template_friendly || DEFAULT_TEMPLATES.template1
  )
  const [template2, setTemplate2] = React.useState(
    initialSettings?.template_acid || DEFAULT_TEMPLATES.template2
  )
  const [template3, setTemplate3] = React.useState(
    initialSettings?.template_critical || DEFAULT_TEMPLATES.template3
  )

  const [isSaving, setIsSaving] = React.useState(false)
  const [savedSuccess, setSavedSuccess] = React.useState(false)
  const [copiedVariable, setCopiedVariable] = React.useState<string | null>(null)

  const canCustomTemplates = permissions.canCustomTemplates

  const interestTypeSelectOptions = [
    { value: "none", label: INTEREST_TYPE_LABELS.none },
    { value: "total_percentage", label: INTEREST_TYPE_LABELS.total_percentage },
    {
      value: "fixed",
      label: permissions.isFreePlan
        ? `${INTEREST_TYPE_LABELS.fixed} (Liberado no Tubarão Branco)`
        : INTEREST_TYPE_LABELS.fixed,
      disabled: permissions.isFreePlan,
    },
    {
      value: "monthly_percentage",
      label: permissions.maxDebtors !== null
        ? `${INTEREST_TYPE_LABELS.monthly_percentage} (Exclusivo Tubarão Cabeça Chato)`
        : INTEREST_TYPE_LABELS.monthly_percentage,
      disabled: permissions.maxDebtors !== null,
    },
  ]

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopiedVariable(tag)
    setTimeout(() => setCopiedVariable(null), 2000)
  }

  const handleResetTemplate = (num: 1 | 2 | 3) => {
    if (!canCustomTemplates) return
    if (num === 1) setTemplate1(DEFAULT_TEMPLATES.template1)
    if (num === 2) setTemplate2(DEFAULT_TEMPLATES.template2)
    if (num === 3) setTemplate3(DEFAULT_TEMPLATES.template3)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const numericRate =
        defaultInterestType === "none"
          ? 0
          : parseFloat(defaultInterestRate.replace(",", ".")) || 0

      const res = await saveCreditorSettingsAction({
        pix_key_type: (pixType || null) as CreditorSettingsFormInputs["pix_key_type"],
        pix_key: pixKey,
        pix_holder_name: accountOwner,
        pix_bank_name: bankName,
        default_interest_type: defaultInterestType,
        default_interest_rate: numericRate,
        template_friendly: canCustomTemplates ? template1 : undefined,
        template_acid: canCustomTemplates ? template2 : undefined,
        template_critical: canCustomTemplates ? template3 : undefined,
      })

      if (res.success) {
        setSavedSuccess(true)
        toast.success("Armas de cobrança e taxas calibradas no cofre!")
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Erro ao salvar configurações do tubarão.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Configurações do Tubarão
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Armas de cobrança, chave Pix padrão, taxas de juros e modelos de mensagens para o WhatsApp.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold animate-in fade-in">
            <FaCheck className="size-3.5" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 w-full">
        {/* Card 1: Meus Dados de Recebimento (Chave Pix) */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 w-full">
          <div className="flex items-start gap-2.5 pb-3 border-b border-zinc-800">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FaKey className="size-3.5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-heading text-base font-bold text-white">
                Chave Pix de Recebimento
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Essa chave será copiada rapidamente e anexada nas mensagens automáticas de cobrança.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field>
              <FieldLabel>Tipo de Chave</FieldLabel>
              <Select
                value={pixType}
                onValueChange={(val) => {
                  if (val) {
                    setPixType(val)
                    setPixKey(maskPixKey(pixKey, val))
                  }
                }}
                items={PIX_KEY_TYPES}
              >
                <SelectTrigger
                  size="lg"
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm h-11 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                >
                  <SelectValue placeholder="Selecione o tipo de chave">
                    {PIX_KEY_LABELS[pixType] || "Selecione o tipo"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200">
                  {PIX_KEY_TYPES.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="hover:bg-zinc-800 focus:bg-zinc-800 text-xs sm:text-sm font-mono py-2 cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Chave Pix</FieldLabel>
              <Input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(maskPixKey(e.target.value, pixType))}
                placeholder="Insira sua chave Pix"
                className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
              />
            </Field>

            <Field>
              <FieldLabel>Titular da Conta</FieldLabel>
              <Input
                type="text"
                value={accountOwner}
                onChange={(e) => setAccountOwner(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value) setAccountOwner(formatProperName(e.target.value))
                }}
                placeholder="Ex: Vinicius Ramos"
                className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
              />
            </Field>

            <Field>
              <FieldLabel>Banco / Instituição</FieldLabel>
              <Input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: Nubank, Itaú"
                className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
              />
            </Field>
          </div>

          {/* Prévia de Exibição */}
          <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-zinc-400">Prévia formatada para o devedor:</span>
            <span className="text-emerald-400 font-bold bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
              Chave: {pixKey || "Não configurada"} ({accountOwner || "Titular"} - {bankName || "Banco"})
            </span>
          </div>
        </div>

        {/* Card 2: Regras Financeiras e Taxas Padrão */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 w-full">
          <div className="flex items-start gap-2.5 pb-3 border-b border-zinc-800">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FaPercent className="size-3.5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-heading text-base font-bold text-white">
                Regras Financeiras e Taxas Padrão
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Calibre a modalidade e o valor padrão de acréscimo pré-carregados ao criar novas dívidas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Modalidade de Juros Padrão</FieldLabel>
              <Select
                value={defaultInterestType}
                onValueChange={(val) => {
                  if (val) {
                    const nextType = val as InterestType
                    setDefaultInterestType(nextType)
                    if (nextType === "none") {
                      setDefaultInterestRate("0")
                    }
                  }
                }}
                items={interestTypeSelectOptions}
              >
                <SelectTrigger
                  size="lg"
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm h-11 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                >
                  <SelectValue placeholder="Selecione a modalidade de juros">
                    {INTEREST_TYPE_LABELS[defaultInterestType] || "Selecione a modalidade"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200">
                  {interestTypeSelectOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                      className="hover:bg-zinc-800 focus:bg-zinc-800 text-xs sm:text-sm font-mono py-2 cursor-pointer data-disabled:opacity-50 data-disabled:pointer-events-none"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>
                {defaultInterestType === "fixed"
                  ? "Valor da Taxa Fixa Padrão (R$)"
                  : defaultInterestType === "monthly_percentage"
                  ? "Taxa Mensal Padrão (% a.m.)"
                  : defaultInterestType === "total_percentage"
                  ? "Taxa Percentual Padrão (%)"
                  : "Taxa de Juros Padrão"}
              </FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                disabled={defaultInterestType === "none"}
                value={defaultInterestType === "none" ? "0" : defaultInterestRate}
                onChange={(e) => setDefaultInterestRate(e.target.value)}
                placeholder={defaultInterestType === "fixed" ? "Ex: 50.00" : "Ex: 5.0"}
                className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </Field>
          </div>

          {/* Explicativo em tempo real */}
          <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-zinc-400">Comportamento em novas dívidas:</span>
            <span className="text-emerald-400 font-medium text-left sm:text-right">
              {defaultInterestType === "none" &&
                "Novas dívidas serão pré-carregadas sem juros (empréstimo camarada)."}
              {defaultInterestType === "fixed" &&
                `Novas dívidas virão com acréscimo fixo padrão de R$ ${Number(defaultInterestRate || 0).toFixed(2)}.`}
              {defaultInterestType === "total_percentage" &&
                `Novas dívidas virão com taxa percentual padrão de ${defaultInterestRate || 0}% sobre o total.`}
              {defaultInterestType === "monthly_percentage" &&
                `Novas dívidas virão com taxa proporcional padrão de ${defaultInterestRate || 0}% ao mês.`}
            </span>
          </div>
        </div>

        {/* Card 3: Modelos de Mensagem para o WhatsApp & Painel de Variáveis */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6 w-full">
          <div className="flex items-start gap-2.5 pb-3 border-b border-zinc-800">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FaWhatsapp className="size-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-heading text-base font-bold text-white">
                Modelos de Mensagem para o WhatsApp
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Personalize o tom da conversa de acordo com a cara de pau do devedor.
              </p>
            </div>
          </div>

          {!canCustomTemplates && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-300">
                <FaLock className="size-3.5 shrink-0 text-amber-400" />
                <span>
                  A edição de mensagens é exclusiva para planos com armas personalizadas. Seu plano utiliza os modelos padrão de alta conversão.
                </span>
              </div>
              <Link
                href="/painel/conta/assinatura"
                className="text-amber-400 underline shrink-0 hover:text-amber-200 font-bold"
              >
                Ver Planos
              </Link>
            </div>
          )}

          {/* Painel Explicativo das Variáveis Dinâmicas */}
          <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FaCircleInfo className="size-3.5 text-zinc-400 shrink-0" />
              <span className="font-heading text-xs font-bold text-white tracking-wide uppercase">
                Variáveis Disponíveis para Personalização
              </span>
              <span className="text-zinc-500 text-xs hidden md:inline">
                (Clique em qualquer tag para copiar e colar no seu texto)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {AVAILABLE_VARIABLES.map((v) => {
                const isCopied = copiedVariable === v.tag

                return (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleCopyTag(v.tag)}
                    className="rounded-lg bg-zinc-900 border border-zinc-800/90 p-2.5 text-left hover:border-emerald-500/40 hover:bg-zinc-850 transition-all group flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                          {v.tag}
                        </code>
                        <span className="text-[11px] font-mono text-zinc-300 font-medium truncate">
                          • {v.label}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate">
                        {v.desc}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5 text-zinc-500 group-hover:text-zinc-300">
                      {isCopied ? (
                        <FaCheck className="size-3 text-emerald-400" />
                      ) : (
                        <FaCopy className="size-3" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lista dos 3 Modelos de Mensagem */}
          <div className="space-y-5">
            {/* Modelo 1: Lembrete Amistoso */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-emerald-400 truncate">
                      Nível 1 — Lembrete Amistoso
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-zinc-500 block">
                    Gatilho: Dia do Vencimento
                  </span>
                </div>

                {canCustomTemplates && (
                  <button
                    type="button"
                    onClick={() => handleResetTemplate(1)}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 transition-colors cursor-pointer pt-0.5"
                  >
                    <FaRotateLeft className="size-2.5" />
                    <span>Restaurar padrão</span>
                  </button>
                )}
              </div>

              <Textarea
                rows={3}
                disabled={!canCustomTemplates}
                value={template1}
                onChange={(e) => setTemplate1(e.target.value)}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 leading-relaxed transition-colors ${
                  !canCustomTemplates ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Modelo 2: Cutucada Ácida */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-amber-400 truncate">
                      Nível 2 — Cutucada Ácida do Caloteiro
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-zinc-500 block">
                    Gatilho: Atraso Leve (1 a 5 dias)
                  </span>
                </div>

                {canCustomTemplates && (
                  <button
                    type="button"
                    onClick={() => handleResetTemplate(2)}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 transition-colors cursor-pointer pt-0.5"
                  >
                    <FaRotateLeft className="size-2.5" />
                    <span>Restaurar padrão</span>
                  </button>
                )}
              </div>

              <Textarea
                rows={3}
                disabled={!canCustomTemplates}
                value={template2}
                onChange={(e) => setTemplate2(e.target.value)}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 leading-relaxed transition-colors ${
                  !canCustomTemplates ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Modelo 3: Modo Julius */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-xs font-mono font-bold text-rose-400 truncate">
                      Nível 3 — Pressão Total / Modo Julius
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-zinc-500 block">
                    Gatilho: Atraso Crítico (&gt; 15 dias)
                  </span>
                </div>

                {canCustomTemplates && (
                  <button
                    type="button"
                    onClick={() => handleResetTemplate(3)}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 transition-colors cursor-pointer pt-0.5"
                  >
                    <FaRotateLeft className="size-2.5" />
                    <span>Restaurar padrão</span>
                  </button>
                )}
              </div>

              <Textarea
                rows={3}
                disabled={!canCustomTemplates}
                value={template3}
                onChange={(e) => setTemplate3(e.target.value)}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus-visible:ring-rose-500/30 focus-visible:border-rose-500 leading-relaxed transition-colors ${
                  !canCustomTemplates ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar (Regra 4A: CTA padronizado em branco) */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isSaving ? "Gravando no Cofre..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  )
}
