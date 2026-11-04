-- ==============================================================================
-- Schema: subscription_cancellations
-- Registro de cancelamentos e motivos de saída do usuário
-- ==============================================================================

create table if not exists public.subscription_cancellations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  mp_subscription_id text,
  reason text not null,
  reason_details text,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.subscription_cancellations enable row level security;

-- Policies RLS
drop policy if exists "Usuário visualiza seus cancelamentos" on public.subscription_cancellations;
create policy "Usuário visualiza seus cancelamentos"
  on public.subscription_cancellations for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário registra cancelamento" on public.subscription_cancellations;
create policy "Usuário registra cancelamento"
  on public.subscription_cancellations for insert
  with check (auth.uid() = user_id);

