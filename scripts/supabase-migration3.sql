-- ============================================================
-- Supabase Migration: Add flight_date column to registrations
-- Ejecuta este SQL en: Project › SQL Editor › New query
--   https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- Add flight_date column (timestamptz type for datetime with timezone)
alter table public.registrations
add column flight_date timestamptz not null;

-- Add index for filtering by flight date
create index registrations_flight_date_idx
on public.registrations (flight_date);

-- Optional: Add check constraint to ensure datetime is not in future
alter table public.registrations
add constraint registrations_flight_date_not_future
check (flight_date <= now());
