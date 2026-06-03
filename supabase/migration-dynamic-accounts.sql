-- Migration: make accounts dynamic
-- Run this in the mia-seb-apps Supabase SQL editor

-- 1. New user_accounts table
create table user_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  label text not null,
  owner text not null default 'Both',   -- 'Sebastian' | 'Mingyue' | 'Both'
  goal numeric(14,2),
  is_debt boolean not null default false,
  sort_order integer not null default 0,
  archived_at timestamptz,              -- null = active, set = removed
  created_at timestamptz default now()
);

alter table user_accounts enable row level security;
create policy "household access" on user_accounts
  for all using (household_id = my_household_id());

-- 2. Seed the 13 existing accounts (uses whichever household exists)
do $$
declare hh_id uuid;
begin
  select id into hh_id from households limit 1;
  insert into user_accounts (household_id, label, owner, goal, is_debt, sort_order) values
    (hh_id, 'Sebastian — A/C',        'Sebastian', 15000,   false,  1),
    (hh_id, 'Mingyue — A/C',          'Mingyue',   160000,  false,  2),
    (hh_id, 'Combined — A/C',         'Both',      5000,    false,  3),
    (hh_id, 'Sebastian — CPF',        'Sebastian', null,    false,  4),
    (hh_id, 'Mingyue — CPF',          'Mingyue',   null,    false,  5),
    (hh_id, 'Sebastian — SRS',        'Sebastian', null,    false,  6),
    (hh_id, 'Mingyue — SRS',          'Mingyue',   null,    false,  7),
    (hh_id, 'Sebastian — Insurance',  'Sebastian', null,    false,  8),
    (hh_id, 'Mingyue — Time Deposit', 'Mingyue',   null,    false,  9),
    (hh_id, 'Mingyue — IBKR',        'Mingyue',   11000,   false, 10),
    (hh_id, 'Sebastian — IBKR',      'Sebastian', null,    false, 11),
    (hh_id, 'Gold',                   'Both',      8000,    false, 12),
    (hh_id, 'Housing Loan',           'Both',      null,    true,  13);
end $$;

-- 3. Migrate account_snapshots: replace text account_key with uuid account_id
--    Safe to truncate since the app just launched and has no real snapshot data yet.
--    If you have real data, comment out the truncate and handle the migration manually.
truncate account_snapshots;

alter table account_snapshots
  drop constraint account_snapshots_household_id_account_key_snapshot_date_key,
  drop column account_key,
  add column account_id uuid not null references user_accounts(id),
  add constraint account_snapshots_unique unique (household_id, account_id, snapshot_date);
