import { SignInFlow } from "@/features/signin";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar no Painel Financeiro",
  description:
    "Acesse sua conta no Caloteiro para gerenciar devedores, acompanhar parcelas vencidas, registrar comprovantes e enviar cobranças pelo WhatsApp.",
  alternates: {
    canonical: "/entrar",
  },
};

interface SignInPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedParams = await searchParams;
  return <SignInFlow initialEmail={resolvedParams?.email} />;
}