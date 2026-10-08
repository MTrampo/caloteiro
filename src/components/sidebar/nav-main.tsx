"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavSectionItem, NavSectionGroup, NavRoot } from "@/commons/types/sidebar"
import { FaChevronRight } from "react-icons/fa6"
import { usePathname } from "next/navigation"
import Link from "next/link"

export type NavMainProps = {
  nav?: NavRoot
  items?: NavSectionItem[]
  groups?: NavSectionGroup[]
}

export function NavMain({ nav, items, groups }: NavMainProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const isActive = (url: string) => {
    if (url === "/painel" || url === "/painel/dividas") return pathname === url
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const groupsToRender =
    groups ??
    nav?.groups ??
    (nav?.main ? [{ label: undefined, items: nav.main }] : items ? [{ label: undefined, items }] : [])

  return (
    <>
      {groupsToRender.map((group, gi) => (
        <SidebarGroup key={group.label ?? gi}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.items.map((item) =>
              !item.subNavs ? (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <Collapsible
                  key={item.title}
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive(item.url)}
                        />
                      }
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      <FaChevronRight className="ml-auto size-2.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subNavs?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={<Link href={subItem.url} onClick={() => setOpenMobile(false)} />}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
