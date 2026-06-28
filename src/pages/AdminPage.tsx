import * as React from "react";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { AppUser } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { KeyRound, Loader2, Plus, ShieldCheck, UserCheck, UserX } from "lucide-react";

export function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = React.useState<AppUser[] | null>(null);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", nombre: "", password: "", role: "user" });
  const [saving, setSaving] = React.useState(false);

  const reload = React.useCallback(() => {
    data.adminAction("list", {}).then((r) => setUsers(r.users ?? [])).catch((e) => toast.error(e.message));
  }, []);
  React.useEffect(reload, [reload]);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await data.adminAction("create", form);
      toast.success("Usuario creado");
      setOpen(false);
      setForm({ email: "", nombre: "", password: "", role: "user" });
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (u: AppUser) => {
    await data.adminAction(u.activo ? "deactivate" : "activate", { userId: u.id });
    toast.success(u.activo ? "Usuario desactivado" : "Usuario activado");
    reload();
  };

  const cambiarRol = async (u: AppUser) => {
    const role = u.role === "admin" ? "user" : "admin";
    await data.adminAction("setRole", { userId: u.id, role });
    toast.success(`Rol cambiado a ${role}`);
    reload();
  };

  const resetPass = async (u: AppUser) => {
    const password = prompt(`Nueva contraseña para ${u.email} (mínimo 6 caracteres):`);
    if (!password) return;
    if (password.length < 6) return toast.error("Mínimo 6 caracteres");
    try {
      await data.adminAction("resetPassword", { userId: u.id, password });
      toast.success("Contraseña actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ShieldCheck className="size-6 text-primary" /> Gestión de usuarios
            </h1>
            <p className="text-sm text-muted-foreground">Crea y administra las cuentas. No hay registro público.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus /> Nuevo usuario</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear usuario</DialogTitle>
                <DialogDescription>Define las credenciales y el rol.</DialogDescription>
              </DialogHeader>
              <form onSubmit={crear} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="u-email">Correo</Label>
                  <Input id="u-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-nombre">Nombre</Label>
                  <Input id="u-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="u-pass">Contraseña</Label>
                    <Input id="u-pass" type="text" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="≥ 6 caracteres" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="u-role">Rol</Label>
                    <select
                      id="u-role"
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="user">Alumno</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />} Crear usuario
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {users === null ? (
          <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.nombre ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === "admin" ? "default" : "muted"}>
                          {u.role === "admin" ? "Administrador" : "Alumno"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.activo ? "success" : "danger"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Resetear contraseña" onClick={() => resetPass(u)}>
                            <KeyRound />
                          </Button>
                          <Button variant="ghost" size="icon" title="Cambiar rol" onClick={() => cambiarRol(u)} disabled={u.id === user?.id}>
                            <ShieldCheck />
                          </Button>
                          <Button variant="ghost" size="icon" title={u.activo ? "Desactivar" : "Activar"} onClick={() => toggleActivo(u)} disabled={u.id === user?.id}>
                            {u.activo ? <UserX className="text-danger" /> : <UserCheck className="text-success" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
