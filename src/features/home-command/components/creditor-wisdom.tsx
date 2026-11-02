"use client"

import * as React from "react"
import { FaQuoteLeft } from "react-icons/fa6"
import { getRandomWisdomQuote } from "../utils/greeting-helper"

type CreditorWisdomProps = {
  initialWisdom: {
    quote: string
    author: string
    subtext: string
  }
}

export function CreditorWisdom({ initialWisdom }: CreditorWisdomProps) {
  const [wisdom, setWisdom] = React.useState(initialWisdom)

  const handleShuffle = () => {
    setWisdom(getRandomWisdomQuote())
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 shadow-2xs">
          <FaQuoteLeft className="size-4 text-amber-400" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-400/90 shrink-0">
              Pílula de Sabedoria
            </span>
            <span className="text-zinc-600 font-mono text-xs shrink-0">•</span>
            <span className="text-xs font-mono font-bold text-zinc-400 truncate max-w-[220px]">
              {wisdom.author}
            </span>
          </div>

          <p className="text-sm sm:text-base font-heading font-medium text-white italic">
            &ldquo;{wisdom.quote}&rdquo;
          </p>

          <p className="text-xs font-mono text-zinc-500">
            {wisdom.subtext}
          </p>
        </div>
      </div>
    </div>
  )
}

