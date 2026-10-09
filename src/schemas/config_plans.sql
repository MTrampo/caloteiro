-- ==============================================================================
-- Schema: config_plans
-- Definição de limites e feature flags dos planos
-- ==============================================================================

create table if not exists public.config_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  max_debtors int4 default 1,            -- NULL indica devedores ilimitados
  custom_templates boolean default false, -- Se pode customizar templates de cobrança
  export_reports boolean default false,   -- Se pode exportar relatórios
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.config_plans enable row level security;

-- Policies RLS
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

