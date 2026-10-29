import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getCurrentUserSessionProfileApi } from "@/server/account/service/auth.api"
import { FREE_PLAN_SLUG } from "@/commons/constants/subscription"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    template: "%s | Caloteiro",
    default: "Painel | Caloteiro",
  },
  description: "Central de cobrança e gestão de promessas de pagamento.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, planName, permissions, subscription } = await getCurrentUserSessionProfileApi()

  const sidebarUserData = user
    ? {
        name: profile?.name || (user.user_metadata?.name as string | undefined) || "Tubarão",
        nickname: profile?.nickname || (user.user_metadata?.nickname as string | undefined) || null,
        email: user.email || "tubarao@caloteiro.app",
        avatar: profile?.avatar_url || subscription?.plan?.slug || FREE_PLAN_SLUG,
        plan: planName,
      }
    : undefined

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TooltipProvider delay={0}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "17rem",
              "--header-height": "3.5rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar user={sidebarUserData} permissions={permissions} />
          <SidebarInset className="min-h-screen flex flex-col bg-background">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}