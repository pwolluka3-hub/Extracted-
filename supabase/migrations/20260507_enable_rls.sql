-- Enable RLS for all tables and define security policies
-- Migration: 20260507_enable_rls.sql

-- 1. Workspaces
alter table public.workspaces enable row level security;
create policy "Users can manage their own workspaces" on public.workspaces
  for all using (auth.uid() = user_id);

-- 2. Brand Kits
alter table public.brand_kits enable row level security;
create policy "Users can manage their own brand kits" on public.brand_kits
  for all using (auth.uid() = user_id);

-- 3. Drafts
alter table public.drafts enable row level security;
create policy "Users can manage their own drafts" on public.drafts
  for all using (auth.uid() = user_id);

-- 4. App Settings
alter table public.app_settings enable row level security;
create policy "Users can manage their own app settings" on public.app_settings
  for all using (auth.uid() = user_id);

-- 5. Chat Threads
alter table public.chat_threads enable row level security;
create policy "Users can manage their own chat threads" on public.chat_threads
  for all using (auth.uid() = user_id);

-- 6. User State
alter table public.user_state enable row level security;
create policy "Users can manage their own user state" on public.user_state
  for all using (auth.uid() = user_id);

-- 7. Content Performance
alter table public.content_performance enable row level security;
create policy "Users can view their own content performance" on public.content_performance
  for select using (
    exists (
      select 1 from public.workspaces 
      where workspaces.user_id = auth.uid() 
      and content_performance.agent_id = workspaces.id -- Assuming agent_id might be workspace_id in some contexts or linked
    )
    or (content_performance.agent_id = auth.uid())
  );

-- 8. Performance Insights
alter table public.performance_insights enable row level security;
create policy "Users can view their own insights" on public.performance_insights
  for select using (performance_insights.agent_id = auth.uid());

-- 9. Autonomous Plans
alter table public.autonomous_plans enable row level security;
create policy "Users can manage their own autonomous plans" on public.autonomous_plans
  for all using (autonomous_plans.agent_id = auth.uid());

-- 10. Plan Steps
alter table public.plan_steps enable row level security;
create policy "Users can view steps of their own plans" on public.plan_steps
  for all using (
    exists (
      select 1 from public.autonomous_plans 
      where autonomous_plans.id = plan_steps.plan_id 
      and autonomous_plans.agent_id = auth.uid()
    )
  );

-- 11. Agent Action Logs
alter table public.agent_action_logs enable row level security;
create policy "Users can view their own agent logs" on public.agent_action_logs
  for select using (agent_action_logs.agent_id = auth.uid());

-- 12. Agent Vector Memory
alter table public.agent_vector_memory enable row level security;
create policy "Users can manage their own vector memory" on public.agent_vector_memory
  for all using (agent_vector_memory.agent_id = auth.uid());

-- 13. Social Posts
alter table public.social_posts enable row level security;
create policy "Users can manage their own social posts" on public.social_posts
  for all using (social_posts.agent_id = auth.uid());

-- 14. System Configs (Read-only for authenticated users)
alter table public.system_configs enable row level security;
create policy "Authenticated users can read system configs" on public.system_configs
  for select using (auth.role() = 'authenticated');

-- 15. Evolution Logs (Read-only for authenticated users)
alter table public.evolution_logs enable row level security;
create policy "Authenticated users can read evolution logs" on public.evolution_logs
  for select using (auth.role() = 'authenticated');

-- 16. Approval Queue
alter table public.approval_queue enable row level security;
create policy "Authenticated users can view approval queue" on public.approval_queue
  for select using (auth.role() = 'authenticated');
