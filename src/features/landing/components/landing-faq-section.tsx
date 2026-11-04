"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { FaChevronDown } from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAQ_ITEMS = [
  {
    id: "faq-main-role",
    question: "Qual é o principal papel do Caloteiro no meu dia a dia?",
    answer:
      "O papel principal do Caloteiro é acabar com a cegueira financeira e reunir todos os seus devedores em um só quartel-general. Chega de bloco de notas do celular, papel de pão e cobrança de cabeça (onde você só lembra da dívida quando o caloteiro posta foto em praia de luxo). Na sua Gruta, você tem uma visão panorâmica e sem ilusões: sabe na hora quanto ainda tem esperança de voltar (recebíveis na pista), quanto você já arrancou de volta no Pix e quanto já está virando doação involuntária ou lenda urbana. Acaba a ilusão e você passa a ter o controle cirúrgico de cada centavo.",
  },
  {
    id: "faq-auto-charge",
    question: "O Caloteiro cobra o devedor automaticamente no WhatsApp sem eu autorizar?",
    answer:
      "Não! O Caloteiro não faz disparos automáticos nem ligações robóticas pelas suas costas. Você é o Tubarão que comanda a caça: a plataforma calcula juros e saldo atualizado, monta a mensagem afiada com a sua chave Pix e, com 1 clique, você abre o seu próprio WhatsApp para disparar quando achar melhor.",
  },
  {
    id: "faq-target-audience",
    question: "Para quem o Caloteiro é indicado? Serve para pessoas físicas ou autônomos?",
    answer:
      "O Caloteiro atende perfeitamente a dois perfis que sofrem com promessas furadas: 1) Pessoas Físicas que emprestam dinheiro do próprio bolso para parentes, amigos, conhecidos ou dividem contas e rolês; e 2) Autônomos, freelancers e prestadores de serviços que trabalham com pequenos empréstimos, vendem fiado ou parcelam serviços por conta própria e precisam cobrar clientes sem climão nem prejuízo.",
  },
  {
    id: "faq-commission-pix",
    question: "O Caloteiro fica com alguma comissão ou porcentagem do meu Pix?",
    answer:
      "Zero comissão! 100% do dinheiro pago pelo devedor vai direto para a sua própria conta bancária pessoal ou profissional (Nubank, Inter, Itaú, etc.). O Caloteiro não retém o seu dinheiro e não desconta absolutamente nada do valor que você recuperou.",
  },
  {
    id: "faq-privacy-exposure",
    question: "O nome do devedor é exposto publicamente na internet ou no Serasa?",
    answer:
      "De jeito nenhum. O Caloteiro é uma ferramenta privada e segura de gestão financeira para quem emprestou o dinheiro. Não há lista pública, busca aberta ou exposição vexatória. A fatura externa é estritamente bloqueada contra rastreamento de buscadores e protegida por PIN de 4 dígitos gerado por você.",
  },
  {
    id: "faq-encryption-lgpd",
    question: "Os dados sensíveis como CPF e Chave Pix ficam seguros no banco de dados?",
    answer:
      "Blindagem absoluta perante a LGPD: todos os CPFs, CNPJs e chaves Pix cadastrados são criptografados em repouso no banco de dados com algoritmo AES-256 (padrão bancário). Nem os desenvolvedores ou administradores da plataforma conseguem visualizar esses dados em texto puro; somente você, autenticado na sua Gruta, tem a chave para visualizá-los.",
  },
  {
    id: "faq-1",
    question: "O devedor precisa baixar aplicativo ou criar conta?",
    answer:
      "Não. Toda a cobrança chega diretamente no WhatsApp dele pronta para leitura. E caso você envie o link da fatura externa (disponível a partir do plano Tubarão Branco), ele consulta o extrato completo direto pelo navegador do celular sem precisar instalar nada.",
  },
  {
    id: "faq-no-card-required",
    question: "Preciso cadastrar cartão de crédito para começar no plano grátis?",
    answer:
      "Não! No plano Tubarão Lixa você entra na gruta sem informar nenhum dado de pagamento ou cartão de crédito. Você já começa a rastrear até 2 presas marcadas na hora, gratuitamente e para sempre.",
  },
  {
    id: "faq-proofs-and-excuses",
    question: "Posso guardar comprovantes de pagamento e histórico de desculpas?",
    answer:
      "Sim! A partir do plano Tubarão Branco você tem o Cofre de Comprovantes para anexar recibos de Pix em cada parcela. E no Cabeça Chata você conta com o Mural de Caôs para registrar todas as promessas esfarrapadas com data e hora.",
  },
  {
    id: "faq-2",
    question: "O pagamento da assinatura pelo Mercado Pago é seguro?",
    answer:
      "Totalmente. As assinaturas dos planos pagos são processadas diretamente pelo ambiente oficial do Mercado Pago. O Caloteiro não armazena dados sensíveis de cartão e a liberação da sua gruta acontece instantaneamente.",
  },
  {
    id: "faq-4",
    question: "Posso cancelar a assinatura quando eu quiser?",
    answer:
      "Quando quiser, sem fidelidade, letras miúdas ou multa rescisória. Quando o último caloteiro quitar tudo, você pode cancelar ou voltar para o plano gratuito mantendo todo o seu histórico salvo.",
  },
  {
    id: "faq-5",
    question: "O que acontece com os meus dados se eu voltar para o plano grátis?",
    answer:
      "Nenhuma dívida ou presa marcada é apagada. Todo o seu histórico continua intacto na sua gruta; o sistema apenas aplica o limite de novos cadastros do plano gratuito até que você queira expandir novamente.",
  },
];

export function LandingFaqSection() {
  const [openId, setOpenId] = React.useState<string | null>("faq-1");
  const sectionRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".faq-collapsible-item",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 58%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="w-full py-12 sm:py-24 border-b border-border/60 bg-zinc-900/30 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-6 sm:space-y-8">
        {/* Cabeçalho Padrão no Topo (Regra 7) */}
      <div className="space-y-2 max-w-2xl">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Dúvidas antes de entrar na gruta?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
          Respostas diretas sobre segurança, assinatura via Mercado Pago e
          funcionamento dos planos.
        </p>
      </div>

      {/* Lista de Perguntas Abaixo do Cabeçalho */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;

          return (
            <Collapsible
              key={item.id}
              open={isOpen}
              onOpenChange={(nextOpen) =>
                setOpenId(nextOpen ? item.id : null)
              }
              className="faq-collapsible-item rounded-2xl border border-border bg-card overflow-hidden transition-colors"
            >
              <CollapsibleTrigger className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-zinc-900/50 transition-colors">
                <span className="font-heading text-sm sm:text-base font-bold text-white">
                  {item.question}
                </span>
                <FaChevronDown
                  className={`size-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                {item.answer}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      </div>
    </section>
  );
}
