-- Enable the pgvector extension to enable vector processing
create extension if not exists vector;

-- Create the agent_vector_memory table
create table if not exists public.agent_vector_memory (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  content text not null,
  embedding vector(1536), -- 1536 is the dimension for text-embedding-3-small
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for faster similarity search
create index if not exists on public.agent_vector_memory 
using hnsw (embedding vector_cosine_ops);

-- Create the RPC function for similarity search
create or replace function match_agent_memories (
  query_embedding vector(1536),
  filter_agent_id text,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  agent_id text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    m.id,
    m.agent_id,
    m.content,
    m.metadata,
    1 - (m.embedding <=> query_embedding) as similarity
  from agent_vector_memory m
  where m.agent_id = filter_agent_id
    and 1 - (m.embedding <=> query_embedding) > match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
end;
$$;
