"use client";

import * as React from "react";
import Link from "next/link";
import {
  FaScaleBalanced,
  FaShieldHalved,
  FaFileContract,
  FaWhatsapp,
  FaReceipt,
  FaArrowRight,
  FaGavel,
  FaBuildingColumns,
  FaCalculator,
  FaUserShield,
  FaTriangleExclamation,
  FaComments,
  FaHandshakeAngle,
} from "react-icons/fa6";
import {
  DocFaqCollapsible,
  type DocFaqItem,
} from "@/features/documents/components/doc-faq-collapsible";

interface LegalFaqCategory {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: DocFaqItem[];
}

const LEGAL_FAQ_CATEGORIES: LegalFaqCategory[] = [
  {
    title: "1. A Linha da Lei, Usura & Neutralidade da Plataforma",
    description:
      "Onde termina o direito do credor e começa a agiotagem, as regras contra violência e como a plataforma se posiciona com total neutralidade.",
    icon: FaScaleBalanced,
    iconColor: "text-amber-400",
    items: [
      {
        id: "faq-shark-usury-line",
        question: "Qual é a linha tênue entre emprestar dinheiro legalmente e a agiotagem (Crime de Usura)?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              O segredo para nadar com segurança é conhecer a regra do jogo: emprestar o seu próprio dinheiro conquistado com suor e estipular um retorno justo não tem nada a ver com o crime de agiotagem.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaScaleBalanced className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                <strong>Empréstimo Civil:</strong> &ldquo;Emprestei R$ 1.000 pro meu primo sair do sufoco e combinamos uma taxa de retorno pelo risco de eu ficar no prejuízo.&rdquo; Isso é legal e permitido.
                <br />
                <strong>Crime de Usura:</strong> &ldquo;Cobrar 30% ou 50% ao mês explorando o desespero de alguém ou transformando o empréstimo em uma máfia clandestina sem autorização do Banco Central.&rdquo; Isso é crime.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaGavel className="size-3.5" />
                <span>Base Legal &amp; Penas:</span>
              </span>
              <p className="text-zinc-300">
                Código Civil (arts. 586 a 592 e art. 406), Decreto nº 22.626/1933 (Lei de Usura) e Lei nº 1.521/1951 (Crimes contra a Economia Popular, art. 4º).
              </p>
              <p className="text-zinc-400">
                A pena prevista na Lei nº 1.521/51 para a usura pecuniária é de <strong>6 meses a 2 anos de detenção e multa</strong>, além da nulidade jurídica de cláusulas abusivas.
              </p>
            </div>

            <p>
              O Caloteiro oferece modalidades transparentes (Camarada sem juros, % no total ou taxa fixa em Reais) para você registrar o combinado sem precisar fazer conta no guardanapo e mantendo a operação sob controle.
            </p>
          </div>
        ),
      },
      {
        id: "faq-shark-violent-collection",
        question: "O que a lei diz sobre cobrança violenta, ameaças ou retenção de documentos e cartões?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              Regra fundamental de quem tem maturidade financeira: <strong>o Tubarão inteligente cobra com a cabeça, com dados e com elegância, NUNCA com violência ou coação física</strong>.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-rose-300 flex items-center gap-1.5">
                <FaTriangleExclamation className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Ameaçar quebrar a pessoa, mandar alguém armado na porta dela, reter cartão de benefício ou tomar moto na marra NÃO é cobrança: <strong>é crime com pena pesada de cadeia fechada</strong>. Quem é profissional cobra na conversa civilizada pelo WhatsApp ou bloqueia as contas da presa formalmente no fórum das Pequenas Causas.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2 text-xs">
              <span className="font-heading font-bold text-zinc-200 flex items-center gap-1.5">
                <FaGavel className="size-3.5 text-amber-400" />
                <span>Tipificação no Código Penal:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>
                  <strong className="text-white">Extorsão (Art. 158 do CP):</strong> Constranger mediante violência ou grave ameaça para obter vantagem econômica. Pena: <strong>reclusão de 4 a 10 anos e multa</strong>.
                </li>
                <li>
                  <strong className="text-white">Ameaça e Constrangimento Ilegal (Arts. 146 e 147 do CP):</strong> Pena de detenção e processo penal.
                </li>
                <li>
                  <strong className="text-white">Reter Cartão de Benefício ou Documento:</strong> Crime autônomo previsto no Estatuto da Pessoa Idosa (art. 104) e Código Penal.
                </li>
                <li>
                  <strong className="text-white">Tomar bens na marra (Art. 345 do CP):</strong> Exercício arbitrário das próprias razões.
                </li>
              </ul>
            </div>

            <p>
              No Caloteiro, o foco é 100% digital e pacífico: links claros, cálculo exato de parcelas e mensagens objetivas no WhatsApp para você recuperar o que é seu sem arrumar confusão com a polícia.
            </p>
          </div>
        ),
      },
      {
        id: "faq-shark-platform-neutrality",
        question: "Qual é a postura do Caloteiro sobre o uso do app e a colaboração com a justiça?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              Queremos que tudo fique cristalino entre nós e você, com total transparência e sem hipocrisia:
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1.5 text-xs">
                <span className="font-heading font-bold text-white block">
                  1. Ferramenta Neutra de Tecnologia
                </span>
                <p className="text-zinc-400">
                  O Caloteiro é um software de organização financeira pessoal. <strong>Nós não somos xerifes, não fazemos auditoria prévia e não vigiamos as negociações particulares de nenhum usuário.</strong> Cada credor é o único e exclusivo responsável pelos acordos que faz e pelas mensagens que decide enviar.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1.5 text-xs">
                <span className="font-heading font-bold text-emerald-400 block">
                  2. Privacidade e Minimização de Dados
                </span>
                <p className="text-zinc-400">
                  Como já deixamos expresso em nossa Política de Privacidade, <strong>o Caloteiro NÃO coleta endereços de IP nem mantém registros invasivos de navegação do usuário</strong>. Respeitamos a confidencialidade do seu uso.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1.5 text-xs">
                <span className="font-heading font-bold text-amber-300 block">
                  3. Cooperação Legal nos Limites dos Dados Disponíveis
                </span>
                <p className="text-zinc-400">
                  Caso a plataforma receba uma intimação judicial formal ou ordem de autoridade policial competente nos termos da lei, <strong>cooperaremos estritamente com os dados que possuímos disponíveis no cadastro</strong> (como o nome e o e-mail informados no ato do registro), em conformidade com o Marco Civil da Internet (Lei nº 12.965/2014, arts. 10 e 15).
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "faq-encryption-lgpd",
        question: "Como o Caloteiro protege dados sensíveis como CPF e Chave Pix perante a LGPD?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              Blindagem técnica rigorosa: a plataforma adota o padrão de <strong>Criptografia em Repouso</strong> para todos os dados sensíveis armazenados no sistema.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-purple-400 flex items-center gap-1.5">
                <FaShieldHalved className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Nem a equipe de desenvolvimento, nem administradores da plataforma conseguem ver o CPF ou a chave Pix que você cadastrou. Os dados são transformados em uma sopa de caracteres ilegível. Somente você, logado com a sua conta na sua Gruta, tem a chave de sessão para visualizá-los descriptografados.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaGavel className="size-3.5" />
                <span>Base Legal na LGPD:</span>
              </span>
              <p className="text-zinc-300">
                Lei Geral de Proteção de Dados (Lei nº 13.709/2018), arts. 46 (medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados) e 47 (boas práticas de governança e sigilo).
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "faq-spreadsheet-vs-system",
        question: "Qual a vantagem de usar o Caloteiro em vez de uma planilha de controle de empréstimos no Excel?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Planilhas de empréstimo quebram no celular, não guardam comprovantes e obrigam você a fazer conta e digitar cobrança na mão.</strong> Quem tenta controlar dinheiro emprestado, vendas parceladas ou acordos em planilha de Excel ou bloco de notas sempre esbarra no mesmo problema: o devedor manda um pagamento parcial picado, pede mais prazo e a planilha inteira vira uma bagunça.
            </p>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaCalculator className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Na Gruta do Caloteiro, você cadastra o valor, escolhe as parcelas e os juros, e o sistema faz tudo: recalcula saldos parciais em cascata, guarda os comprovantes de transferência, anota as desculpas no <em>Mural de Caôs</em> e gera a <em>Investida</em> pronta para o WhatsApp em 1 clique.{" "}
                <Link
                  href="/documentos/ajuda#planilha-vs-caloteiro"
                  className="underline underline-offset-2 text-white hover:text-emerald-300"
                >
                  Veja o comparativo completo aqui
                </Link>
                .
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "faq-calculate-loan-interest",
        question: "Como controlar dinheiro emprestado e calcular juros (taxa fixa, % total ou juros ao mês)?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>O motor financeiro do Caloteiro calcula parcelas e juros automaticamente na hora em que você registra a dívida.</strong> Basta informar o valor principal, a quantidade de parcelas (de 1x até 120x conforme o seu plano) e escolher uma das 4 modalidades de retorno:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300">
              <li>
                <strong>Sem Juros (Modo Camarada):</strong> divide apenas o valor original emprestado nas parcelas;
              </li>
              <li>
                <strong>Percentual sobre o Total (%):</strong> aplica uma porcentagem sobre o montante total e dilui nas parcelas;
              </li>
              <li>
                <strong>Taxa Fixa em Reais (R$):</strong> soma um valor fechado de retorno combinado (ex: emprestou R$ 1.000 para receber R$ 1.150);
              </li>
              <li>
                <strong>Juros ao Mês (% a.m.):</strong> calcula a taxa mensal proporcional ao longo dos meses do parcelamento.
              </li>
            </ul>

            <p className="text-xs text-zinc-400">
              E se a Presa pagar um valor menor ou maior que a parcela do mês, a <strong>Amortização em Cascata</strong> abate o saldo automaticamente sem que você precise refazer uma única conta.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "2. Cobrança no WhatsApp, Provas & Comprovantes",
    description:
      "Como cobrar dívidas pelo WhatsApp de forma 100% legal sem risco de acusação de assédio, e o valor probatório dos comprovantes Pix.",
    icon: FaWhatsapp,
    iconColor: "text-emerald-400",
    items: [
      {
        id: "faq-whatsapp-legal",
        question: "Cobrar dívida pelo WhatsApp pode ser considerado assédio ou crime?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Não! Cobrar quem te deve é o exercício regular de um direito do credor.</strong> Lembrar a presa no privado sobre uma obrigação vencida não é assédio moral e nem viola a privacidade.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaComments className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Se a pessoa atrasa 3 meses e depois reclama que você mandou mensagem no WhatsApp chamando de &ldquo;assédio&rdquo;, isso é puro choro de caloteiro querendo inverter a culpa. Cobrar no privado com educação e firmeza é direito seu garantido em lei.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaShieldHalved className="size-3.5" />
                <span>Base Legal:</span>
              </span>
              <p className="text-zinc-300">
                Código Civil, art. 188, I (&ldquo;não constituem atos ilícitos os praticados no exercício regular de um direito reconhecido&rdquo;) e art. 394 (caracterização da mora).
              </p>
            </div>

            <p>
              <strong>Onde está o limite?</strong> O que a lei veda expressamente é a <em>cobrança vexatória</em>: expor a presa em grupos da família, postar comentários cobrando nas fotos do Instagram dela ou ligar às 3h da manhã. As mensagens geradas pelo Caloteiro são calibradas exatamente para o WhatsApp privado, mantendo postura firme e sem dar brechas para processo.
            </p>
          </div>
        ),
      },
      {
        id: "faq-whatsapp-auto-charge",
        question: "Por que o Caloteiro não faz disparos automáticos por robô, SMS ou e-mail?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Porque cobrança automática de telemarketing tem cerca de 92% de rejeição e bloqueio no Brasil.</strong> O Caloteiro não é uma central de telemarketing. Quando um devedor recebe ligação, SMS, e-mail ou mensagem automática de um número desconhecido de robô, o instinto imediato dele é <strong>bloquear, denunciar como spam e ignorar</strong> em menos de 3 segundos.
            </p>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaComments className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                É muito fácil dar block num robô sem rosto de uma plataforma qualquer. Mas é muito difícil ignorar ou bloquear o seu próprio número na cara dura quando você manda uma <strong>Investida</strong> assinada pelo sistema com o valor calculado ao centavo e o Link da Dívida. O Caloteiro faz 99% do trabalho pesado e você dá o bote com 1 clique pelo canal que tem 96% de leitura real.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "faq-whatsapp-proof",
        question: "Conversas de WhatsApp, áudios e comprovantes de Pix servem como prova jurídica na justiça?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Sim, servem como prova plena perante a justiça brasileira.</strong> Acabou a época em que você precisava de contrato timbrado em cartório para provar um empréstimo.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaFileContract className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Aquele print onde a pessoa diz &ldquo;irmão, me passa R$ 500 no Pix que na próxima sexta te devolvo com R$ 50 de caixinha&rdquo; tem o mesmo peso de um contrato assinado perante o juiz. É confissão explícita de dívida.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaReceipt className="size-3.5" />
                <span>Base Legal:</span>
              </span>
              <p className="text-zinc-300">
                Código de Processo Civil (CPC), arts. 369 e 411; Enunciado 443 do Centro de Estudos Judiciários do CJF.
              </p>
            </div>

            <p>
              Com o Caloteiro, você anexa os recibos de Pix no <em>Cofre de Comprovantes</em> e documenta todas as justificativas furadas no <em>Mural de Caôs</em>. Caso precise executar a dívida, todo o dossiê cronológico está pronto para ser apresentado ao juiz.
            </p>
          </div>
        ),
      },
      {
        id: "faq-pix-unproven",
        question: "A presa jurou que já fez o Pix mas não envia o comprovante. A dívida está quitada?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Legalmente a dívida continua 100% aberta e exigível.</strong> O clássico golpe do &ldquo;já mandei o Pix, deve ser o seu banco que está instável&rdquo; não tem validade alguma perante a lei.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-rose-300 flex items-center gap-1.5">
                <FaReceipt className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                No direito brasileiro vigora a regra implacável: <strong>&ldquo;quem paga mal, paga duas vezes&rdquo;</strong>. A obrigação de provar que a grana saiu da conta e entrou na sua é da presa. Sem código de autenticação bancária de 32 dígitos, o Pix simplesmente não aconteceu.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaGavel className="size-3.5" />
                <span>Base Legal:</span>
              </span>
              <p className="text-zinc-300">
                Código Civil, arts. 319 (o devedor que paga tem direito a quitação regular) e 320 (ônus da prova da quitação recai exclusivamente sobre quem realizou o pagamento).
              </p>
            </div>

            <p>
              Na Gruta do Caloteiro a regra é clara: você só dá baixa na parcela quando o saldo bate na sua conta. Sem comprovante anexado, a presa continua marcada na água.
            </p>
          </div>
        ),
      },
      {
        id: "faq-whatsapp-billing-messages",
        question: "Quais as melhores mensagens de cobrança para cobrar dinheiro emprestado no WhatsApp?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>A melhor mensagem de cobrança é aquela que já traz o valor exato atualizado, a data de vencimento, a sua chave Pix pronta para cópia e o Link da Dívida.</strong> No Caloteiro, você não precisa quebrar a cabeça inventando texto: o sistema possui as <strong>Investidas no WhatsApp em 3 níveis</strong>:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300">
              <li>
                <strong>Nível 1 (Lembrete Amistoso):</strong> ideal para o dia do vencimento, avisando com leveza e já entregando a chave Pix;
              </li>
              <li>
                <strong>Nível 2 (Cutucada Firme):</strong> para atrasos leves (1 a 5 dias), cobrando posição sobre a parcela vencida;
              </li>
              <li>
                <strong>Nível 3 (Modo Tio Patinhas):</strong> para atrasos críticos, deixando claro o total de dias em aberto e exigindo regularização imediata.
              </li>
            </ul>

            <p className="text-xs text-zinc-400">
              A partir do plano Tubarão Branco, você também pode personalizar 100% os modelos de mensagem com variáveis automáticas (nome da presa, valor da parcela, dias de atraso e link da fatura externa).
            </p>
          </div>
        ),
      },
      {
        id: "faq-informal-loan-proof",
        question: "Emprestei dinheiro sem contrato assinado e não me pagam: como organizar as provas para cobrar?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Mesmo sem papel assinado em cartório, você pode organizar um dossiê completo de provas digitais da dívida.</strong> Para transformar um empréstimo ou venda informal em uma cobrança estruturada:
            </p>

            <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300">
              <li>
                Registre a dívida na sua Gruta e anexe o <strong>comprovante da transferência ou Pix inicial</strong> que você fez para o devedor;
              </li>
              <li>
                Envie o <strong>Link da Dívida (Fatura Externa)</strong> pelo WhatsApp para formalizar o cronograma de parcelas e valores;
              </li>
              <li>
                Sempre que a Presa pedir mais prazo ou inventar uma desculpa, registre no <strong>Mural de Caôs</strong> com a nova data prometida;
              </li>
              <li>
                Guarde os comprovantes de pagamentos parciais no <strong>Cofre de Comprovantes</strong>. Esse histórico cronológico serve tanto para pressionar no acordo amigável quanto para instruir ação no Juizado Especial.
              </li>
            </ol>
          </div>
        ),
      },
    ],
  },
  {
    title: "3. Legalidade dos Juros, Fiado & Juizado Especial",
    description:
      "Empréstimo civil, cobrança de fiado e como acionar o Juizado Especial (Pequenas Causas) de graça sem advogado.",
    icon: FaBuildingColumns,
    iconColor: "text-sky-400",
    items: [
      {
        id: "faq-legal-interest",
        question: "Emprestar dinheiro e cobrar juros entre conhecidos é crime?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Não é crime!</strong> O Código Civil brasileiro autoriza expressamente o <em>Contrato de Mútuo Feneratício</em> (empréstimo de dinheiro com taxa de juros) entre pessoas físicas. O Superior Tribunal de Justiça (STJ) já confirmou inúmeras vezes que cidadãos comuns podem estipular juros para remunerar o capital emprestado.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaScaleBalanced className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                <em>Mútuo Feneratício</em> é o termo formal dos juízes para: &ldquo;emprestei R$ 1.000 para alguém e tenho o direito legítimo de receber o valor com uma taxa de compensação pelo tempo em que fiquei sem a minha grana&rdquo;.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaGavel className="size-3.5" />
                <span>Base Legal &amp; STJ:</span>
              </span>
              <p className="text-zinc-300">
                Código Civil, arts. 586 a 592 e art. 406; Recurso Especial (REsp) nº 1.109.805 do STJ.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "faq-legal-verbal-contract",
        question: "O que é um 'contrato verbal de empréstimo' e ele tem validade jurídica?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Sim, tem validade jurídica plena.</strong> No direito brasileiro vigora o princípio da liberdade das formas (art. 107 do Código Civil). Acordos combinados de boca, por ligação ou por mensagens no WhatsApp são contratos legais obrigatórios entre as partes.
            </p>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaFileContract className="size-3.5" />
                <span>Base Legal:</span>
              </span>
              <p className="text-zinc-300">
                Código Civil, art. 107 (validade da declaração de vontade) e art. 586.
              </p>
            </div>

            <p>
              A fraqueza do contrato de boca era a memória: a presa finge que esqueceu a data ou o valor. Ao gerar a fatura externa no Caloteiro com PIN de segurança, você formaliza visualmente o acordo e acaba com a desculpa do &ldquo;não lembro de ter combinado isso&rdquo;.
            </p>
          </div>
        ),
      },
      {
        id: "faq-fiado-interest",
        question: "Vendi no fiado ou prestei serviço e o cliente sumiu. Posso cobrar juros de atraso?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Sim, com certeza.</strong> Quem trabalha por conta própria, é autônomo, freelancer ou vende mercadorias não é instituição de caridade. A partir do dia seguinte ao vencimento combinado, o devedor entra em mora de pleno direito.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-sky-400 flex items-center gap-1.5">
                <FaCalculator className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                <em>Mora</em> é o termo jurídico para: a presa começou a enrolar. Você tem o direito legal de receber o valor original corrigido com juros pelo atraso para não perder dinheiro para a inflação.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaGavel className="size-3.5" />
                <span>Base Legal:</span>
              </span>
              <p className="text-zinc-300">
                Código Civil, arts. 389 (inadimplemento da obrigação), 395 (mora e responsabilidade por perdas, juros e custas) e 406.
              </p>
            </div>

            <p>
              O motor de inteligência do Caloteiro recalcula os juros e os dias de atraso automaticamente para você cobrar o saldo real e justo sem vergonha.
            </p>
          </div>
        ),
      },
      {
        id: "faq-small-claims",
        question: "Posso cobrar na justiça valores de até 20 salários mínimos sem pagar advogado?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>Sim! Você pode entrar com ação no Juizado Especial Cível (Pequenas Causas) de graça.</strong>
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                <FaBuildingColumns className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Para dívidas de até 20 salários mínimos vigentes, você não precisa contratar advogado nem pagar custas iniciais. Basta ir ao balcão do fórum com os extratos do Caloteiro impressos e protocolar o pedido.
              </p>
            </div>

            {/* Base Legal */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <FaGavel className="size-3.5" />
                <span>Base Legal:</span>
              </span>
              <p className="text-zinc-300">
                Lei nº 9.099/1995 (Lei dos Juizados Especiais Cíveis), art. 9º (capacidade postulatória direta da parte para causas de até 20 salários mínimos).
              </p>
            </div>

            <p>
              O extrato gerado pelo Caloteiro, com as datas de vencimento, pagamentos parciais amortizados e links enviados, serve como o inventário perfeito da dívida para instruir a petição no fórum.
            </p>
          </div>
        ),
      },
      {
        id: "faq-shame-friend",
        question: "Como cobrar parente ou amigo sem perder a amizade nem virar o 'vilão'?",
        answer: (
          <div className="space-y-4 pt-1">
            <p>
              <strong>A vergonha deve ser de quem pegou o dinheiro e não honrou, nunca de quem foi solidário e ajudou.</strong>
            </p>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
              <span className="font-heading font-bold text-white flex items-center gap-1.5">
                <FaHandshakeAngle className="size-3.5 text-emerald-400" />
                <span>A Psicologia do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                O devedor costuma usar uma técnica clássica de inversão de culpa: atrasa meses, mas quando você cobra, diz que &ldquo;você não tem consideração&rdquo;. O segredo para acabar com isso é <strong>despersonalizar a cobrança</strong>.
              </p>
              <p className="text-zinc-400">
                Quando você cobra &ldquo;de boca&rdquo;, parece perseguição pessoal. Quando você envia o Link da Dívida (fatura externa) do Caloteiro com o cronograma limpo e a chave Pix, o sistema vira o seu auditor financeiro particular. Você não está brigando: você só está enviando o extrato do sistema.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
];

interface ChannelComparisonBar {
  channel: string;
  subtitle: string;
  rejectionRate: number;
  effectiveRate: number;
  verdictBadge: string;
  verdictClass: string;
  barColorClass: string;
  sharkComment: string;
  isHeroChannel?: boolean;
}

const ANTI_TELEMARKETING_CHANNELS: ChannelComparisonBar[] = [
  {
    channel: "1. Ligação de Telemarketing / Robocall",
    subtitle: "Centrais de cobrança e discadores automáticos",
    rejectionRate: 92,
    effectiveRate: 8,
    verdictBadge: "92% Rejeitado / Bloqueado",
    verdictClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    barColorClass: "bg-rose-500",
    sharkComment:
      "O Brasil recebe mais de 1 bilhão de robocalls por mês (Anatel/Truecaller). Com filtros nativos do Android/iOS e o 'Não Me Perturbe', o celular da Presa nem chega a tocar.",
  },
  {
    channel: "2. Bot de WhatsApp ou SMS (Número Desconhecido)",
    subtitle: "Disparo automático por número terceirizado",
    rejectionRate: 88,
    effectiveRate: 12,
    verdictBadge: "88% Bloqueado na Hora",
    verdictClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    barColorClass: "bg-rose-500",
    sharkComment:
      "Quando um número comercial estranho manda 'Você possui uma pendência', o caloteiro aperta 'Bloquear e Denunciar Spam' em 3 segundos e ainda diz que achou que era golpe.",
  },
  {
    channel: "3. E-mail Automático de Cobrança",
    subtitle: "Notificações automáticas por caixa de entrada",
    rejectionRate: 82,
    effectiveRate: 18,
    verdictBadge: "82% Ignorado / Caixa de Spam",
    verdictClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    barColorClass: "bg-amber-400",
    sharkComment:
      "Se a Presa já finge demência no WhatsApp, imagina num e-mail soterrado entre promoções de varejo e filtros de spam.",
  },
  {
    channel: "4. Investida 1-Clique do Caloteiro (Seu WhatsApp)",
    subtitle: "Mensagem calculada pelo sistema + envio pelo seu número real",
    rejectionRate: 4,
    effectiveRate: 96,
    verdictBadge: "96% Leitura Imediata",
    verdictClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
    barColorClass: "bg-emerald-400",
    sharkComment:
      "Chega pelo seu contato salvo na agenda da Presa (zero barreira de spam), mas com a armadura oficial do sistema: cálculo exato ao centavo, chave Pix e Link da Dívida com PIN.",
    isHeroChannel: true,
  },
];

const ANTI_TELEMARKETING_REASONS = [
  {
    title: "1. Robô não dá frio na barriga de caloteiro",
    description:
      "Ninguém perde o sono porque um robô de telemarketing mandou um SMS automático. Mas quando a cobrança chega diretamente pelo seu contato — assinada pelo sistema e com o extrato formal da dívida — o peso psicológico muda na hora.",
  },
  {
    title: "2. Mata a desculpa do “achei que era vírus ou golpe”",
    description:
      "Sistemas que disparam links por números desconhecidos dão munição para a Presa dizer que não abriu por medo de fraude. Quando você mesmo envia a Investida com 1 clique na conversa de vocês, essa desculpa morre antes de nascer.",
  },
  {
    title: "3. O sistema faz 99% do trabalho, você só dá o bote",
    description:
      "Não ter robô não significa cobrar na mão: o Caloteiro calcula juros, conta os dias de atraso, puxa os caôs anteriores e escreve a mensagem inteira nos 3 níveis de pressão. Você só dá 1 clique para enviar pelo canal onde a Presa não consegue se esconder.",
  },
];

export function LegalFaqDocFeature() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Cabeçalho Oficial (Solto, sem card, sem ícones no h2 - Regra 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Perguntas Frequentes &amp; Guia Legal
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            O juridiquês traduzido pelo Tubarão com base real no Código Civil, STJ e legislação brasileira sobre empréstimos, usura e cobrança no WhatsApp.
          </p>
        </div>

        <Link
          href="/cadastrar"
          className="inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <span>Abrir Minha Gruta</span>
          <FaArrowRight className="size-3" />
        </Link>
      </div>

      {/* 2. Banner de Esclarecimento Legal & Neutralidade */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <FaUserShield className="size-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm sm:text-base font-bold text-white">
              Embasamento Jurídico &amp; Neutralidade Operacional
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Informação séria na essência, humor afiado na casca.
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
          O Caloteiro é um software de organização financeira pessoal. Não somos instituição financeira, não investigamos e não monitoramos as negociações particulares dos usuários, e não coletamos endereços de IP. Este guia foi elaborado com base na legislação civil brasileira em vigor (Código Civil, Decreto da Lei de Usura, Código de Processo Civil, Lei dos Juizados Especiais e STJ) para que todo credor conheça os seus direitos e saiba cobrar com inteligência, elegância e segurança jurídica.
        </p>
      </div>

      {/* 3. Seção Especial com Dados & Gráfico: Por que Não Fazemos Cobrança Automática (#por-que-sem-robo) */}
      <section
        id="por-que-sem-robo"
        className="space-y-5 pt-2 scroll-mt-20 sm:scroll-mt-24"
      >
        <div className="space-y-1.5">
          <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white">
            Por que o Caloteiro não usa robôs de telemarketing (e por que a cobrança automática falha em 92% dos casos)?
          </h3>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
            Não é falta de tecnologia — é inteligência de caça. Veja os dados reais do cenário brasileiro e entenda por que terceirizar a cobrança para um robô é o caminho mais rápido para levar bloqueio da Presa.
          </p>
        </div>

        {/* Gráfico Analítico Comparativo (Unidade Semântica de Gráfico - Regra 7) */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
            <div>
              <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                Taxa de Rejeição e Bloqueio vs. Leitura Real por Canal no Brasil
              </h4>
              <p className="text-[11px] sm:text-xs font-mono text-zinc-400">
                Fontes de referência: Levantamentos Idec (92% de desconexão/rejeição), Anatel, relatórios Truecaller e Panorama Mobile Time.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
              <span className="inline-flex items-center gap-1.5 text-rose-400">
                <span className="size-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>Rejeição / Bloqueio</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="size-2.5 rounded-sm bg-emerald-400 inline-block" />
                <span>Leitura Efetiva</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {ANTI_TELEMARKETING_CHANNELS.map((item) => (
              <div
                key={item.channel}
                className={`rounded-xl border p-3.5 sm:p-4 space-y-2.5 ${
                  item.isHeroChannel
                    ? "border-emerald-500/40 bg-emerald-950/15"
                    : "border-zinc-800/90 bg-zinc-950/60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-heading text-xs sm:text-sm font-bold text-white block">
                      {item.channel}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 block">
                      {item.subtitle}
                    </span>
                  </div>

                  <span
                    className={`self-start sm:self-auto text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border whitespace-nowrap shrink-0 ${item.verdictClass}`}
                  >
                    {item.verdictBadge}
                  </span>
                </div>

                {/* Barra Visual Comparativa */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex">
                    {item.isHeroChannel ? (
                      <>
                        <div
                          className="h-full bg-emerald-400 transition-all"
                          style={{ width: `${item.effectiveRate}%` }}
                          title={`Leitura Efetiva: ${item.effectiveRate}%`}
                        />
                        <div
                          className="h-full bg-rose-500/50 transition-all"
                          style={{ width: `${item.rejectionRate}%` }}
                          title={`Rejeição: ${item.rejectionRate}%`}
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className={`h-full ${item.barColorClass} transition-all`}
                          style={{ width: `${item.rejectionRate}%` }}
                          title={`Rejeição / Bloqueio: ${item.rejectionRate}%`}
                        />
                        <div
                          className="h-full bg-emerald-400/70 transition-all"
                          style={{ width: `${item.effectiveRate}%` }}
                          title={`Efetividade: ${item.effectiveRate}%`}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                    {item.isHeroChannel ? (
                      <>
                        <span className="text-emerald-400 font-bold">
                          {item.effectiveRate}% Lido na conversa direta
                        </span>
                        <span className="text-zinc-500">
                          Apenas {item.rejectionRate}% ignorado
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-rose-400 font-bold">
                          {item.rejectionRate}% Bloqueado / Ignorado
                        </span>
                        <span className="text-zinc-400">
                          Apenas {item.effectiveRate}% de abertura útil
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs font-mono text-zinc-300 leading-relaxed pt-0.5">
                  {item.sharkComment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Cards de Psicologia da Cobrança Direta vs. Robô (Soltos no Grid - Anti-Card Inception) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ANTI_TELEMARKETING_REASONS.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h4 className="font-heading text-sm font-bold text-white leading-snug">
                  {reason.title}
                </h4>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Seções Temáticas de Perguntas e Respostas */}
      <div className="space-y-8 sm:space-y-10">
        {LEGAL_FAQ_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;

          return (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-1 border-b border-border/40">
                <CategoryIcon className={`size-4 ${category.iconColor} shrink-0`} />
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {category.description}
                  </p>
                </div>
              </div>

              <DocFaqCollapsible items={category.items} defaultOpenIndex={0} />
            </div>
          );
        })}
      </div>

      {/* 4. CTA Final na Base da Documentação */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 text-center space-y-3">
        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
          Pronto para assumir o controle dos seus devedores?
        </h3>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-xl mx-auto">
          Chega de ficar no escuro e com medo de cobrar quem pegou o seu dinheiro. Crie sua gruta no plano gratuito e comece a rastrear suas presas com elegância e apoio na lei.
        </p>
        <div className="pt-2">
          <Link
            href="/cadastrar"
            className="inline-flex items-center justify-center h-11 px-6 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-md gap-2 transition-all cursor-pointer"
          >
            <span>Começar Grátis no Tubarão Lixa</span>
            <FaArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
