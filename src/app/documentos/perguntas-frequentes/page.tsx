import type { Metadata } from "next";
import { LegalFaqDocFeature } from "@/features/documents/legal-faq-doc-feature";
import { APP_URL } from "@/commons/constants/env";

export const metadata: Metadata = {
  title: "Perguntas Frequentes & Guia Legal sobre Empréstimos, Juros e Cobranças — Caloteiro",
  description:
    "Tire dúvidas sobre como controlar dinheiro emprestado, substituir planilhas de empréstimo, calcular juros, enviar mensagens de cobrança no WhatsApp, validade de comprovantes Pix e cobrança no Juizado Especial.",
  alternates: {
    canonical: `${APP_URL}/documentos/perguntas-frequentes`,
  },
  keywords: [
    "como controlar dinheiro emprestado",
    "planilha de controle de emprestimos",
    "calcular juros de dinheiro emprestado",
    "mensagem de cobranca whatsapp",
    "emprestei dinheiro e nao me pagam",
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
    title: "Perguntas Frequentes & Guia Legal sobre Empréstimos, Juros e Cobranças — Caloteiro",
    description:
      "Como controlar dinheiro emprestado, calcular parcelas e juros, enviar mensagens de cobrança no WhatsApp e conhecer seus direitos pelo Código Civil e STJ.",
    url: `${APP_URL}/documentos/perguntas-frequentes`,
    siteName: "Caloteiro",
    locale: "pt_BR",
    type: "article",
  },
};

export default function DocumentosPerguntasFrequentesPage() {
  return <LegalFaqDocFeature />;
}

