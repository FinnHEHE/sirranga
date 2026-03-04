-- Create apps table
create table if not exists public.apps (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  url text,
  icon text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security
alter table public.apps enable row level security;

-- Allow public read access
create policy "Public read access"
  on public.apps
  for select
  using (true);

-- Allow all writes (since you handle auth on the frontend)
create policy "Allow all inserts"
  on public.apps
  for insert
  with check (true);

create policy "Allow all deletes"
  on public.apps
  for delete
  using (true);
