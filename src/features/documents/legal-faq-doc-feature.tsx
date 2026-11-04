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
              Blindagem técnica rigorosa: a plataforma adota o padrão de <strong>Criptografia em Repouso (Encryption-at-Rest) com algoritmo AES-256-GCM</strong> para todos os dados sensíveis armazenados no banco de dados.
            </p>

            {/* Tradução do Tubarão */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-1.5 text-xs">
              <span className="font-heading font-bold text-purple-400 flex items-center gap-1.5">
                <FaShieldHalved className="size-3.5" />
                <span>Tradução do Tubarão:</span>
              </span>
              <p className="text-zinc-300">
                Nem a equipe de desenvolvimento, nem administradores de banco de dados conseguem ver o CPF ou a chave Pix que você cadastrou. Os dados são transformados em uma sopa de caracteres ilegível. Somente você, logado com a sua conta na sua Gruta, tem a chave de sessão para visualizá-los descriptografados.
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
                Quando você cobra &ldquo;de boca&rdquo;, parece perseguição pessoal. Quando você envia o link do portal da dívida do Caloteiro com o cronograma limpo e a chave Pix, o sistema vira o seu auditor financeiro particular. Você não está brigando: você só está enviando o extrato do sistema.
              </p>
            </div>
          </div>
        ),
      },
    ],
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

      {/* 3. Seções Temáticas de Perguntas e Respostas */}
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
