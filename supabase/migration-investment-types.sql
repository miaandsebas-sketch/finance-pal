-- Migration: configurable investment types
-- Run this in the mia-seb-apps Supabase SQL editor.

create table investment_types (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  key text not null,
  label text not null,
  emoji text not null default '📈',
  color text not null default '#0f766e',
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  unique (household_id, key)
);

alter table investment_types enable row level security;
create policy "household access" on investment_types
  for all using (household_id = my_household_id());

-- Seed with the 3 existing hardcoded types
do $$
declare hh_id uuid;
begin
  select id into hh_id from households limit 1;
  insert into investment_types (household_id, key, label, emoji, color, sort_order) values
    (hh_id, 'gold',            'Gold',             '🪙', '#f59e0b', 1),
    (hh_id, 'ibkr_mingyue',   'IBKR — Mingyue',  '📈', '#0f766e', 2),
    (hh_id, 'ibkr_sebastian', 'IBKR — Sebastian', '📈', '#6366f1', 3);
end $$;
