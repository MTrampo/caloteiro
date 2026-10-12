import * as React from "react"

export function DebtorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between gap-4 animate-pulse">
      {/* Cabeçalho Skeleton */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 bg-zinc-800 rounded-md" />
              <div className="h-4 w-16 bg-zinc-800/60 rounded-md" />
            </div>
            <div className="h-3.5 w-24 bg-zinc-800/50 rounded-md" />
          </div>

          <div className="h-6 w-20 bg-zinc-800 rounded-md" />
        </div>

        {/* Linhas de informações */}
        <div className="space-y-2 pt-1 border-t border-zinc-800/60">
          <div className="h-3 w-40 bg-zinc-800/40 rounded-md" />
          <div className="h-3 w-48 bg-zinc-800/40 rounded-md" />
        </div>
      </div>

      {/* Rodapé Skeleton */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-zinc-800 rounded-md" />
          <div className="h-8 w-14 bg-zinc-800 rounded-md" />
        </div>
        <div className="h-4 w-16 bg-zinc-800/50 rounded-md" />
      </div>
    </div>
  )
}

