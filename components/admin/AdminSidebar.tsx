"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale, LayoutDashboard, FileText, Download,
  Settings, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  userEmail: string;
  userName: string;
}

const NAV_ITEMS = [
  { href: "/admin",          icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/admin/registros",icon: FileText,         label: "Registros"    },
  { href: "/admin/exportar", icon: Download,         label: "Exportar"     },
  { href: "/admin/config",   icon: Settings,         label: "Configuración"},
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AdminSidebar({ userEmail, userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials = getInitials(userName || userEmail);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 border-b px-4 h-14 shrink-0",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex items-center justify-center size-8 rounded-md bg-primary shrink-0">
          <Scale className="size-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-bold leading-tight text-foreground truncate">
              Plataforma Legal
            </p>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider truncate">
              Demandas Colectivas
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t p-2 shrink-0">
        <div className={cn(
          "flex items-center gap-2 rounded-md px-2 py-2 mb-1",
          collapsed && "justify-center px-0"
        )}>
          {/* Avatar */}
          <div className="flex items-center justify-center size-8 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {userName || "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
        </div>

        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              collapsed ? "justify-center px-0" : "justify-start gap-2"
            )}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </Button>
        </form>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 flex items-center justify-center size-6 rounded-full border bg-card text-muted-foreground hover:text-foreground shadow-sm z-10 transition-colors"
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  );
}
