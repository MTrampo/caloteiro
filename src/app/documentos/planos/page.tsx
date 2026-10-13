import type { Metadata } from "next";
import { PlansDocFeature } from "@/features/documents/plans-doc-feature";

export const metadata: Metadata = {
  title: "Comparativo de Planos & Regras — Caloteiro",
  description:
    "Conheça os limites, regras de cobrança, modalidades de juros e o arsenal completo de cada espécie de Tubarão no Caloteiro.",
};

export default function DocumentosPlanosPage() {
  return <PlansDocFeature />;
}

