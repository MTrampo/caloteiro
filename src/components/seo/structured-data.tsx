import * as React from "react";
import { APP_URL } from "@/commons/constants/env";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${APP_URL}/#software`,
        "name": "Caloteiro",
        "alternateName":
          "Caloteiro — Sistema de Gestão de Dívidas, Parcelas e Cobranças",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web, Android, iOS",
        "url": APP_URL,
        "description":
          "Sistema de gestão de dívidas, parcelas e controle financeiro de recebíveis. Centralize devedores em um só lugar, calcule juros e parcelas, guarde comprovantes, registre histórico de promessas e envie cobranças em 1 clique pelo WhatsApp.",
        "creator": {
          "@type": "Organization",
          "name": "Meu Trampo",
          "url": "https://meutrampo.dev.br/",
          "sameAs": [
            "https://instagram.com/meutrampo.dev",
            "https://wa.me/5511911051247"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-91105-1247",
            "contactType": "customer service",
            "availableLanguage": ["Portuguese"]
          }
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Tubarão Lixa (Grátis)",
            "price": "0.00",
            "priceCurrency": "BRL",
            "description":
              "Até 2 devedores ativos (presas), parcelamento em até 12x, cálculo sem juros ou % total e investidas em 3 níveis no WhatsApp sem exigir cartão de crédito."
          },
          {
            "@type": "Offer",
            "name": "Tubarão Branco",
            "price": "29.90",
            "priceCurrency": "BRL",
            "description":
              "Até 10 devedores ativos (presas), parcelamento em até 36x, taxa fixa em R$, investidas 100% editáveis, link da dívida (fatura externa) com Pix 1-clique e cofre de comprovantes."
          },
          {
            "@type": "Offer",
            "name": "Tubarão Cabeça Chato",
            "price": "49.90",
            "priceCurrency": "BRL",
            "description":
              "Devedores e dívidas ilimitadas, parcelamento em até 120x, juros compostos ao mês (% a.m.), Termômetro da Gruta, Faro do Tubarão (0 a 100 pts) e Mural de Caôs (histórico de promessas)."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${APP_URL}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Qual é o principal papel do Caloteiro?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "O principal papel do Caloteiro é centralizar todos os seus devedores em um único sistema de gestão financeira (a Gruta), proporcionando visão clara de recebíveis em aberto, valores já recuperados, cálculo de parcelas e juros, arquivo de comprovantes e cobrança em 1 clique no WhatsApp."
            }
          },
          {
            "@type": "Question",
            "name": "Por que o Caloteiro não realiza cobrança automática por robô, SMS ou e-mail?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Porque o Caloteiro não é um sistema de telemarketing — e pesquisas apontam que cerca de 92% das cobranças automatizadas (robocalls, SMS e bots de números desconhecidos) são rejeitadas ou bloqueadas imediatamente pelo devedor. No Caloteiro, a plataforma calcula juros e saldo atualizado, monta a Investida afiada com a sua chave Pix e o Link da Dívida, e com 1 clique você dispara pelo seu próprio WhatsApp, alcançando até 96% de leitura real sem bloqueios de spam."
            }
          },
          {
            "@type": "Question",
            "name": "O Caloteiro retém o dinheiro ou cobra porcentagem sobre o pagamento recebido?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero comissão. O dinheiro não passa pela conta do Caloteiro. A chave Pix cadastrada é a sua própria conta bancária (Nubank, Inter, Itaú, etc.). O devedor paga direto para você e o valor entra 100% limpo no seu bolso."
            }
          },
          {
            "@type": "Question",
            "name": "O nome do devedor fica público na internet ou vai para órgãos de proteção?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Não. O Caloteiro é uma ferramenta privada de inteligência e gestão financeira para o credor. Não há lista pública ou exposição. Apenas você tem acesso à sua gruta, e o devedor só vê a fatura externa dele quando você envia o link exclusivo protegido por PIN."
            }
          },
          {
            "@type": "Question",
            "name": "Preciso cadastrar cartão de crédito para testar o sistema?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Não. O plano Tubarão Lixa é 100% gratuito para sempre para até 2 presas ativas e não exige nenhum dado de pagamento ou cartão de crédito."
            }
          },
          {
            "@type": "Question",
            "name": "E se o devedor disser que já pagou e não mandar comprovante?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "O Caloteiro conta com o Arquivo de Provas Permanente: você só dá baixa na parcela quando confirmar o crédito, anexando o comprovante diretamente no histórico da dívida para acabar com discussões."
            }
          },
          {
            "@type": "Question",
            "name": "Emprestar dinheiro a juros entre pessoas físicas é crime?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Não é crime. O Código Civil brasileiro autoriza expressamente o mútuo feneratício entre particulares (arts. 586 a 592). O STJ reconhece a validade da cobrança de juros legais acordados entre pessoas físicas, desde que respeitados os limites da legislação civil."
            }
          },
          {
            "@type": "Question",
            "name": "Cobrar devedor pelo WhatsApp pode ser considerado assédio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Não. Lembrar o devedor sobre uma obrigação vencida no privado do WhatsApp é o exercício regular de um direito do credor (art. 188, I do Código Civil). O que a lei veda é a exposição pública e vexatória."
            }
          },
          {
            "@type": "Question",
            "name": "Mensagens de WhatsApp e comprovantes Pix servem como prova jurídica de dívida?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sim. O Código de Processo Civil (arts. 369 e 411) admite mensagens eletrônicas e comprovantes Pix como início de prova material legítima de contratos verbais de empréstimo."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

