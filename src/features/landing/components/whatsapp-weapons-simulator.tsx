"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FaWhatsapp, FaCopy, FaCheck, FaUser } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type WeaponLevel = 1 | 2 | 3;

interface DebtorPreset {
  id: string;
  name: string;
  relation: string;
  amount: string;
  lateDays: string;
}

const DEBTOR_PRESETS: DebtorPreset[] = [
  {
    id: "marcio",
    name: "Marcio",
    relation: "Cunhado",
    amount: "R$ 350,00",
    lateDays: "4",
  },
  {
    id: "ricardo",
    name: "Ricardo",
    relation: "Colega de Trabalho",
    amount: "R$ 620,00",
    lateDays: "18",
  },
];

const WEAPON_LEVELS: Record<
  WeaponLevel,
  {
    title: string;
    subtitle: string;
    dotClass: string;
    activeBorderClass: string;
    badgeClass: string;
    pressurePercent: number;
    barColorClass: string;
    buildMessage: (d: DebtorPreset) => string;
    signature: string;
  }
> = {
  1: {
    title: "Nível 1 — Lembrete Amistoso",
    subtitle: "Dia do Vencimento",
    dotClass: "bg-emerald-400",
    activeBorderClass: "border-emerald-500/50 bg-emerald-500/5",
    badgeClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    pressurePercent: 33,
    barColorClass: "bg-emerald-400",
    buildMessage: (d) =>
      `Fala ${d.name}, beleza? Passando só pra lembrar que aquela nossa parcela de ${d.amount} vence hoje. Segue a chave Pix: 123.456.789-00 (Tubarão - Nubank). Valeu!`,
    signature: "_(Notificação automática de vencimento • Sistema Caloteiro)_",
  },
  2: {
    title: "Nível 2 — Cutucada Ácida do Caloteiro",
    subtitle: "Atraso Leve (1 a 5 dias)",
    dotClass: "bg-amber-400",
    activeBorderClass: "border-amber-500/50 bg-amber-500/5",
    badgeClass: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    pressurePercent: 66,
    barColorClass: "bg-amber-400",
    buildMessage: (d) =>
      `E aí ${d.name}! O prazo da parcela de ${d.amount} venceu faz ${d.lateDays} dias e o Pix não pingou. Meu boleto não espera, meu parceiro! Manda aí: 123.456.789-00 (Tubarão).`,
    signature: "_(Disparo automático de cobrança • Sistema Caloteiro)_",
  },
  3: {
    title: "Nível 3 — Pressão Total / Modo Julius",
    subtitle: "Atraso Crítico (> 15 dias)",
    dotClass: "bg-rose-500",
    activeBorderClass: "border-rose-500/50 bg-rose-500/5",
    badgeClass: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    pressurePercent: 100,
    barColorClass: "bg-rose-500",
    buildMessage: (d) =>
      `Alerta vermelho, ${d.name}. Você sumiu há ${d.lateDays} dias com os ${d.amount} em aberto. Já posso ligar pra sua mãe ou você vai honrar essa dívida agora? Chave Pix: 123.456.789-00.`,
    signature: "_(Alerta crítico automático • Sistema Caloteiro)_",
  },
};

