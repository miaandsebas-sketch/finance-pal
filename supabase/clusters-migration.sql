-- Dashboard clusters — named sums of accounts for the Finance Pal overview.
-- Run this in the Supabase SQL editor after the main schema.sql has been applied.

create table dashboard_clusters (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name         text not null,
  account_keys text[] not null default '{}',
  sort_order   integer default 0,
  created_at   timestamptz default now()
);

alter table dashboard_clusters enable row level security;
create policy "household access" on dashboard_clusters
  for all using (household_id = my_household_id());

-- Realtime
alter publication supabase_realtime add table dashboard_clusters;
alter table dashboard_clusters replica identity full;
