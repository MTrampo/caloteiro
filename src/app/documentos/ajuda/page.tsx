import type { Metadata } from "next";
import { HelpDictionaryDocFeature } from "@/features/documents/help-dictionary-doc-feature";
import { APP_URL } from "@/commons/constants/env";

export const metadata: Metadata = {
  title: "Ajuda & Dicionário da Gruta — Como Funciona o Caloteiro",
  description:
    "Guia prático e dicionário oficial do Caloteiro: entenda o que significa Tubarão, Gruta, Presa, Mordida, Faro do Tubarão, Termômetro, Mural de Caôs e Investidas no WhatsApp.",
  alternates: {
    canonical: `${APP_URL}/documentos/ajuda`,
  },
  openGraph: {
    title: "Ajuda & Dicionário da Gruta — Como Funciona o Caloteiro",
    description:
      "Entenda como o sistema de gestão de dívidas e parcelas do Caloteiro funciona na prática e consulte o significado de cada termo da Gruta.",
    url: `${APP_URL}/documentos/ajuda`,
    siteName: "Caloteiro",
    locale: "pt_BR",
    type: "article",
  },
};

export default function DocumentosAjudaPage() {
  return <HelpDictionaryDocFeature />;
}

