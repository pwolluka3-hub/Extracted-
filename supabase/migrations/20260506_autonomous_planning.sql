-- Table for high-level autonomous plans
create table if not exists public.autonomous_plans (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  goal text not null,
  description text,
  status text default 'active', -- 'active', 'completed', 'paused', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for atomic steps within a plan
create table if not exists public.plan_steps (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.autonomous_plans(id) on delete cascade,
  step_order int not null,
  description text not null,
  action_type text, -- e.g., 'research', 'generate', 'post', 'analyze'
  status text default 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  dependencies text[], -- IDs of steps that must be completed first
  result_summary text, -- What happened during this step
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices for fast plan lookup
create index if not exists idx_plans_agent on public.autonomous_plans(agent_id);
create index if not exists idx_steps_plan on public.plan_steps(plan_id);
