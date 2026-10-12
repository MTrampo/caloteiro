"use client"

import * as React from "react"
import Link from "next/link"
import { FaMagnifyingGlass, FaUserPlus, FaRotateRight } from "react-icons/fa6"
import { DebtorCard } from "./components/debtor-card"
import { DebtorCardSkeleton } from "./components/debtor-card-skeleton"
import { getDebtorsAction } from "@/actions/debtors"
import type { DebtorItemFormatted } from "./types"

interface DebtorsFeatureProps {
  initialDebtors?: DebtorItemFormatted[]
  initialHasMore?: boolean
  initialTotalCount?: number
}

const ITEMS_PER_PAGE = 12

export function DebtorsFeature({
  initialDebtors = [],
  initialHasMore = false,
  initialTotalCount = 0,
}: DebtorsFeatureProps) {
  const [debtors, setDebtors] = React.useState<DebtorItemFormatted[]>(initialDebtors)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(initialHasMore)
  const [totalCount, setTotalCount] = React.useState(initialTotalCount)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)

  // Referência para o sentinela do infinite scroll
  const observerTarget = React.useRef<HTMLDivElement | null>(null)
  const isMountedRef = React.useRef(false)

  // Busca reativa com debounce
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const res = await getDebtorsAction({
        page: 1,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
      })

      if (res.success && res.data) {
        setDebtors(res.data.items)
        setHasMore(res.data.hasMore)
        setTotalCount(res.data.totalCount)
        setPage(1)
      }
      setIsSearching(false)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Infinite Scroll: carregar próxima página ao atingir o final da tela
  const loadMoreDebtors = React.useCallback(async () => {
    if (isLoadingMore || !hasMore || isSearching) return

    setIsLoadingMore(true)
    const nextPage = page + 1

    const res = await getDebtorsAction({
      page: nextPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
    })

    const data = res.data
    if (res.success && data) {
      setDebtors((prev) => [...prev, ...data.items])
      setHasMore(data.hasMore)
      setTotalCount(data.totalCount)
      setPage(nextPage)
    }

    setIsLoadingMore(false)
  }, [page, hasMore, isLoadingMore, isSearching, searchTerm])

  // Observador de interseção do sentinela
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore && !isSearching) {
          loadMoreDebtors()
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMoreDebtors, hasMore, isLoadingMore, isSearching])

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Lista de Devedores (Solto, sem card, sem ícones no título h2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Devedores
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Registro e rastreio de quem pegou seu dinheiro emprestado e jurou que pagava na sexta-feira.
          </p>
        </div>

        {/* Botão Cadastrar Devedor Padronizado (Branco) */}
        <Link
          href="/painel/devedores/novo"
          className="inline-flex items-center justify-center h-9 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <FaUserPlus className="size-3.5" />
          <span>Cadastrar Devedor</span>
        </Link>
      </div>

      {/* Barra de Busca (Sem Tabs obsoletas) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, apelido, telefone ou CPF..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 shadow-xs"
          />
        </div>

        {/* Contador de Devedores */}
        <div className="text-xs font-mono text-zinc-400 shrink-0">
          <span>{totalCount} {totalCount === 1 ? "devedor cadastrado" : "devedores cadastrados"}</span>
        </div>
      </div>

      {/* Estado de Carregamento da Busca com Skeletons */}
      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <DebtorCardSkeleton key={`searching-skeleton-${idx}`} />
          ))}
        </div>
      ) : debtors.length > 0 ? (
        <>
          {/* Grid Responsivo de Cards de Devedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debtors.map((debtor) => (
              <DebtorCard key={debtor.id} debtor={debtor} />
            ))}

            {/* Skeletons adicionais durante o Infinite Scroll */}
            {isLoadingMore && (
              <>
                <DebtorCardSkeleton />
                <DebtorCardSkeleton />
                <DebtorCardSkeleton />
              </>
            )}
          </div>

          {/* Elemento Sentinela do Infinite Scroll */}
          <div ref={observerTarget} className="h-6 w-full" />
        </>
      ) : searchTerm.trim() ? (
        /* Fallback de Busca Vazia (Solto, sem card, centralizado) */
        <div className="py-16 sm:py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="space-y-1.5">
            <h3 className="font-heading text-base font-bold text-white">
              Nenhum devedor encontrado para &ldquo;{searchTerm}&rdquo;
            </h3>
            <p className="text-xs sm:text-sm font-mono text-zinc-400">
              O caloteiro conseguiu escapar da busca ou você digitou o nome errado?
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <FaRotateRight className="size-3" />
            <span>Limpar Busca</span>
          </button>
        </div>
      ) : (
        /* Empty State Principal do Tanque (Solto, sem card, centralizado) */
        <div className="py-16 sm:py-24 text-center space-y-5 max-w-md mx-auto">
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-white">
              Nenhum caloteiro fichado no tanque
            </h3>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
              Ou você é abençoado, ou finalmente aprendeu a dizer &ldquo;não&rdquo;. Se alguém te pediu um Pix emprestado hoje, cadastre agora antes que suma no mundo.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/painel/devedores/novo"
              className="inline-flex items-center justify-center h-10 px-5 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all cursor-pointer"
            >
              <FaUserPlus className="size-3.5" />
              <span>Cadastrar Primeiro Devedor</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
