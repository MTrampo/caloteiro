import { SignUpFlow } from "@/features/signup";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cadastrar | Caloteiro",
  description:
    "Crie sua conta no Caloteiro e nunca mais perca o controle do dinheiro que emprestou.",
  alternates: {
    canonical: "/cadastrar",
  },
};

export default function SignUpPage() {
  return <SignUpFlow />;
}
