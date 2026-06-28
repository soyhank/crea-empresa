import * as React from "react";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { AppUser, Rol } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { normalizeUsername, isValidUsername } from "@/core/auth/identity";
import { generarPasswordTemporal, copiarAlPortapapeles } from "@/lib/password";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2, Copy, KeyRound, Loader2, Plus, RefreshCw, Search, ShieldCheck, Users, UserCheck, UserX, XCircle,
} from "lucide-react";

type Avail = "idle" | "invalid" | "checking" | "ok" | "taken";

function fechaCorta(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

/** Bloque de credenciales con botón copiar (se muestra una sola vez). */
function CredencialBox({ displayName, password }: { displayName: string; password: string }) {
  const copiar = async () => {
    const ok = await copiarAlPortapapeles(`Nombre: ${displayName}\nContraseña: ${password}`);
    toast[ok ? "success" : "error"](ok ? "Credenciales copiadas" : "No se pudo copiar");
  };
  return (
    <div className="rounded-lg border border-success/30 bg-success-soft p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="tabular">
          <div><span className="text-muted-foreground">Nombre:</span> <b>{displayName}</b></div>
          <div><span className="text-muted-foreground">Contraseña temporal:</span> <b className="font-mono">{password}</b></div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={copiar}><Copy /> Copiar</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Guárdala ahora: por seguridad no se volverá a mostrar.</p>
    </div>
  );
}

/** Diálogo "Crear usuario" con slug en vivo y contraseña temporal. */
function CrearUsuarioDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (cred: { displayName: string; password: string }) => void;
}) {
  const [displayName, setDisplayName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Rol>("user");
  const [avail, setAvail] = React.useState<Avail>("idle");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const slug = normalizeUsername(displayName);

  React.useEffect(() => {
    if (open) {
      setDisplayName("");
      setRole("user");
      setError(null);
      setAvail("idle");
      setPassword(generarPasswordTemporal());
    }
  }, [open]);

  React.useEffect(() => {
    if (!displayName.trim()) return setAvail("idle");
    if (!isValidUsername(slug)) return setAvail("invalid");
    setAvail("checking");
    const t = setTimeout(async () => {
      try {
        setAvail((await data.checkUsername(slug)) ? "ok" : "taken");
      } catch {
        setAvail("idle");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [displayName, slug]);

  const generar = async () => {
    const p = generarPasswordTemporal();
    setPassword(p);
    const ok = await copiarAlPortapapeles(p);
    if (ok) toast.success("Contraseña generada y copiada");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (avail === "taken") return setError(`El usuario «${slug}» ya existe`);
    if (avail === "invalid" || !isValidUsername(slug)) return setError("El nombre genera un usuario inválido");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setSaving(true);
    try {
      await data.createUser({ displayName: displayName.trim(), password, role });
      toast.success("Usuario creado");
      onCreated({ displayName: displayName.trim(), password });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>El empresario iniciará sesión con su nombre y esta contraseña.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="cu-nombre">Nombre de empresario</Label>
            <Input id="cu-nombre" required autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ej. José Pérez" />
            {displayName.trim() && (
              <p className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Usuario:</span>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-slate-700">{slug || "—"}</code>
                {avail === "checking" && <span className="text-muted-foreground">comprobando…</span>}
                {avail === "ok" && <span className="font-medium text-success">✓ disponible</span>}
                {avail === "taken" && <span className="font-medium text-danger">✗ ya existe</span>}
                {avail === "invalid" && <span className="font-medium text-danger">✗ nombre inválido</span>}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cu-pass">Contraseña temporal</Label>
            <div className="flex gap-2">
              <Input id="cu-pass" required value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" />
              <Button type="button" variant="outline" onClick={generar} title="Generar y copiar"><RefreshCw /> Generar</Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cu-role">Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Rol)}>
              <SelectTrigger id="cu-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Empresario (alumno)</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={saving || avail === "taken" || avail === "invalid"}>
            {saving && <Loader2 className="animate-spin" />} Crear usuario
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Diálogo "Resetear contraseña": genera, aplica y muestra una sola vez. */
function ResetPasswordDialog({ user, onClose }: { user: AppUser | null; onClose: () => void }) {
  const [password, setPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [aplicada, setAplicada] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setPassword(generarPasswordTemporal());
      setAplicada(false);
    }
  }, [user]);

  const aplicar = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await data.resetPassword(user.id, password);
      setAplicada(true);
      toast.success("Contraseña actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
          <DialogDescription>{user ? <>Para <b>{user.displayName}</b></> : null}</DialogDescription>
        </DialogHeader>
        {aplicada && user ? (
          <div className="space-y-3">
            <CredencialBox displayName={user.displayName} password={password} />
            <Button className="w-full" onClick={onClose}>Listo</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rp-pass">Nueva contraseña temporal</Label>
              <div className="flex gap-2">
                <Input id="rp-pass" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" />
                <Button type="button" variant="outline" onClick={() => setPassword(generarPasswordTemporal())} title="Regenerar"><RefreshCw /></Button>
              </div>
            </div>
            <Button className="w-full" onClick={aplicar} disabled={saving || password.length < 6}>
              {saving && <Loader2 className="animate-spin" />} Aplicar y mostrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = React.useState<AppUser[] | null>(null);
  const [openCrear, setOpenCrear] = React.useState(false);
  const [resetTarget, setResetTarget] = React.useState<AppUser | null>(null);
  const [credenciales, setCredenciales] = React.useState<{ displayName: string; password: string } | null>(null);
  const [busqueda, setBusqueda] = React.useState("");

  const reload = React.useCallback(() => {
    data.listUsers().then(setUsers).catch((e) => toast.error(e.message));
  }, []);
  React.useEffect(reload, [reload]);

  const filtrados = React.useMemo(() => {
    if (!users) return null;
    const q = normalizeUsername(busqueda);
    if (!q) return users;
    return users.filter((u) => u.username.includes(q) || normalizeUsername(u.displayName).includes(q));
  }, [users, busqueda]);

  const toggleActivo = async (u: AppUser) => {
    try {
      await data.setActive(u.id, !u.activo);
      toast.success(u.activo ? "Usuario desactivado" : "Usuario activado");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const cambiarRol = async (u: AppUser) => {
    const role: Rol = u.role === "admin" ? "user" : "admin";
    try {
      await data.setRole(u.id, role);
      toast.success(`Rol cambiado a ${role === "admin" ? "administrador" : "empresario"}`);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              <Users className="size-6 text-primary" /> Usuarios
              <Badge variant="default" className="ml-1">solo admin</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Crea y administra las cuentas. No hay registro público.</p>
          </div>
          <Button onClick={() => setOpenCrear(true)}><Plus /> Crear usuario</Button>
        </div>

        {credenciales && (
          <Alert variant="success" className="mb-4">
            <CheckCircle2 />
            <AlertTitle>Usuario creado</AlertTitle>
            <AlertDescription className="mt-2">
              <CredencialBox displayName={credenciales.displayName} password={credenciales.password} />
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCredenciales(null)}>Ocultar</Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-3 relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nombre…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nombre de empresario</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados === null ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtrados.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-12 text-center">
                      <Users className="mx-auto mb-2 size-8 text-muted-foreground" />
                      <p className="font-medium text-slate-900">{busqueda ? "Sin resultados" : "Aún no hay usuarios"}</p>
                      <p className="text-sm text-muted-foreground">{busqueda ? "Prueba con otro nombre." : "Crea la primera cuenta."}</p>
                      {!busqueda && <Button className="mt-3" size="sm" onClick={() => setOpenCrear(true)}><Plus /> Crear usuario</Button>}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-slate-900">{u.displayName}</TableCell>
                      <TableCell><code className="font-mono text-xs text-muted-foreground">{u.username}</code></TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "muted"}>
                          {u.role === "admin" ? "Administrador" : "Empresario"}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant={u.activo ? "success" : "muted"}>{u.activo ? "Activo" : "Inactivo"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fechaCorta(u.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Resetear contraseña" onClick={() => setResetTarget(u)}>
                            <KeyRound />
                          </Button>
                          <Button variant="ghost" size="icon" title={u.role === "admin" ? "Hacer empresario" : "Hacer administrador"} onClick={() => cambiarRol(u)} disabled={u.id === user?.id}>
                            <ShieldCheck />
                          </Button>
                          <Button variant="ghost" size="icon" title={u.activo ? "Desactivar" : "Activar"} onClick={() => toggleActivo(u)} disabled={u.id === user?.id}>
                            {u.activo ? <UserX className="text-danger" /> : <UserCheck className="text-success" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <CrearUsuarioDialog open={openCrear} onOpenChange={setOpenCrear} onCreated={(c) => { setCredenciales(c); reload(); }} />
      <ResetPasswordDialog user={resetTarget} onClose={() => setResetTarget(null)} />
    </div>
  );
}
