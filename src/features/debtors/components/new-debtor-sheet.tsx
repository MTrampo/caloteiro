"use client"

import * as React from "react"
import { Debtor } from "../types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FaUserPlus, FaWhatsapp, FaShieldHalved } from "react-icons/fa6"

type NewDebtorSheetProps = {
  onAddDebtor: (debtor: Debtor) => void
  children?: React.ReactNode
}

export function NewDebtorSheet({ onAddDebtor, children }: NewDebtorSheetProps) {
  const [open, setOpen] = React.useState(false)

  // Campos obrigatórios
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")

  // Campos opcionais
  const [nickname, setNickname] = React.useState("")
  const [relationship, setRelationship] = React.useState("Amigo")
  const [riskLevel, setRiskLevel] = React.useState<Debtor["riskLevel"]>("medium")
  const [cpf, setCpf] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [pixKey, setPixKey] = React.useState("")
  const [classicExcuses, setClassicExcuses] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return

    const newDebtor: Debtor = {
      id: `debtor-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      nickname: nickname.trim() || undefined,
      relationship,
      riskLevel,
      cpf: cpf.trim() || undefined,
      address: address.trim() || undefined,
      pixKey: pixKey.trim() || undefined,
      classicExcuses: classicExcuses.trim() || undefined,
      status: "em_dia",
      activeDebtsCount: 0,
      paidDebtsCount: 0,
    }

    onAddDebtor(newDebtor)
    setOpen(false)

    // Reset form
    setName("")
    setPhone("")
    setNickname("")
    setRelationship("Amigo")
    setRiskLevel("medium")
    setCpf("")
    setAddress("")
    setPixKey("")
    setClassicExcuses("")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={children || (
        <Button size="default" className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl shadow-xs gap-2">
          <FaUserPlus className="size-3.5" />
          <span>Cadastrar Devedor</span>
        </Button>
      )} />

      <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-5">
            <SheetHeader className="p-0 border-b border-zinc-800 pb-4">
              <SheetTitle className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <FaUserPlus className="size-4 text-emerald-400" />
                Cadastrar Figurinha / Devedor
              </SheetTitle>
              <SheetDescription className="text-xs font-mono text-zinc-400">
                Preencha os dados de quem pegou seu dinheiro. Contato e nome são essenciais para cobrança.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              {/* Nome Completo (Obrigatório) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-200 flex items-center justify-between">
                  <span>Nome Completo *</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Obrigatório</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* WhatsApp / Telefone (Obrigatório) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaWhatsapp className="size-3 text-emerald-400" />
                    WhatsApp / Telefone *
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">Obrigatório</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Apelido / Como Você Conhece */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300">
                  Apelido / Como você conhece
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Paulinho do Bar, Cunhado, Mecânico"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Grau de Relação & Risco */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300">
                    Relação
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Amigo">Amigo</option>
                    <option value="Parente">Parente (Perigo Dobrado)</option>
                    <option value="Colega">Colega de Trabalho</option>
                    <option value="Conhecido">Conhecido</option>
                    <option value="Desconhecido">Desconhecido</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1">
                    <FaShieldHalved className="size-2.5 text-zinc-400" />
                    Grau de Risco
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as Debtor["riskLevel"])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="low">Baixo (Paga em dia)</option>
                    <option value="medium">Médio (Avisa se atrasar)</option>
                    <option value="high">Alto (Tem histórico de sumiço)</option>
                    <option value="extreme">Extremo (Golpista em potencial)</option>
                  </select>
                </div>
              </div>

              {/* CPF & Chave Pix do Devedor (Opcionais) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-400">
                    CPF (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-400">
                    Chave Pix (Opcional)
                  </label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Chave dele"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Endereço (Opcional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-400">
                  Endereço / Onde encontrar (Opcional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Desculpas Clássicas / Notas */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-400">
                  Desculpas Clássicas / Notas de Observação
                </label>
                <textarea
                  rows={2}
                  value={classicExcuses}
                  onChange={(e) => setClassicExcuses(e.target.value)}
                  placeholder="Ex: Sempre diz que o banco bloqueou o app ou que a vó foi internada..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t border-zinc-800 flex gap-2">
            <Button
              type="submit"
              disabled={!name.trim() || !phone.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl shadow-xs"
            >
              Salvar Devedor
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

