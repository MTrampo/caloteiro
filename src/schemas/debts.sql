-- ==============================================================================
-- Schema: debts, installments, debt_payments, debt_excuses
-- Gestão de Contratos de Dívidas, Cronograma de Parcelas, Extrato Pix e Caôs
-- ==============================================================================

-- 1. Garantir que a tabela debtors existe
create table if not exists public.debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  nickname text,
  relationship smallint not null default 2 check (relationship between 0 and 6),
  document text,
  address text,
  phone text not null,
  pix_key text,
  pix_key_type text,
  notes text,
  is_archived bool default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_debtors_user_id on public.debtors(user_id);
create index if not exists idx_debtors_user_archived on public.debtors(user_id, is_archived);
create index if not exists idx_debtors_name on public.debtors(user_id, name);
create index if not exists idx_debtors_phone on public.debtors(user_id, phone);

alter table public.debtors enable row level security;

drop policy if exists "Tubarão visualiza seus próprios devedores" on public.debtors;
create policy "Tubarão visualiza seus próprios devedores"
  on public.debtors for select using (auth.uid() = user_id);

drop policy if exists "Tubarão insere seus próprios devedores" on public.debtors;
create policy "Tubarão insere seus próprios devedores"
  on public.debtors for insert with check (auth.uid() = user_id);

drop policy if exists "Tubarão atualiza seus próprios devedores" on public.debtors;
create policy "Tubarão atualiza seus próprios devedores"
  on public.debtors for update using (auth.uid() = user_id);

drop policy if exists "Tubarão remove seus próprios devedores" on public.debtors;
create policy "Tubarão remove seus próprios devedores"
  on public.debtors for delete using (auth.uid() = user_id);


-- 2. Tabela debts: O Acordo Geral / Contrato
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  
  title text not null,
  category text not null default 'personal_loan',
  original_amount numeric(10,2) not null check (original_amount > 0),
  installments_count int4 not null default 1 check (installments_count >= 1),
  payment_method text not null default 'pix',
  loan_date date not null default current_date,
  first_due_date date not null,
  interest_type text not null default 'none' check (interest_type in ('none', 'fixed', 'total_percentage', 'monthly_percentage')),
  interest_rate numeric(10,2) default 0,
  total_amount numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'settled', 'defaulted')),
  settled_at timestamptz,
  notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_debts_user_id on public.debts(user_id);
create index if not exists idx_debts_debtor_id on public.debts(debtor_id);
create index if not exists idx_debts_status on public.debts(user_id, status);

alter table public.debts enable row level security;

drop policy if exists "Tubarão visualiza suas próprias dívidas" on public.debts;
create policy "Tubarão visualiza suas próprias dívidas"
  on public.debts for select using (auth.uid() = user_id);

drop policy if exists "Tubarão insere suas próprias dívidas" on public.debts;
create policy "Tubarão insere suas próprias dívidas"
  on public.debts for insert with check (auth.uid() = user_id);

drop policy if exists "Tubarão atualiza suas próprias dívidas" on public.debts;
create policy "Tubarão atualiza suas próprias dívidas"
  on public.debts for update using (auth.uid() = user_id);

drop policy if exists "Tubarão remove suas próprias dívidas" on public.debts;
create policy "Tubarão remove suas próprias dívidas"
  on public.debts for delete using (auth.uid() = user_id);


-- 3. Tabela installments: O Cronograma de Parcelas
create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references public.debts(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  installment_number int4 not null check (installment_number >= 1),
  nominal_amount numeric(10,2) not null check (nominal_amount > 0),
  paid_amount numeric(10,2) not null default 0.00 check (paid_amount >= 0),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'late', 'partially_paid', 'paid')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_installments_debt_id on public.installments(debt_id);
create index if not exists idx_installments_debtor_id on public.installments(debtor_id);
create index if not exists idx_installments_user_id on public.installments(user_id);
create index if not exists idx_installments_due_date on public.installments(user_id, due_date);
create index if not exists idx_installments_status on public.installments(user_id, status);

alter table public.installments enable row level security;

drop policy if exists "Tubarão visualiza suas próprias parcelas" on public.installments;
create policy "Tubarão visualiza suas próprias parcelas"
  on public.installments for select using (auth.uid() = user_id);

drop policy if exists "Tubarão insere suas próprias parcelas" on public.installments;
create policy "Tubarão insere suas próprias parcelas"
  on public.installments for insert with check (auth.uid() = user_id);

drop policy if exists "Tubarão atualiza suas próprias parcelas" on public.installments;
create policy "Tubarão atualiza suas próprias parcelas"
  on public.installments for update using (auth.uid() = user_id);

drop policy if exists "Tubarão remove suas próprias parcelas" on public.installments;
create policy "Tubarão remove suas próprias parcelas"
  on public.installments for delete using (auth.uid() = user_id);


-- 4. Tabela debt_payments: Extrato de Amortizações (Pix que pingaram)
create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references public.debts(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  amount numeric(10,2) not null check (amount > 0),
  notes text,
  paid_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists idx_debt_payments_debt_id on public.debt_payments(debt_id);
create index if not exists idx_debt_payments_user_id on public.debt_payments(user_id);
create index if not exists idx_debt_payments_debtor_id on public.debt_payments(debtor_id);

alter table public.debt_payments enable row level security;

drop policy if exists "Tubarão visualiza seus próprios pagamentos" on public.debt_payments;
create policy "Tubarão visualiza seus próprios pagamentos"
  on public.debt_payments for select using (auth.uid() = user_id);

drop policy if exists "Tubarão insere seus próprios pagamentos" on public.debt_payments;
create policy "Tubarão insere seus próprios pagamentos"
  on public.debt_payments for insert with check (auth.uid() = user_id);

drop policy if exists "Tubarão remove seus próprios pagamentos" on public.debt_payments;
create policy "Tubarão remove seus próprios pagamentos"
  on public.debt_payments for delete using (auth.uid() = user_id);


-- 5. Tabela debt_excuses: Histórico dos Caôs (desculpas/promessas)
create table if not exists public.debt_excuses (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid references public.installments(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  excuse_text text not null,
  promised_date date not null,
  was_honored bool default false,
  
  created_at timestamptz default now()
);

create index if not exists idx_debt_excuses_installment_id on public.debt_excuses(installment_id);
create index if not exists idx_debt_excuses_debtor_id on public.debt_excuses(debtor_id);
create index if not exists idx_debt_excuses_user_id on public.debt_excuses(user_id);

alter table public.debt_excuses enable row level security;

drop policy if exists "Tubarão visualiza seus próprios caôs" on public.debt_excuses;
create policy "Tubarão visualiza seus próprios caôs"
  on public.debt_excuses for select using (auth.uid() = user_id);

drop policy if exists "Tubarão insere seus próprios caôs" on public.debt_excuses;
create policy "Tubarão insere seus próprios caôs"
  on public.debt_excuses for insert with check (auth.uid() = user_id);

drop policy if exists "Tubarão atualiza seus próprios caôs" on public.debt_excuses;
create policy "Tubarão atualiza seus próprios caôs"
  on public.debt_excuses for update using (auth.uid() = user_id);

drop policy if exists "Tubarão remove seus próprios caôs" on public.debt_excuses;
create policy "Tubarão remove seus próprios caôs"
  on public.debt_excuses for delete using (auth.uid() = user_id);

