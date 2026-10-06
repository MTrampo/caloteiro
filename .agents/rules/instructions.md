---
trigger: always_on
---

# Diretrizes de Desenvolvimento e Arquitetura do Projeto

Você é um assistente de codificação sénior a atuar neste projeto. Siga rigorosamente as regras abaixo para garantir a consistência, segurança e qualidade do código.

## 1. Stack Tecnológico
* **Framework:** Next.js 16 (App Router)
* **Estilização:** Tailwind CSS
* **Componentes de UI:** Shadcn UI
* **Backend as a Service / DB:** Supabase (Autenticação com @supabase/ssr, Base de Dados, Storage, RLS)
* **Validação:** Zod
* **Pagamentos:** Mercado Pago

## 2. Padrão Arquitetural e Estrutura de Pastas (Monólito em Camadas)
Respeite estritamente a localização e a responsabilidade de cada pasta. Não crie atalhos ('gambiarras') ou misture camadas.

* `src/app`: Páginas e rotas do Next.js (Server e Client Components).
* `src/components/ui`: Componentes base do Shadcn UI.
* `src/components/*`: Componentes reutilizáveis compostos (buttons, cards, dialogs, forms, etc.).
* `src/features`: Componentes de escopo específico ou blocos de páginas (debtors, debts, dashboard, etc.).
* `src/actions`: Módulos de integração (Server Actions) entre a interface e o domínio de negócio.
* `src/back`: Camada de domínio, regras de negócio e persistência, dividida por módulos (ex: `src/back/debtors`).
* `src/store`: Gestão de estado global de cliente (se estritamente necessário, via Zustand).
* `src/commons`: Utilitários, esquemas Zod partilhados, enums, modelos, tipos globais e clientes base.
* `src/schemas`: Scripts de migração SQL, políticas RLS e definições de tabelas do Supabase.

## 3. Fluxo de Dados e Regras de Camadas (Crucial)
O fluxo de execução deve respeitar uma hierarquia rigorosa: **UI -> Action -> Service -> Repository**.

* **UI (Pages/Features):** Consomem as Actions. Podem ser Server Components ou Client Components.
* **Actions (`src/actions`):**
  * Devem conter obrigatoriamente a diretiva `'use server'` no topo do ficheiro.
  * Têm de validar a sessão do utilizador autenticado antes de qualquer chamada.
  * Têm de validar a entrada de dados via **Zod** antes de chamar a camada de Service.
  * Retornam sempre uma resposta tipada padronizada: `{ success: true, data: T }` ou `{ success: false, error: string }`.
  * Não acedem à base de dados diretamente; delegam a execução aos Services.
* **Services (`src/back/[dominio]/service/*.api.ts`):**
  * Concentram toda a regra de negócio (cálculos de juros, penalizações, validações de contrato).
  * São orquestrados apenas pelas Actions.
  * Consomem os Repositories para carregar ou gravar dados.
* **Repositories (`src/back/[dominio]/repository/*.supabase.ts`):**
  * Contêm a lógica de acesso a dados (Supabase, consultas e mutações).
  * Operam com o cliente Supabase associado à sessão do utilizador (`@supabase/ssr`).
  * Toda e qualquer operação de escrita e leitura deve respeitar o isolamento por utilizador (`userId`) e políticas ativas de Row Level Security (RLS).
  * O tipo de dados deve seguir a tipagem gerada do Supabase (`src/commons/types/database.types.ts`).

## 4. Diretrizes para Criação de Componentes
* **Prioridade Shadcn:** Antes de criar qualquer componente, verifique a pasta `src/components/ui`.
* **Componentes Compostos:** Se o componente base do Shadcn não existir, consulte a documentação ou instale-o via CLI. Utilize-o como alicerce para componentes compostos em `src/components` ou `src/features`.
* **Evite o Zero:** Nunca reconstrua do zero componentes fundamentais (modais, comboboxes, dropdowns, alerts) que já existem no ecossistema Shadcn.
* **Estilização:** Utilize unicamente o utilitário `cn()` para fundir e intercalar classes Tailwind.

## 5. Qualidade de Código e Segurança Financeira
* **Tipagem Estrita:** Tipagem forte em TypeScript. O uso de `any`, `as any` ou casts forçados é proibido.
* **Cálculos Financeiros:** Valores monetários devem ser processados de forma precisa (preferencialmente em cêntimos inteiros para evitar imprecisões de ponto flutuante).
* **Gestão de Datas:** Datas de vencimento e auditoria devem ser normalizadas para evitar discrepâncias entre o servidor (UTC) e a timezone local do utilizador.
* **Tratamento de Exceções:** Repositories lançam erros de persistência; Services capturam e aplicam a semântica de negócio; Actions formatam a mensagem final de forma segura para o utilizador.
* **Assincronismo:** Utilize invariavelmente `async/await`. O uso de `.then()` e `.catch()` encadeados é desaconselhado.

## 6. Documentação e Ferramental (MCP)
* Sempre que precisar de confirmar especificações do Supabase, Mercado Pago, Next.js ou Shadcn UI, utilize os recursos MCP disponíveis para validar padrões actualizados antes de gerar soluções complexas.