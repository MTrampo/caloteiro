import { SignUpFlow } from "@/features/signup";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar Conta Grátis — Gestão de Dívidas e Recebíveis",
  description:
    "Crie sua conta grátis no Caloteiro sem precisar de cartão de crédito. Organize devedores, parcelas, juros, comprovantes e mensagens de cobrança no WhatsApp.",
  alternates: {
    canonical: "/cadastrar",
  },
};

export default function SignUpPage() {
  return <SignUpFlow />;
}
