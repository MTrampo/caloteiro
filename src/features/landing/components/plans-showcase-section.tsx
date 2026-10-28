"use client";

import * as React from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { SharkBehaviorBox } from "@/features/subscription/components/shark-behavior-box";
import { ResponsiveCardsCarousel } from "@/components/cards/responsive-cards-carousel";
import tlSvg from "@/commons/assets/svgs/tl.svg";
import tbSvg from "@/commons/assets/svgs/tb.svg";
import tccSvg from "@/commons/assets/svgs/tcc.svg";
import { FaArrowRight, FaCheck, FaXmark } from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface SharkSpeciesStep {
  stepIndex: number;
  id: string;
  slug: "tubarao-lixa" | "tubarao-branco" | "tubarao-cabeca-chato";
  shortCode: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  svg: StaticImageData;
  whoItServesHeadline: string;
  whoItServesProfile: string;
  sharkBehaviorText: string;
  typicalScenarios: string[];
  buttonLabel: string;
  isFeatured?: boolean;
  features: { label: string; included: boolean }[];
}

const SHARK_SPECIES_STEPS: SharkSpeciesStep[] = [
  {
    stepIndex: 0,
    id: "tl",
    slug: "tubarao-lixa",
    shortCode: "TL",
    name: "Tubarão Lixa",
    badge: "Grátis • Nível 1",
    price: "R$ 0,00",
    period: "grátis para sempre",
    svg: tlSvg,
    whoItServesHeadline:
      "Para quem ainda acha que parente ou amigo paga no prazo combinado.",
    whoItServesProfile:
      "Você tem coração mole, emprestou um dinheiro para 'salvar um imprevisto' no almoço de família e agora precisa tirar essa dívida do bloco de notas do celular sem gastar um centavo.",
    sharkBehaviorText:
      "Tubarão-lixa: Passa o dia deitado na areia esperando o devedor ter bom senso.",
    typicalScenarios: [
      "Emprestou R$ 300 pro cunhado consertar a moto e ele jurou pagar 'no quinto dia útil sem falta'.",
      "Pagou a conta do churrasco ou ingresso no seu cartão e tem até 2 amigos fingindo amnésia seletiva.",
      "Anotou num guardanapo quanto já te pagaram e perdeu a conta de quanto ainda falta receber.",
      "Fica sem graça de cobrar no domingo à noite e quer mandar um lembrete assinado pelo sistema.",
      "Quer testar a Gruta de graça para até 2 presas marcadas sem cadastrar cartão de crédito.",
    ],
    buttonLabel: "Continuar Manso",
    isFeatured: false,
    features: [
      { label: "Até 2 presas marcadas na gruta", included: true },
      { label: "Até 2 dívidas ativas simultâneas", included: true },
      { label: "Parcelamento em até 12x", included: true },
      { label: "2 modalidades (Sem Juros e % Total)", included: true },
      { label: "3 níveis de mensagens prontas no WhatsApp", included: true },
      { label: "Taxa Fixa em R$ e Templates Editáveis", included: false },
      { label: "Link da Dívida e Cofre de Comprovantes Pix", included: false },
    ],
  },
  {
    stepIndex: 1,
    id: "tb",
    slug: "tubarao-branco",
    shortCode: "TB",
    name: "Tubarão Branco",
    badge: "Mais Popular • Nível 2",
    price: "R$ 29,90",
    period: "por mês",
    svg: tbSvg,
    whoItServesHeadline:
      "Para quem cansou de tomar golpe e quer arrancar até os fiapos do bolso.",
    whoItServesProfile:
      "Você empresta dinheiro com frequência, vende produtos fiado ou presta serviços parcelados. Já entendeu que conversa bonita não paga boleto e precisa de controle profissional.",
    sharkBehaviorText:
      "Tubarão-branco: Fica na espreita só esperando o prazo bater na trave para subir com o bote no WhatsApp.",
    typicalScenarios: [
      "Tem até 10 presas marcadas rodando ao mesmo tempo e não pode deixar nenhum vencimento passar batido.",
      "Quer cobrar Taxa Fixa em Reais (R$) ou deixar sua taxa padrão já engatilhada para novas dívidas.",
      "Cansou de ouvir 'me manda sua chave Pix de novo' e quer enviar o Link Externo da Dívida pronto.",
      "Quer personalizar com as próprias palavras os 3 níveis de mensagens ácidas do WhatsApp.",
      "Faz questão de anexar o print do comprovante Pix em cada parcela para acabar com discussões.",
    ],
    buttonLabel: "Dar o Bote",
    isFeatured: true,
    features: [
      { label: "Até 10 presas marcadas na gruta", included: true },
      { label: "Até 10 dívidas ativas simultâneas", included: true },
      { label: "Parcelamento estendido em até 36x", included: true },
      { label: "3 modalidades (+ Taxa Fixa em Reais R$)", included: true },
      { label: "Edição livre dos 3 templates de WhatsApp", included: true },
      { label: "Painel Financeiro Consolidado liberado", included: true },
      { label: "Link da Dívida + Cofre de Comprovantes Pix", included: true },
    ],
  },
  {
    stepIndex: 2,
    id: "tcc",
    slug: "tubarao-cabeca-chato",
    shortCode: "TCC",
    name: "Tubarão Cabeça Chata",
    badge: "Sem Limites • Nível 3",
    price: "R$ 49,90",
    period: "por mês",
    svg: tccSvg,
    whoItServesHeadline:
      "Para quem não quer apenas o Pix de volta: quer tirar a paz de quem fingiu demência e vai buscar o dinheiro nem que precise cavar a terra.",
    whoItServesProfile:
      "O topo da cadeia alimentar. Para quem movimenta dezenas de cobranças na praça e exige uma gruta sem qualquer trava de quantidade de devedores ou contratos ativos.",
    sharkBehaviorText:
      "Tubarão-cabeça-chata: O predador mais agressivo do mar — sobe até rio de água doce para caçar quem sumiu.",
    typicalScenarios: [
      "Tem mais de 10 caloteiros ou clientes na rua e precisa de capacidade ILIMITADA na sua gruta.",
      "Fecha acordos longos parcelados em até 120x e monitora o risco de quebra mês a mês.",
      "Precisa do Painel Financeiro Consolidado para cruzar tudo que está em aberto vs. recuperado no ano.",
      "Mantém um arquivo completo de comprovantes Pix de todas as parcelas sem limite de contratos.",
      "Quer acesso prioritário e imediato a todas as próximas armas pesadas do ecossistema Caloteiro.",
    ],
    buttonLabel: "Cavar a Terra",
    isFeatured: false,
    features: [
      { label: "Presas marcadas ILIMITADAS na gruta", included: true },
      { label: "Dívidas ativas ILIMITADAS simultâneas", included: true },
      { label: "Parcelamento máximo em até 120x", included: true },
      { label: "Todas as modalidades de juros e taxas", included: true },
      { label: "Edição livre dos 3 templates de WhatsApp", included: true },
      { label: "Painel Financeiro Consolidado completo", included: true },
      { label: "Link da Dívida + Cofre de Comprovantes Pix", included: true },
    ],
  },
];

