"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

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

  // ── 3. INSERT ────────────────────────────────────────────────────────────
  const { error: insertError } = await supabase.from("registrations").insert({
    full_name:       parsed.data.full_name.trim(),
    email:           parsed.data.email.trim().toLowerCase(),
    phone:           parsed.data.phone.trim(),
    passport_number: parsed.data.passport_number.trim().toUpperCase(),
    flight_number:   parsed.data.flight_number.trim().toUpperCase(),
    airline:         parsed.data.airline.trim(),
  });

  if (insertError) {
    console.error("[submitRegistration] insert error:", insertError);
    // Race-condition: unique constraint violation (PostgreSQL code 23505)
    if (insertError.code === "23505") {
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

  return { success: true };
}
