import { createClient } from "@/lib/supabase/server";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import type { Registration } from "@/lib/types";

/**
 * Admin dashboard — Server Component.
 *
 * Fetches all registrations server-side (authenticated, no RLS bypass needed
 * because the user is authenticated and the policy allows authenticated SELECT).
 */
export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Supabase connection issue — show graceful error
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">
            Error al cargar los registros
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <RegistrationsTable initialData={(data ?? []) as Registration[]} />
  );
}
