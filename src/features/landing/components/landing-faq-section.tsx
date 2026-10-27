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
    id: "faq-1",
    question: "O devedor precisa baixar aplicativo ou criar conta?",
    answer:
      "Não. Toda a cobrança chega diretamente no WhatsApp dele pronta para leitura. E caso você use o link externo no plano Tubarão Branco, ele consulta tudo direto pelo navegador do celular sem precisar instalar nada.",
  },
  {
    id: "faq-2",
    question: "O pagamento da assinatura pelo Mercado Pago é seguro?",
    answer:
      "Totalmente. As assinaturas dos planos pagos são processadas diretamente pelo ambiente oficial do Mercado Pago. O Caloteiro não armazena dados do seu cartão e a liberação da sua gruta acontece automaticamente.",
  },
  {
    id: "faq-3",
    question: "Posso começar grátis no Tubarão Lixa e mudar de plano depois?",
    answer:
      "Sim! Você pode criar sua gruta no plano Tubarão Lixa sem informar cartão de crédito e usar gratuitamente para até 2 presas marcadas. Quando precisar vigiar mais devedores, basta evoluir de espécie com 1 clique.",
  },
  {
    id: "faq-4",
    question: "Posso cancelar a assinatura quando eu quiser?",
    answer:
      "Quando quiser, sem fidelidade, letras miúdas ou multa rescisória. Quando o último caloteiro quitar tudo, você pode cancelar ou voltar para o plano gratuito mantendo todo o seu histórico salvo.",
  },
  {
    id: "faq-5",
    question:
      "O que acontece com os meus dados se eu voltar para o plano grátis?",
    answer:
      "Nenhuma dívida ou presa marcada é apagada. Todo o seu histórico continua intacto na sua gruta; o sistema apenas aplica o limite de novos cadastros do plano atual até que você queira expandir novamente.",
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
    <section ref={sectionRef} id="faq" className="py-16 sm:py-24 space-y-8">
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
    </section>
  );
}
