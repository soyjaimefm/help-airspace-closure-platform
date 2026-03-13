import { z } from "zod";

// ─── Zod validation schema ────────────────────────────────────────────────────
// Single source of truth used by React Hook Form (client) AND
// the Server Action (server-side defence-in-depth validation).

export const registrationSchema = z.object({
  full_name: z
    .string()
    .min(1, "El nombre completo es obligatorio.")
    .refine(
      (v) => v.trim().split(/\s+/).length >= 2,
      "Introduce nombre y apellidos."
    ),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Introduce un correo electrónico válido."),
  phone: z
    .string()
    .min(1, "El teléfono es obligatorio.")
    .regex(
      /^\+?[\d\s\-().]{7,20}$/,
      "Introduce un teléfono válido con prefijo de país."
    ),
  passport_number: z
    .string()
    .min(1, "El número de pasaporte es obligatorio.")
    .min(5, "El número de pasaporte no es válido."),
  flight_number: z
    .string()
    .min(1, "El número de vuelo es obligatorio.")
    .regex(
      /^[A-Za-z0-9]{2,10}$/,
      "Formato incorrecto. Ej: IB3456 o VY1024."
    ),
  airline: z.string().min(1, "Selecciona una aerolínea."),
  privacy_accepted: z
    .boolean()
    .refine(
      (v) => v === true,
      "Debes aceptar la política de privacidad para continuar."
    ),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type RegistrationStatus = "en_proceso" | "validado" | "incidencia";


// ─── DB row type (returned from Supabase) ─────────────────────────────────────

export interface Registration {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  passport_number: string;
  flight_number: string;
  airline: string;
  status: RegistrationStatus;
  created_at: string;
}

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  en_proceso: "En proceso",
  validado:   "Validado",
  incidencia: "Incidencia",
};

export const STATUS_COLORS: Record<RegistrationStatus, string> = {
  en_proceso: "text-blue-600 bg-blue-50 border-blue-200",
  validado:   "text-emerald-600 bg-emerald-50 border-emerald-200",
  incidencia: "text-amber-600 bg-amber-50 border-amber-200",
};

// ─── Server Action response ───────────────────────────────────────────────────

export interface RegistrationResult {
  success: boolean;
  error?: string;
  duplicate?: boolean;
}

// ─── Airlines list ────────────────────────────────────────────────────────────

export const AIRLINES = [
  "Iberia",
  "SriLankan Airlines",
  "Air Europa",
  "Emirates",
  "Etihad Airways",
  "Qatar Airways",
  "Turkish Airlines",
  "Otra aerolínea",
] as const;

export type Airline = (typeof AIRLINES)[number];
