"use client"

import * as React from "react"
import { Debtor, DebtorStatus } from "./types"
import { DebtorCard } from "./components/debtor-card"
import { NewDebtorSheet } from "./components/new-debtor-sheet"
import { FaMagnifyingGlass } from "react-icons/fa6"

const initialDebtors: Debtor[] = [
  {
    id: "d-1",
    name: "Marcio Ramos",
    nickname: "Marcio da Oficina",
    phone: "(11) 98765-4321",
    relationship: "Amigo de Infância",
    riskLevel: "high",
    status: "atraso_leve",
    activeDebtsCount: 1,
    paidDebtsCount: 2,
    pixKey: "11987654321",
    classicExcuses: "Falou que o banco bloqueou o aplicativo dele até segunda",
  },
  {
    id: "d-2",
    name: "Cleiton Lopes",
    nickname: "Cunhado",
    phone: "(11) 99888-7766",
    relationship: "Parente",
    riskLevel: "extreme",
    status: "critico",
    activeDebtsCount: 2,
    paidDebtsCount: 0,
    pixKey: "11998887766",
    classicExcuses: "Disse que o vale ia cair às 16h mas o chefe viajou",
  },
  {
    id: "d-3",
    name: "Ricardo Alvarenga",
    nickname: "Ricardinho do Futebol",
    phone: "(11) 97777-6655",
    relationship: "Colega",
    riskLevel: "medium",
    status: "em_dia",
    activeDebtsCount: 1,
    paidDebtsCount: 4,
    pixKey: "11977776655",
  },
  {
    id: "d-4",
    name: "Beto Silveira",
    nickname: "Beto Churrasqueiro",
    phone: "(11) 96666-5544",
    relationship: "Amigo",
    riskLevel: "low",
    status: "em_dia",
    activeDebtsCount: 0,
    paidDebtsCount: 6,
    pixKey: "11966665544",
  },
]

export function DebtorsFeature() {
  const [debtors, setDebtors] = React.useState<Debtor[]>(initialDebtors)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<DebtorStatus | "all">("all")

  const handleAddDebtor = (newDebtor: Debtor) => {
    setDebtors((prev) => [newDebtor, ...prev])
  }

  const filteredDebtors = React.useMemo(() => {
    return debtors.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.nickname && d.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.phone.includes(searchTerm)

      const matchStatus = statusFilter === "all" || d.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [debtors, searchTerm, statusFilter])

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Lista de Devedores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Devedores &amp; Suspeitos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Dossiê completo, contatos e histórico de quem pegou seu dinheiro.
          </p>
        </div>

        <NewDebtorSheet onAddDebtor={handleAddDebtor} />
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, apelido ou WhatsApp..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 shadow-xs"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              statusFilter === "all"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Todos ({debtors.length})
          </button>
          <button
            onClick={() => setStatusFilter("em_dia")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              statusFilter === "em_dia"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Em Dia
          </button>
          <button
            onClick={() => setStatusFilter("atraso_leve")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              statusFilter === "atraso_leve"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Atrasados
          </button>
          <button
            onClick={() => setStatusFilter("critico")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              statusFilter === "critico"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sumidos
          </button>
        </div>
      </div>

      {/* Grid de Cards de Devedores */}
      {filteredDebtors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebtors.map((debtor) => (
            <DebtorCard key={debtor.id} debtor={debtor} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <p className="text-sm font-mono text-zinc-400">
            Nenhuma figurinha encontrada para os filtros atuais.
          </p>
          <p className="text-xs font-mono text-zinc-500">
            Cadastre um novo devedor pelo botão acima ou limpe o termo de busca.
          </p>
        </div>
      )}
    </div>
  )
}
