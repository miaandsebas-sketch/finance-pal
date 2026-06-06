-- Run this in the existing mia-seb-apps Supabase project.
-- households, household_members, and my_household_id() already exist — skip them.

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

-- Realtime
-- REPLICA IDENTITY FULL ensures all columns appear in UPDATE/DELETE payloads.
alter publication supabase_realtime add table user_accounts, account_snapshots, investment_purchases, investment_types, home_improvement_items;
alter table user_accounts          replica identity full;
alter table account_snapshots      replica identity full;
alter table investment_purchases   replica identity full;
alter table investment_types       replica identity full;
alter table home_improvement_items replica identity full;
