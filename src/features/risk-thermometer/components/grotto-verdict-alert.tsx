"use client";

import * as React from "react";
import type { GrottoThermometerData } from "@/commons/models/risk-score";
import { Button } from "@/components/ui/button";
import {
  FaTrophy,
  FaTriangleExclamation,
  FaBiohazard,
  FaCompass,
  FaRotateRight,
} from "react-icons/fa6";

const ELITE_VERDICTS = [
  "Você anda ameaçando as suas presas por aí, meu Tubarão? Todo mundo pagando em dia... parece até suspeito. Confere se não te pagaram com nota falsa de três reais.",
  "Sua gruta tá mais pontual que a Suíça. Ou você tem um dom sobrenatural para escolher amigos, ou você tem fotos comprometedoras de cada um deles.",
  "Cardume exemplar! Ninguém atrasou, ninguém inventou velório de periquito e o Pix caiu sem chiar. Aproveite esse momento raro antes que o próximo parente apareça pedindo R$ 500.",
  "Todo mundo em dia? Nem parece Brasil. O Tio Patinhas olharia para essa sua carteira e derramaria uma lágrima de orgulho no cofre.",
  "Nível de calote: ZERO. Você não é apenas um Tubarão, você é o terror psicológico dos devedores. Continue farejando e não baixe a guarda!",
  "Inacreditável: suas presas têm vergonha na cara! Guarde esse momento num quadro, porque achar devedor que honra a data combinada é mais difícil que achar político honesto.",
  "Score lá no alto e dinheiro na mão. Se continuar nesse ritmo, você vai poder abrir seu próprio banco... só não esqueça de continuar cobrando juros.",
];

const AVERAGE_VERDICTS = [
  "Sua gruta tá naquele famoso 'devo, não nego, pago quando me der na telha'. Metade paga certinho e a outra metade finge que o WhatsApp não tem internet.",
  "Tubarão que dorme vira sopa de barbatana! Suas presas não são caloteiras profissionais ainda, mas já aprenderam a arte de enrolar 3 dias úteis.",
  "Você tá sendo muito bonzinho com esse cardume ensaboado. Se continuar aceitando áudio de 5 minutos explicando 'o imprevisto', mês que vem você tá na Zona de Calote.",
  "Nem herói, nem agiota falido: sua carteira tá no meio do caminho. Hora de engatilhar o WhatsApp e mandar aquele lembrete antes que o devedor gaste seu Pix no boteco.",
  "Tem presa aí ensaiando o golpe. Começa atrasando um dia, depois uma semana, e quando você vê ela tá postando foto na praia e te devendo parcela.",
  "Águas mornas não criam tubarão temido! Dê uma mordida de aviso nessa galera do meio da tabela para eles lembrarem quem manda na gruta.",
  "Seu score médio tá num empate técnico entre a decência e a cara de pau. Pressione um pouquinho mais para não virar financiador de open bar alheio.",
];

const DEFAULTER_VERDICTS = [
  "Tubarão, o problema é que você é frouxo, por isso ninguém te paga! Reveja seus conceitos antes que você vire patrocinador oficial do churrasco dos seus devedores.",
  "ALERTA VERMELHO: sua gruta parece um abrigo de caridade! Você tem {riskExposure} na pista com alto risco de virar lenda urbana. Acorda pra vida!",
  "Prevejo um calote homérico de {riskExposure} se você não puxar o freio agora. Para de emprestar dinheiro pra quem tem score menor que a temperatura ambiente!",
  "Seus devedores não têm medo de você, Tubarão. Eles olham sua mensagem de cobrança e dão risada enquanto pedem outra rodada de chopp no seu dinheiro.",
  "Parabéns, você não é um predador dos mares, você é uma ONG de caloteiros! Mais da metade da sua base tá na zona de golpe. Hora de colocar o Modo Tio Patinhas no máximo!",
  "Nesse ritmo, o próximo a pedir empréstimo vai ser você para conseguir pagar o almoço de domingo. Mostre os dentes ou mude o nome da gruta para Asilo dos Caloteiros.",
  "Você tem {defaulterCount} caloteiros na gruta achando que o que pegaram emprestado foi doação a fundo perdido. Puxe o extrato e exija o Pix hoje mesmo!",
  "A cara de pau do seu cardume já passou do limite do Código Penal. Ou você começa a cobrar com juros e ultimato, ou pode dar adeus a esses {riskExposure}.",
];

