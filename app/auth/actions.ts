"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── Email + Password login ───────────────────────────────────────────────────

export async function loginWithPassword(formData: FormData) {
  const supabase = await createClient();

  const email    = (formData.get("email")    as string).trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/auth/login?error=missing_fields");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[loginWithPassword]", error.message);
    redirect("/auth/login?error=invalid_credentials");
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function loginWithGoogle() {
  const supabase = await createClient();

  // Use an absolute URL so it works behind proxies / Vercel
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        // Request offline access so Supabase can refresh the token
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    console.error("[loginWithGoogle]", error?.message);
    redirect("/login?error=oauth_failed");
  }

  // Redirect browser to Google's consent screen
  redirect(data.url);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
