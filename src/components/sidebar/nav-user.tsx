"use client"

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
import { FaCreditCard, FaRightFromBracket, FaSliders, FaUser } from "react-icons/fa6"
import { ChevronsUpDown } from "lucide-react"
import Link from "next/link"

export function NavUser({
  user = {
    name: "Credor Investigador",
    email: "detetive@caloteiro.app",
    avatar: "",
    plan: "Plano Individual",
  },
}: {
  user?: {
    name: string
    email: string
    avatar?: string
    plan?: string
  }
}) {
  const { isMobile } = useSidebar()

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
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-zinc-800 border border-zinc-700/80 text-zinc-100 font-bold font-mono text-xs">
                CI
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-white">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.plan}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg bg-zinc-900 border-zinc-800 text-zinc-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-zinc-800 border border-zinc-700/80 text-zinc-100 font-bold font-mono text-xs">
                  CI
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
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
              onClick={() => {
                window.location.href = "/"
              }}
            >
              <FaRightFromBracket className="size-3.5" />
              <span>Sair da Sessão</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}