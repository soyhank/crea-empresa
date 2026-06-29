import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Eye, EyeOff, Info, Loader2, Lock, ShieldAlert } from "lucide-react";

const FEATURES = [
  "10 módulos guiados, del estudio de mercado a los estados financieros",
  "Cálculo financiero en vivo: VAN, TIR, punto de equilibrio y más",
  "Reemplaza el Excel: tú solo ingresas los datos de tu negocio",
];

function MarcaBlanca() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white ring-1 ring-white/25">C</div>
      <span className="text-sm font-semibold tracking-tight text-white">Crea<span className="text-indigo-200">Empresa</span></span>
    </div>
  );
}

export function LoginPage() {
  const { signIn, modo, user } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) navigate("/proyectos", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(nombre, password);
      navigate("/proyectos", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ───────── Hero (escritorio) ───────── */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-10 lg:flex lg:flex-col">
        {/* glow decorativo */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <MarcaBlanca />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-indigo-400/30 blur-2xl" />
            <img
              src="/santos.png"
              alt="Profesor Santos"
              className="size-52 rounded-full object-cover shadow-2xl ring-4 ring-white/20"
            />
          </div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-white/20">
            <Lock className="size-3" /> Plataforma privada · solo para estudiantes
          </span>
          <h1 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-white">
            Formula tu plan de negocio, paso a paso
          </h1>
          <p className="mt-3 max-w-md text-sm text-indigo-100/90">
            Aula virtual del <b className="text-white">profesor Santos</b> para sus cursos de
            formulación de proyectos. Acceso exclusivo para sus alumnos.
          </p>

          <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-indigo-50">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-300" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-indigo-200/70">© Crea-Empresa · Plan de negocio guiado</p>
      </aside>

      {/* ───────── Formulario ───────── */}
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Cabecera compacta (móvil) */}
          <div className="mb-6 flex flex-col items-center gap-3 text-center lg:hidden">
            <img src="/santos.png" alt="Profesor Santos" className="size-20 rounded-full object-cover shadow-lg ring-2 ring-primary/20" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Lock className="size-3" /> Plataforma privada · estudiantes del Prof. Santos
            </span>
          </div>

          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Acceso exclusivo para estudiantes del profesor Santos.</p>
          </div>
          <h2 className="mb-1 text-center text-2xl font-semibold tracking-tight text-slate-900 lg:hidden">Iniciar sesión</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground lg:hidden">Acceso exclusivo para estudiantes.</p>

          <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            {error && (
              <Alert variant="destructive">
                <ShieldAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre de empresario</Label>
              <Input id="nombre" type="text" autoComplete="username" required autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. José Pérez" />
              <p className="text-xs text-muted-foreground">El que te asignó tu profesor.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Ingresar
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Olvidaste tu contraseña? <span className="font-medium text-slate-700">Contacta al profesor.</span>
            </p>
          </form>

          {modo === "demo" && (
            <Alert variant="info" className="mt-4">
              <Info />
              <AlertTitle>Modo demo · datos locales</AlertTitle>
              <AlertDescription className="mt-1 text-xs">
                Ingresa con el nombre:
                <br />
                Admin: <b>Santos</b> / <b>pamer2026</b>
                <br />
                Estudiante: <b>Alumno Demo</b> / <b>alumno123</b>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}
