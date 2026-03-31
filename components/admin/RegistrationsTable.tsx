"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Calendar, FileSpreadsheet,
  FileDown, ChevronLeft, ChevronRight, MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type RegistrationWithFlights, type RegistrationStatus,
  STATUS_LABELS, STATUS_COLORS,
} from "@/lib/types";
import { updateStatus, fetchAllRegistrations } from "@/app/admin/actions";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, color,
}: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`text-3xl font-bold tabular-nums ${color ?? "text-foreground"}`}>
        {value.toLocaleString("es-ES")}
      </p>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Avatar initials ─────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
  const colors = [
    "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex items-center justify-center size-8 rounded-full text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ─── Export helpers ───────────────────────────────────────────────────────────
function toCSV(data: RegistrationWithFlights[]): string {
  const MAX_FLIGHTS = 6;
  const flightHeaders = Array.from({ length: MAX_FLIGHTS }, (_, i) => `Vuelo ${i + 1}`);
  const header = ["ID", "Nombre", "Email", "Teléfono", "Pasaporte", "Observaciones", "Estado", "Fecha", ...flightHeaders];

  const rows = data.map((r) => {
    const flights = Array.from({ length: MAX_FLIGHTS }, (_, i) =>
      `${r.cancelled_flights?.[i]?.flight_number || "—"} - ${r.cancelled_flights?.[i]?.airline || "—"} - ${r.cancelled_flights?.[i]?.flight_date ? new Date(r.cancelled_flights?.[i]?.flight_date).toLocaleDateString("es-ES") : "—"}`
    );
    return [
      r.id, `"${r.full_name}"`, r.email, r.phone,
      r.passport_number, `"${r.notes || "—"}"`, STATUS_LABELS[r.status], new Date(r.created_at).toLocaleDateString("es-ES"), ...flights
    ]
  });

  return [header, ...rows].map((r) => r.join(",")).join("\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegistrationsTable({
  initialData,
}: {
  initialData: RegistrationWithFlights[];
}) {
  const [data, setData]           = useState(initialData);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [page, setPage]           = useState(1);
  const [isPending, startTransition] = useTransition();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // ── Toggle row expansion ────────────────────────────────────────────────
  const toggleExpand = (regId: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(regId) ? next.delete(regId) : next.add(regId);
      return next;
    });
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((r) => {
      const matchSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.passport_number.toLowerCase().includes(q);
      const matchStatus  = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     data.length,
    en_proceso: data.filter((r) => r.status === "en_proceso").length,
    validado:   data.filter((r) => r.status === "validado").length,
    incidencia: data.filter((r) => r.status === "incidencia").length,
  }), [data]);

  // ── Update status ──────────────────────────────────────────────────────────
  function handleStatusChange(id: number, newStatus: RegistrationStatus) {
    startTransition(async () => {
      const result = await updateStatus(id, newStatus);
      if (result.success) {
        setData((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    });
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  async function handleExportCSV() {
    const { data: all } = await fetchAllRegistrations();
    if (!all) return;
    downloadBlob(toCSV(all as RegistrationWithFlights[]), "registros.csv", "text/csv;charset=utf-8;");
  }

  async function handleExportXLSX() {
    const { data: all } = await fetchAllRegistrations();
    if (!all) return;
    // Dynamic import to keep bundle small
    const XLSX = await import("xlsx");
    const MAX_FLIGHTS = 6;
    const wsData = (all as RegistrationWithFlights[]).map((r) => {
      const base = {
        ID: r.id,
        Nombre: r.full_name,
        Email: r.email,
        Teléfono: r.phone,
        Pasaporte: r.passport_number,
        Observaciones: r.notes || "—",
        Estado: STATUS_LABELS[r.status],
        "Fecha Registro": new Date(r.created_at).toLocaleDateString("es-ES"),
      }

      const flights = Object.fromEntries(
        Array.from({ length: MAX_FLIGHTS }, (_, i) => [
          `Vuelo ${i + 1}`,
          `${r.cancelled_flights?.[i]?.flight_number || "—"} - ${r.cancelled_flights?.[i]?.airline || "—"} - ${r.cancelled_flights?.[i]?.flight_date ? new Date(r.cancelled_flights?.[i]?.flight_date).toLocaleDateString("es-ES") : "—"}`,
        ])
      );

      return { ...base, ...flights }
    });
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, "registros.xlsx");
  }

  // ── Page numbers helper ────────────────────────────────────────────────────
  function pageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registros de Demandantes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestión y control centralizado de reclamaciones activas.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileDown className="size-4" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={handleExportXLSX}>
            <FileSpreadsheet className="size-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Demandas" value={stats.total} />
        <StatCard label="En Proceso"     value={stats.en_proceso} color="text-blue-600" />
        <StatCard label="Validadas"      value={stats.validado}   color="text-emerald-600" />
        <StatCard label="Incidencias"    value={stats.incidencia} color="text-amber-600" />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, email o pasaporte..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36 gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="en_proceso">En proceso</SelectItem>
            <SelectItem value="validado">Validado</SelectItem>
            <SelectItem value="incidencia">Incidencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>
                <div className="flex items-center gap-1">
                  Nombre <ArrowUpDown className="size-3 text-muted-foreground/50" />
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Pasaporte</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              paged.flatMap((reg) => [
                // ── Main registration row ──────────────────────────────────────
                <TableRow key={reg.id} className={isPending ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 -ml-2"
                        onClick={() => toggleExpand(reg.id)}
                      >
                        <ChevronRight
                          className={`size-4 transition-transform ${
                            expandedRows.has(reg.id) ? "rotate-90" : ""
                          }`}
                        />
                      </Button>
                      <Avatar name={reg.full_name} />
                      <span className="font-medium text-sm text-foreground">{reg.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{reg.email}</TableCell>
                  <TableCell className="text-sm font-mono">{reg.passport_number}</TableCell>
                  <TableCell className="max-w-48">
                    {reg.notes ? (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground truncate cursor-default">
                              {reg.notes}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-72 whitespace-normal text-xs"
                          >
                            {reg.notes}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground/40 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(reg.created_at).toLocaleDateString("es-ES", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={reg.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(reg.id, "en_proceso")}
                          disabled={reg.status === "en_proceso"}
                        >
                          <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                          En proceso
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(reg.id, "validado")}
                          disabled={reg.status === "validado"}
                        >
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                          Validado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(reg.id, "incidencia")}
                          disabled={reg.status === "incidencia"}
                        >
                          <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                          Incidencia
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>,

                // ── Expanded flights row (conditional) ─────────────────────────
                ...(expandedRows.has(reg.id) && reg.cancelled_flights && reg.cancelled_flights.length > 0
                  ? [
                      <TableRow key={`expanded-${reg.id}`} className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                              Vuelos Cancelados ({reg.cancelled_flights.length})
                            </p>
                            <div className="space-y-2">
                              {reg.cancelled_flights.map((flight, idx) => (
                                <div key={`${reg.id}-flight-${idx}`} className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm">
                                  <div className="flex items-center gap-2.5 flex-1">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                      {flight.flight_number}
                                    </span>
                                    <span className="text-muted-foreground">{flight.airline}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <time className="text-xs text-muted-foreground">
                                      {new Date(flight.flight_date).toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}{" "}
                                      {new Date(flight.flight_date).toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </time>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>,
                    ]
                  : []),
              ])
            )}
          </TableBody>
        </Table>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length.toLocaleString("es-ES")} registros
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon" className="size-8"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
              ) : (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "outline"}
                  size="icon"
                  className="size-8 text-xs"
                  onClick={() => setPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline" size="icon" className="size-8"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
