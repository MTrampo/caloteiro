-- ==============================================================================
-- Schema: subscriptions
-- Assinatura ativa vinculada 1:1 diretamente ao usuário credor
-- ==============================================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan_id uuid references public.plans(id) on delete set null,
  scheduled_plan_id uuid references public.plans(id) on delete set null,
  mp_subscription_id text unique,        -- ID da assinatura no Mercado Pago
  mp_payer_id int8,
  mp_payer_email text,
  mp_status text default 'pending',      -- 'authorized', 'paused', 'cancelled', etc.
  base_value numeric(10,2) not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.subscriptions enable row level security;

-- Policies RLS
drop policy if exists "Usuário acessa sua própria assinatura" on public.subscriptions;
create policy "Usuário acessa sua própria assinatura"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário atualiza sua própria assinatura" on public.subscriptions;
create policy "Usuário atualiza sua própria assinatura"
  on public.subscriptions for update
  using (auth.uid() = user_id);

