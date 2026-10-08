"use client"

import { FaPlus } from "react-icons/fa6"
import { Button } from "@/components/ui/button"

import Link from "next/link"

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
        <Button
          size="sm"
          onClick={onNewDebtClick}
          render={<Link href="/painel/dividas" />}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold shadow-xs shadow-white/10 h-9 px-3.5"
        >
          <FaPlus className="size-3.5 mr-1.5" />
          Nova Dívida
        </Button>
      </div>
    </div>
  )
}

