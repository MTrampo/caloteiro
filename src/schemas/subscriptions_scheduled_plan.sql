-- ==============================================================================
-- Schema Migration: subscriptions_scheduled_plan
-- Adiciona a coluna scheduled_plan_id para gerenciar downgrades e transições de ciclo
-- ==============================================================================

alter table public.subscriptions
  add column if not exists scheduled_plan_id uuid references public.plans(id) on delete set null;

comment on column public.subscriptions.scheduled_plan_id is
  'ID do plano agendado para entrar em vigor após o término do ciclo vigente (current_period_end).';

