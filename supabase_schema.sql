-- Supabase Schema for PDP Analyzer
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- User profiles for plan tiers and limits
create table user_profiles (
  id uuid references auth.users(id) primary key,
  email text,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  monthly_limit int default 10,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Usage logs for tracking and rate limiting
create table usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  source_url text not null,
  product_category text,
  competitor_brand text,
  competitor_url text,
  created_at timestamptz default now()
);

-- Index for fast rate limit queries
create index usage_logs_user_date on usage_logs(user_id, created_at desc);

-- RLS policies
alter table user_profiles enable row level security;
alter table usage_logs enable row level security;

create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);
create policy "Users can view own logs" on usage_logs
  for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on usage_logs
  for insert with check (auth.uid() = user_id);

-- =============================================
-- FUTURE: Rate Limiting Query (use when ready)
-- =============================================
-- SELECT p.monthly_limit, count(l.id) as used_this_month
-- FROM user_profiles p
-- LEFT JOIN usage_logs l ON l.user_id = p.id 
--   AND l.created_at > date_trunc('month', now())
-- WHERE p.id = auth.uid()
-- GROUP BY p.monthly_limit;

