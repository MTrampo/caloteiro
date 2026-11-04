-- ==============================================================================
-- Migration: profiles_status_retention
-- Adiciona controle de status de conta, quarentena legal de 6 meses (Marco Civil/LGPD)
-- e bloqueio permanente de e-mails banidos.
-- ==============================================================================

alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'deleted', 'banned', 'suspended')),
  add column if not exists status_reason text,
  add column if not exists deleted_at timestamptz,
  add column if not exists retention_until timestamptz;

-- Índices de consulta para validação de e-mails banidos e quarentena de expurgo
create index if not exists idx_profiles_status_email on public.profiles(email, status);
create index if not exists idx_profiles_retention_purge on public.profiles(status, retention_until)
  where status in ('deleted', 'suspended');

