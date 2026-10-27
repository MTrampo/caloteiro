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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const heroVisualRef = React.useRef<HTMLDivElement>(null);
  const floatingImageRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-reveal",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.12 }
      ).fromTo(
        heroVisualRef.current,
        { y: 36, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9 },
        "-=0.45"
      );

      // Flutuação contínua suave da arte principal do Hero
      if (floatingImageRef.current) {
        gsap.to(floatingImageRef.current, {
          y: -12,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Parallax em planos opostos conforme o usuário rola a página
      gsap.to(leftColumnRef.current, {
        y: -44,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      gsap.to(heroVisualRef.current, {
        y: 36,
        scale: 0.96,
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
      className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-border/60"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Coluna Esquerda: Narrativa Principal */}
        <div ref={leftColumnRef} className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <h1 className="hero-reveal font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Eles fingem que esqueceram. O Tubarão lembra até o último centavo.
            </h1>

            <p className="hero-reveal text-xs sm:text-base text-zinc-400 font-mono leading-relaxed max-w-xl">
              Chega de anotar dívidas em bloco de notas e ficar com vergonha de
              cobrar. Marque suas presas na gruta, registre cada caô e deixe o
              sistema cobrar o seu Pix.
            </p>
          </div>

          {/* Botões de Ação Principais (Regra 4A: CTA em Branco) */}
          <div className="hero-reveal flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Button
              render={<Link href="/cadastrar" />}
              size="lg"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-12 px-6 text-sm shadow-sm cursor-pointer justify-center"
            >
              <span>Abrir Minha Gruta Grátis</span>
              <FaArrowRight className="size-3.5 ml-2" />
            </Button>

            <Button
              render={<a href="#central-gruta" />}
              variant="outline"
              size="lg"
              className="border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 font-mono text-xs sm:text-sm rounded-xl h-12 px-5 cursor-pointer justify-center"
            >
              Ver Central da Gruta em Ação
            </Button>
          </div>

          {/* Destaques Rápidos Reais */}
          <div className="hero-reveal grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <FaCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>Grátis até 2 presas</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>Amortização em cascata</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>Disparo no WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Ilustração Principal hero.svg */}
        <div
          ref={heroVisualRef}
          className="lg:col-span-6 flex items-center justify-center relative"
        >
          {/* Iluminação atmosférica suave ao fundo da arte */}
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
          />

          <div
            ref={floatingImageRef}
            className="relative w-full max-w-[520px] mx-auto select-none"
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
