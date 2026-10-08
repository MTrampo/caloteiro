"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import type { NavRoot } from "@/commons/types/sidebar"
import { FaClipboardList, FaCoins, FaCrosshairs, FaGear, FaHouse, FaUsers } from "react-icons/fa6"

const navigation: NavRoot = {
  groups: [
    {
      label: "GERAL",
      items: [
        {
          title: "Painel",
          url: "/painel",
          icon: <FaHouse className="size-3.5" />,
        },
      ],
    },
    {
      label: "DÍVIDAS",
      items: [
        {
          title: "Acompanhamento",
          url: "/painel/dividas/acompanhamento",
          icon: <FaClipboardList className="size-3.5" />,
        },
        {
          title: "Financeiro",
          url: "/painel/dividas",
          icon: <FaCoins className="size-3.5" />,
        },
        {
          title: "Devedores",
          url: "/painel/dividas/devedores",
          icon: <FaUsers className="size-3.5" />,
        },
      ],
    },
    {
      label: "SISTEMA",
      items: [
        {
          title: "Configurações",
          url: "/painel/configuracoes",
          icon: <FaGear className="size-3.5" />,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar aria-label="Menu Principal" collapsible="icon" className="border-r border-sidebar-border bg-sidebar" {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border px-3.5 justify-center">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100 shrink-0 shadow-sm shadow-black/40">
            <FaCrosshairs className="size-4 text-zinc-200" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="font-heading font-extrabold text-sm tracking-wider text-white">
              CALOTEIRO
            </span>
            <span className="text-[11px] text-muted-foreground font-mono truncate">
              Radar de Dívidas
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <NavMain nav={navigation} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800/80 p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
