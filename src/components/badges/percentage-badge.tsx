import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"
import { FaArrowTrendDown, FaArrowTrendUp, FaMinus } from "react-icons/fa6"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/commons/lib/utils"

const percentageVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-mono font-bold border tracking-tight",
  {
    variants: {
      status: {
        LOW: "",
        STABLE: "",
        HIGH: "",
      },
      negative: {
        true: "",
        false: "",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs sm:text-[13px]",
        md: "px-3 py-1 text-sm",
      },
    },
    compoundVariants: [
      {
        status: "LOW",
        negative: true,
        className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        status: "LOW",
        negative: false,
        className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      },
      {
        status: "HIGH",
        negative: true,
        className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      },
      {
        status: "HIGH",
        negative: false,
        className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      },
      {
        status: "STABLE",
        className: "text-slate-400 bg-slate-800/80 border-slate-700/50",
      },
    ],
    defaultVariants: {
      negative: false,
      size: "sm",
    },
  }
)

export interface PercentageStatusBadgeProps
  extends VariantProps<typeof percentageVariants> {
  className?: string
  statusText?: ReactNode
  status: "LOW" | "STABLE" | "HIGH"
}

export function PercentageBadge({
  negative = false,
  status,
  statusText,
  className,
  size = "sm",
}: PercentageStatusBadgeProps) {
  const statusIconMap: Record<"LOW" | "STABLE" | "HIGH", ReactNode> = {
    LOW: negative ? <FaArrowTrendUp className="size-3.5" /> : <FaArrowTrendDown className="size-3.5" />,
    STABLE: <FaMinus className="size-3.5" />,
    HIGH: negative ? <FaArrowTrendDown className="size-3.5" /> : <FaArrowTrendUp className="size-3.5" />,
  }

  const statusIcon = statusIconMap[status]

  return (
    <Badge
      variant="outline"
      className={cn(percentageVariants({ status, negative, size }), className)}
    >
      {statusIcon}
      {statusText && <span>{statusText}</span>}
    </Badge>
  )
}