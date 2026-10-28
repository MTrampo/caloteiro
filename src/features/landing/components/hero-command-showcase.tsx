"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/commons/assets/svgs/hero.svg";
import { FaArrowRight, FaCheck } from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroCommandShowcase() {
  const containerRef = React.useRef<HTMLElement>(null);
  const heroVisualRef = React.useRef<HTMLDivElement>(null);
  const floatingImageRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Apenas a ilustração da direita possui animação de entrada, flutuação e parallax
      gsap.fromTo(
        heroVisualRef.current,
        { y: 24, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: "power3.out" }
      );

      if (floatingImageRef.current) {
        gsap.to(floatingImageRef.current, {
          y: -12,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      gsap.to(heroVisualRef.current, {
        y: 28,
        scale: 0.97,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full pt-6 pb-12 sm:pt-14 sm:pb-24 border-b border-border/60 bg-background"
    >
      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        {/* Coluna Esquerda: Narrativa Principal Estática (Visível Imediatamente) */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Eles fingem que esqueceram. O Tubarão lembra até o último centavo.
            </h1>

            <p className="text-xs sm:text-base text-zinc-400 font-mono leading-relaxed max-w-xl">
              Chega de anotar dívidas em bloco de notas e ficar com vergonha de
              cobrar. Marque suas presas na gruta, registre cada caô e deixe o
              sistema cobrar o seu Pix.
            </p>
          </div>

          {/* Botões de Ação Principais (Regra 4A: CTA em Branco) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
            <Button
              render={<Link href="/cadastrar" />}
              size="lg"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-11 sm:h-12 px-6 text-xs sm:text-sm shadow-sm cursor-pointer justify-center"
            >
              <span>Abrir Minha Gruta Grátis</span>
              <FaArrowRight className="size-3.5 ml-2" />
            </Button>

            <Button
              render={<a href="#central-gruta" />}
              variant="outline"
              size="lg"
              className="border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 font-mono text-xs sm:text-sm rounded-xl h-11 sm:h-12 px-5 cursor-pointer justify-center"
            >
              Ver Central da Gruta em Ação
            </Button>
          </div>

          {/* Destaques Rápidos Reais (Em linha fluida no mobile para economizar altura) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-border/50 text-[11px] sm:text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <FaCheck className="size-3 text-emerald-400 shrink-0" />
              <span>Grátis até 2 presas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaCheck className="size-3 text-emerald-400 shrink-0" />
              <span>Amortização em cascata</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaCheck className="size-3 text-emerald-400 shrink-0" />
              <span>Disparo no WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Ilustração Principal hero.svg */}
        <div
          ref={heroVisualRef}
          className="lg:col-span-6 flex items-center justify-center relative"
        >
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
          />

          <div
            ref={floatingImageRef}
            className="relative w-full max-w-[290px] sm:max-w-[420px] lg:max-w-[520px] mx-auto select-none"
          >
            <Image
              src={heroIllustration}
              alt="Ilustração do Tubarão monitorando dívidas e recebendo Pix na Gruta"
              priority
              unoptimized
              className="w-full h-auto drop-shadow-[0_24px_48px_rgba(0,0,0,0.65)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
