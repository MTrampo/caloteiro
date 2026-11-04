import type { Metadata } from "next";
import { TermsDocFeature } from "@/features/documents/terms-doc-feature";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso — Caloteiro",
  description:
    "Confira os termos e condições de uso da plataforma Caloteiro, operada por Meu Trampo. Diretrizes de uso, isenções financeiras, planos e conduta do credor.",
};

export default function DocumentosTermosPage() {
  return <TermsDocFeature />;
}

