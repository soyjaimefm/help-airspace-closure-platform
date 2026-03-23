import { Scale, CheckCircle2, ShieldCheck, Users } from "lucide-react";

import { Badge }     from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import RegistrationForm from "@/components/RegistrationForm";

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS   = ["Inicio"] as const;
const FOOTER_LINKS = ["Aviso Legal", "Privacidad", "Cookies", "Contacto"] as const;

const TRUST_BADGES = [
  { label: "Acreditado por", value: "LEGAL_INTL" },
  { label: "Seguridad",      value: "ISO_27001"  },
  { label: "Consumidores",   value: "ECC_NET"    },
] as const;

const FEATURES = [
  { icon: CheckCircle2, text: "Sin costes iniciales" },
  { icon: ShieldCheck,  text: "Gestión 100% digital" },
  { icon: Users,        text: "Miles de afectados"   },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center size-8 rounded-md bg-primary transition-opacity group-hover:opacity-90">
              <Scale className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">
              Registro de Demandas Colectivas
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {item}
              </a>
            ))}
            <a
              href="/admin"
              className="ml-2 text-sm font-semibold px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Admin
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div className="space-y-6">
              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-primary border-primary/30 bg-primary/5">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Caso Activo: Cierre Espacio Aéreo
                </span>
              </Badge>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                  Compensación por Cancelaciones:{" "}
                  <span className="text-primary">Oriente Medio</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Si su vuelo fue cancelado debido al cierre repentino del espacio
                  aéreo en el Oriente Medio, usted puede tener derecho a una
                  indemnización oficial según la normativa internacional. Únase a la
                  plataforma de registro gestionada por expertos legales.
                </p>
              </div>

              {/* <div className="flex flex-wrap gap-4">
                {FEATURES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="size-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Right: SVG illustration */}
            <div className="relative hidden lg:block">
              {/* Soft decorative glow */}
              <div className="absolute -inset-6 rounded-3xl bg-primary/5 blur-2xl -z-10" />

              <div className="relative rounded-2xl overflow-hidden border bg-card shadow-xl shadow-primary/10">
                <img src="/plane.webp" alt="avión" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Form section ───────────────────────────────────────────────────── */}
        <section id="form" className="py-14 sm:py-20 bg-muted/40 border-y">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">

            {/* Form card */}
            <Card className="shadow-xl shadow-primary/5 py-0 gap-0">
              <CardHeader className="px-6 pt-8 pb-6 border-b">
                <CardTitle className="text-2xl">
                  Formulario de Registro Oficial
                </CardTitle>
                <CardDescription>
                  Por favor, introduzca los detalles exactos que figuran en su
                  documentación de viaje.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-8">
                <RegistrationForm />
              </CardContent>
            </Card>

            {/* Trust badges */}
            {/* <div className="flex items-center justify-center gap-0">
              {TRUST_BADGES.map((badge, i) => (
                <div key={badge.value} className="flex items-center">
                  {i > 0 && (
                    <Separator orientation="vertical" className="mx-6 h-8" />
                  )}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium mb-0.5">
                      {badge.label}
                    </p>
                    <p className="text-sm font-bold tracking-wide text-muted-foreground">
                      {badge.value}
                    </p>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-8 bg-card border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-7 rounded-md bg-primary">
                <Scale className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Plataforma de Registro Legal
              </span>
            </div>

            {/* Footer links */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {FOOTER_LINKS.map((link, i) => (
                <span key={link} className="flex items-center">
                  {i > 0 && <span className="text-border mx-2 text-xs">·</span>}
                  <a
                    href="#"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </span>
              ))}
            </div>
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              © 2026 Plataforma de Registro para Demandas Colectivas. Todos los
              derechos reservados.
            </p>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              <span>Cifrado SSL 256 bits</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
