-- Household scaffold
create table households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

create or replace function my_household_id()
returns uuid language sql stable
as $$ select household_id from household_members where user_id = auth.uid() limit 1 $$;

alter table household_members enable row level security;
create policy "own row only" on household_members
  for all using (user_id = auth.uid());

-- Account balance snapshots
-- One row per (household, account_key, date) — upsert-safe via unique constraint
create table account_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  account_key text not null,
  amount numeric(14,2) not null,
  snapshot_date date not null,
  created_at timestamptz default now(),
  unique (household_id, account_key, snapshot_date)
);

alter table account_snapshots enable row level security;
create policy "household access" on account_snapshots
  for all using (household_id = my_household_id());

-- Investment purchase log
create table investment_purchases (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  inv_type text not null,        -- 'gold' | 'ibkr_mingyue' | 'ibkr_sebastian'
  amount numeric(14,2) not null,
  purchase_date date not null,
  url text,
  created_at timestamptz default now()
);

alter table investment_purchases enable row level security;
create policy "household access" on investment_purchases
  for all using (household_id = my_household_id());

-- Home improvement wishlist
create table home_improvement_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  title text not null,
  description text,
  proposer text,
  approver text,
  status text not null default 'Pending Decision',
  urgency text not null default 'Urgent',
  importance text not null default 'Important',
  funded_by text,
  estimated_budget numeric(10,2),
  remarks text,
  created_at timestamptz default now()
);

alter table home_improvement_items enable row level security;
create policy "household access" on home_improvement_items
  for all using (household_id = my_household_id());

-- Seed: one household for Mia & Sebastian
insert into households (id) values ('00000000-0000-0000-0000-000000000001');

-- After signing up both users in Supabase Auth, insert a row for each:
-- insert into household_members (household_id, user_id, display_name)
-- values ('00000000-0000-0000-0000-000000000001', '<sebastian-user-id>', 'Sebastian');
-- insert into household_members (household_id, user_id, display_name)
-- values ('00000000-0000-0000-0000-000000000001', '<mingyue-user-id>', 'Mingyue');
