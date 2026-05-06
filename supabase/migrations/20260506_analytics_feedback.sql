-- Table to track individual post performance
create table if not exists public.content_performance (
  id uuid primary key default gen_random_uuid(),
  post_id text not null, -- The ID from the social platform
  agent_id text not null,
  platform text not null, -- tiktok, instagram, youtube
  content_type text, -- video, image, text
  metrics jsonb default '{}'::jsonb, -- { "views": 100, "likes": 10, "shares": 2, "comments": 5 }
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(post_id, platform)
);

-- Table for synthesized performance insights (the "Lessons Learned")
create table if not exists public.performance_insights (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  insight text not null, -- e.g., "Fast-paced intros with captions increase retention by 20%"
  confidence float default 0.5,
  evidence_post_ids text[], -- List of post_ids that support this insight
  category text, -- 'hook', 'editing', 'topic', 'hashtag'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indices for faster querying
create index if not exists idx_content_perf_agent on public.content_performance(agent_id);
create index if not exists idx_perf_insights_agent on public.performance_insights(agent_id);
