import type { Metadata } from "next";
import { HelpDictionaryDocFeature } from "@/features/documents/help-dictionary-doc-feature";
import { APP_URL } from "@/commons/constants/env";

export const metadata: Metadata = {
  title: "Ajuda & Dicionário da Gruta — Como Controlar Empréstimos, Juros e Dívidas",
  description:
    "Guia prático e dicionário oficial do Caloteiro: veja como controlar dinheiro emprestado, substituir planilhas de empréstimo com juros, enviar cobranças no WhatsApp e entenda os termos Tubarão, Gruta, Presa, Mordida e Faro.",
  alternates: {
    canonical: `${APP_URL}/documentos/ajuda`,
  },
  keywords: [
    "como controlar dinheiro emprestado",
    "planilha de controle de emprestimos",
    "planilha de emprestimo com juros",
    "aplicativo para controlar dinheiro emprestado",
    "calcular juros de dinheiro emprestado",
    "dicionario do caloteiro",
    "como funciona o caloteiro",
    "sistema de controle de emprestimos e parcelas",
  ],
  openGraph: {
    title: "Ajuda & Dicionário da Gruta — Como Controlar Empréstimos, Juros e Dívidas",
    description:
      "Entenda como substituir planilhas de controle de empréstimos pelo sistema do Caloteiro, calcular juros automaticamente e cobrar em 1 clique no WhatsApp.",
    url: `${APP_URL}/documentos/ajuda`,
    siteName: "Caloteiro",
    locale: "pt_BR",
    type: "article",
  },
};

export default function DocumentosAjudaPage() {
  return <HelpDictionaryDocFeature />;
}

