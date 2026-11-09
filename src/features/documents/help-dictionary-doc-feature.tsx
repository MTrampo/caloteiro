"use client";

import * as React from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaBookOpen,
  FaCompass,
  FaHandHoldingDollar,
  FaWhatsapp,
  FaGaugeHigh,
  FaShieldHalved,
  FaCommentDots,
  FaFileInvoiceDollar,
  FaCrown,
  FaCheck,
  FaXmark,
  FaUserPlus,
  FaCalculator,
} from "react-icons/fa6";

interface DictionaryTermItem {
  term: string;
  meaning: string;
  description: string;
  badgeText: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const DICTIONARY_TERMS: DictionaryTermItem[] = [
  {
    term: "Tubarão",
    meaning: "Você (O Credor / Dono da Conta)",
    description:
      "É quem tem valores a receber e utiliza o sistema para manter controle cirúrgico do próprio dinheiro, sem pedir desculpas por cobrar o que é legitimamente seu.",
    badgeText: "Identidade Principal",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    icon: FaCrown,
    iconColor: "text-emerald-400",
  },
  {
    term: "A Gruta",
    meaning: "Seu Painel Financeiro Privado",
    description:
      "O território exclusivo onde você centraliza suas Presas, acompanha suas Mordidas, monitora vencimentos e visualiza quanto dinheiro está na rua e quanto já voltou.",
    badgeText: "Painel de Controle",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/25",
    icon: FaCompass,
    iconColor: "text-sky-400",
  },
  {
    term: "Presa",
    meaning: "O Devedor Cadastrado",
    description:
      "A pessoa registrada na sua Gruta que possui valores pendentes com você. Cada Presa tem seu histórico próprio de acordos, pagamentos e comportamento.",
    badgeText: "Cadastro de Devedor",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    icon: FaUserPlus,
    iconColor: "text-amber-400",
  },
  {
    term: "Mordida",
    meaning: "A Dívida ou Acordo Registrado",
    description:
      "Qualquer valor a receber lançado no sistema — seja de um cartão emprestado, boleto pago, venda, serviço, rateio ou dinheiro — com parcelas, vencimentos e modalidade de juros definidos.",
    badgeText: "Registro de Dívida",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    icon: FaCalculator,
    iconColor: "text-rose-400",
  },
  {
    term: "Dinheiro na Pista (ou Voando)",
    meaning: "Saldo Total em Aberto",
    description:
      "O montante total que ainda está na rua aguardando pagamento, somando todas as parcelas abertas e eventuais acréscimos acordados.",
    badgeText: "Indicador Financeiro",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    icon: FaHandHoldingDollar,
    iconColor: "text-emerald-400",
  },
  {
    term: "Pingou o Pix? (Baixar Parcela)",
    meaning: "Registro de Pagamento Recebido",
    description:
      "Ação de dar baixa quando a Presa paga (seja via Pix, transferência, dinheiro em mãos, cartão ou boleto). Aceita pagamento total ou parcial com amortização automática em cascata.",
    badgeText: "Baixa Financeira",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    icon: FaCheck,
    iconColor: "text-emerald-400",
  },
  {
    term: "Caô / Mural de Caôs",
    meaning: "Histórico de Desculpas e Promessas",
    description:
      "Linha do tempo onde você anota cada justificativa da Presa ('sexta eu pago sem falta') junto com a nova data prometida, deixando gravado se ela honrou ou furou a palavra.",
    badgeText: "Memória da Parcela",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    icon: FaCommentDots,
    iconColor: "text-amber-400",
  },
  {
    term: "Cofre de Comprovantes (Arquivo de Provas)",
    meaning: "Guarda Permanente de Recibos",
    description:
      "Espaço para anexar imagens de comprovantes, recibos ou prints tanto do acordo inicial quanto de cada parcela liquidada, acabando com a conversa de 'já te paguei mês passado'.",
    badgeText: "Tubarão Branco+",
    badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/25",
    icon: FaShieldHalved,
    iconColor: "text-sky-400",
  },
  {
    term: "Investidas no WhatsApp",
    meaning: "Mensagens de Cobrança em 3 Níveis",
    description:
      "Gerador de mensagens prontas com saldo e chave de pagamento que abre o seu próprio WhatsApp em 1 clique: Nível 1 (Lembrete Amistoso), Nível 2 (Cutucada Firme) e Nível 3 (Modo Tio Patinhas).",
    badgeText: "Cobrança em 1 Clique",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    icon: FaWhatsapp,
    iconColor: "text-emerald-400",
  },
  {
    term: "Link da Dívida (Fatura Externa)",
    meaning: "Extrato Protegido por PIN",
    description:
      "Página externa privada e protegida por código de 4 dígitos para você enviar à Presa. Ela consulta o cronograma de parcelas atualizado e copia os dados de pagamento sem precisar instalar nada.",
    badgeText: "Tubarão Branco+",
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/25",
    icon: FaFileInvoiceDollar,
    iconColor: "text-purple-400",
  },
  {
    term: "Faro do Tubarão (0 a 100 pts)",
    meaning: "Pontuação Comportamental da Presa",
    description:
      "Nota individual calculada automaticamente para cada Presa. Toda Presa começa com 50 pontos (Peixe Ensaboado): pagamentos em dia sobem a nota (Cicatrização) e atrasos ou caôs derrubam a nota (Sangramento).",
    badgeText: "Exclusivo Cabeça Chato",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    icon: FaGaugeHigh,
    iconColor: "text-emerald-400",
  },
  {
    term: "Termômetro da Gruta",
    meaning: "Diagnóstico Geral da Sua Carteira",
    description:
      "Diferente do Faro individual de uma Presa, o Termômetro analisa toda a sua Gruta de uma só vez, separando suas Presas entre Elite, Na Média e Zona de Calote para revelar o risco global do seu dinheiro.",
    badgeText: "Exclusivo Cabeça Chato",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    icon: FaGaugeHigh,
    iconColor: "text-rose-400",
  },
];

const QUICK_STEPS = [
  {
    step: "01",
    title: "Cadastre a Presa",
    description:
      "Registre o nome, WhatsApp e vínculo de quem te deve. Os dados sensíveis ficam protegidos com criptografia na sua Gruta.",
  },
  {
    step: "02",
    title: "Registre a Mordida (Dívida)",
    description:
      "Informe o valor, a quantidade de parcelas, a modalidade de juros (sem juros, % no total, taxa fixa em R$ ou % ao mês) e o primeiro vencimento.",
  },
  {
    step: "03",
    title: "Dê a Investida no WhatsApp ou Anote o Caô",
    description:
      "Chegou o vencimento? Envie o lembrete pronto em 1 clique pelo seu WhatsApp ou compartilhe o Link da Dívida com PIN. Se inventarem desculpa, clique em 'Anotar Caô'.",
  },
  {
    step: "04",
    title: "Baixe a Parcela ('Pingou o Pix?')",
    description:
      "Recebeu o pagamento? Dê baixa na parcela em segundos, anexe o comprovante no cofre e deixe o sistema atualizar todos os saldos automaticamente.",
  },
];

const SPREADSHEET_COMPARISON = [
  {
    criterion: "Cálculo de Juros e Parcelas",
    spreadsheet:
      "Fórmulas manuais no Excel que quebram facilmente no celular e exigem recalcular tudo quando o devedor paga um valor quebrado.",
    caloteiro:
      "Motor financeiro automático (sem juros, % no total, taxa fixa em R$ ou juros ao mês % a.m.) com amortização automática em cascata.",
  },
  {
    criterion: "Comprovantes de Empréstimo e Pix",
    spreadsheet:
      "Prints de transferência perdidos no rolo da câmera do celular, impossíveis de achar meses depois quando o devedor diz que já pagou.",
    caloteiro:
      "Cofre de Comprovantes vinculado diretamente ao acordo inicial e a cada parcela paga, pronto para conferência em 1 toque.",
  },
  {
    criterion: "Mensagens de Cobrança no WhatsApp",
    spreadsheet:
      "Abrir a planilha, somar quanto falta de cabeça, abrir o WhatsApp, procurar o contato e digitar a mensagem do zero toda vez.",
    caloteiro:
      "Investidas em 1 clique com 3 níveis de pressão: o texto já sai pronto com valor atualizado, sua chave Pix e o Link da Dívida.",
  },
  {
    criterion: "Histórico de Promessas e Risco",
    spreadsheet:
      "Anotações soltas que não mostram quantas vezes a pessoa já furou o prazo nem qual o risco real de tomar novo calote.",
    caloteiro:
      "Mural de Caôs carimbado com data e hora + Faro do Tubarão (0 a 100 pts) que calcula automaticamente a confiabilidade de cada Presa.",
  },
];

const INTEREST_MODALITIES_GUIDE = [
  {
    title: "1. Sem Juros (Modo Camarada)",
    badge: "Tubarão Lixa+",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    description:
      "Divide apenas o valor principal emprestado ou combinado pelo número de parcelas, sem acréscimos. Ideal para quando você só quer garantir que cada centavo volte no prazo.",
  },
  {
    title: "2. Percentual sobre o Total (%)",
    badge: "Tubarão Lixa+",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    description:
      "Aplica uma porcentagem única sobre o valor total (ex: emprestou R$ 1.000 com +20% = R$ 1.200) e divide igualmente entre as parcelas do acordo.",
  },
  {
    title: "3. Taxa Fixa em Reais (R$)",
    badge: "Tubarão Branco+",
    badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/25",
    description:
      "Adiciona um valor fechado em Reais ao acordo (ex: emprestou R$ 500 com retorno combinado de +R$ 100 = R$ 600), sem precisar calcular porcentagens.",
  },
  {
    title: "4. Juros ao Mês (% a.m.)",
    badge: "Cabeça Chato",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    description:
      "Calcula a rentabilidade mensal proporcional ao prazo de parcelamento escolhido (até 120x), garantindo exatidão de centavos em acordos mais longos.",
  },
];

export function HelpDictionaryDocFeature() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Cabeçalho Oficial (Solto, sem card, sem ícones no h2 - Regra 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1 max-w-2xl">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ajuda &amp; Dicionário da Gruta
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Entenda como o Caloteiro funciona na prática e o que significa cada termo do universo do Tubarão dentro do sistema.
          </p>
        </div>

        <Link
          href="/cadastrar"
          className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <span>Abrir Minha Gruta</span>
          <FaArrowRight className="size-3" />
        </Link>
      </div>

      {/* 2. Explicação Direta (Sem Filtro): O que é o sistema e por que falamos "Pix" e "Tubarão" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <FaBookOpen className="size-4" />
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                O que o Caloteiro faz na prática?
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
              Tirando toda a nossa linguagem bem-humorada, o Caloteiro é um{" "}
              <strong className="text-white">
                sistema completo de gestão financeira de dívidas, parcelas e recebíveis
              </strong>
              . Ele substitui o bloco de notas do celular e as planilhas improvisadas para que você controle quem te deve, calcule juros automaticamente, guarde comprovantes e cobre no WhatsApp com 1 clique.
            </p>
          </div>
          <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-emerald-400">
            Sem robôs de telemarketing (92% de rejeição): você dispara a Investida pronta em 1 clique pelo seu WhatsApp.{" "}
            <Link
              href="/documentos/perguntas-frequentes#por-que-sem-robo"
              className="underline underline-offset-2 text-white hover:text-emerald-300"
            >
              Entenda por quê
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <FaHandHoldingDollar className="size-4" />
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                Serve apenas para Pix ou empréstimos em dinheiro?
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
              <strong className="text-white">Não! Serve para qualquer dívida ou acordo.</strong>{" "}
              Você pode controlar valores de um cartão de crédito emprestado, um boleto pago para alguém, vendas parceladas, serviços prestados, aluguéis, rateios ou empréstimos. Usamos a palavra{" "}
              <strong className="text-white">&ldquo;Pix&rdquo;</strong> nos botões (como <em>&ldquo;Pingou o Pix?&rdquo;</em>) porque virou sinônimo de dinheiro na cultura brasileira, mas você pode dar baixa em pagamentos recebidos por qualquer meio.
            </p>
          </div>
          <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-amber-300">
            Zero intermediação: o dinheiro não passa pela plataforma e não cobramos comissão.
          </div>
        </div>
      </div>

      {/* 3. Dicionário Oficial do Tubarão */}
      <div className="space-y-4 pt-1">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Dicionário Oficial do Tubarão
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            A tradução direta de cada nome que você encontra nas telas da plataforma:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DICTIONARY_TERMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.term}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Icon className={`size-3.5 ${item.iconColor}`} />
                      </div>
                      <h4 className="font-heading text-sm sm:text-base font-bold text-white leading-snug">
                        {item.term}
                      </h4>
                    </div>

