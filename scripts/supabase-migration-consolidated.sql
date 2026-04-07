-- ============================================================
-- Supabase Migration: Consolidated - Complete Schema
-- Flight Cancellation Registration Platform
--
-- This migration combines all previous migrations into one
-- complete schema setup that can be executed in a single run.
--
-- Ejecuta este SQL en: Project › SQL Editor › New query
--   https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 1: REGISTRATIONS TABLE
-- ══════════════════════════════════════════════════════════════════════════════

create table public.registrations (
  id              bigint primary key generated always as identity,
  full_name       text        not null,
  email           text        not null,
  phone           text        not null,
  passport_number text        not null unique,
  notes           text        null,
  status          text        not null default 'en_proceso'
                  check (status in ('en_proceso', 'validado', 'incidencia')),
  created_at      timestamptz not null default now()
);

comment on table public.registrations
  is 'Registrations of passengers affected by Middle East airspace closure';

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.registrations enable row level security;

-- Allow INSERT from anyone (public form + server actions)
create policy "enable_insert_for_all"
  on public.registrations
  for insert
  with check (true);

-- Allow SELECT for authenticated users (admin panel)
create policy "enable_select_for_authenticated"
  on public.registrations
  for select
  to authenticated
  using (true);

-- Allow UPDATE for authenticated users (admin panel)
create policy "enable_update_for_authenticated"
  on public.registrations
  for update
  to authenticated
  using (true)
  with check (true);

-- ── Índices para registrations ───────────────────────────────────────────────
create index registrations_passport_number_idx
  on public.registrations (passport_number);

create index registrations_status_idx
  on public.registrations (status);

create index registrations_created_at_idx
  on public.registrations (created_at desc);

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 2: CANCELLED_FLIGHTS TABLE
-- ══════════════════════════════════════════════════════════════════════════════

create table public.cancelled_flights (
  id              bigint primary key generated always as identity,
  registration_id bigint        not null references public.registrations(id) on delete cascade,
  flight_number   text          not null,
  airline         text          not null,
  flight_date     timestamptz   not null,
  created_at      timestamptz   not null default now(),
);

comment on table public.cancelled_flights
  is 'Cancelled flights linked to registrations (one registration can have multiple cancelled flights)';

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.cancelled_flights enable row level security;

-- Allow INSERT from anyone (public form + server actions)
create policy "enable_insert_for_all"
  on public.cancelled_flights
  for insert
  with check (true);

-- Allow SELECT for authenticated users (admin panel)
create policy "enable_select_for_authenticated"
  on public.cancelled_flights
  for select
  to authenticated
  using (true);

-- ── Índices para cancelled_flights ──────────────────────────────────────────
-- Búsqueda rápida por registration_id (joins con registrations)
create index cancelled_flights_registration_id_idx
  on public.cancelled_flights (registration_id);

-- Filtro por fecha de vuelo en reportes
create index cancelled_flights_flight_date_idx
  on public.cancelled_flights (flight_date desc);

-- Búsqueda por numero de vuelo
create index cancelled_flights_flight_number_idx
  on public.cancelled_flights (flight_number);

-- ══════════════════════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA (OPCIONAL)
-- Descomenta las líneas de abajo para insertar datos de prueba
-- Elimina antes de pasar a producción
-- ══════════════════════════════════════════════════════════════════════════════

-- insert into public.registrations (full_name, email, phone, passport_number, status)
-- values
--   ('Alejandro García', 'alejandro.g@gmail.com', '+34 600 111 222', 'AA1234567', 'validado'),
--   ('María López',      'm.lopez@outlook.es',    '+34 611 333 444', 'BB9876543', 'en_proceso'),
--   ('John Smith',       'j.smith@emirates.com',  '+44 7911 123456', 'CC7418529', 'incidencia'),
--   ('Roberto Martínez', 'roberto.mtz@me.com',    '+34 699 555 666', 'DD3692581', 'validado');

-- insert into public.cancelled_flights (registration_id, flight_number, airline, flight_date)
-- values
--   (1, 'IB3202', 'Iberia', '2024-01-15 14:30:00+00'),
--   (1, 'IB3203', 'Iberia', '2024-01-16 10:00:00+00'),
--   (2, 'VY1502', 'Vueling', '2024-01-15 18:45:00+00'),
--   (3, 'EK142',  'Emirates', '2024-01-17 22:15:00+00'),
--   (4, 'UX1024', 'Air Europa', '2024-01-15 16:20:00+00');
