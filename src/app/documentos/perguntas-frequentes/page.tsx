import type { Metadata } from "next";
import { LegalFaqDocFeature } from "@/features/documents/legal-faq-doc-feature";
import { APP_URL } from "@/commons/constants/env";

export const metadata: Metadata = {
  title: "Perguntas Frequentes & Guia Legal sobre Empréstimos — Caloteiro",
  description:
    "Tudo o que você precisa saber sobre a legalidade de emprestar dinheiro a juros, cobrar pelo WhatsApp, validade jurídica de comprovantes Pix e cobrança sem advogado pelo Código Civil e STJ.",
  alternates: {
    canonical: `${APP_URL}/documentos/perguntas-frequentes`,
  },
  keywords: [
    "emprestar dinheiro a juros e crime stj",
    "posso cobrar juros de dinheiro emprestado",
    "como cobrar amigo sem perder a amizade",
    "como cobrar parente sem climao",
    "cobrar no whatsapp e crime",
    "mensagem de whatsapp vale como prova de divida",
    "como cobrar fiado legalmente",
    "calculadora de juros de emprestimo entre amigos",
    "juizado especial civel cobranca sem advogado",
    "mutuo feneraticio codigo civil",
  ],
  openGraph: {
    title: "Perguntas Frequentes & Guia Legal sobre Empréstimos — Caloteiro",
    description:
      "Tire dúvidas jurídicas e práticas sobre empréstimos particulares, taxas de juros legais, validade de mensagens de WhatsApp e cobrança no Juizado Especial com o Caloteiro.",
    url: `${APP_URL}/documentos/perguntas-frequentes`,
    siteName: "Caloteiro",
    locale: "pt_BR",
    type: "article",
  },
};

export default function DocumentosPerguntasFrequentesPage() {
  return <LegalFaqDocFeature />;
}