                    <span
                      className={`self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${item.badgeClass}`}
                    >
                      {item.badgeText}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-emerald-400">
                    Significado: {item.meaning}
                  </div>

                  <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Como Usar em 4 Passos Rápidos */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Como funciona o fluxo na Gruta em 4 passos
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Do momento em que você registra a dívida até a quitação total:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Passo {item.step}
                </span>
                <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                  {item.title}
                </h4>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Comparativo: Planilha de Controle de Empréstimos vs. A Gruta do Caloteiro */}
      <div id="planilha-vs-caloteiro" className="space-y-4 pt-2 scroll-mt-24">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Por que trocar a Planilha de Controle de Empréstimos pela Gruta do Caloteiro?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Planilhas de Excel e blocos de notas funcionam até o segundo caloteiro pedir prazo ou mandar pagamento picado:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPREADSHEET_COMPARISON.map((row) => (
            <div
              key={row.criterion}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3 flex flex-col justify-between"
            >
              <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                {row.criterion}
              </h4>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                    <FaXmark className="size-3 shrink-0" />
                    <span>Na Planilha / Bloco de Notas:</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    {row.spreadsheet}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <FaCheck className="size-3 shrink-0" />
                    <span>Na Gruta do Caloteiro:</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">
                    {row.caloteiro}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Como Calcular Juros de Dinheiro Emprestado e Parcelamentos no Sistema */}
      <div id="calculo-de-juros" className="space-y-4 pt-2 scroll-mt-24">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Como calcular juros de dinheiro emprestado, vendas ou acordos parcelados
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Escolha entre 4 modalidades automáticas de cálculo na hora de registrar a dívida:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INTEREST_MODALITIES_GUIDE.map((mode) => (
            <div
              key={mode.title}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                    {mode.title}
                  </h4>
                  <span
                    className={`self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${mode.badgeClass}`}
                  >
                    {mode.badge}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. CTA Final */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-8 text-center space-y-3">
        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
          Pronto para colocar ordem nas suas cobranças?
        </h3>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-xl mx-auto">
          Comece gratuitamente no plano Tubarão Lixa (sem precisar de cartão de crédito) ou explore o comparativo completo das espécies.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/cadastrar"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-md gap-2 transition-all cursor-pointer"
          >
            <span>Criar Minha Gruta Grátis</span>
            <FaArrowRight className="size-3" />
          </Link>
          <Link
            href="/documentos/planos"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-5 text-xs font-mono font-bold border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <span>Ver Comparativo de Planos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

