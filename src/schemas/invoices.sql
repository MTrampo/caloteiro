-- ==============================================================================
-- Schema: invoices
-- Histórico de faturas e pagamentos gerados pelo Mercado Pago
-- ==============================================================================

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  mp_invoice_id text unique,
  mp_subscription_id text,
  amount numeric(10,2) not null,
  currency text default 'BRL',
  status text not null,                  -- 'approved', 'rejected', 'pending', etc.
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.invoices enable row level security;

-- Policies RLS
drop policy if exists "Usuário visualiza suas próprias faturas" on public.invoices;
create policy "Usuário visualiza suas próprias faturas"
  on public.invoices for select
  using (auth.uid() = user_id);