const EMPTY_VERDICTS = [
  "Nenhuma presa no tanque ainda. Ou você finalmente aprendeu a dizer 'não' pros seus amigos, ou seu cofre tá mais vazio que deserto.",
  "Gruta limpa e sem estresse. Se alguém te mandar mensagem pedindo dinheiro hoje, lembre-se da paz dessa tela e bloqueie imediatamente.",
  "Zero presas cadastradas. Tubarão que não caça passa fome, mas pelo menos não toma calote de cunhado. Cadastre seu primeiro devedor quando tiver coragem.",
  "Paz absoluta nas águas. Aproveite o silêncio antes de emprestar para aquele colega que jura que te devolve 'na próxima terça sem falta'.",
  "Nenhum caloteiro para monitorar. O Tio Patinhas aprova a prudência, mas o mar tá aberto para rastrear suas promessas.",
];

interface GrottoVerdictAlertProps {
  data: GrottoThermometerData;
}

export function GrottoVerdictAlert({ data }: GrottoVerdictAlertProps) {
  const { totalDebtors, overallScore, formattedRiskExposure, defaulterCount, eliteCount } = data;

  const category = React.useMemo(() => {
    if (totalDebtors === 0) return "empty";
    if (overallScore >= 70) return "elite";
    if (overallScore >= 50) return "average";
    return "defaulter";
  }, [totalDebtors, overallScore]);

  const pool = React.useMemo(() => {
    switch (category) {
      case "elite":
        return ELITE_VERDICTS;
      case "average":
        return AVERAGE_VERDICTS;
      case "defaulter":
        return DEFAULTER_VERDICTS;
      default:
        return EMPTY_VERDICTS;
    }
  }, [category]);

  const [quoteOffset, setQuoteOffset] = React.useState(0);

  const handleNextQuote = () => {
    setQuoteOffset((prev) => prev + 1);
  };

  const safeIndex =
    pool.length > 0
      ? Math.abs(overallScore + totalDebtors + quoteOffset) % pool.length
      : 0;
  const rawQuote = pool[safeIndex] ?? pool[0] ?? "";

  const interpolatedQuote = React.useMemo(() => {
    return rawQuote
      .replace("{riskExposure}", formattedRiskExposure || "R$ 0,00")
      .replace(
        "{defaulterCount}",
        `${defaulterCount} ${defaulterCount === 1 ? "presa" : "presas"}`
      )
      .replace(
        "{eliteCount}",
        `${eliteCount} ${eliteCount === 1 ? "presa" : "presas"}`
      );
  }, [rawQuote, formattedRiskExposure, defaulterCount, eliteCount]);

  const config = React.useMemo(() => {
    switch (category) {
      case "elite":
        return {
          containerClass: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
          badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          iconContainer: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
          icon: <FaTrophy className="size-4" />,
          title: "Veredito da Gruta: Cardume de Elite",
        };
      case "average":
        return {
          containerClass: "border-amber-500/30 bg-amber-950/20 text-amber-300",
          badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          iconContainer: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          icon: <FaTriangleExclamation className="size-4" />,
          title: "Veredito da Gruta: Águas Mornas",
        };
      case "defaulter":
        return {
          containerClass: "border-rose-500/35 bg-rose-950/25 text-rose-300",
          badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/30",
          iconContainer: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
          icon: <FaBiohazard className="size-4" />,
          title: "Veredito da Gruta: Cardume Tóxico",
        };
      default:
        return {
          containerClass: "border-zinc-800 bg-zinc-950/60 text-zinc-300",
          badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
          iconContainer: "bg-zinc-900 text-zinc-400 border border-zinc-800",
          icon: <FaCompass className="size-4" />,
          title: "Veredito da Gruta: Oceano Tranquilo",
        };
    }
  }, [category]);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all ${config.containerClass}`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${config.iconContainer}`}>
          {config.icon}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border whitespace-nowrap ${config.badgeClass}`}
            >
              {config.title}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] font-mono text-zinc-200 leading-relaxed italic">
            &ldquo;{interpolatedQuote}&rdquo;
          </p>
        </div>
      </div>

      <div className="shrink-0 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/40">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextQuote}
          className="w-full sm:w-auto h-8 px-2.5 text-[11px] font-mono font-bold bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-xl cursor-pointer touch-manipulation justify-center"
          title="Ver outra mensagem ácida"
        >
          <FaRotateRight className="size-3 mr-1.5 text-zinc-400" />
          <span>Outro veredito</span>
        </Button>
      </div>
    </div>
  );
}

