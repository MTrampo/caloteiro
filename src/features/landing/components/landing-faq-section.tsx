"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { FaChevronDown, FaArrowRight } from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface LandingFaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: LandingFaqItem[] = [
  {
    id: "faq-main-role",
    question: "Qual é o principal papel do Caloteiro no meu dia a dia?",
    answer:
      "O papel principal do Caloteiro é acabar com a cegueira financeira e reunir todos os seus devedores em um só quartel-general. Chega de bloco de notas do celular, planilhas de controle de empréstimos confusas e cobrança de cabeça (onde você só lembra da dívida quando o caloteiro posta foto em praia de luxo). Na sua Gruta, você controla dinheiro emprestado, vendas ou acordos com visão panorâmica e sem ilusões: sabe na hora quanto ainda tem esperança de voltar (recebíveis na pista), quanto já voltou no Pix e quanto está em atraso crítico.",
  },
  {
    id: "faq-spreadsheet-vs-system",
    question: "Por que usar o Caloteiro em vez de uma planilha de controle de empréstimos no Excel?",
    answer: (
      <div className="space-y-2.5">
        <p>
          Planilhas exigem fórmulas manuais que quebram na tela do celular, não guardam comprovantes de transferência e deixam você perdido quando o devedor paga um valor picado. No Caloteiro, o motor calcula parcelas e juros sozinho (sem juros, % total, taxa fixa em R$ ou % ao mês), faz a{" "}
          <strong className="text-white">Amortização em Cascata</strong> de pagamentos parciais, guarda os recibos no{" "}
          <strong className="text-white">Cofre de Comprovantes</strong> e gera as{" "}
          <strong className="text-white">Investidas de cobrança para o WhatsApp</strong> em 1 clique.
        </p>
        <div>
          <Link
            href="/documentos/ajuda#planilha-vs-caloteiro"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4"
          >
            <span>Ver comparativo completo: Planilha vs. Caloteiro</span>
            <FaArrowRight className="size-3 shrink-0" />
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: "faq-auto-charge",
    question: "Por que o Caloteiro não faz cobrança automática por robô, SMS ou e-mail?",
    answer: (
      <div className="space-y-2.5">
        <p>
          Porque o Caloteiro não é um sistema de telemarketing — e pesquisas no Brasil apontam que cerca de{" "}
          <strong className="text-white">92% das cobranças automatizadas são rejeitadas ou bloqueadas</strong>. Quando um devedor recebe ligação, SMS, e-mail ou mensagem automática de um número desconhecido de robô, ele bloqueia e denuncia como spam em 3 segundos. Já quando você envia a{" "}
          <strong className="text-white">Investida 1-Clique</strong> pelo seu próprio WhatsApp (com o cálculo oficial e o Link da Dívida gerados pelo sistema), a Presa não tem filtro de spam para se esconder e a leitura chega a 96%.
        </p>
        <div>
          <Link
            href="/documentos/perguntas-frequentes#por-que-sem-robo"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4"
          >
            <span>Ver estudo completo e gráfico de rejeição (92%)</span>
            <FaArrowRight className="size-3 shrink-0" />
          </Link>
        </div>
      </div>
    ),
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
    question: "Os dados sensíveis como CPF e Chave Pix ficam seguros?",
    answer:
      "Blindagem absoluta perante a LGPD: todos os CPFs, CNPJs e chaves Pix cadastrados são criptografados em repouso (padrão bancário). Nem os desenvolvedores ou administradores da plataforma conseguem visualizar esses dados em texto puro; somente você, autenticado na sua Gruta, tem a chave para visualizá-los.",
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
      "Não! No plano Tubarão Lixa você entra na gruta sem informar nenhum dado de pagamento ou cartão de crédito. Você já começa a rastrear até 2 presas na hora, gratuitamente e para sempre.",
  },
  {
    id: "faq-proofs-and-excuses",
    question: "Posso guardar comprovantes de pagamento e histórico de desculpas?",
    answer:
      "Sim! A partir do plano Tubarão Branco você tem o Cofre de Comprovantes para anexar recibos e comprovantes de pagamento em cada parcela. E no Cabeça Chata você conta com o Mural de Caôs para registrar todas as promessas esfarrapadas com data e hora.",
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
      "Nenhuma dívida ou presa é apagada. Todo o seu histórico continua intacto na sua gruta; o sistema apenas aplica o limite de novos cadastros do plano gratuito até que você queira expandir novamente.",
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
