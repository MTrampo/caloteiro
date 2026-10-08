"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  FaKey,
  FaWhatsapp,
  FaSliders,
  FaCheck,
  FaCopy,
  FaRotateLeft,
  FaCircleInfo,
} from "react-icons/fa6"

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
    "Fala {nome}, beleza? Passando só pra lembrar que aquela nossa parcela vence hoje. Segue a chave Pix: {chave_pix} ({titular} - {banco}). Valeu!",
  template2:
    "E aí {nome}! O prazo venceu faz {dias_atraso} dias e o Pix não pingou. Meu boleto não espera, meu parceiro! Manda aí: {chave_pix} ({titular}).",
  template3:
    "Alerta vermelho, {nome}. Você sumiu há {dias_atraso} dias. Já posso ligar pra sua mãe ou você vai honrar essa promessa agora? Chave Pix: {chave_pix}.",
}

export function SettingsFeature() {
  const [pixType, setPixType] = React.useState("cpf")
  const [pixKey, setPixKey] = React.useState("123.456.789-00")
  const [accountOwner, setAccountOwner] = React.useState("Vinicius")
  const [bankName, setBankName] = React.useState("Nubank")
  const [savedSuccess, setSavedSuccess] = React.useState(false)
  const [copiedVariable, setCopiedVariable] = React.useState<string | null>(null)

  // Templates de mensagens do WhatsApp
  const [template1, setTemplate1] = React.useState(DEFAULT_TEMPLATES.template1)
  const [template2, setTemplate2] = React.useState(DEFAULT_TEMPLATES.template2)
  const [template3, setTemplate3] = React.useState(DEFAULT_TEMPLATES.template3)

  // Tolerâncias
  const [criticalDays, setCriticalDays] = React.useState(30)
  const [defaultPublicMode, setDefaultPublicMode] = React.useState(true)

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopiedVariable(tag)
    setTimeout(() => setCopiedVariable(null), 2000)
  }

  const handleResetTemplate = (num: 1 | 2 | 3) => {
    if (num === 1) setTemplate1(DEFAULT_TEMPLATES.template1)
    if (num === 2) setTemplate2(DEFAULT_TEMPLATES.template2)
    if (num === 3) setTemplate3(DEFAULT_TEMPLATES.template3)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Configurações do Credor
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Armas de cobrança, chave Pix padrão e modelos de mensagens para o WhatsApp.
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FaKey className="size-3.5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Chave Pix de Recebimento
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Essa chave será copiada rapidamente e anexada nas mensagens automáticas de cobrança.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
              Chave Principal Ativa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Tipo de Chave
              </label>
              <select
                value={pixType}
                onChange={(e) => setPixType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-emerald-500 transition-colors"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="celular">Celular / WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="aleatoria">Chave Aleatória</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Chave Pix
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Insira sua chave Pix"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Titular da Conta
              </label>
              <input
                type="text"
                value={accountOwner}
                onChange={(e) => setAccountOwner(e.target.value)}
                placeholder="Ex: Vinicius"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Banco / Instituição
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: Nubank, Itaú"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Prévia de Exibição */}
          <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-zinc-400">
              Prévia formatada para o devedor:
            </span>
            <span className="text-emerald-400 font-bold bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
              Chave: {pixKey} ({accountOwner} - {bankName})
            </span>
          </div>
        </div>

        {/* Card 2: Modelos de Mensagem para o WhatsApp & Painel de Variáveis */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FaWhatsapp className="size-4" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Modelos de Mensagem para o WhatsApp
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Personalize o tom da conversa de acordo com a cara de pau do devedor.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
              Interpolação Automática
            </span>
          </div>

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Nível 1 — Lembrete Amistoso
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Dia do Vencimento
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetTemplate(1)}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
                >
                  <FaRotateLeft className="size-2.5" />
                  <span>Restaurar padrão</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={template1}
                onChange={(e) => setTemplate1(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-emerald-500 leading-relaxed transition-colors"
              />
            </div>

            {/* Modelo 2: Cutucada Ácida */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Nível 2 — Cutucada Ácida do Caloteiro
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Atraso Leve (1 a 5 dias)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetTemplate(2)}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
                >
                  <FaRotateLeft className="size-2.5" />
                  <span>Restaurar padrão</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={template2}
                onChange={(e) => setTemplate2(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-amber-500 leading-relaxed transition-colors"
              />
            </div>

            {/* Modelo 3: Modo Julius */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-xs font-mono font-bold text-rose-400">
                    Nível 3 — Pressão Total / Modo Julius
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Atraso Crítico (&gt; 15 dias)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetTemplate(3)}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
                >
                  <FaRotateLeft className="size-2.5" />
                  <span>Restaurar padrão</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={template3}
                onChange={(e) => setTemplate3(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-rose-500 leading-relaxed transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Tolerâncias e Comportamento do Sistema */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4 w-full">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
            <div className="size-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 shrink-0">
              <FaSliders className="size-3.5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">
                Tolerâncias &amp; Privacidade
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Critérios de alerta de calote e preferências de segurança visual.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4 space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-200 block">
                Dias para Alerta Vermelho (Risco Crítico)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={criticalDays}
                  onChange={(e) => setCriticalDays(Number(e.target.value))}
                  className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white text-center focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-xs font-mono text-zinc-400">
                  dias de atraso antes de acionar a sirene
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-zinc-200 block">
                  Modo Público como Padrão
                </label>
                <p className="text-xs font-mono text-zinc-400">
                  Ao abrir o sistema, entrar sempre na Central de Comando sem valores em R$.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={defaultPublicMode}
                  onChange={(e) => setDefaultPublicMode(e.target.checked)}
                  className="size-4 rounded-sm border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs font-mono text-zinc-300">
                  {defaultPublicMode ? "Ativado (Segurança Máxima)" : "Desativado"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl shadow-xs"
          >
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}
