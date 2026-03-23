"use client";

import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, Send, User, Plane,
  ShieldCheck, AlertTriangle, TriangleAlert, CircleCheck, AlertCircle, Plus, Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";

import { registrationSchema, type RegistrationFormData, AIRLINES } from "@/lib/types";
import { submitRegistration } from "@/app/actions";

// ─── Small helpers ────────────────────────────────────────────────────────────

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
          { label: "Nombre", value: data.full_name },
          { label: "Email", value: data.email },
          { label: "Vuelos Cancelados", value: `${data.cancelledFlights.length} vuelo(s)` },
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
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      passport_number: "",
      cancelledFlights: [
        { flight_number: "", airline: "", flight_date: "" }
      ],
      privacy_accepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cancelledFlights",
  });

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
        <Alert variant="destructive">
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
          <Controller
            name="full_name"
            control={control}
            render={({ field, fieldState: { invalid, error } }) => (
              <div className="space-y-1.5" data-invalid={invalid}>
                <Label htmlFor="full_name">
                  Nombre Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...field}
                  id="full_name"
                  placeholder="Ej: Juan Pérez García"
                  autoComplete="name"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "full_name-error" : undefined}
                />
                {invalid && (
                  <p
                    id="full_name-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="size-3 shrink-0" />
                    {error?.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState: { invalid, error } }) => (
              <div className="space-y-1.5" data-invalid={invalid}>
                <Label htmlFor="email">
                  Correo Electrónico <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "email-error" : undefined}
                />
                {invalid && (
                  <p
                    id="email-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="size-3 shrink-0" />
                    {error?.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Teléfono */}
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState: { invalid, error } }) => (
              <div className="space-y-1.5" data-invalid={invalid}>
                <Label htmlFor="phone">
                  Teléfono (con código de país) <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...field}
                  id="phone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  autoComplete="tel"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "phone-error" : undefined}
                />
                {invalid && (
                  <p
                    id="phone-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="size-3 shrink-0" />
                    {error?.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Pasaporte */}
          <Controller
            name="passport_number"
            control={control}
            render={({ field, fieldState: { invalid, error } }) => (
              <div className="space-y-1.5" data-invalid={invalid}>
                <Label htmlFor="passport_number">
                  Número de Pasaporte <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...field}
                  id="passport_number"
                  placeholder="A12345678"
                  autoComplete="off"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "passport_number-error" : undefined}
                />
                {invalid && (
                  <p
                    id="passport_number-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="size-3 shrink-0" />
                    {error?.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* ── Detalles del Vuelo ── */}
      <div className="space-y-4">
        <SectionHeading icon={Plane} label="Vuelos Cancelados" />

        {/* Array validation error message */}
        {!fields.length && (
          <p className="text-xs text-destructive">Debes registrar al menos un vuelo cancelado.</p>
        )}

        {/* Dynamic flight fields */}
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border bg-muted/30 p-5 space-y-4">
              {/* Flight counter */}
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-muted-foreground">
                  Vuelo {index + 1} de {fields.length}
                </p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-3">

                {/* Flight number */}
                <Controller
                  name={`cancelledFlights.${index}.flight_number`}
                  control={control}
                  render={({ field: flightField, fieldState: { invalid, error } }) => (
                    <div className="space-y-1.5" data-invalid={invalid}>
                      <Label htmlFor={`flight_number_${index}`}>
                        Número de Vuelo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...flightField}
                        id={`flight_number_${index}`}
                        placeholder="Ej: IB3240"
                        autoComplete="off"
                        aria-invalid={invalid}
                        aria-describedby={invalid ? `flight_number_${index}-error` : undefined}
                      />
                      {invalid && (
                        <p
                          id={`flight_number_${index}-error`}
                          className="flex items-center gap-1 text-xs text-destructive mt-1"
                          role="alert"
                        >
                          <AlertCircle className="size-3 shrink-0" />
                          {error?.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Airline */}
                <Controller
                  name={`cancelledFlights.${index}.airline`}
                  control={control}
                  render={({ field: flightField, fieldState: { invalid, error } }) => (
                    <div className="space-y-1.5" data-invalid={invalid}>
                      <Label htmlFor={`airline_${index}`}>
                        Aerolínea <span className="text-destructive">*</span>
                      </Label>
                      <Select value={flightField.value || ""} onValueChange={flightField.onChange}>
                        <SelectTrigger
                          id={`airline_${index}`}
                          className="w-full"
                          aria-invalid={invalid}
                          aria-describedby={invalid ? `airline_${index}-error` : undefined}
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
                      {invalid && (
                        <p
                          id={`airline_${index}-error`}
                          className="flex items-center gap-1 text-xs text-destructive mt-1"
                          role="alert"
                        >
                          <AlertCircle className="size-3 shrink-0" />
                          {error?.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Flight date and time */}
                <Controller
                  name={`cancelledFlights.${index}.flight_date`}
                  control={control}
                  render={({ field: flightField, fieldState: { invalid, error } }) => (
                    <div className="space-y-1.5" data-invalid={invalid}>
                      <Label htmlFor={`flight_date_${index}`}>
                        Fecha y Hora del Vuelo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...flightField}
                        id={`flight_date_${index}`}
                        type="datetime-local"
                        aria-invalid={invalid}
                        aria-describedby={invalid ? `flight_date_${index}-error` : undefined}
                      />
                      {invalid && (
                        <p
                          id={`flight_date_${index}-error`}
                          className="flex items-center gap-1 text-xs text-destructive mt-1"
                          role="alert"
                        >
                          <AlertCircle className="size-3 shrink-0" />
                          {error?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add flight button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ flight_number: "", airline: "", flight_date: "" })}
          disabled={fields.length >= 6}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          Agregar vuelo cancelado
        </Button>
      </div>

      {/* Observaciones */}
      <Controller
        name="notes"
        control={control}
        render={({ field, fieldState: { invalid, error } }) => (
          <div className="space-y-1.5" data-invalid={invalid}>
            <Label htmlFor="notes">
              Observaciones <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              {...field}
              id="notes"
              placeholder="Añada aquí cualquier información relevante sobre su caso..."
              aria-invalid={invalid}
              aria-describedby={invalid ? "notes-error" : undefined}
                />
                {invalid && (
                  <p
                    id="notes-error"
                    className="flex items-center gap-1 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertCircle className="size-3 shrink-0" />
                    {error?.message}
                  </p>
                )}
              </div>
            )}
          />

      <Separator />

      {/* ── Privacidad / RGPD ── */}
      <div className="rounded-lg border bg-accent/40 p-4">
        <Controller
          name="privacy_accepted"
          control={control}
          render={({ field, fieldState: { invalid, error } }) => (
            <div data-invalid={invalid}>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy_accepted"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "privacy_accepted-error" : undefined}
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
              {invalid && (
                <p
                  id="privacy_accepted-error"
                  className="flex items-center gap-1 text-xs text-destructive mt-2"
                  role="alert"
                >
                  <AlertCircle className="size-3 shrink-0" />
                  {error?.message}
                </p>
              )}
            </div>
          )}
        />
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
