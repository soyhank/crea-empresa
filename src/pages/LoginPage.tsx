import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/Brand";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, Info, Loader2, ShieldAlert } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Brand className="scale-125" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Acceso para empresarios.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          {error && (
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre de empresario</Label>
            <Input
              id="nombre"
              type="text"
              autoComplete="username"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. José Pérez"
            />
            <p className="text-xs text-muted-foreground">El que te asignó tu administrador.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Ingresar
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ¿Olvidaste tu contraseña? <span className="font-medium text-slate-700">Contacta al administrador.</span>
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
              Admin: <b>Administrador</b> / <b>admin123</b>
              <br />
              Empresario: <b>Alumno Demo</b> / <b>alumno123</b>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
