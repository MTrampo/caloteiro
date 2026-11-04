import { ReactNode } from "react"
import { Separator } from "../ui/separator"
import { SidebarTrigger } from "../ui/sidebar"

type HeaderProps = {
  title: ReactNode | string
  action?: ReactNode
  showSidebarTrigger?: boolean
}

export default function Header({
  title,
  action,
  showSidebarTrigger = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/90 backdrop-blur-md transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-3 sm:px-4">
        {showSidebarTrigger && (
          <>
            <SidebarTrigger className="-ml-1 size-8.5 sm:size-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors touch-manipulation" />
            <Separator
              orientation="vertical"
              className="mx-1 h-3.5 bg-border"
            />
          </>
        )}
        <h1 className="text-sm font-heading font-bold text-white tracking-wide truncate">
          {title}
        </h1>
        {action && (
          <div className="ml-auto flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </header>
  )
}