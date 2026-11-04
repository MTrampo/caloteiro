import type { Metadata } from "next";
import { PrivacyDocFeature } from "@/features/documents/privacy-doc-feature";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados (LGPD) — Caloteiro",
  description:
    "Conheça a Política de Privacidade e Proteção de Dados da plataforma Caloteiro em estrita conformidade com a LGPD (Lei nº 13.709/2018) e Marco Civil da Internet.",
};

export default function DocumentosPrivacidadePage() {
  return <PrivacyDocFeature />;
}

