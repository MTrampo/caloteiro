"use client"

import * as React from "react"
import Link from "next/link"
import { FaPlus, FaUserPlus, FaCirclePlus, FaLock, FaFileCirclePlus } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { PlanLimitModal } from "@/components/modals/plan-limit-modal"
import { cn } from "@/commons/lib/utils"

export type NewButtonIconName = "plus" | "user-plus" | "circle-plus" | "file-circle-plus"

export interface NewButtonProps extends Omit<React.ComponentProps<typeof Button>, "render"> {
  href: string
  label: string
  icon: NewButtonIconName | React.ComponentType<{ className?: string }> | React.ReactNode
  isLocked?: boolean
  lockReason?: "debtor" | "debt"
  maxAllowed?: number
  planName?: string
  onLockedClick?: () => void
}

const ICON_MAP: Record<NewButtonIconName, React.ComponentType<{ className?: string }>> = {
  plus: FaPlus,
  "user-plus": FaUserPlus,
  "circle-plus": FaCirclePlus,
  "file-circle-plus": FaFileCirclePlus,
}

export function NewButton({
  href,
  label,
  icon,
  className,
  variant = "default",
  size = "lg",
  isLocked = false,
  lockReason = "debtor",
  maxAllowed = 2,
  planName = "Tubarão Lixa",
  onLockedClick,
  onClick,
  ...props
}: NewButtonProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const renderIcon = () => {
    if (typeof icon === "string" && icon in ICON_MAP) {
      const ResolvedIcon = ICON_MAP[icon as NewButtonIconName]
      return <ResolvedIcon className="size-3.5 shrink-0" />
    }

    if (React.isValidElement(icon)) {
      return icon
    }

    if (typeof icon === "function") {
      const CustomIcon = icon
      return <CustomIcon className="size-3.5 shrink-0" />
    }

    return null
  }

  const handleClick: React.ComponentProps<typeof Button>["onClick"] = (e) => {
    if (isLocked) {
      e.preventDefault()
      e.stopPropagation()
      if (onLockedClick) {
        onLockedClick()
      } else {
        setIsModalOpen(true)
      }
      return
    }

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        render={isLocked ? undefined : <Link href={href} />}
        onClick={handleClick}
        className={cn(
          isLocked &&
            "opacity-50 hover:opacity-75 cursor-pointer bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 shadow-none",
          className
        )}
        {...props}
      >
        {renderIcon()}
        <span>{label}</span>
      </Button>

      {isLocked && !onLockedClick && (
        <PlanLimitModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          lockReason={lockReason}
          maxAllowed={maxAllowed}
          planName={planName}
        />
      )}
    </>
  )
}
