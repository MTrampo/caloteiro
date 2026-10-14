"use client"

import { NewButton } from "@/components/buttons/new-button"

type GreetingBannerProps = {
  userName: string
  timeGreeting: string
  punchline: string
  onNewDebtClick?: () => void
}

export function GreetingBanner({
  userName,
  timeGreeting,
  punchline,
  onNewDebtClick,
}: GreetingBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4 pb-1">
      <div className="space-y-1">
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
          {timeGreeting}, {userName}.
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-2xl leading-relaxed">
          {punchline}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <NewButton
          href="/painel/dividas/nova"
          label="Nova Dívida"
          icon="plus"
          onClick={onNewDebtClick}
        />
      </div>
    </div>
  )
}

