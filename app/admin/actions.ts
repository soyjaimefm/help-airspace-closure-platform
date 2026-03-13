"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RegistrationStatus } from "@/lib/types";

// ─── Update registration status ───────────────────────────────────────────────

export async function updateStatus(id: number, status: RegistrationStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("registrations")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[updateStatus]", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

// ─── Fetch all registrations (for export) ────────────────────────────────────

export async function fetchAllRegistrations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
