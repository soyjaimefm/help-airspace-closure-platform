"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, Send, User, Plane,
  ShieldCheck, AlertTriangle, TriangleAlert, CircleCheck, AlertCircle,
} from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { registrationSchema, type RegistrationFormData, AIRLINES } from "@/lib/types";
import { submitRegistration } from "@/app/actions";

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive" role="alert">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  );
}

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        {label}
      </span>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ data }: { data: RegistrationFormData }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="flex items-center justify-center size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CircleCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">¡Registro completado!</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Hemos recibido tu inscripción correctamente. Nos pondremos en contacto
          contigo en cuanto avance el proceso legal.
        </p>
      </div>

      <div className="w-full rounded-lg border bg-muted/40 p-4 text-left space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Resumen de tu registro
        </p>
        {[
          { label: "Nombre",    value: data.full_name },
          { label: "Email",     value: data.email },
          { label: "Vuelo",     value: data.flight_number.toUpperCase() },
          { label: "Aerolínea", value: data.airline },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

type SubmitStatus = "idle" | "success" | "duplicate" | "error";

export default function RegistrationForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState("");
  const [submittedData, setSubmittedData] = useState<RegistrationFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      passport_number: "",
      flight_number: "",
      airline: "",
      privacy_accepted: false,
    },
  });

  const privacyAccepted = watch("privacy_accepted");

  const onSubmit = async (data: RegistrationFormData) => {
    setStatus("idle");
    setServerError("");

    try {
      const result = await submitRegistration(data);
      if (result.success) {
        setSubmittedData(data);
        setStatus("success");
      } else if (result.duplicate) {
        setStatus("duplicate");
      } else {
        setStatus("error");
        setServerError(result.error ?? "Error desconocido.");
      }
    } catch {
      setStatus("error");
      setServerError("Error de conexión. Por favor, inténtalo de nuevo.");
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success" && submittedData) {
    return <SuccessScreen data={submittedData} />;
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* Duplicate passport warning */}
      {status === "duplicate" && (
        <Alert variant="warning">
          <AlertTriangle className="size-4" />
          <AlertTitle>Ya estás registrado</AlertTitle>
          <AlertDescription>
            Existe un registro con este número de pasaporte. Si crees que es un
            error, contacta con nosotros.
          </AlertDescription>
        </Alert>
      )}

      {/* Generic server error */}
      {status === "error" && (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>Error al enviar</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* ── Información Personal ── */}
      <div className="space-y-4">
        <SectionHeading icon={User} label="Información Personal" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Ej: Juan Pérez García"
              autoComplete="name"
              aria-invalid={!!errors.full_name}
              {...register("full_name")}
            />
            <FieldError message={errors.full_name?.message} />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Correo Electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Teléfono (con código de país) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+34 600 000 000"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          {/* Pasaporte */}
          <div className="space-y-1.5">
            <Label htmlFor="passport_number">
              Número de Pasaporte <span className="text-destructive">*</span>
            </Label>
            <Input
              id="passport_number"
              placeholder="A12345678"
              autoComplete="off"
              aria-invalid={!!errors.passport_number}
              {...register("passport_number")}
            />
            <FieldError message={errors.passport_number?.message} />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Detalles del Vuelo ── */}
      <div className="space-y-4">
        <SectionHeading icon={Plane} label="Detalles del Vuelo" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Número de vuelo */}
          <div className="space-y-1.5">
            <Label htmlFor="flight_number">
              Número de Vuelo Cancelado <span className="text-destructive">*</span>
            </Label>
            <Input
              id="flight_number"
              placeholder="Ej: IB3240"
              autoComplete="off"
              aria-invalid={!!errors.flight_number}
              {...register("flight_number")}
            />
            <FieldError message={errors.flight_number?.message} />
          </div>

          {/* Aerolínea */}
          <div className="space-y-1.5">
            <Label htmlFor="airline">
              Aerolínea <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("airline", value, { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="airline"
                aria-invalid={!!errors.airline}
              >
                <SelectValue placeholder="Seleccione una aerolínea" />
              </SelectTrigger>
              <SelectContent>
                {AIRLINES.map((airline) => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.airline?.message} />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Privacidad / RGPD ── */}
      <div className="rounded-lg border bg-accent/40 p-4 space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="privacy_accepted"
            checked={privacyAccepted}
            onCheckedChange={(checked) =>
              setValue("privacy_accepted", checked === true, {
                shouldValidate: true,
              })
            }
            aria-invalid={!!errors.privacy_accepted}
            className="mt-0.5"
          />
          <Label
            htmlFor="privacy_accepted"
            className="text-sm font-normal leading-relaxed cursor-pointer"
          >
            <span>
              He leído y acepto la{" "}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                Política de Privacidad
              </a>{" "}
              y los términos legales de la plataforma. Autorizo el tratamiento de
              mis datos para la gestión de esta demanda colectiva bajo el marco del
              RGPD.

            </span>
          </Label>
        </div>
        <FieldError message={errors.privacy_accepted?.message} />
      </div>

      {/* ── Botón de envío ── */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send />
            Enviar Registro Oficial
          </>
        )}
      </Button>

      {/* ── Nota de seguridad SSL ── */}
      <div className="flex items-start gap-2 text-muted-foreground">
        <ShieldCheck className="size-4 mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed">
          Este sitio utiliza cifrado SSL de 256 bits para garantizar la seguridad
          de sus datos personales. Su información no será compartida con terceros
          ajenos al proceso legal sin su consentimiento explícito.
        </p>
      </div>
    </form>
  );
}
