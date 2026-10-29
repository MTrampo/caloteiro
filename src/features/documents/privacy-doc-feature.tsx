"use client";

import * as React from "react";
import Link from "next/link";
import {
  FaScaleBalanced,
  FaLock,
  FaArrowRight,
  FaInstagram,
  FaWhatsapp,
  FaUserCheck,
} from "react-icons/fa6";

const PRIVACY_NAV = [
  { id: "compromisso", title: "1. Compromisso" },
  { id: "papeis", title: "2. Papéis LGPD" },
  { id: "dados", title: "3. Dados Tratados" },
  { id: "bases", title: "4. Bases Legais" },
  { id: "retencao-devedores", title: "5. Retenção de Devedores" },
  { id: "compartilhamento", title: "6. Compartilhamento" },
  { id: "exclusao", title: "7. Exclusão e Marco Civil" },
  { id: "seguranca", title: "8. Segurança" },
  { id: "direitos-dpo", title: "9. Direitos e DPO" },
  { id: "foro", title: "10. Foro de Eleição" },
];

const LGPD_BASES_TABLE = [
  {
    categoria: "Cadastro do Usuário Credor",
    finalidade: "Autenticação, criação da conta e disponibilização do serviço",
    base: "Art. 7º, V da LGPD",
    detalhes: "Execução de Contrato",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    categoria: "Dados dos Devedores (Presas)",
    finalidade: "Organização, conciliação e histórico de cobranças privadas pelo credor",
    base: "Art. 7º, VI da LGPD",
    detalhes: "Exercício Regular de Direitos em Processo ou Contrato",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    categoria: "Métricas e Telemetria (Google Analytics)",
    finalidade: "Medição agregada e anônima de desempenho e usabilidade da interface (sem identificação pessoal e sem IPs)",
    base: "Art. 7º, IX da LGPD",
    detalhes: "Legítimo Interesse da Controladora (Métricas Agregadas)",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  {
    categoria: "Cooperação Judicial Exclusiva",
    finalidade: "Atendimento estrito a determinações e ordens judiciais emitidas pelo Poder Judiciário por descumprimento de normas",
    base: "Art. 7º, II da LGPD",
    detalhes: "Cumprimento de Obrigação Legal ou Decisão Judicial",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
];

export function PrivacyDocFeature() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Cabeçalho Principal (Regra 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Política de Privacidade e Proteção de Dados
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: 27 de outubro de 2026 • Em conformidade com a LGPD (Lei nº 13.709/2018)
          </p>
        </div>

        <Link
          href="/documentos/termos"
          className="inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <span>Ver Termos de Uso</span>
          <FaArrowRight className="size-3" />
        </Link>
      </div>

      {/* Card da Controladora e Encarregado de Dados (DPO) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-xs font-mono text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-bold text-white">
            Controladora da Aplicação: Meu Trampo
          </p>
          <p className="text-zinc-400">
            Canal do Encarregado de Proteção de Dados (DPO): WhatsApp e Instagram oficiais
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
            <span>Falar com o DPO</span>
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

      {/* Box de Destaque: Anonimato e Segurança do Credor */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6 space-y-2.5">
        <div className="flex items-center gap-2.5 text-emerald-400 font-heading font-bold text-sm sm:text-base">
          <FaLock className="size-4 shrink-0" />
          <span>Prioridade Máxima: Segurança, Sigilo e Anonimidade do Tubarão</span>
        </div>
        <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
          No Caloteiro, a discrição do credor é absoluta. <strong className="text-white">Não realizamos guarda rotineira de dados técnicos de conexão (endereços IP, modelos de dispositivo, portas lógicas ou impressões digitais de navegadores)</strong>. Suas cobranças e relacionamentos com devedores são estritamente privados. O fornecimento de dados a terceiros ocorre única e exclusivamente mediante <strong className="text-white">ordem judicial expressa e fundamentada expedida pelo Poder Judiciário</strong> em hipótese formal de apuração de descumprimento de normas legais.
        </p>
      </div>

      {/* Sumário Rápido */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-3">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          Índice da Política de Privacidade
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono">
          {PRIVACY_NAV.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:text-white text-zinc-400 transition-colors text-center truncate"
            >
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      {/* Conteúdo Detalhado */}
      <div className="space-y-10 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* 1. Compromisso com a Privacidade */}
        <section id="compromisso" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            1. Compromisso com a Privacidade
          </h3>
          <p>
            Esta Política de Privacidade e Proteção de Dados (&ldquo;Política&rdquo;) tem como objetivo esclarecer
            de forma transparente, objetiva e compreensível como a plataforma{" "}
            <strong className="text-white">Caloteiro</strong>, operada por{" "}
            <strong className="text-white">Meu Trampo</strong>, coleta, processa, utiliza, armazena, compartilha e
            descarta dados pessoais, em estrita conformidade com a{" "}
            <strong className="text-white">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>,
            com o <strong className="text-white">Marco Civil da Internet (Lei nº 12.965/2014)</strong> e com as
            diretrizes da Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
          <p>
            Ao utilizar o Caloteiro, o Usuário expressa ciência e concordância inequívoca com os termos aqui dispostos.
          </p>
        </section>

        {/* 2. Papéis de Tratamento Segundo a LGPD */}
        <section id="papeis" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            2. Papéis de Tratamento Segundo a LGPD
          </h3>
          <p>Para os devidos fins de interpretação legal do Artigo 5º da LGPD:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-heading text-xs font-bold uppercase text-emerald-400 block">
                Usuário Credor (Tubarão)
              </span>
              <p className="font-bold text-white">Controlador de Dados de Terceiros</p>
              <p className="text-xs text-zinc-400">
                O Usuário titular da conta é o único e exclusivo Controlador dos dados de terceiros (devedores)
                que decide voluntariamente registrar no sistema para controle e exercício de seus créditos.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-heading text-xs font-bold uppercase text-zinc-400 block">
                Meu Trampo / Caloteiro
              </span>
              <p className="font-bold text-white">Operadora de Dados</p>
              <p className="text-xs text-zinc-400">
                Atua primordialmente como Operadora em relação às anotações dos devedores, fornecendo a infraestrutura
                computacional e o banco de dados seguro para processamento sob instrução do Credor.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-heading text-xs font-bold uppercase text-zinc-400 block">
                Meu Trampo
              </span>
              <p className="font-bold text-white">Controladora Direta</p>
              <p className="text-xs text-zinc-400">
                Atua como Controladora exclusivamente sobre os dados cadastrais mínimos e essenciais do próprio
                Usuário Credor (como e-mail de login, credenciais e configurações da conta).
              </p>
            </div>
          </div>
        </section>

        {/* 3. Dados Pessoais Tratados */}
        <section id="dados" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            3. Dados Pessoais Tratados
          </h3>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="font-heading text-sm font-bold text-white">
                3.1. Dados Pessoais do Usuário Credor
              </h4>
              <p className="text-zinc-300">
                <strong className="text-white">Identificação e Cadastro:</strong> Nome completo, apelido (quando fornecido),
                endereço de e-mail e senha de acesso criptografada (hash seguro).
              </p>
              <p className="text-zinc-300">
                <strong className="text-white">Dados Financeiros e Meios de Pagamento:</strong> O Caloteiro{" "}
                <strong className="text-white">não coleta, não transaciona e não armazena</strong> números de cartões de
                crédito, códigos de segurança (CVV) ou dados bancários de seus Usuários. Toda a etapa de faturamento
                dos planos pagos é processada de ponta a ponta pelo gateway{" "}
                <strong className="text-white">Mercado Pago</strong> sob seus próprios padrões de conformidade PCI-DSS.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="font-heading text-sm font-bold text-white">
                3.2. Não Armazenamento de Dados Técnicos (Sem Coleta de IPs) e Métricas Anônimas
              </h4>
              <p className="text-zinc-300">
                <strong className="text-white">Privacidade e Zero Rastreamento Técnico:</strong> O Caloteiro{" "}
                <strong className="text-white">NÃO coleta, NÃO monitora e NÃO armazena endereços IP</strong>,
                portas lógicas, modelos de hardware ou impressões digitais (<em>fingerprints</em>) de navegadores
                do Credor. Sua navegação e o uso da plataforma são confidenciais.
              </p>
              <p className="text-zinc-300">
                <strong className="text-white">Telemetria de Uso via Google Analytics:</strong> Utilizamos a ferramenta{" "}
                <strong className="text-white">Google Analytics</strong> exclusivamente para medição estatística,
                agregada e anônima de volume de acessos e telas utilizadas. Essas informações de uso são desvinculadas
                de qualquer dado cadastral do Usuário e não permitem identificação individual.
              </p>
              <p className="text-zinc-300">
                <strong className="text-white">Cookies de Sessão:</strong> Utilizamos estritamente cookies funcionais
                e temporários para manutenção segura da autenticação do usuário durante o período em que ele estiver
                conectado.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="font-heading text-sm font-bold text-white">
                3.3. Dados de Terceiros Inseridos pelo Credor (Devedores)
              </h4>
              <p className="text-zinc-300">
                Nome civil, apelido/vulgo, grau de proximidade (parente, amigo, colega), número de telefone celular para contato/WhatsApp.
                Informações acessórias opcionais: CPF, endereço residencial em linha única, chave Pix informada pelo terceiro
                e anotações livres de justificativas (&ldquo;caôs&rdquo; ou desculpas) vinculadas ao vencimento de parcelas.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Finalidades e Bases Legais do Tratamento */}
        <section id="bases" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            4. Finalidades e Bases Legais do Tratamento (Art. 7º da LGPD)
          </h3>
          <p>
            O tratamento de dados pessoais no Caloteiro apoia-se estritamente nas seguintes hipóteses autorizativas da LGPD:
          </p>

          {/* Tabela de Bases Legais Formatada */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 bg-zinc-900/90 border-b border-border p-3.5 text-xs font-mono text-zinc-400 font-bold">
              <div className="col-span-4">Categoria de Dados</div>
              <div className="col-span-4">Finalidade Primária</div>
              <div className="col-span-4">Base Legal (LGPD)</div>
            </div>

            <div className="divide-y divide-border/40 text-xs font-mono">
              {LGPD_BASES_TABLE.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:p-4 gap-2 sm:gap-4 items-center hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="sm:col-span-4">
                    <span className="font-bold text-white block">{row.categoria}</span>
                  </div>
                  <div className="sm:col-span-4 text-zinc-300">
                    <span>{row.finalidade}</span>
                  </div>
                  <div className="sm:col-span-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${row.badgeClass}`}
                    >
                      {row.base}
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-1">{row.detalhes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Política de Retenção de Dados de Devedores */}
        <section id="retencao-devedores" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            5. Política de Retenção de Dados de Devedores (Direito à Cobrança)
          </h3>
          <p>
            5.1. <strong className="text-white">Legítimo Registro de Crédito:</strong> Em virtude do princípio da finalidade
            e do exercício regular de direitos, os dados cadastrais e as parcelas de devedores inseridas pelo Usuário{" "}
            <strong className="text-white">
              permanecerão no sistema enquanto houver pendência financeira não liquidada associada ao respectivo devedor
            </strong>.
          </p>
          <p>
            5.2. A plataforma não realizará a remoção forçada de anotações ativas a pedido exclusivo do terceiro devedor caso
            persista débito pendente comprovado pelo Credor responsável pelo cadastro.
          </p>
          <p>
            5.3. Uma vez liquidada e honrada integralmente a obrigação, o Usuário Credor dispõe de autonomia total dentro do
            sistema para arquivar, retificar ou deletar definitivamente o cadastro do devedor e seu histórico correspondente.
          </p>
        </section>

        {/* 6. Compartilhamento de Dados com Terceiros */}
        <section id="compartilhamento" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            6. Compartilhamento de Dados com Terceiros
          </h3>
          <p>
            A plataforma não comercializa, não aluga e não transfere dados pessoais de Usuários ou devedores a terceiros para
            fins de marketing ou publicidade. O compartilhamento ocorre restritamente com provedores de infraestrutura indispensáveis:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
            <li>
              <strong className="text-white">Serviços de Nuvem e Banco de Dados (Cloud):</strong> Provedores internacionais
              para armazenamento em conformidade com padrões rígidos de criptografia e backups periódicos;
            </li>
            <li>
              <strong className="text-white">Mercado Pago:</strong> Gateway de intermediação financeira responsável pelo
              processamento de assinaturas e conciliação de faturas recorrentes;
            </li>
            <li>
              <strong className="text-white">Google Analytics:</strong> Serviço de análise estatística agregada e medição anônima de tráfego, sem identificação de usuários ou cruzamento com cadastros;
            </li>
            <li>
              <strong className="text-white">Autoridades Judiciais Competentes:</strong> A única hipótese de quebra de sigilo ou fornecimento de informações cadastrais dá-se exclusivamente mediante <strong className="text-white">ordem judicial expressa e fundamentada expedida pelo Poder Judiciário</strong>, em caso de investigação formal de descumprimento de normas legais ou fraudes. A plataforma não atende a solicitações extrajudiciais genéricas.
            </li>
          </ul>
        </section>

        {/* 7. Exclusão de Conta e Quarentena Legal de 6 Meses */}
        <section id="exclusao" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            7. Exclusão de Conta e Quarentena Legal de 6 Meses
          </h3>
          <p>
            7.1. O Usuário tem o direito de requerer o encerramento e a exclusão integral de sua conta a qualquer momento por meio
            das opções do painel ou acionando o suporte oficial.
          </p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <FaLock className="size-3.5 text-emerald-400" />
              <span>7.2. Quarentena de Segurança e Retenção Legal (6 Meses / 180 Dias)</span>
            </div>
            <p className="text-zinc-300">
              Ao solicitar a exclusão, a conta é imediatamente desativada e mantida em quarentena de retenção legal pelo prazo de <strong className="text-white">6 (seis) meses (180 dias)</strong>. Durante esse período, a assinatura do Mercado Pago é cancelada de forma imediata e bloqueante para assegurar que nenhuma nova cobrança ocorra. A conta pode ser reativada voluntariamente pelo titular caso efetue novo login dentro dos 180 dias. Não há coleta nem guarda de endereços IP de conexão.
            </p>
          </div>
          <p>
            7.3. <strong className="text-white">Purga Definitiva em Cascata:</strong> Transcorrido o intervalo de 180 dias sem que o usuário tenha manifestado intenção de reativar a conta, todos os dados cadastrais, presas marcadas, históricos de justificativas, parcelas e pagamentos vinculados ao titular são excluídos permanentemente de forma automatizada e irreversível.
          </p>
        </section>

        {/* 8. Segurança da Informação e Boas Práticas */}
        <section id="seguranca" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            8. Segurança da Informação e Boas Práticas
          </h3>
          <p>
            Adotamos padrões rígidos de segurança cibernética para resguardar as informações contra acessos não autorizados, incidentes
            ou perdas:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
            <li>Criptografia ponta a ponta nas conexões via HTTPS/TLS;</li>
            <li>Armazenamento de senhas via mecanismos de hash criptográfico irreversível;</li>
            <li>Políticas rigorosas de controle de acesso aos bancos de dados de produção;</li>
            <li>Compressão segura de comprovantes Pix e isolamento por identificador de usuário (Row Level Security - RLS).</li>
          </ul>
        </section>

        {/* 9. Direitos do Titular de Dados e Canal do DPO */}
        <section id="direitos-dpo" className="space-y-4 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            9. Direitos do Titular de Dados e Canal do DPO (Art. 18 da LGPD)
          </h3>
          <p>
            Em conformidade com o Artigo 18 da LGPD, o Usuário Credor possui o direito de solicitar a qualquer momento:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              ✓ Confirmação da existência de tratamento e acesso às informações;
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              ✓ Correção de dados incompletos, inexatos ou desatualizados;
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              ✓ Anonimização, bloqueio ou eliminação de dados excessivos;
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              ✓ Portabilidade dos dados cadastrais a outro prestador de serviços;
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              ✓ Informação sobre entidades com as quais houve compartilhamento;
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
              ✓ Revogação do consentimento, quando legalmente aplicável.
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 font-heading font-bold text-white text-sm">
              <FaUserCheck className="size-4 text-emerald-400" />
              <span>Canal Oficial do Encarregado de Proteção de Dados (DPO)</span>
            </div>
            <p className="text-xs text-zinc-300">
              Para exercer seus direitos de titular ou apresentar solicitações relacionadas à privacidade, entre em contato direto
              com nosso DPO através dos canais oficiais:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://wa.me/5511911051247"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs cursor-pointer shadow-xs"
              >
                <FaWhatsapp className="size-3.5 text-emerald-600" />
                <span>WhatsApp Oficial: +55 (11) 91105-1247</span>
              </a>

              <a
                href="https://instagram.com/meutrampo.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-xs cursor-pointer"
              >
                <FaInstagram className="size-3.5 text-pink-400" />
                <span>Instagram: @meutrampo.dev</span>
              </a>
            </div>
          </div>
        </section>

        {/* 10. Foro Competente */}
        <section id="foro" className="space-y-3 pt-2 scroll-mt-24">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white border-b border-border/60 pb-2">
            10. Foro Competente
          </h3>
          <p>
            Quaisquer controvérsias decorrentes da interpretação ou aplicação desta Política de Privacidade serão dirimidas em
            consonância com a legislação brasileira, elegendo-se o foro do:
          </p>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 space-y-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2 font-heading font-bold text-white text-sm">
              <FaScaleBalanced className="size-4 text-emerald-400" />
              <span>FORO REGIONAL VI – PENHA DE FRANÇA</span>
            </div>
            <p className="font-bold text-zinc-200">Comarca de São Paulo / SP</p>
            <p className="text-zinc-400">
              Endereço: Rua Doutor João Ribeiro, nº 433, Penha de França, São Paulo – SP, CEP 03634-010
            </p>
            <p className="text-[11px] text-zinc-500 pt-1">
              Com expressa renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </div>
        </section>
      </div>

      {/* CTA Final */}
      <div className="rounded-2xl border border-zinc-800 bg-card p-6 text-center space-y-3">
        <h4 className="font-heading text-base sm:text-lg font-bold text-white">
          Transparência Total com o Tubarão
        </h4>
        <p className="text-xs font-mono text-zinc-400 max-w-lg mx-auto">
          Conheça também as regras de planos e cobranças ou revise os termos de uso da nossa gruta.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/documentos/planos"
            className="inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all cursor-pointer"
          >
            <span>Ver Planos & Regras</span>
            <FaArrowRight className="size-3" />
          </Link>
          <Link
            href="/documentos/termos"
            className="inline-flex items-center justify-center h-10 px-5 text-xs font-mono font-bold border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl transition-all cursor-pointer"
          >
            <span>Ler Termos de Uso</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

