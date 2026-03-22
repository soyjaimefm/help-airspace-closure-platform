-- ============================================================
-- Supabase Migration: Create cancelled_flights table for multiple flights per registration
-- Ejecuta este SQL en: Project › SQL Editor › New query
--   https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- Create cancelled_flights table (one-to-many relationship with registrations)
create table public.cancelled_flights (
  id              bigint primary key generated always as identity,
  registration_id bigint        not null references public.registrations(id) on delete cascade,
  flight_number   text          not null,
  airline         text          not null,
  flight_date     timestamptz   not null,
  created_at      timestamptz   not null default now(),
  -- Prevent duplicate flights per registration
  unique(registration_id, flight_number)
);

comment on table public.cancelled_flights
  is 'Cancelled flights linked to registrations (one registration can have multiple cancelled flights)';

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.cancelled_flights enable row level security;

-- Anónimo puede INSERT (formulario público)
create policy "public_can_insert"
  on public.cancelled_flights
  for insert
  to anon
  with check (true);

-- Solo usuarios autenticados pueden leer
create policy "authenticated_can_select"
  on public.cancelled_flights
  for select
  to authenticated
  using (true);

-- ── Índices ──────────────────────────────────────────────────────────────────

-- Búsqueda rápida por registration_id (joins con registrations)
create index cancelled_flights_registration_id_idx
  on public.cancelled_flights (registration_id);

-- Filtro por fecha de vuelo en reportes
create index cancelled_flights_flight_date_idx
  on public.cancelled_flights (flight_date desc);

-- Búsqueda por numero de vuelo
create index cancelled_flights_flight_number_idx
  on public.cancelled_flights (flight_number);

-- ── Cleanup: Remove old flight columns from registrations ─────────────────────

-- Migrate any existing data from old columns before dropping them
-- Uncomment the lines below ONLY after verifying all registrations have been migrated to cancelled_flights table
alter table public.registrations drop column if exists flight_number;
alter table public.registrations drop column if exists airline;
alter table public.registrations drop column if exists flight_date;
