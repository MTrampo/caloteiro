"use client";

import * as React from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaTriangleExclamation,
  FaScaleBalanced,
  FaLock,
  FaArrowRight,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa6";

const SECTIONS_NAV = [
  { id: "aceitacao", title: "1. Aceitação dos Termos" },
  { id: "natureza", title: "2. Natureza e Objeto do Sistema" },
  { id: "cadastro", title: "3. Cadastro e Acesso" },
  { id: "conduta", title: "4. Devedores e Conduta do Credor" },
  { id: "planos", title: "5. Planos, Assinaturas e Trial" },
  { id: "propriedade", title: "6. Propriedade Intelectual" },
  { id: "exclusao", title: "7. Exclusão de Conta e Marco Civil" },
  { id: "disposicoes", title: "8. Disposições Gerais" },
  { id: "foro", title: "9. Foro de Eleição" },
];

export function TermsDocFeature() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Cabeçalho Principal (Regra 7: sem card, sem ícones no h2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Termos e Condições de Uso
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: 27 de outubro de 2026 • Controladora: Meu Trampo
          </p>
        </div>

        <Link
          href="/documentos/privacidade"
          className="inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <span>Ver Política de Privacidade</span>
          <FaArrowRight className="size-3" />
        </Link>
      </div>

      {/* Card de Identificação da Controladora e Contatos */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-xs font-mono text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-bold text-white">
            Plataforma Caloteiro — Operada por Meu Trampo
          </p>
          <p className="text-zinc-400">
            Website oficial:{" "}
            <a
              href="https://meutrampo.dev.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              https://meutrampo.dev.br/
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <a
            href="https://wa.me/5511911051247"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:text-white transition-colors"
          >
            <FaWhatsapp className="size-3" />
            <span>+55 (11) 91105-1247</span>
          </a>

          <a
            href="https://instagram.com/meutrampo.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
          >
            <FaInstagram className="size-3 text-pink-400" />
            <span>@meutrampo.dev</span>
          </a>
        </div>
      </div>

      {/* Sumário Rápido de Seções */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-3">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          Índice dos Termos
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
          {SECTIONS_NAV.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:text-white text-zinc-400 transition-colors"
            >
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      {/* Conteúdo Integral das Cláusulas */}
      <div className="space-y-10 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* 1. Aceitação dos Termos */}
        <section id="aceitacao" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            1. Aceitação dos Termos
          </h3>
          <p>
            Ao acessar, registrar-se ou utilizar de qualquer forma o sistema{" "}
            <strong className="text-white">Caloteiro</strong> (&ldquo;Plataforma&rdquo; ou
            &ldquo;Sistema&rdquo;), você (&ldquo;Usuário&rdquo; ou &ldquo;Credor&rdquo;) manifesta expressa,
            livre e inequívoca concordância com estes Termos e Condições de Uso (&ldquo;Termos&rdquo;),
            bem como com a respectiva Política de Privacidade vinculada.
          </p>
          <p>
            Caso discorde de qualquer cláusula, condição ou obrigação aqui estipulada, o Usuário
            deverá abster-se imediatamente de utilizar a Plataforma.
          </p>
        </section>

        {/* 2. Natureza e Objeto do Sistema */}
        <section id="natureza" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            2. Natureza e Objeto do Sistema
          </h3>
          <p>
            2.1. O <strong className="text-white">Caloteiro</strong> é um software como serviço (
            <em>SaaS</em>) voltado exclusivamente à{" "}
            <strong className="text-white">
              gestão, acompanhamento e organização financeira pessoal privada
            </strong>{" "}
            de compromissos e acordos informais.
          </p>

          {/* Card de Isenção Estrita */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-heading font-bold text-amber-300 text-sm">
              <FaTriangleExclamation className="size-4 shrink-0" />
              <span>2.2. Isenção e Limitação Operacional Estrita</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
              <li>
                A Plataforma <strong className="text-white">não</strong> é instituição financeira,
                cooperativa de crédito, correspondente bancário ou prestadora de serviços de pagamento.
              </li>
              <li>
                A Plataforma <strong className="text-white">não</strong> realiza concessão de crédito,
                empréstimos com juros remuneratórios ou intermediação de agiotagem sob nenhuma hipótese.
              </li>
              <li>
                A Plataforma <strong className="text-white">não</strong> executa cobrança extrajudicial
                automatizada ou terceirizada em nome próprio,{" "}
                <strong className="text-white">não</strong> remete notificações formais com validade de
                protesto cartorário e <strong className="text-white">não</strong> negativa titulares
                devedores perante birôs de crédito (SPC, Serasa ou afins).
              </li>
              <li>
                A Plataforma não se responsabiliza pelo adimplemento, pontualidade ou inadimplemento total
                ou parcial dos valores organizados pelo Usuário.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Cadastro, Segurança e Acesso */}
        <section id="cadastro" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            3. Cadastro, Segurança e Acesso
          </h3>
          <p>
            3.1. Para usufruir dos recursos da Plataforma, o Usuário deve efetuar cadastro informando dados
            válidos, incluindo nome completo, apelido (quando aplicável), e-mail e criação de senha pessoal.
          </p>
          <p>
            3.2. As credenciais de acesso são estritamente pessoais e intransferíveis. O Usuário é o único
            responsável pela guarda, confidencialidade e segurança de seu login e senha, devendo comunicar
            imediatamente a administração da Plataforma caso identifique qualquer indício de acesso não autorizado.
          </p>
        </section>

        {/* 4. Dados de Terceiros e Conduta do Credor */}
        <section id="conduta" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            4. Dados de Terceiros (Devedores) e Conduta do Credor
          </h3>
          <p>
            4.1. <strong className="text-white">Papel de Controlador dos Dados Pessoais:</strong> O Usuário
            atua como o único e exclusivo{" "}
            <strong className="text-white">Controlador dos Dados Pessoais de Terceiros</strong> (denominados
            &ldquo;Devedores&rdquo; ou &ldquo;Presas Marcadas&rdquo;) inseridos no Sistema, tais como nome, apelido, telefone
            celular, CPF, endereço físico, histórico de conversas e justificativas registradas. A Plataforma atua
            estritamente como Operadora da infraestrutura técnica e de banco de dados a serviço do Usuário.
          </p>
          <p>
            4.2. <strong className="text-white">Autonomia e Responsabilidade de Cobrança:</strong> Todas as
            comunicações, mensagens via WhatsApp, chamadas telefônicas ou contatos físicos mantidos com terceiros
            cadastrados decorrem de iniciativa direta, discricionária e exclusiva do Usuário. A Plataforma fornece
            meros modelos de texto e atalhos operacionais com fins satíricos e organizacionais, não interferindo
            nem respondendo pelo teor, frequência, termos, horários ou legalidade das abordagens realizadas.
          </p>

          {/* Vedações Anti-Doxing */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-heading font-bold text-rose-300 text-sm">
              <FaShieldHalved className="size-4 shrink-0" />
              <span>4.3. Vedações Estritas (Anti-Abuso, Anti-Doxing e Proteção à Integridade)</span>
            </div>
            <p className="text-zinc-300">É expressamente proibido ao Usuário utilizar a Plataforma para:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-300">
              <li>
                Praticar <strong className="text-white">doxing</strong>, consistente na divulgação pública,
                compartilhamento não autorizado, exposição em redes sociais ou vazamento de dados pessoais
                de devedores (incluindo CPF, números telefônicos ou endereços);
              </li>
              <li>
                Praticar condutas tipificadas como coação, constrangimento ilegal, perseguição física ou digital
                (<em>stalking</em>), injúria, difamação, calúnia ou ameaça contra terceiros;
              </li>
              <li>
                Cadastrar pessoas das quais o Usuário não possua legítimo interesse ou relação financeira
                preexistente que justifique o controle de crédito.
              </li>
            </ul>
          </div>

          <p>
            4.4. <strong className="text-white">Suspensão, Bloqueio e Penalidades:</strong> Caso seja constatada
            violação às vedações do item 4.3, denúncia idônea fundamentada ou requisição de autoridades competentes,
            a administração de <strong className="text-white">Meu Trampo</strong> reserva-se o direito de{" "}
            <strong className="text-white">suspender temporariamente ou cancelar definitivamente</strong> a conta
            do Usuário, bloqueando o acesso sem dever de ressarcimento ou devolução de valores, sem prejuízo da
            adoção das medidas legais pertinentes nas esferas cível e criminal.
          </p>
        </section>

        {/* 5. Planos, Assinaturas, Período de Testes e Cancelamento */}
        <section id="planos" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            5. Planos, Assinaturas, Período de Testes e Cancelamento
          </h3>
          <p>
            5.1. <strong className="text-white">Intermediação Exclusiva de Pagamentos:</strong> Todas as
            assinaturas pagas (<em>Planos Tubarão Branco</em> e <em>Tubarão Cabeça Chata</em>) são processadas
            exclusivamente pelo gateway de pagamentos terceirizado{" "}
            <strong className="text-white">Mercado Pago</strong>. O Caloteiro não coleta, não processa e não
            custodia dados bancários, números de cartões de crédito ou códigos de segurança (CVV).
          </p>
          <p>
            5.2. <strong className="text-white">Período de Testes (Trial de 30 Dias):</strong> Novos Usuários que
            contratarem diretamente um plano pago no cadastro terão direito a um período de experimentação gratuita
            de 30 (trinta) dias corridos. Caso o Usuário cancele a assinatura antes de transcorridos os 30 dias,
            nada será cobrado. Findo o período de 30 dias sem cancelamento prévio, a mensalidade será faturada
            automaticamente pelo Mercado Pago.
          </p>
          <p>
            5.3. <strong className="text-white">Inaplicabilidade de Teste em Upgrades e Política de Não Reembolso:</strong>{" "}
            O Usuário que iniciar seu uso por meio do plano gratuito (<em>Tubarão Lixa</em>) e optar voluntariamente
            por migrar (<em>upgrade</em>) para um plano pago reconhece que já usufruiu da fase de teste e validação
            das funcionalidades essenciais. Portanto, a contratação de planos pagos a partir de upgrade possui{" "}
            <strong className="text-white">
              faturamento imediato, não dispondo de novo período de teste gratuito de 30 dias e nem de restituição
              pecuniária retroativa
            </strong>.
          </p>
          <p>
            5.4. <strong className="text-white">Cancelamento da Assinatura:</strong> O cancelamento da renovação
            recorrente pode ser realizado a qualquer momento pelo Usuário diretamente no painel do Caloteiro ou por
            meio de sua conta no Mercado Pago. Realizado o cancelamento, o Usuário continuará usufruindo dos recursos
            correspondentes ao plano contratado até a data originalmente prevista para o término do ciclo faturado,
            data a partir da qual as cobranças serão cessadas e a conta retroagirá ao plano gratuito.
          </p>
        </section>

        {/* 6. Propriedade Intelectual */}
        <section id="propriedade" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            6. Propriedade Intelectual
          </h3>
          <p>
            6.1. Todos os direitos de propriedade industrial e autoral relativos à marca &ldquo;Caloteiro&rdquo;, identidade
            visual, ilustrações, interfaces, códigos-fonte, algoritmos de cálculo e arquitetura da aplicação
            pertencem exclusivamente a <strong className="text-white">Meu Trampo</strong>.
          </p>
          <p>
            6.2. É terminantemente proibida a cópia, reprodução, engenharia reversa, descompilação, distribuição,
            licenciamento ou exploração comercial não autorizada do software e de suas marcas associadas.
          </p>
        </section>

        {/* 7. Exclusão de Conta e Quarentena Legal de 6 Meses */}
        <section id="exclusao" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            7. Exclusão de Conta e Quarentena Legal de 6 Meses
          </h3>
          <p>
            7.1. O Usuário poderá solicitar o cancelamento e a exclusão de sua conta a qualquer momento mediante opção disponibilizada
            no painel de configurações ou via contato com os canais de suporte oficiais.
          </p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <FaLock className="size-3.5 text-emerald-400" />
              <span>7.2. Quarentena de Segurança e Retenção Legal (6 Meses / 180 Dias)</span>
            </div>
            <p className="text-zinc-300">
              Ao ser solicitada a exclusão, a conta é imediatamente desativada e mantida em quarentena de retenção legal pelo prazo de <strong className="text-white">6 (seis) meses (180 dias)</strong>. Durante esse período, a assinatura do Mercado Pago é cancelada na hora para evitar novas cobranças. A plataforma não armazena dados técnicos de conexão (endereços IP). A conta poderá ser reativada caso o usuário realize novo login dentro dos 180 dias.
            </p>
          </div>
          <p>
            7.3. Expirado o prazo legal de 180 dias sem reativação, todos os dados cadastrais, presas marcadas, históricos e parcelas vinculados ao usuário serão eliminados de forma definitiva, permanente e irrecuperável.
          </p>
        </section>

        {/* 8. Disposições Gerais e Alterações */}
        <section id="disposicoes" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            8. Disposições Gerais e Alterações
          </h3>
          <p>
            8.1. A Plataforma poderá revisar e atualizar estes Termos a qualquer momento para refletir melhorias técnicas,
            adequações legislativas ou mudanças nas condições operacionais. As modificações passarão a vigorar a partir
            de sua publicação na Plataforma.
          </p>
          <p>
            8.2. A tolerância de eventuais descumprimentos destes Termos não implicará renúncia de direitos ou novação jurídica.
          </p>
        </section>

        {/* 9. Foro de Eleição */}
        <section id="foro" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            9. Foro de Eleição
          </h3>
          <p>
            9.1. Estes Termos de Uso são regidos, interpretados e executados segundo a legislação vigente na República
            Federativa do Brasil.
          </p>
          <p>
            9.2. Para dirimir quaisquer litígios, conflitos, dúvidas ou controvérsias decorrentes destes Termos ou da
            utilização da Plataforma, fica expressamente eleito o foro do:
          </p>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 space-y-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2 font-heading font-bold text-white text-sm">
              <FaScaleBalanced className="size-4 text-emerald-400" />
              <span>FORO REGIONAL VI – PENHA DE FRANÇA</span>
            </div>
            <p className="font-bold text-zinc-200">Comarca da Capital do Estado de São Paulo</p>
            <p className="text-zinc-400">
              Endereço: Rua Doutor João Ribeiro, nº 433, Penha de França, São Paulo – SP, CEP 03634-010
            </p>
            <p className="text-[11px] text-zinc-500 pt-1">
              Com renúncia expressa a qualquer outro foro, por mais privilegiado ou especial que seja ou venha a ser.
            </p>
          </div>
        </section>
      </div>

      {/* CTA Final */}
      <div className="rounded-2xl border border-zinc-800 bg-card p-6 text-center space-y-3">
        <h4 className="font-heading text-base sm:text-lg font-bold text-white">
          Dúvidas sobre os Termos de Uso?
        </h4>
        <p className="text-xs font-mono text-zinc-400 max-w-lg mx-auto">
          Nosso time de suporte está disponível para esclarecer qualquer questão relacionada ao funcionamento e às regras da plataforma.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://wa.me/5511911051247"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all cursor-pointer"
          >
            <FaWhatsapp className="size-3.5 text-emerald-600" />
            <span>Falar com o Suporte</span>
          </a>
          <Link
            href="/documentos/privacidade"
            className="inline-flex items-center justify-center h-10 px-5 text-xs font-mono font-bold border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl transition-all cursor-pointer"
          >
            <span>Ler Política de Privacidade</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

