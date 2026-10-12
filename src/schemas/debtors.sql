-- ==============================================================================
-- Schema: debtors
-- Gestão de devedores / figurinhas cadastradas pelo Tubarão
-- ==============================================================================

-- Tabela principal de devedores
create table if not exists public.debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Identificação Básica
  name text not null,                  -- Nome completo / de batismo
  nickname text,                       -- Apelido / Vulgo (ex: "Marcio da Oficina")
  relationship smallint not null default 2 check (relationship between 0 and 6),
  
  -- Localização & Rastreio (Opcionais)
  document text,                       -- CPF do devedor (apenas dígitos)
  address text,                        -- Linha única: "Rua X, 120 - próx. ao mercado"
  
  -- Contato & Recebimento
  phone text not null,                 -- Telefone com DDD (apenas dígitos para wa.me)
  pix_key text,                        -- Chave Pix do devedor
  pix_key_type text,                   -- 'cpf', 'cnpj', 'phone', 'email', 'random'
  
  -- Anotações e Gestão
  notes text,                          -- Observações gerais do indivíduo
  is_archived bool default false,      -- Esconder do radar sem apagar histórico
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices de performance
create index if not exists idx_debtors_user_id on public.debtors(user_id);
create index if not exists idx_debtors_user_archived on public.debtors(user_id, is_archived);
create index if not exists idx_debtors_name on public.debtors(user_id, name);
create index if not exists idx_debtors_phone on public.debtors(user_id, phone);

-- Habilitar RLS
alter table public.debtors enable row level security;

-- Políticas RLS (Row Level Security)
drop policy if exists "Tubarão visualiza seus próprios devedores" on public.debtors;
create policy "Tubarão visualiza seus próprios devedores"
  on public.debtors for select
  using (auth.uid() = user_id);

drop policy if exists "Tubarão insere seus próprios devedores" on public.debtors;
create policy "Tubarão insere seus próprios devedores"
  on public.debtors for insert
  with check (auth.uid() = user_id);

drop policy if exists "Tubarão atualiza seus próprios devedores" on public.debtors;
create policy "Tubarão atualiza seus próprios devedores"
  on public.debtors for update
  using (auth.uid() = user_id);

drop policy if exists "Tubarão remove seus próprios devedores" on public.debtors;
create policy "Tubarão remove seus próprios devedores"
  on public.debtors for delete
  using (auth.uid() = user_id);

