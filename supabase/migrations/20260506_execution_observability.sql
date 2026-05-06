-- Table to track the real-time execution trace of agent actions
create table if not exists public.agent_action_logs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  plan_id uuid references public.autonomous_plans(id) on delete cascade,
  step_id uuid references public.plan_steps(id) on delete cascade,
  status text not null, -- 'thinking', 'acting', 'completed', 'failed', 'waiting'
  message text not null, -- The human-readable status message
  metadata jsonb default '{}'::jsonb, -- Any extra data (e.g. tool name, error details)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast retrieval of a specific agent's current timeline
create index if not exists idx_action_logs_agent on public.agent_action_logs(agent_id);
create index if not exists idx_action_logs_created on public.agent_action_logs(created_at);
