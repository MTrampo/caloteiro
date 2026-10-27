"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import backgroundIllustration from "@/commons/assets/svgs/background.svg";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FinalClosingBanner() {
  const sectionRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".grotto-bg-reveal",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.14,
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
      className="relative w-full bg-[#070b12] border-t border-border/50 overflow-hidden"
    >
      {/* Bloco de Texto no Mobile (Acima da arte para não cobrir os personagens em telas pequenas) */}
      <div className="lg:hidden px-6 pt-12 pb-6 space-y-4">
        <h2 className="grotto-bg-reveal font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          Tem dinheiro seu voando na praça agora?
        </h2>
        <p className="grotto-bg-reveal text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
          Eles sempre dizem &ldquo;amanhã eu pago&rdquo;. Abra sua gruta grátis,
          marque cada devedor e deixe o Tubarão cobrar o seu Pix.
        </p>
        <div className="grotto-bg-reveal pt-1">
          <Button
            render={<Link href="/cadastrar" />}
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-11 px-6 text-xs sm:text-sm shadow-lg cursor-pointer justify-center"
          >
            <span>Abrir Minha Gruta Grátis</span>
            <FaArrowRight className="size-3.5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Arte Panorâmica Completa de Ponta a Ponta (100% Width sem cortes e sem véu escuro) */}
      <div className="relative w-full aspect-[1920/1071]">
        <Image
          src={backgroundIllustration}
          alt="A Gruta do Tubarão cobrando os devedores no Pix"
          fill
          unoptimized
          className="object-contain lg:object-cover object-center select-none"
        />

        {/* Fusão suave apenas na linha extrema do topo e da base com o fundo da página */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent pointer-events-none"
        />

        {/* Texto no Desktop: Posicionado exatamente no quadrante superior esquerdo livre da caverna */}
        <div className="hidden lg:block absolute inset-x-0 top-[7%] z-10">
          <div className="w-full mx-auto px-6 max-w-5xl md:max-w-7xl">
            <div className="max-w-[430px] xl:max-w-[470px] space-y-4">
              <h2 className="grotto-bg-reveal font-heading text-3xl xl:text-4xl font-bold tracking-tight text-white leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                Tem dinheiro seu voando na praça agora?
              </h2>

              <p className="grotto-bg-reveal text-xs xl:text-sm font-mono text-zinc-200 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                Eles sempre dizem &ldquo;amanhã eu pago&rdquo;. Aposente o bloco
                de notas, marque suas presas na gruta e deixe o Tubarão cobrar o
                seu Pix.
              </p>

              <div className="grotto-bg-reveal flex items-center gap-3 pt-1">
                <Button
                  render={<Link href="/cadastrar" />}
                  size="lg"
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-11 px-6 text-xs xl:text-sm shadow-xl cursor-pointer justify-center"
                >
                  <span>Abrir Minha Gruta Grátis</span>
                  <FaArrowRight className="size-3.5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
