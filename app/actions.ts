"use server";

import { createSecretClient } from "@/lib/supabase/server";
import { registrationSchema, type RegistrationResult } from "@/lib/types";
import type { RegistrationFormData } from "@/lib/types";

export async function submitRegistration(
  data: RegistrationFormData
): Promise<RegistrationResult> {
  // ── 1. Server-side schema validation (defence in depth) ──────────────────
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos del formulario no válidos." };
  }

  const supabase = await createSecretClient();

  // ── 2. Duplicate passport check ──────────────────────────────────────────
  const { data: existing, error: lookupError } = await supabase
    .from("registrations")
    .select("id")
    .eq("passport_number", parsed.data.passport_number.trim().toUpperCase())
    .maybeSingle();

  if (lookupError) {
    console.error("[submitRegistration] lookup error:", lookupError);
    return { success: false, error: "Error al verificar el registro." };
  }

  if (existing) {
    return {
      success: false,
      duplicate: true,
      error: "Ya estás registrado con este número de pasaporte.",
    };
  }

  // ── 3. INSERT registration ────────────────────────────────────────────────
  const { data: registration, error: insertRegError } = await supabase
    .from("registrations")
    .insert({
      full_name:       parsed.data.full_name.trim(),
      email:           parsed.data.email.trim().toLowerCase(),
      phone:           parsed.data.phone.trim(),
      passport_number: parsed.data.passport_number.trim().toUpperCase(),
    })
    .select("id")
    .single();

  if (insertRegError) {
    console.error("[submitRegistration] registration insert error:", insertRegError);
    // Race-condition: unique constraint violation (PostgreSQL code 23505)
    if (insertRegError.code === "23505") {
      return {
        success: false,
        duplicate: true,
        error: "Ya estás registrado con este número de pasaporte.",
      };
    }
    return {
      success: false,
      error: "Error al enviar el registro. Inténtalo de nuevo.",
    };
  }

  // ── 4. INSERT cancelled flights ──────────────────────────────────────────
  const { error: flightsError } = await supabase
    .from("cancelled_flights")
    .insert(
      parsed.data.cancelledFlights.map((flight) => ({
        registration_id: registration.id,
        flight_number:   flight.flight_number.trim().toUpperCase(),
        airline:         flight.airline.trim(),
        flight_date:     flight.flight_date,
      }))
    );

  if (flightsError) {
    console.error("[submitRegistration] flights insert error:", flightsError);
    // Handle UNIQUE constraint violation (duplicate flight per registration)
    if (flightsError.code === "23505") {
      return {
        success: false,
        error: "Ya has registrado uno de estos vuelos.",
      };
    }
    return {
      success: false,
      error: "Error al guardar los vuelos. Inténtalo de nuevo.",
    };
  }

  return { success: true };
}

