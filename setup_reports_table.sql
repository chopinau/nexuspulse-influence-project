-- Create the 'reports' table for full JSON persistence and caching
create table if not exists reports (
  id bigint primary key generated always as identity,
  query text not null,
  report_json jsonb not null,
  created_at timestamptz default now() not null,
  source text default 'manual' -- 'manual', 'cron', etc.
);

-- Create an index on query and created_at for fast cache lookups
create index if not exists reports_query_created_at_idx on reports (query, created_at desc);

-- Enable Row Level Security (RLS)
alter table reports enable row level security;

-- Policy: Allow public read access (or restrict as needed)
create policy "Public reports are viewable by everyone."
  on reports for select
  using ( true );

-- Policy: Allow service role (backend) to insert
create policy "Service role can insert reports."
  on reports for insert
  with check ( true );
