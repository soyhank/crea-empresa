import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/Brand";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const { signIn, modo, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Bienvenido");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/60 to-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Brand className="scale-125" />
          <div>
            <h1 className="text-xl font-semibold">Inicia sesión</h1>
            <p className="text-sm text-muted-foreground">Formula tu plan de negocio paso a paso.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Ingresar
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No hay registro público. Las cuentas las crea el administrador.
          </p>
        </form>

        {modo === "demo" && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="warning">Modo demo</Badge>
              <span className="text-muted-foreground">Supabase no configurado · datos locales</span>
            </div>
            <p className="text-foreground">
              Admin: <b>admin@demo.com</b> / <b>admin123</b>
              <br />
              Alumno: <b>alumno@demo.com</b> / <b>alumno123</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
