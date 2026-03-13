import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Server Component layout — protects all /admin routes.
 *
 * Uses supabase.auth.getUser() (not getSession()) per Supabase SSR docs:
 * getUser() revalidates the token with Auth server every time,
 * making it safe against cookie spoofing.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar userEmail={user.email ?? ""} userName={userName} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
