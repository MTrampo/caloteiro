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
    default:
      "Caloteiro — Sistema de Gestão de Dívidas, Parcelas e Cobranças",
    template: "%s | Caloteiro",
  },
  description:
    "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Centralize quem te deve em um só lugar: controle dívidas e parcelas, calcule juros, guarde comprovantes, anote promessas e cobre em 1 clique pelo WhatsApp.",
  applicationName: "Caloteiro",
  authors: [{ name: "Meu Trampo", url: "https://meutrampo.dev.br/" }],
  keywords: [
    "sistema de gestão de dívidas",
    "controle financeiro de dívidas e parcelas",
    "aplicativo para controlar dinheiro emprestado",
    "planilha de controle de empréstimos",
    "planilha de empréstimo com juros",
    "sistema de controle de empréstimos e juros",
    "como controlar dinheiro emprestado",
    "calcular juros de dinheiro emprestado",
    "mensagem de cobrança whatsapp",
    "frases para cobrar dinheiro emprestado no whatsapp",
    "emprestei dinheiro e não me pagam",
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
    "calculadora de juros de empréstimo",
    "como fazer caloteiro pagar",
    "juizado especial civel cobranca sem advogado",
    "lembrete de dívida e pix",
    "mural de desculpas",
    "controle de empréstimos e parcelas",
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
    title:
      "Caloteiro — Sistema de Gestão de Dívidas, Parcelas e Cobranças",
    description:
      "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Controle devedores, calcule parcelas e juros, guarde comprovantes e cobre em 1 clique pelo WhatsApp.",
    url: APP_URL,
    siteName: "Caloteiro",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Caloteiro — Sistema de Gestão de Dívidas, Parcelas e Cobranças",
    description:
      "Eles fingem que esqueceram, o Tubarão lembra até o último centavo. Controle devedores, parcelas, juros, comprovantes e cobrança no WhatsApp.",
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
