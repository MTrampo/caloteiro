"use client"

import * as React from "react"
import { FaQuoteLeft, FaRotate } from "react-icons/fa6"
import { getRandomWisdomQuote } from "../utils/greeting-helper"
import { Button } from "@/components/ui/button"

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
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-400/90">
              Pílula de Sabedoria
            </span>
            <span className="text-zinc-600 font-mono text-xs">•</span>
            <span className="text-xs font-mono font-bold text-zinc-400">
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

      <div className="shrink-0 self-end sm:self-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShuffle}
          className="text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 gap-1.5 h-8"
          title="Outra dica ácida"
        >
          <FaRotate className="size-3" />
          <span>Outra Dica</span>
        </Button>
      </div>
    </div>
  )
}

