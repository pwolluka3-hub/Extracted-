-- Table to track actual live posts on social platforms
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  plan_id uuid references public.autonomous_plans(id) on delete cascade,
  platform text not null, -- tiktok, instagram, youtube
  external_post_id text, -- The ID returned by the social API
  video_url text not null,
  caption text,
  status text default 'pending', -- 'pending', 'uploading', 'published', 'failed'
  live_url text, -- The final public URL of the post
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for tracking an agent's publishing history
create index if not exists idx_social_posts_agent on public.social_posts(agent_id);
create index if not exists idx_social_posts_status on public.social_posts(status);
