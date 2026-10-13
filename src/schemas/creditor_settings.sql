-- ==============================================================================
-- Schema: creditor_settings
-- Configurações financeiras do credor (Chave Pix e Templates de Cobrança)
-- ==============================================================================

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
  default_interest_rate numeric(10,2) default 0,
  default_interest_type text default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.creditor_settings enable row level security;

-- Policies RLS
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

