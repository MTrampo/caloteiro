"use client"

import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FaCircleQuestion } from "react-icons/fa6"
import { cn } from "@/commons/lib/utils"

export type CardAccent = "neutral" | "emerald" | "amber" | "rose" | "cyan"

type SummaryCardProps = {
  title: string
  amount: string
  percentage?: ReactNode
  description: ReactNode
  last?: string
  icon?: ReactNode
  accent?: CardAccent
  helpText?: string
  className?: string
}

const accentStyles: Record<CardAccent, { iconContainer: string }> = {
  neutral: {
    iconContainer: "bg-zinc-800 border-zinc-700/80 text-zinc-100",
  },
  cyan: {
    iconContainer: "bg-zinc-800 border-zinc-700/80 text-zinc-100",
  },
  emerald: {
    iconContainer: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  amber: {
    iconContainer: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  rose: {
    iconContainer: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  },
}

export function SummaryCard({
  title,
  amount,
  percentage,
  description,
  last,
  icon,
  accent = "neutral",
  helpText,
  className,
}: SummaryCardProps) {
  const style = accentStyles[accent]

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border bg-card shadow-xs rounded-xl sm:rounded-2xl flex flex-col justify-between gap-0 h-full",
        className
      )}
    >
      <CardHeader className="space-y-2 p-3.5 sm:p-4 pb-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className={cn("p-1.5 rounded-lg border shadow-2xs shrink-0", style.iconContainer)}>
                {icon}
              </div>
            )}
            <span className="font-bold text-sm sm:text-base uppercase tracking-wider text-zinc-100 font-mono truncate">
              {title}
            </span>
            {helpText && (
              <div className="hidden sm:inline-flex shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-help"
                      />
                    }
                  >
                    <FaCircleQuestion className="w-3.5 h-3.5" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-56 text-xs bg-zinc-950 text-zinc-200 border border-zinc-800 shadow-xl p-2.5 leading-relaxed rounded-lg"
                  >
                    {helpText}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
          {percentage && <CardAction className="shrink-0">{percentage}</CardAction>}
        </div>
      </CardHeader>

      <CardContent className="px-3.5 sm:px-4 py-1.5">
        <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading tabular-nums">
          {amount}
        </CardTitle>
      </CardContent>

      <CardFooter className="flex-col items-start gap-1 p-3 px-3.5 sm:p-3.5 sm:px-4 bg-zinc-950/40 border-t border-border mt-1">
        <div className="line-clamp-1 flex gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-300">
          {description}
        </div>
        {last && (
          <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 font-mono">
            {last}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}