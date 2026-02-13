-- Create reports table to store strategic analysis results
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  topic text not null,
  persona text not null,
  verdict text,
  report_markdown text,
  structured_data jsonb,
  user_id uuid references auth.users(id)
);

-- Set up RLS (Row Level Security)
alter table public.reports enable row level security;

-- Allow read access to everyone (for now, can be restricted later)
create policy "Allow public read access"
  on public.reports for select
  using (true);

-- Allow insert access to everyone (for now, can be restricted later)
create policy "Allow public insert access"
  on public.reports for insert
  with check (true);