const STEP_NAVS = [
  { index: 0, code: "01 • TL", label: "Tubarão Lixa" },
  { index: 1, code: "02 • TB", label: "Tubarão Branco" },
  { index: 2, code: "03 • TCC", label: "Tubarão Cabeça Chata" },
  { index: 3, code: "04 • FINAL", label: "Comparativo de Planos" },
];

export function PlansShowcaseSection() {
  const sectionWrapperRef = React.useRef<HTMLElement>(null);
  const pinBlockRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const activeStepRef = React.useRef<number>(0);

  // Animação suave sempre que muda o step ativo (0 -> 1 -> 2 -> 3)
  React.useEffect(() => {
    if (!stageRef.current) return;
    gsap.fromTo(
      stageRef.current,
      { y: 18, opacity: 0, scale: 0.985 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, [activeStep]);

  // GSAP ScrollTrigger com Pin travado na altura exata abaixo do Header Sticky (top 72px)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: pinBlockRef.current,
          start: "top 72px",
          end: "+=280%",
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => {
            const progress = self.progress;
            const nextStep =
              progress < 0.25
                ? 0
                : progress < 0.5
                ? 1
                : progress < 0.75
                ? 2
                : 3;

            if (nextStep !== activeStepRef.current) {
              activeStepRef.current = nextStep;
              setActiveStep(nextStep);
            }
          },
        });
      });

      return () => mm.revert();
    },
    { scope: sectionWrapperRef }
  );

  const handleManualStepSelect = (index: number) => {
    activeStepRef.current = index;
    setActiveStep(index);
  };

  const currentShark =
    activeStep < 3 ? SHARK_SPECIES_STEPS[activeStep] : null;

  return (
    <section
      ref={sectionWrapperRef}
      id="planos"
      className="w-full py-12 sm:py-20 border-b border-border/60 bg-background"
    >
      <div
        ref={pinBlockRef}
        className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-5"
      >
        {/* Cabeçalho da Seção (Regra 7: Sem ícones no h2, sem pílula acima do título) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Qual espécie de Tubarão representa a sua fome de receber?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
              Role a página (ou toque nas etapas abaixo) para descobrir para
              quem serve cada tubarão antes de escolher o seu plano.
            </p>
          </div>

          <Link
            href="/documentos/planos"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors self-start lg:self-auto"
          >
            <span>Ver matriz completa de regras</span>
            <FaArrowRight className="size-3" />
          </Link>
        </div>

        {/* Barra de Stepper (4 Passos: TL -> TB -> TCC -> Comparativo) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {STEP_NAVS.map((item) => {
            const isActive = activeStep === item.index;
            const isCompleted = activeStep > item.index;

            return (
              <button
                key={item.index}
                type="button"
                onClick={() => handleManualStepSelect(item.index)}
                className={`text-left rounded-xl border p-2.5 sm:p-3 transition-all cursor-pointer ${
                  isActive
                    ? "border-emerald-500/50 bg-emerald-500/10 text-white shadow-xs"
                    : isCompleted
                    ? "border-zinc-700 bg-zinc-900/70 text-zinc-200"
                    : "border-border bg-card/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider">
                  <span
                    className={
                      isActive
                        ? "text-emerald-400 font-bold"
                        : isCompleted
                        ? "text-zinc-300"
                        : "text-zinc-500"
                    }
                  >
                    {item.code}
                  </span>
                  <span
                    className={`size-2 rounded-full ${
                      isActive
                        ? "bg-emerald-400 animate-pulse"
                        : isCompleted
                        ? "bg-emerald-500/60"
                        : "bg-zinc-700"
                    }`}
                  />
                </div>
                <p className="font-heading text-xs sm:text-sm font-bold mt-1 truncate">
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Palco Principal com Altura Padronizada no Desktop e Fluida no Mobile */}
        <div
          ref={stageRef}
          className="w-full lg:min-h-[510px] flex flex-col justify-center"
        >
          {currentShark ? (
            /* STEPS 1, 2 e 3: Foco Total em "Para Quem Serve" (Sem repetir SharkBehaviorBox) */
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 lg:p-9 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center shadow-xl lg:min-h-[510px]">
              {/* Coluna Esquerda (5 cols): Ilustração Oficial do Tubarão (tl.svg, tb.svg, tcc.svg) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                <div
                  aria-hidden="true"
                  className={`absolute inset-6 rounded-full blur-3xl pointer-events-none ${
                    currentShark.slug === "tubarao-lixa"
                      ? "bg-sky-500/10"
                      : currentShark.slug === "tubarao-branco"
                      ? "bg-emerald-500/15"
                      : "bg-rose-500/15"
                  }`}
                />

                <div className="relative w-full max-w-[180px] sm:max-w-[260px] lg:max-w-[330px] mx-auto select-none">
                  <Image
                    src={currentShark.svg}
                    alt={`Ilustração ${currentShark.name}`}
                    unoptimized
                    className="w-full h-auto max-h-[180px] sm:max-h-[260px] lg:max-h-[320px] object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)]"
                  />
                </div>
              </div>

              {/* Coluna Direita (7 cols): Destaque Exclusivo em "Para Quem Serve" com 5 Sinais Clássicos */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                      {currentShark.name}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      {currentShark.badge} •{" "}
                      <strong className="text-white">
                        {currentShark.price}
                      </strong>{" "}
                      ({currentShark.period})
                    </p>
                  </div>
                </div>

                {/* Bloco Principal: Para Quem Serve Este Plano (Expandido e Sem Repetição) */}
                <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 sm:p-5 space-y-3 sm:space-y-3.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                    Para quem serve o {currentShark.name}?
                  </span>

                  <p className="font-heading text-base sm:text-xl font-bold text-white leading-snug">
                    &ldquo;{currentShark.whoItServesHeadline}&rdquo;
                  </p>

                  <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                    {currentShark.whoItServesProfile}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-200">
                    {currentShark.typicalScenarios.map((scenario, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{scenario}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações do Step */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
                  <Button
                    render={<Link href="/cadastrar" />}
                    size="lg"
                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-11 px-6 text-xs sm:text-sm cursor-pointer justify-center"
                  >
                    <span>
                      {currentShark.buttonLabel} ({currentShark.name})
                    </span>
                    <FaArrowRight className="size-3.5 ml-2" />
                  </Button>

                  <button
                    type="button"
                    onClick={() =>
                      handleManualStepSelect(currentShark.stepIndex + 1)
                    }
                    className="text-xs font-mono font-bold text-zinc-300 hover:text-white bg-zinc-900/80 sm:bg-transparent border border-zinc-800 sm:border-0 rounded-xl px-4 py-2.5 sm:p-2 transition-colors cursor-pointer text-center"
                  >
                    {currentShark.stepIndex < 2
                      ? "Próxima espécie de Tubarão ➔"
                      : "Ver comparativo dos 3 planos ➔"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 4: Cards Comparativos dos 3 Planos com ResponsiveCardsCarousel no Mobile/Tablet e Grid 3 Colunas no Desktop */
            <ResponsiveCardsCarousel desktopColumns={3} tabletColumns={2}>
              {SHARK_SPECIES_STEPS.map((plan) => (
                <div
                  key={plan.id}
                  className={`h-full rounded-2xl border p-4 sm:p-6 flex flex-col justify-between gap-4 ${
                    plan.isFeatured
                      ? "border-emerald-500/50 bg-card ring-1 ring-emerald-500/20 shadow-lg"
                      : "border-border bg-card shadow-xs"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Cabeçalho do Card com Miniatura do SVG do Tubarão */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 rounded-xl bg-zinc-950 border border-zinc-800 p-1.5 flex items-center justify-center shrink-0">
                          <Image
                            src={plan.svg}
                            alt={plan.name}
                            unoptimized
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading text-lg font-bold text-white truncate">
                            {plan.name}
                          </h3>
                          <p className="text-[11px] font-mono text-zinc-400">
                            {plan.badge}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="flex items-baseline gap-1.5 pb-2.5 border-b border-zinc-800/80">
                      <span className="font-heading text-2xl sm:text-3xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        / {plan.period}
                      </span>
                    </div>

                    {/* Comportamento da Espécie (Exclusivo no Comparativo para não repetir) */}
                    <SharkBehaviorBox
                      slug={plan.slug}
                      sharkText={plan.sharkBehaviorText}
                    />

                    {/* Lista Comparativa de Recursos */}
                    <div className="space-y-1.5 pt-1 text-xs font-mono">
                      {plan.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 ${
                            feat.included ? "text-zinc-200" : "text-zinc-500"
                          }`}
                        >
                          {feat.included ? (
                            <FaCheck className="size-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <FaXmark className="size-3.5 text-zinc-600 shrink-0" />
                          )}
                          <span>{feat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Ação com o Texto Original do Plano */}
                  <div className="pt-2">
                    <Button
                      render={<Link href="/cadastrar" />}
                      size="lg"
                      className={
                        plan.isFeatured
                          ? "w-full bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl h-11 cursor-pointer justify-center"
                          : "w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-heading font-bold rounded-xl h-11 cursor-pointer justify-center"
                      }
                    >
                      <span>{plan.buttonLabel}</span>
                      <FaArrowRight className="size-3.5 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </ResponsiveCardsCarousel>
          )}
        </div>
      </div>
    </section>
  );
}
