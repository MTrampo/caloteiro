import type { Metadata } from "next";
import "@/commons/styles/globals.css";
import { fontBody, fontTitle } from "@/commons/styles/fonts";
import { cn } from "@/commons/lib/utils";
import { Toaster } from "sonner";
import { CookieConsentBanner } from "@/components/banners/cookie-consent-banner";

export const metadata: Metadata = {
  title: "Caloteiro — Central de Cobrança e Gestão de Devedores",
  description:
    "O Gabinete do Detetive: anote cada centavo na pista, monitore caloteiros em fuga e comemore cada Pix confirmado.",
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
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        {children}
        <Toaster richColors theme="dark" position="top-right" />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
