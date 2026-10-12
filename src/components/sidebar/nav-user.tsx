"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { FaCreditCard, FaRightFromBracket, FaUser } from "react-icons/fa6"
import { ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { signOutAction } from "@/actions/auth"
import { formatProperName, getNameInitials } from "@/commons/utils/format"

export interface NavUserData {
  name: string
  nickname?: string | null
  email: string
  avatar?: string | null
  plan?: string
}

export function NavUser({
  user = {
    name: "Tubarão",
    nickname: null,
    email: "tubarao@caloteiro.app",
    avatar: "",
    plan: "Tubarão Lixa",
  },
}: {
  user?: NavUserData
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Formatação segura de nomes
  const formattedNickname = user.nickname ? formatProperName(user.nickname) : null
  const formattedFullName = user.name ? formatProperName(user.name) : "Tubarão"

  // Dá preferência ao apelido/vulgo; se não tiver, usa o nome formatado
  const displayName = formattedNickname || formattedFullName
  const initials = getNameInitials(displayName, "TB")

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction()
      router.push("/entrar")
      router.refresh()
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg shrink-0">
              <AvatarImage src={user.avatar || undefined} alt={displayName} />
              <AvatarFallback className="rounded-lg bg-zinc-800 border border-zinc-700/80 text-zinc-100 font-bold font-mono text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-white" title={displayName}>
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground font-mono" title={user.plan}>
                {user.plan || "Tubarão Lixa"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg bg-zinc-900 border-zinc-800 text-zinc-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
              <Avatar className="size-8 rounded-lg shrink-0">
                <AvatarImage src={user.avatar || undefined} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-zinc-800 border border-zinc-700/80 text-zinc-100 font-bold font-mono text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white" title={displayName}>
                  {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground font-mono" title={user.email}>
                  {user.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/painel/conta" />}
                className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white"
              >
                <FaUser className="size-3.5 text-zinc-400" />
                <span>Minha Conta</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/painel/conta" />}
                className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white"
              >
                <FaCreditCard className="size-3.5 text-zinc-400" />
                <span>Assinatura</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-rose-400 hover:text-rose-300 focus:text-rose-300"
              disabled={isPending}
              onClick={handleSignOut}
            >
              <FaRightFromBracket className="size-3.5" />
              <span>{isPending ? "Saindo..." : "Sair da Sessão"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}