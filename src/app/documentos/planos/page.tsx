import type { Metadata } from "next";
import { PlansDocFeature } from "@/features/documents/plans-doc-feature";

export const metadata: Metadata = {
  title: "Planos e Preços de Gestão de Dívidas — Caloteiro",
  description:
    "Compare os planos do Caloteiro (a partir de R$ 0 no plano gratuito). Controle devedores, calcule parcelas e juros, guarde comprovantes e cobre pelo WhatsApp.",
};

export default function DocumentosPlanosPage() {
  return <PlansDocFeature />;
}

