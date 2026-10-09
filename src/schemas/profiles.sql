-- ==============================================================================
-- Schema: profiles
-- Tabela de perfil do credor, estendendo auth.users (1:1)
-- ==============================================================================

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

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Policies RLS
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

