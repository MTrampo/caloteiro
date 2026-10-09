import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
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

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <AppSidebar />
          <SidebarInset className="min-h-screen flex flex-col bg-background">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}