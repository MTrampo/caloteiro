"use client"

import * as React from "react"
import Link from "next/link"
import { FaPlus, FaUserPlus, FaCirclePlus } from "react-icons/fa6"
import { Button } from "@/components/ui/button"

export type NewButtonIconName = "plus" | "user-plus" | "circle-plus"

export interface NewButtonProps extends Omit<React.ComponentProps<typeof Button>, "render"> {
  href: string
  label: string
  icon: NewButtonIconName | React.ComponentType<{ className?: string }> | React.ReactNode
}

const ICON_MAP: Record<NewButtonIconName, React.ComponentType<{ className?: string }>> = {
  plus: FaPlus,
  "user-plus": FaUserPlus,
  "circle-plus": FaCirclePlus,
}

export function NewButton({
  href,
  label,
  icon,
  className,
  variant = "default",
  size = "lg",
  ...props
}: NewButtonProps) {
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

  return (
    <Button
      variant={variant}
      size={size}
      render={<Link href={href} />}
      className={className}
      {...props}
    >
      {renderIcon()}
      <span>{label}</span>
    </Button>
  )
}
