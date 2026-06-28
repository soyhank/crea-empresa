import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { Project } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { FileSpreadsheet, FolderOpen, Loader2, Plus, Trash2 } from "lucide-react";

export function DashboardPage() {
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [open, setOpen] = React.useState(false);
  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const reload = React.useCallback(() => {
    data.listProjects().then(setProjects).catch((e) => toast.error(e.message));
  }, []);
  React.useEffect(reload, [reload]);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      await data.createProject(nombre.trim(), descripcion.trim() || undefined);
      toast.success("Proyecto creado");
      setOpen(false);
      setNombre("");
      setDescripcion("");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto y todos sus datos?")) return;
    await data.deleteProject(id);
    toast.success("Proyecto eliminado");
    reload();
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mis proyectos</h1>
            <p className="text-sm text-muted-foreground">Cada proyecto es un plan de negocio completo.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus /> Nuevo proyecto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo proyecto</DialogTitle>
                <DialogDescription>Dale un nombre a tu plan de negocio.</DialogDescription>
              </DialogHeader>
              <form onSubmit={crear} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="np-nombre">Nombre</Label>
                  <Input id="np-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Bebida K-KORI" autoFocus />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-desc">Descripción (opcional)</Label>
                  <Input id="np-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Breve idea del negocio" />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />} Crear proyecto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {projects === null ? (
          <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FileSpreadsheet className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Aún no tienes proyectos</p>
                <p className="text-sm text-muted-foreground">Crea el primero para empezar a formular tu plan.</p>
              </div>
              <Button onClick={() => setOpen(true)}><Plus /> Nuevo proyecto</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id} className="group transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="truncate">{p.nombre}</span>
                    <Button variant="ghost" size="icon" className="size-7 opacity-0 transition group-hover:opacity-100" onClick={() => eliminar(p.id)}>
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </CardTitle>
                  {p.descripcion && <p className="line-clamp-2 text-xs text-muted-foreground">{p.descripcion}</p>}
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full">
                    <Link to={`/proyecto/${p.id}`}><FolderOpen /> Abrir</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
