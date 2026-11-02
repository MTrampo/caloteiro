import type { Metadata, Viewport } from "next";
import "@/commons/styles/globals.css";
import { fontBody, fontTitle } from "@/commons/styles/fonts";
import { cn } from "@/commons/lib/utils";
import { Toaster } from "sonner";
import { CookieConsentBanner } from "@/components/banners/cookie-consent-banner";
import { RouteTelemetryTracker } from "@/components/analytics/route-telemetry-tracker";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_ID, APP_URL } from "@/commons/constants/env";
import { PwaRegister, InstallBanner } from "@/components/pwa";
import { StructuredData } from "@/components/seo/structured-data";

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Caloteiro — O Fim da Vergonha de Cobrar Dinheiro Emprestado",
    template: "%s | Caloteiro",
  },
  description:
    "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Centralize todos os seus devedores em 1 só lugar com visão panorâmica de recebíveis, dinheiro recuperado e calotes históricos. Aplicativo descontraído para pessoas físicas e autônomos cobrarem no WhatsApp sem climão.",
  applicationName: "Caloteiro",
  authors: [{ name: "Meu Trampo", url: "https://meutrampo.dev.br/" }],
  generator: "Next.js",
  keywords: [
    "aplicativo de gestão de cobranças",
    "app de cobrança",
    "aplicativo para caloteiro",
    "aplicativo para evitar caloteiro",
    "centralizar devedores em um só lugar",
    "controle de recebíveis e dinheiro perdido",
    "como cobrar amigo sem perder a amizade",
    "como cobrar parente sem climao",
    "cobrar dinheiro emprestado no whatsapp",
    "posso cobrar juros de dinheiro emprestado",
    "emprestar dinheiro a juros e crime stj",
    "mensagem de whatsapp vale como prova de divida",
    "aplicativo de controle de fiado",
    "caderno de fiado digital",
    "calculadora de juros de empréstimo entre amigos",
    "como fazer caloteiro pagar",
    "juizado especial civel cobranca sem advogado",
    "lembrete de dívida e pix",
    "mural de desculpas",
    "gestão de devedores autônomos e freelancers",
  ],
  creator: "Meu Trampo",
  publisher: "Meu Trampo",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Caloteiro",
  },
  openGraph: {
    title: "Caloteiro — O Fim da Vergonha de Cobrar Dinheiro Emprestado",
    description:
      "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Gestão afiada de dívidas, faturas Pix elegantes e cobrança no WhatsApp com humor ácido para autônomos e pessoas físicas.",
    url: APP_URL,
    siteName: "Caloteiro",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caloteiro — O Fim da Vergonha de Cobrar Dinheiro Emprestado",
    description:
      "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Gestão afiada de dívidas e cobrança no WhatsApp sem climão.",
    creator: "@meutrampo.dev",
  },
  icons: {
    icon: [
      { url: "/icon1.png" },
      { url: "/icon0.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("dark scroll-smooth", fontTitle.variable, fontBody.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <StructuredData />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        {children}
        <Toaster richColors theme="dark" position="top-right" />
        <CookieConsentBanner />
        <InstallBanner />
        <PwaRegister />
        <RouteTelemetryTracker />
        <Analytics />
        <SpeedInsights />
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
