"use client"

import * as React from "react"
import type {
  PromiseFilterTab,
  PromiseItem,
  PromiseSortBy,
  TrackingCounts,
} from "./types"
import { PromiseFilters } from "./promise-filters"
import { PromiseCardItem } from "./promise-card-item"
import { getTrackingDataAction } from "@/actions/tracking"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromisesListProps {
  initialData?: PromiseItem[]
  initialHasMore?: boolean
  initialCounts?: TrackingCounts
}

export function PromisesList({
  initialData = [],
  initialHasMore = false,
  initialCounts = {
    open: initialData.length,
    onTime: initialData.filter((p) => p.gravity === "ON_TIME").length,
    overdue: initialData.filter(
      (p) => p.gravity === "LIGHT_DELAY" || p.gravity === "STANDARD_EXCUSE"
    ).length,
    defaulted: initialData.filter((p) => p.gravity === "BROKEN_AGREEMENT").length,
  },
}: PromisesListProps) {
  const [items, setItems] = React.useState<PromiseItem[]>(initialData)
  const [activeTab, setActiveTab] = React.useState<PromiseFilterTab>("OPEN")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<PromiseSortBy>("late_first")
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(initialHasMore)
  const [counts, setCounts] = React.useState<TrackingCounts>(initialCounts)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [isFiltering, setIsFiltering] = React.useState(false)

  // Sentinela para o Infinite Scroll
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const isFirstRender = React.useRef(true)

  // Debounce do campo de busca (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Busca remota quando filtros ou ordenação mudam
  const fetchFilteredData = React.useCallback(
    async (tab: PromiseFilterTab, search: string, sort: PromiseSortBy) => {
      setIsFiltering(true)
      try {
        const res = await getTrackingDataAction({
          page: 1,
          limit: 12,
          tab,
          search,
          sortBy: sort,
        })

        if (res.success && res.data) {
          const { paginated } = res.data
          setItems(paginated.items)
          setHasMore(paginated.hasMore)
          setCounts(paginated.counts)
          setPage(1)
        }
      } catch (error) {
        console.error("[PromisesList] Erro ao filtrar promessas:", error)
      } finally {
        setIsFiltering(false)
      }
    },
    []
  )

  // Dispara busca remota quando a aba, busca ou ordenação mudar
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    fetchFilteredData(activeTab, debouncedSearch, sortBy)
  }, [activeTab, debouncedSearch, sortBy, fetchFilteredData])

  // Carregar mais itens (Infinite Scroll - próximo lote de 12)
  const handleLoadMore = React.useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1

    try {
      const res = await getTrackingDataAction({
        page: nextPage,
        limit: 12,
        tab: activeTab,
        search: debouncedSearch,
        sortBy,
      })

      if (res.success && res.data) {
        const { paginated } = res.data
        setItems((prev) => [...prev, ...paginated.items])
        setHasMore(paginated.hasMore)
        setPage(nextPage)
      }
    } catch (error) {
      console.error("[PromisesList] Erro no infinite scroll:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, page, activeTab, debouncedSearch, sortBy])

  // IntersectionObserver para disparo automático do infinite scroll ao rolar a página
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isFiltering) {
          handleLoadMore()
        }
      },
      { rootMargin: "250px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, isFiltering, handleLoadMore])

  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho da Seção sem ícones soltos */}
      <div className="space-y-0.5">
        <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
          Promessas
        </h3>
        <p className="text-xs sm:text-[13px] text-zinc-400 font-mono">
          Quem tá pagando e quem tá ensaiando o golpe.
        </p>
      </div>

      {/* Barra de Filtros, Busca e Ordenação */}
      <PromiseFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
      />

      {/* Lista de Cards de Promessas */}
      {isFiltering ? (
        <div className="py-16 text-center space-y-3 font-mono">
          <Loader2 className="size-6 animate-spin text-zinc-400 mx-auto" />
          <p className="text-xs text-zinc-500">
            Atualizando promessas no radar...
          </p>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((promise) => (
            <PromiseCardItem key={promise.id} promise={promise} />
          ))}

          {/* Elemento Sentinela para o Infinite Scroll */}
          <div ref={sentinelRef} className="h-6 w-full flex items-center justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-3">
                <Loader2 className="size-4 animate-spin" />
                <span>Puxando mais promessas...</span>
              </div>
            )}
          </div>

          {/* Botão de fallback caso o usuário queira clicar manualmente */}
          {hasMore && !isLoadingMore && (
            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                className="h-9 px-4 text-xs font-mono text-zinc-400 hover:text-white border-zinc-800"
              >
                Carregar mais promessas
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty States Limpos e Sem Borda Pontilhada (Regra de Design do Caloteiro) */
        <div className="py-16 sm:py-24 text-center space-y-3 max-w-md mx-auto">
          <p className="text-base font-bold text-white font-heading">
            {debouncedSearch
              ? "Nenhuma promessa encontrada para essa busca."
              : activeTab === "DEFAULTED"
              ? "Nenhum caloteiro nessa categoria."
              : activeTab === "OVERDUE"
              ? "Nenhum atraso registrado no momento."
              : "Nenhuma promessa ativa no momento."}
          </p>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
            {debouncedSearch
              ? "Confira se digitou o nome certo ou se o devedor já sumiu do mapa."
              : activeTab === "DEFAULTED"
              ? "Ou seus devedores viraram santos ou o milagre finalmente aconteceu."
              : activeTab === "OVERDUE"
              ? "Todo mundo em dia? Estranho... confere o extrato pra ver se não foi ilusão."
              : "Você pode registrar um novo acordo a qualquer momento pelo botão acima."}
          </p>
        </div>
      )}
    </div>
  )
}