export function WhatsappWeaponsSimulator() {
  const [selectedLevel, setSelectedLevel] = React.useState<WeaponLevel>(1);
  const [selectedDebtorId, setSelectedDebtorId] =
    React.useState<string>("marcio");
  const [copiedDemo, setCopiedDemo] = React.useState(false);

  const sectionRef = React.useRef<HTMLElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const lastScrollLevelRef = React.useRef<WeaponLevel>(1);

  const currentDebtor =
    DEBTOR_PRESETS.find((d) => d.id === selectedDebtorId) || DEBTOR_PRESETS[0];
  const currentWeapon = WEAPON_LEVELS[selectedLevel];

  // Entrada da seção + progressão automática dos 3 níveis conforme o scroll
  useGSAP(
    () => {
      gsap.fromTo(
        ".wa-level-btn",
        { x: -45, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".wa-preview-window",
        { x: 45, opacity: 0, scale: 0.96 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Troca de nível guiada pelo progresso do scroll apenas quando a seção está no centro da tela
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 38%",
        end: "bottom 55%",
        onUpdate: (self) => {
          const p = self.progress;
          const nextLevel: WeaponLevel = p < 0.35 ? 1 : p < 0.7 ? 2 : 3;
          if (nextLevel !== lastScrollLevelRef.current) {
            lastScrollLevelRef.current = nextLevel;
            setSelectedLevel(nextLevel);
          }
        },
      });
    },
    { scope: sectionRef }
  );

  // Animação GSAP suave ao alternar nível ou presa + pulso nas tags dinâmicas
  useGSAP(
    () => {
      if (!previewRef.current) return;

      gsap.fromTo(
        previewRef.current,
        { y: 12, opacity: 0.35, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.38, ease: "power2.out" }
      );

      gsap.fromTo(
        ".wa-tag-pill",
        { scale: 1.16, y: -2 },
        {
          scale: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: "back.out(2)",
        }
      );
    },
    { dependencies: [selectedLevel, selectedDebtorId], scope: sectionRef }
  );

  const handleCopyPreview = () => {
    const fullText = `${currentWeapon.buildMessage(currentDebtor)}\n\n${
      currentWeapon.signature
    }`;
    navigator.clipboard.writeText(fullText);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="armas-whatsapp"
      className="py-16 sm:py-24 border-b border-border/60 space-y-8"
    >
      {/* Cabeçalho da Seção (Regra 7) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Três níveis de pressão. Zero vergonha de cobrar.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
            Role pela seção ou clique nos níveis abaixo. A mensagem já sai com
            sua Chave Pix interpolada e assinada como disparo automático para
            tirar o constrangimento das suas costas.
          </p>
        </div>

        {/* Seletor rápido de Presa de Exemplo */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {DEBTOR_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedDebtorId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedDebtorId(preset.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-zinc-950 font-bold border-white"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <FaUser className="size-3" />
                <span>
                  {preset.name} ({preset.relation})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid do Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Coluna Esquerda: Seleção dos 3 Níveis Reais */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {([1, 2, 3] as WeaponLevel[]).map((level) => {
            const item = WEAPON_LEVELS[level];
            const isActive = selectedLevel === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  lastScrollLevelRef.current = level;
                  setSelectedLevel(level);
                }}
                className={`wa-level-btn rounded-2xl border p-4 sm:p-5 text-left transition-all cursor-pointer space-y-2 ${
                  isActive
                    ? item.activeBorderClass
                    : "border-border bg-card hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2.5 rounded-full shrink-0 ${item.dotClass}`}
                    />
                    <span className="font-heading text-sm sm:text-base font-bold text-white">
                      {item.title}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${item.badgeClass}`}
                  >
                    {item.subtitle}
                  </span>
                </div>

                <p className="text-xs font-mono text-zinc-400 line-clamp-2">
                  {item.buildMessage(currentDebtor)}
                </p>
              </button>
            );
          })}
        </div>

        {/* Coluna Direita: Mockup Fiel do Disparo no WhatsApp */}
        <div className="wa-preview-window lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between gap-5">
            {/* Topo da Janela de Mensagem + Termômetro de Pressão */}
            <div className="space-y-3 pb-4 border-b border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FaWhatsapp className="size-5" />
                  </div>
                  <div>
                    <span className="font-heading text-sm sm:text-base font-bold text-white block">
                      Prévia da Mensagem Pronta para Disparo
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Para: {currentDebtor.name} ({currentDebtor.relation}) •
                      Parcela de {currentDebtor.amount}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${currentWeapon.badgeClass}`}
                >
                  Pressão: {currentWeapon.pressurePercent}%
                </span>
              </div>

              {/* Barra Visual de Intensidade */}
              <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${currentWeapon.barColorClass}`}
                  style={{ width: `${currentWeapon.pressurePercent}%` }}
                />
              </div>
            </div>

            {/* Balão Realista da Mensagem */}
            <div
              ref={previewRef}
              className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-4 sm:p-5 space-y-3"
            >
              <p className="text-xs sm:text-sm font-mono text-zinc-100 leading-relaxed">
                {currentWeapon.buildMessage(currentDebtor)}
              </p>

              <p className="text-xs font-mono text-emerald-400/90 italic pt-2 border-t border-zinc-800/80">
                {currentWeapon.signature.replace(/^_|_$/g, "")}
              </p>
            </div>

            {/* Rodapé Explicativo das Variáveis + Botão Copiar Teste */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <span>Tags injetadas:</span>
                <code className="wa-tag-pill inline-block px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                  {"{nome}"}
                </code>
                <code className="wa-tag-pill inline-block px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                  {"{valor}"}
                </code>
                <code className="wa-tag-pill inline-block px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                  {"{dias_atraso}"}
                </code>
                <code className="wa-tag-pill inline-block px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                  {"{chave_pix}"}
                </code>
              </div>

              <Button
                type="button"
                onClick={handleCopyPreview}
                size="sm"
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-9 px-4 cursor-pointer shrink-0"
              >
                {copiedDemo ? (
                  <>
                    <FaCheck className="size-3 mr-1.5 text-emerald-600" />
                    <span>Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="size-3 mr-1.5" />
                    <span>Copiar Exemplo</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
