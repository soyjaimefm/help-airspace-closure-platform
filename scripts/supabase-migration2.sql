-- ============================================================
-- Supabase Migration: Módulos 1 + 2
-- Ejecuta este SQL en: Project › SQL Editor › New query
-- ============================================================

-- ── Tabla principal ──────────────────────────────────────────────────────────
create table public.registrations (
  id              bigint primary key generated always as identity,
  full_name       text        not null,
  email           text        not null,
  phone           text        not null,
  passport_number text        not null unique,
  flight_number   text        not null,
  airline         text        not null,
  status          text        not null default 'en_proceso'
                  check (status in ('en_proceso', 'validado', 'incidencia')),
  created_at      timestamptz not null default now()
);

comment on table public.registrations
  is 'Registrations of passengers affected by Middle East airspace closure';

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.registrations enable row level security;

-- Anónimo puede INSERT (formulario público)
create policy "public_can_insert"
  on public.registrations
  for insert
  to anon
  with check (true);

-- Usuarios autenticados (admins) pueden leer y actualizar
create policy "authenticated_can_select"
  on public.registrations
  for select
  to authenticated
  using (true);

create policy "authenticated_can_update"
  on public.registrations
  for update
  to authenticated
  using (true)
  with check (true);

-- ── Índices ──────────────────────────────────────────────────────────────────
create index registrations_passport_number_idx on public.registrations (passport_number);
create index registrations_airline_idx         on public.registrations (airline);
create index registrations_status_idx          on public.registrations (status);
create index registrations_created_at_idx      on public.registrations (created_at desc);

-- ── Datos de prueba (opcional, elimina antes de producción) ──────────────────
-- insert into public.registrations (full_name, email, phone, passport_number, flight_number, airline, status)
-- values
--   ('Alejandro García', 'alejandro.g@gmail.com', '+34 600 111 222', 'AA1234567', 'IB3202', 'Iberia', 'validado'),
--   ('María López',      'm.lopez@outlook.es',    '+34 611 333 444', 'BB9876543', 'VY1502', 'Vueling', 'en_proceso'),
--   ('John Smith',       'j.smith@emirates.com',  '+44 7911 123456', 'CC7418529', 'EK142',  'Emirates', 'incidencia'),
--   ('Roberto Martínez', 'roberto.mtz@me.com',    '+34 699 555 666', 'DD3692581', 'UX1024', 'Air Europa', 'validado');
