-- ============================================================
-- Supabase Migration: Módulo 1 — Formulario Público
-- Ejecuta este SQL en: Project › SQL Editor › New query
--   https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- ── Tabla principal ──────────────────────────────────────────────────────────
create table public.registrations (
  id              bigint primary key generated always as identity,
  full_name       text        not null,
  email           text        not null,
  phone           text        not null,
  passport_number text        not null unique,  -- duplicate check constraint
  flight_number   text        not null,
  airline         text        not null,
  created_at      timestamptz not null default now()
);

comment on table public.registrations
  is 'Registrations of passengers affected by Middle East airspace closure';

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.registrations enable row level security;

-- Anónimo puede INSERT (formulario público sin login)
create policy "public_can_insert"
  on public.registrations
  for insert
  to anon
  with check (true);

-- Solo usuarios autenticados pueden leer (panel admin con service_role)
create policy "authenticated_can_select"
  on public.registrations
  for select
  to authenticated
  using (true);

-- ── Índices ──────────────────────────────────────────────────────────────────

-- Búsqueda rápida de pasaporte duplicado
create index registrations_passport_number_idx
  on public.registrations (passport_number);

-- Filtro por aerolínea en el panel de administración (Módulo 2)
create index registrations_airline_idx
  on public.registrations (airline);

-- Ordenación por fecha de registro
create index registrations_created_at_idx
  on public.registrations (created_at desc);
