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
        "alternateName": "Caloteiro — Central de Cobranças",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web, Android, iOS",
        "url": APP_URL,
        "description":
          "Um aplicativo descontraído para centralizar todos os devedores em 1 só lugar, oferecendo visão panorâmica de recebíveis na pista, valores recuperados e calotes históricos para pessoas físicas e autônomos.",
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
            "description": "Até 2 presas ativas na gruta, parcelamento em 12x e 3 níveis de mensagens prontas no WhatsApp sem exigir cartão."
          },
          {
            "@type": "Offer",
            "name": "Tubarão Branco",
            "price": "29.90",
            "priceCurrency": "BRL",
            "description": "Até 10 presas ativas, taxa fixa em R$, mensagens 100% editáveis, link com Pix 1-clique e cofre de comprovantes."
          },
          {
            "@type": "Offer",
            "name": "Tubarão Cabeça Chato",
            "price": "49.90",
            "priceCurrency": "BRL",
            "description": "Presas e dívidas ilimitadas, juros ao mês (% a.m.), Termômetro da Gruta, Score de Risco e Mural de Caôs."
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
              "text": "O principal papel do Caloteiro é centralizar todos os seus devedores em um único lugar (a Gruta), proporcionando uma visão ampla e sem ilusões de recebíveis: quanto dinheiro ainda tem chance de voltar, quanto já foi recuperado no Pix e quanto está virando doação involuntária ou lenda urbana."
            }
          },
          {
            "@type": "Question",
            "name": "O Caloteiro cobra ou envia mensagens para o devedor sozinho pelas minhas costas?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Não. O envio é 100% manual e sob o seu comando. O Caloteiro não faz disparos automáticos pelas suas costas nem incomoda seus contatos sem o seu consentimento. O sistema calcula o valor atualizado, juros, dias de atraso e monta a mensagem com o Pix. Você só precisa clicar para abrir o seu próprio WhatsApp e enviar quando achar melhor."
            }
          },
          {
            "@type": "Question",
            "name": "O Caloteiro retém o dinheiro ou cobra porcentagem sobre o Pix recebido?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Zero comissão. O dinheiro não passa pela conta do Caloteiro. A chave Pix cadastrada é a sua própria conta bancária pessoal (Nubank, Inter, Itaú, etc.). O devedor transfere direto para você e o valor entra 100% limpo no seu bolso."
            }
          },
          {
            "@type": "Question",
            "name": "Para quem o Caloteiro é indicado?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "O Caloteiro é ideal para: 1) Pessoas Físicas que emprestam dinheiro para amigos, parentes ou dividem despesas; e 2) Autônomos, freelancers e prestadores de serviços que trabalham com empréstimos, vendas no fiado ou parcelamento próprio de serviços e precisam cobrar clientes pontualmente sem constrangimento."
            }
          },
          {
            "@type": "Question",
            "name": "O nome do devedor fica público na internet ou vai para órgãos de proteção?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Não. O Caloteiro é uma ferramenta privada de inteligência e gestão financeira para quem emprestou o dinheiro. Não há lista pública ou exposição. Apenas você tem acesso à sua gruta, e o devedor só vê a fatura dele quando você envia o link exclusivo protegido por PIN."
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

