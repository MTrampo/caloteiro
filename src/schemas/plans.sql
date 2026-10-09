-- ==============================================================================
-- Schema: plans
-- Catálogo de planos comerciais vinculados ao Mercado Pago
-- ==============================================================================

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

-- Habilitar RLS
alter table public.plans enable row level security;

-- Policies RLS
drop policy if exists "Planos ativos são visíveis para todos" on public.plans;
create policy "Planos ativos são visíveis para todos"
  on public.plans for select
  using (is_active = true);

