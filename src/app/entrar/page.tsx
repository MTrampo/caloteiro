import { SignInFlow } from "@/features/signin";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar | Caloteiro",
  description:
    "Acesse o cofre do Caloteiro para gerenciar seus devedores, prazos e recuperar seu dinheiro.",
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