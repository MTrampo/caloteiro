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

const BIOLUMINESCENT_BUBBLES = [
  { left: "6%", bottom: "10%", size: "size-2", delay: 0.2, duration: 4.6, drift: 12, rise: -180 },
  { left: "12%", bottom: "18%", size: "size-3", delay: 1.4, duration: 5.4, drift: -15, rise: -220 },
  { left: "18%", bottom: "8%", size: "size-1.5", delay: 2.3, duration: 4.2, drift: 10, rise: -160 },
  { left: "24%", bottom: "26%", size: "size-2.5", delay: 0.7, duration: 5.0, drift: -12, rise: -210 },
  { left: "31%", bottom: "14%", size: "size-3.5", delay: 1.9, duration: 5.8, drift: 16, rise: -240 },
  { left: "37%", bottom: "6%", size: "size-2", delay: 0.4, duration: 4.5, drift: -10, rise: -190 },
  { left: "43%", bottom: "22%", size: "size-2.5", delay: 2.7, duration: 5.1, drift: 14, rise: -230 },
  { left: "49%", bottom: "12%", size: "size-1.5", delay: 1.1, duration: 4.3, drift: -8, rise: -170 },
  { left: "54%", bottom: "16%", size: "size-3.5", delay: 0.1, duration: 5.6, drift: 18, rise: -260 },
  { left: "60%", bottom: "8%", size: "size-2", delay: 1.8, duration: 4.7, drift: -14, rise: -200 },
  { left: "65%", bottom: "28%", size: "size-4", delay: 2.5, duration: 6.1, drift: 15, rise: -270 },
  { left: "71%", bottom: "14%", size: "size-2.5", delay: 0.9, duration: 4.9, drift: -12, rise: -210 },
  { left: "76%", bottom: "20%", size: "size-1.5", delay: 3.1, duration: 4.4, drift: 10, rise: -175 },
  { left: "81%", bottom: "10%", size: "size-3", delay: 1.5, duration: 5.3, drift: -16, rise: -235 },
  { left: "86%", bottom: "24%", size: "size-2", delay: 0.5, duration: 4.8, drift: 12, rise: -195 },
  { left: "91%", bottom: "12%", size: "size-3.5", delay: 2.1, duration: 5.7, drift: -14, rise: -250 },
  { left: "95%", bottom: "18%", size: "size-2", delay: 1.2, duration: 4.6, drift: 9, rise: -185 },
  { left: "52%", bottom: "34%", size: "size-2.5", delay: 2.9, duration: 5.2, drift: -11, rise: -220 },
];

