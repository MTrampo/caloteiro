"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlanLimitModal } from "@/components/modals/plan-limit-modal"
import { cn } from "@/commons/lib/utils"
import { FaPlus, FaEllipsisVertical, FaXmark } from "react-icons/fa6"

export interface FloatingActionItem {
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  isLocked?: boolean
  lockReason?: "debtor" | "debt"
  maxAllowed?: number
  planName?: string
  variant?: "default" | "destructive" | "emerald"
}

export interface MobileFloatingActionProps {
  actions: FloatingActionItem[]
  triggerIcon?: React.ReactNode
  className?: string
  ariaLabel?: string
}

export function MobileFloatingAction({
  actions,
  triggerIcon,
  className,
  ariaLabel = "Ações rápidas",
}: MobileFloatingActionProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [lockedModalData, setLockedModalData] = React.useState<{
    isOpen: boolean
    lockReason?: "debtor" | "debt"
    maxAllowed?: number
    planName?: string
  }>({
    isOpen: false,
  })

  if (!actions || actions.length === 0) {
    return null
  }

  const handleActionClick = (action: FloatingActionItem) => {
    if (action.isLocked) {
      setLockedModalData({
        isOpen: true,
        lockReason: action.lockReason ?? "debt",
        maxAllowed: action.maxAllowed ?? 2,
        planName: action.planName ?? "Tubarão Lixa",
      })
      return
    }

    if (action.href) {
      router.push(action.href)
      return
    }

    if (action.onClick) {
      action.onClick()
    }
  }

  const isSingle = actions.length === 1
  const singleAction = actions[0]

  return (
    <>
      <div
        className={cn(
          "fixed bottom-5 right-4 sm:bottom-6 sm:right-5 z-40 sm:hidden pb-[env(safe-area-inset-bottom)]",
          className
        )}
      >
        {isSingle ? (
          /* Modo Ação Única: Botão Circular Direto */
          <button
            type="button"
            onClick={() => handleActionClick(singleAction)}
            aria-label={singleAction.label || ariaLabel}
            className="size-12 sm:size-14 rounded-full bg-white text-zinc-950 shadow-2xl shadow-black/90 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200/80 touch-manipulation"
          >
            {singleAction.icon ?? <FaPlus className="size-4 sm:size-5" />}
          </button>
        ) : (
          /* Modo Múltiplas Ações: Botão com DropdownMenu deslizante para cima e alternância para ✕ */
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
              aria-label={ariaLabel}
              className="size-12 sm:size-14 rounded-full bg-white text-zinc-950 shadow-2xl shadow-black/90 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200/80 touch-manipulation outline-none"
            >
              {isOpen ? (
                <FaXmark className="size-4 sm:size-5 transition-transform duration-200" />
              ) : (
                triggerIcon ?? <FaEllipsisVertical className="size-4 sm:size-5 transition-transform duration-200" />
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={12}
              className="w-56 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl shadow-2xl text-white space-y-1"
            >
              {actions.map((action, index) => {
                const isEmerald = action.variant === "emerald"
                const isDestructive = action.variant === "destructive"

                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "h-11 px-3 text-xs font-mono font-bold rounded-xl cursor-pointer flex items-center gap-2.5 transition-colors",
                      isEmerald
                        ? "text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-300"
                        : isDestructive
                        ? "text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-300"
                        : "text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
                    )}
                  >
                    {action.icon && (
                      <span className="shrink-0 size-4 flex items-center justify-center">
                        {action.icon}
                      </span>
                    )}
                    <span className="truncate flex-1">{action.label}</span>
                    {action.isLocked && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                        Upgrade
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Modal de Limite de Plano caso a ação esteja bloqueada */}
      {lockedModalData.isOpen && (
        <PlanLimitModal
          open={lockedModalData.isOpen}
          onOpenChange={(open) =>
            setLockedModalData((prev) => ({ ...prev, isOpen: open }))
          }
          lockReason={lockedModalData.lockReason}
          maxAllowed={lockedModalData.maxAllowed}
          planName={lockedModalData.planName}
        />
      )}
    </>
  )
}

