-- ============================================================
-- Fix RLS Policies for Server Actions
--
-- The issue is that RLS policies were configured only for 'anon' role
-- but Server Actions use 'service_role'. We need to adjust the policies.
-- ============================================================

-- ── Drop existing restrictive policies ──────────────────────────────────────
drop policy if exists "public_can_insert" on public.registrations;
drop policy if exists "authenticated_can_select" on public.registrations;
drop policy if exists "authenticated_can_update" on public.registrations;

-- ── Create new, less restrictive policies ────────────────────────────────────

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

-- ── Fix policies for cancelled_flights table ──────────────────────────────────

drop policy if exists "public_can_insert" on public.cancelled_flights;
drop policy if exists "authenticated_can_select" on public.cancelled_flights;

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