export function GrottoVisualShowcase() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const artLayerRef = React.useRef<HTMLDivElement>(null);
  const glowLayerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Zoom cinematográfico suave sincronizado com o scroll
      if (artLayerRef.current) {
        gsap.fromTo(
          artLayerRef.current,
          { scale: 1.05 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 0.6,
            },
          }
        );
      }

      // 2. Pulsação viva nos monitores holográficos do Tubarão e no celular da presa
      gsap.to(".grotto-screen-pulse", {
        opacity: 0.85,
        scale: 1.12,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.6,
      });

      // 3. Partículas bioluminescentes subindo pela caverna com leve oscilação lateral
      const bubbles = gsap.utils.toArray<HTMLElement>(".grotto-bubble");
      bubbles.forEach((bubble, i) => {
        const cfg = BIOLUMINESCENT_BUBBLES[i] || BIOLUMINESCENT_BUBBLES[0];
        gsap.fromTo(
          bubble,
          { y: 0, x: 0, opacity: 0, scale: 0.7 },
          {
            y: cfg.rise,
            x: cfg.drift,
            opacity: 0.85,
            scale: 1.1,
            duration: cfg.duration,
            delay: cfg.delay,
            ease: "sine.out",
            repeat: -1,
            yoyo: false,
          }
        );
      });
    },
    { scope: sectionRef }
  );

  // 4. Reação sutil de profundidade 2.5D ao mover o mouse sobre a arte
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!artLayerRef.current || !glowLayerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(artLayerRef.current, {
      x: relX * -14,
      y: relY * -10,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.to(glowLayerRef.current, {
      x: relX * 22,
      y: relY * 16,
      duration: 0.8,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!artLayerRef.current || !glowLayerRef.current) return;
    gsap.to([artLayerRef.current, glowLayerRef.current], {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power3.out",
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-[#070b12] border-b border-border/60 overflow-hidden"
    >
      {/* Bloco de Texto no Mobile (Acima da arte para não cobrir os personagens) */}
      <div className="lg:hidden px-4 sm:px-6 pt-10 pb-5 space-y-3.5">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          Eles sempre dizem &ldquo;amanhã eu pago&rdquo;. O Tubarão cobra hoje.
        </h2>
        <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
          Enquanto o devedor sua frio olhando o celular, você acompanha cada
          parcela na tela da Gruta até o Pix cair na conta.
        </p>
        <div className="pt-1">
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

      {/* Palco Panorâmico de Ponta a Ponta (100% Width) */}
      <div className="relative w-full min-h-[250px] sm:min-h-0 aspect-[16/10] sm:aspect-[1920/1071]">
        {/* Camada 1: Arte Vetorial background.svg Escurecida para Harmonizar com o Tema Dark + Parallax */}
        <div
          ref={artLayerRef}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          <Image
            src={backgroundIllustration}
            alt="A Gruta do Tubarão cobrando os devedores no Pix"
            fill
            unoptimized
            className="object-cover object-[58%_bottom] sm:object-center select-none brightness-[0.66] contrast-[1.08] saturate-[0.82]"
          />
          {/* Véu escuro abissal sobre a arte para tirar o excesso de saturação e integrar ao fundo preto */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-zinc-950/30 bg-[radial-gradient(circle_at_62%_52%,transparent_25%,rgba(9,9,11,0.68)_100%)] pointer-events-none"
          />
        </div>

        {/* Camada 2: Efeitos de Luz Holográfica Viva e Bolhas Bioluminescentes */}
        <div
          ref={glowLayerRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          {/* Pulso luminoso sobre os monitores verdes do Tubarão */}
          <div className="hidden lg:block grotto-screen-pulse absolute top-[34%] left-[48%] w-[26%] h-[42%] rounded-full bg-emerald-400/18 blur-[64px] opacity-35 mix-blend-screen" />

          {/* Pulso luminoso sobre o ícone do Pix */}
          <div className="hidden lg:block grotto-screen-pulse absolute bottom-[12%] left-[52%] w-[16%] h-[24%] rounded-full bg-emerald-300/20 blur-[48px] opacity-30 mix-blend-screen" />

          {/* Pulso quente no celular do peixe-palhaço */}
          <div className="hidden lg:block grotto-screen-pulse absolute bottom-[14%] left-[5%] w-[12%] h-[20%] rounded-full bg-amber-300/15 blur-[40px] opacity-30 mix-blend-screen" />

          {/* Bolhas bioluminescentes subindo por toda a extensão da gruta */}
          {BIOLUMINESCENT_BUBBLES.map((b, idx) => (
            <span
              key={idx}
              style={{ left: b.left, bottom: b.bottom }}
              className={`grotto-bubble absolute ${b.size} rounded-full border border-emerald-300/60 bg-emerald-400/25 shadow-[0_0_14px_rgba(52,211,153,0.75)]`}
            />
          ))}
        </div>

        {/* Camada 3: Fusão Mais Profunda no Topo e na Base para Conectar à Página Escura */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background via-background/70 to-transparent pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none"
        />

        {/* Camada 4: Texto Estático no Quadrante Superior Esquerdo Livre da Caverna */}
        <div className="hidden lg:block absolute inset-x-0 top-[8%] z-10">
          <div className="w-full mx-auto px-6 max-w-5xl md:max-w-7xl">
            <div className="max-w-[440px] xl:max-w-[480px] space-y-4">
              <h2 className="font-heading text-3xl xl:text-4xl font-bold tracking-tight text-white leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Eles sempre dizem &ldquo;amanhã eu pago&rdquo;. O Tubarão cobra
                hoje.
              </h2>

              <p className="text-xs xl:text-sm font-mono text-zinc-200 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Enquanto o devedor sua frio olhando o celular, você acompanha
                cada parcela nos monitores da Gruta até o Pix pingar na conta.
              </p>

              <div className="flex items-center gap-3 pt-1">
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

export function FinalClosingBanner() {
  return (
    <section className="relative w-full overflow-hidden border-b border-border/60 bg-gradient-to-b from-emerald-950/45 via-zinc-900/90 to-zinc-950 py-14 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.18),transparent_65%)] pointer-events-none"
      />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 max-w-3xl text-center space-y-5 sm:space-y-6">
        <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Tem dinheiro seu voando na praça agora?
        </h2>

        <p className="text-xs sm:text-base font-mono text-zinc-300 leading-relaxed max-w-2xl mx-auto">
          Junte-se aos Tubarões que aposentaram o caderninho de papel e hoje têm
          controle cirúrgico de cada centavo emprestado — sem pedir desculpas
          por cobrar o que é seu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            render={<Link href="/cadastrar" />}
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-12 px-7 text-sm shadow-lg cursor-pointer justify-center"
          >
            <span>Abrir Minha Gruta Grátis</span>
            <FaArrowRight className="size-3.5 ml-2" />
          </Button>

          <Button
            render={<Link href="/entrar" />}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-zinc-700 bg-zinc-950/75 hover:bg-zinc-900 text-zinc-100 font-mono text-xs sm:text-sm rounded-xl h-12 px-6 cursor-pointer justify-center"
          >
            Já Sou Tubarão (Entrar)
          </Button>
        </div>
      </div>
    </section>
  );
}
