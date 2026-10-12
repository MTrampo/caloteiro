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
import { Logo } from "@/components/ui/logo"
import { FaClipboardList, FaCoins, FaGear, FaHouse, FaUsers } from "react-icons/fa6"

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
          url: "/painel/devedores",
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: import("./nav-user").NavUserData
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar aria-label="Menu Principal" collapsible="icon" className="border-r border-sidebar-border bg-sidebar" {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border px-3.5 justify-center">
        <Logo size="md" showText className="w-full" />
      </SidebarHeader>

      <SidebarContent className="py-2">
        <NavMain nav={navigation} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800/80 p-2">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
