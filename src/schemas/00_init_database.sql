-- ==============================================================================
-- CALOTEIRO - MIGRATION CONSOLIDADA DE INICIALIZAÇÃO
-- Projeto Supabase: jpryhtyimkhgowvzoyxr
-- Execute este script completo no SQL Editor do Supabase
-- ==============================================================================

-- 1. EXTENSÃO DO USUÁRIO CREDOR (PROFILES)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  nickname text,
  email text,
  avatar_url text,
  phone text,
  accepted_terms boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Usuário visualiza seu próprio perfil" on public.profiles;
create policy "Usuário visualiza seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Usuário atualiza seu próprio perfil" on public.profiles;
create policy "Usuário atualiza seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Aplicação cria perfil do usuário" on public.profiles;
create policy "Aplicação cria perfil do usuário"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. CONFIGURAÇÕES E LIMITES DE PLANOS (CONFIG_PLANS)
create table if not exists public.config_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  max_debtors int4 default 1,            -- NULL = ilimitado
  custom_templates boolean default false, -- se pode editar mensagens de WhatsApp
  export_reports boolean default false,   -- se pode exportar relatórios
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.config_plans enable row level security;

drop policy if exists "Planos de configuração são visíveis para autenticados" on public.config_plans;
create policy "Planos de configuração são visíveis para autenticados"
  on public.config_plans for select
  to authenticated
  using (true);

drop policy if exists "Planos de configuração públicos para consulta" on public.config_plans;
create policy "Planos de configuração públicos para consulta"
  on public.config_plans for select
  to anon
  using (true);

-- 3. CATÁLOGO COMERCIAL DE PLANOS (PLANS)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  config_plan_id uuid references public.config_plans(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  billing_period text default 'monthly', -- 'monthly' | 'yearly'
  mp_plan_id text,                       -- ID do plano preapproval no Mercado Pago
  badge text,
  is_featured boolean default false,
  is_active boolean default true,
  sort_order int4 default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.plans enable row level security;

drop policy if exists "Planos ativos são visíveis para todos" on public.plans;
create policy "Planos ativos são visíveis para todos"
  on public.plans for select
  using (is_active = true);

-- 4. ASSINATURAS DO USUÁRIO (SUBSCRIPTIONS)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan_id uuid references public.plans(id) on delete set null,
  mp_subscription_id text unique,
  mp_payer_id int8,
  mp_payer_email text,
  mp_status text default 'pending',      -- 'authorized', 'paused', 'cancelled', etc.
  base_value numeric(10,2) not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Usuário acessa sua própria assinatura" on public.subscriptions;
create policy "Usuário acessa sua própria assinatura"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário atualiza sua própria assinatura" on public.subscriptions;
create policy "Usuário atualiza sua própria assinatura"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- 5. HISTÓRICO DE FATURAS DO MERCADO PAGO (INVOICES)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  mp_invoice_id text,
  mp_subscription_id text,
  amount numeric(10,2) not null,
  currency text default 'BRL',
  status text not null,                  -- 'approved', 'rejected', etc.
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz default now()
);

alter table public.invoices enable row level security;

drop policy if exists "Usuário visualiza suas próprias faturas" on public.invoices;
create policy "Usuário visualiza suas próprias faturas"
  on public.invoices for select
  using (auth.uid() = user_id);

-- 6. FEEDBACK DE CANCELAMENTO (SUBSCRIPTION_CANCELLATIONS)
create table if not exists public.subscription_cancellations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  mp_subscription_id text,
  reason text not null,
  reason_details text,
  created_at timestamptz default now()
);

alter table public.subscription_cancellations enable row level security;

drop policy if exists "Usuário visualiza seus cancelamentos" on public.subscription_cancellations;
create policy "Usuário visualiza seus cancelamentos"
  on public.subscription_cancellations for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário registra cancelamento" on public.subscription_cancellations;
create policy "Usuário registra cancelamento"
  on public.subscription_cancellations for insert
  with check (auth.uid() = user_id);

-- 7. CONFIGURAÇÕES FINANCEIRAS DO CREDOR (CREDITOR_SETTINGS)
create table if not exists public.creditor_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  pix_key_type text,                     -- 'cpf', 'cnpj', 'email', 'phone', 'random'
  pix_key text,
  pix_holder_name text,
  pix_bank_name text,
  template_friendly text,                -- Nível 1: Amigável
  template_acid text,                    -- Nível 2: Sarcástico
  template_critical text,                -- Nível 3: Quebra / Ação
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.creditor_settings enable row level security;

drop policy if exists "Usuário visualiza suas configurações de credor" on public.creditor_settings;
create policy "Usuário visualiza suas configurações de credor"
  on public.creditor_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário insere suas configurações de credor" on public.creditor_settings;
create policy "Usuário insere suas configurações de credor"
  on public.creditor_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuário atualiza suas configurações de credor" on public.creditor_settings;
create policy "Usuário atualiza suas configurações de credor"
  on public.creditor_settings for update
  using (auth.uid() = user_id);

-- ==============================================================================
-- 8. SEEDS INICIAIS DE PLANOS DO CALOTEIRO
-- ==============================================================================
do $$
declare
  c_iniciante uuid;
  c_barriga uuid;
  c_blindado uuid;
begin
  -- Configurações de Planos
  insert into public.config_plans (name, max_debtors, custom_templates, export_reports, is_default)
  values ('Iniciante', 3, false, false, true)
  returning id into c_iniciante;

  insert into public.config_plans (name, max_debtors, custom_templates, export_reports, is_default)
  values ('Profissional', 25, true, true, false)
  returning id into c_barriga;

  insert into public.config_plans (name, max_debtors, custom_templates, export_reports, is_default)
  values ('Ilimitado', null, true, true, false)
  returning id into c_blindado;

  -- Catálogo de Preços
  insert into public.plans (config_plan_id, name, slug, description, price, billing_period, badge, is_featured, is_active, sort_order)
  values
    (c_iniciante, 'Tiro de Festim', 'tiro-de-festim', 'Para quem emprestou dinheiro pro primo e só quer um susto de leve.', 19.90, 'monthly', 'Iniciante', false, true, 1),
    (c_barriga, 'Modo Seu Barriga', 'modo-seu-barriga', 'Pague o aluguel! Cobrança cirúrgica, templates venenosos e controle absoluto dos calotes.', 39.90, 'monthly', 'Mais Popular', true, true, 2),
    (c_blindado, 'Cofre Blindado', 'cofre-blindado', 'Para credores de alta patente. Devedores ilimitados e pressão máxima.', 69.90, 'monthly', 'Sem Limites', false, true, 3)
  on conflict (slug) do nothing;
end $$;

