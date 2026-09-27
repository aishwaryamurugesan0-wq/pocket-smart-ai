-- ---------------------------------------------------------------------
-- Pocket Smart AI — Supabase schema
-- ---------------------------------------------------------------------
-- Run this in your Supabase project's SQL editor if you want to move
-- from the built-in local-storage mode to a real Postgres backend with
-- Supabase Auth. The app works fully without this file (see README.md).
-- ---------------------------------------------------------------------

-- PROFILES ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  currency text not null default 'INR',
  monthly_income numeric not null default 0,
  savings_goal numeric not null default 0,
  budget_style text default 'balanced',
  categories text[] default array['Food','Transport','Shopping','Education','Bills','Entertainment','Health','Travel','Family','Other'],
  onboarded boolean not null default false,
  theme text default 'light',
  notification_preference boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- TRANSACTIONS -------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  description text,
  payment_method text,
  transaction_date date not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on transactions(user_id);
create index if not exists transactions_date_idx on transactions(transaction_date);

-- BUDGETS ------------------------------------------------------------------
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  amount numeric not null check (amount >= 0),
  month int not null check (month between 1 and 12),
  year int not null,
  created_at timestamptz not null default now(),
  unique (user_id, category, month, year)
);

-- SAVINGS GOALS --------------------------------------------------------------
create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  target_date date,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS ---------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY: every table is locked to auth.uid() = user_id
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table savings_goals enable row level security;
alter table notifications enable row level security;

create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own savings goals" on savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own notifications" on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Automatically create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
