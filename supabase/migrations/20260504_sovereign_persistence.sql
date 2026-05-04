-- Sovereign System Persistence
-- Migration to move all local state to Supabase

create table if not exists system_configs (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists evolution_logs (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  change_type text not null, -- 'feature', 'fix', 'optimization'
  description text not null,
  diff jsonb null,
  status text not null default 'applied', -- 'proposed', 'applied', 'rolled_back'
  created_at timestamptz not null default now()
);

create table if not exists approval_queue (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  decision_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orchestration_plans (
  id uuid primary key default gen_random_uuid(),
  user_request text not null,
  plan_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  final_output text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger approval_queue_set_updated_at before update on approval_queue
for each row execute function set_updated_at();

create trigger orchestration_plans_set_updated_at before update on orchestration_plans
for each row execute function set_updated_at();
