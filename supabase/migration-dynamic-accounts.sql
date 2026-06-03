-- Migration: dynamic accounts
-- Run this in the mia-seb-apps Supabase SQL editor.
-- account_snapshots is unchanged — account_key stays as text.

create table user_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  key text not null,                    -- matches account_key in account_snapshots
  label text not null,
  owner text not null default 'Both',   -- 'Sebastian' | 'Mingyue' | 'Both'
  goal numeric(14,2),
  is_debt boolean not null default false,
  sort_order integer not null default 0,
  archived_at timestamptz,              -- null = active, set = removed
  created_at timestamptz default now(),
  unique (household_id, key)
);

alter table user_accounts enable row level security;
create policy "household access" on user_accounts
  for all using (household_id = my_household_id());

-- Seed the 13 existing accounts
do $$
declare hh_id uuid;
begin
  select id into hh_id from households limit 1;
  insert into user_accounts (household_id, key, label, owner, goal, is_debt, sort_order) values
    (hh_id, 'sebastian_ac',        'Sebastian — A/C',        'Sebastian', 15000,   false,  1),
    (hh_id, 'mingyue_ac',          'Mingyue — A/C',          'Mingyue',   160000,  false,  2),
    (hh_id, 'combined_ac',         'Combined — A/C',         'Both',      5000,    false,  3),
    (hh_id, 'sebastian_cpf',       'Sebastian — CPF',        'Sebastian', null,    false,  4),
    (hh_id, 'mingyue_cpf',         'Mingyue — CPF',          'Mingyue',   null,    false,  5),
    (hh_id, 'sebastian_srs',       'Sebastian — SRS',        'Sebastian', null,    false,  6),
    (hh_id, 'mingyue_srs',         'Mingyue — SRS',          'Mingyue',   null,    false,  7),
    (hh_id, 'sebastian_insurance', 'Sebastian — Insurance',  'Sebastian', null,    false,  8),
    (hh_id, 'mingyue_td',          'Mingyue — Time Deposit', 'Mingyue',   null,    false,  9),
    (hh_id, 'mingyue_ibkr',       'Mingyue — IBKR',         'Mingyue',   11000,   false, 10),
    (hh_id, 'sebastian_ibkr',     'Sebastian — IBKR',       'Sebastian', null,    false, 11),
    (hh_id, 'gold',                'Gold',                   'Both',      8000,    false, 12),
    (hh_id, 'housing_loan',        'Housing Loan',           'Both',      null,    true,  13);
end $$;
