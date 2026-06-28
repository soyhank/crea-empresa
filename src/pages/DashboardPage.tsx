import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { Project } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { isModuloCompleto, modulosCompletos, porcentajeAvance, TOTAL_MODULOS } from "@/lib/wizard";
import { calcularMercado } from "@/core/calc";
import { formatNumber } from "@/core/money";
import type { MercadoInput } from "@/core/schemas";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy, Download, FileSpreadsheet, FolderOpen, Loader2, MoreVertical, Pencil, Plus, Search, Trash2, TrendingUp,
} from "lucide-react";

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} día${d === 1 ? "" : "s"}`;
  try {
    return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

type Estado = "todos" | "completos" | "progreso";
type Orden = "recientes" | "nombre" | "avance";

function ProjectCard({ p, onOpen, onRename, onDuplicate, onExport, onDelete }: {
  p: Project;
  onOpen: (p: Project) => void;
  onRename: (p: Project) => void;
  onDuplicate: (p: Project) => void;
  onExport: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const completos = modulosCompletos(p.data);
  const avance = porcentajeAvance(p.data);
  const mercadoOk = isModuloCompleto("mercado", p.data);
  const demanda = mercadoOk ? calcularMercado(p.data.mercado as MercadoInput).demandaAnual : null;

  return (
    <Card className="group flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => onOpen(p)} className="min-w-0 text-left">
            <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900">{p.nombre}</h3>
            <p className="truncate text-xs text-muted-foreground">{p.rubro || "Sin rubro"}</p>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Más acciones">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onOpen(p)}><FolderOpen /> Abrir</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRename(p)}><Pencil /> Renombrar</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDuplicate(p)}><Copy /> Duplicar</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onExport(p)}><Download /> Exportar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onDelete(p)}><Trash2 /> Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">{completos}/{TOTAL_MODULOS} módulos</span>
            <span className="tabular text-muted-foreground">{avance}% completo</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avance}%` }} />
          </div>
        </div>

        <div className="min-h-[24px]">
          {demanda != null ? (
            <Badge variant="muted" className="gap-1">
              <TrendingUp className="size-3" /> Demanda {formatNumber(demanda)}/año
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Sin cálculos todavía</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Editado {tiempoRelativo(p.updatedAt)}</span>
          <Button variant="secondary" size="sm" onClick={() => onOpen(p)}><FolderOpen /> Abrir</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [busqueda, setBusqueda] = React.useState("");
  const [estado, setEstado] = React.useState<Estado>("todos");
  const [orden, setOrden] = React.useState<Orden>("recientes");
  const [soloMios, setSoloMios] = React.useState(true);

  // Dialogs
  const [openNuevo, setOpenNuevo] = React.useState(false);
  const [form, setForm] = React.useState({ nombre: "", rubro: "", descripcion: "" });
  const [saving, setSaving] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null);

  const reload = React.useCallback(() => {
    data.listProjects().then(setProjects).catch((e) => toast.error(e.message));
  }, []);
  React.useEffect(reload, [reload]);

  const abrir = (p: Project) => navigate(`/proyectos/${p.id}`);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      const p = await data.createProject({ nombre: form.nombre.trim(), rubro: form.rubro.trim() || undefined, descripcion: form.descripcion.trim() || undefined });
      toast.success("Proyecto creado");
      navigate(`/proyectos/${p.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const duplicar = async (p: Project) => {
    try {
      await data.duplicateProject(p.id);
      toast.success("Proyecto duplicado");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const exportar = (p: Project) => {
    const blob = new Blob([JSON.stringify({ nombre: p.nombre, rubro: p.rubro, descripcion: p.descripcion, data: p.data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.nombre.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eliminar = async () => {
    if (!deleteTarget) return;
    try {
      await data.deleteProject(deleteTarget.id);
      toast.success("Proyecto eliminado");
      setDeleteTarget(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const visibles = React.useMemo(() => {
    if (!projects) return null;
    let list = projects;
    if (user?.role === "admin" && soloMios) list = list.filter((p) => p.userId === user.id);
    const q = busqueda.trim().toLowerCase();
    if (q) list = list.filter((p) => p.nombre.toLowerCase().includes(q) || (p.rubro ?? "").toLowerCase().includes(q));
    if (estado !== "todos") {
      list = list.filter((p) => {
        const av = porcentajeAvance(p.data);
        return estado === "completos" ? av === 100 : av < 100;
      });
    }
    const arr = [...list];
    if (orden === "nombre") arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (orden === "avance") arr.sort((a, b) => porcentajeAvance(b.data) - porcentajeAvance(a.data));
    else arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return arr;
  }, [projects, busqueda, estado, orden, soloMios, user]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Mis proyectos</h1>
            <p className="text-sm text-muted-foreground">Cada proyecto es un plan de negocio completo.</p>
          </div>
          <Button onClick={() => setOpenNuevo(true)}><Plus /> Nuevo proyecto</Button>
        </div>

        {/* Utilidades */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por nombre…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <Select value={estado} onValueChange={(v) => setEstado(v as Estado)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="completos">Completos</SelectItem>
              <SelectItem value="progreso">En progreso</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orden} onValueChange={(v) => setOrden(v as Orden)}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recientes">Recientes</SelectItem>
              <SelectItem value="nombre">Nombre</SelectItem>
              <SelectItem value="avance">% avance</SelectItem>
            </SelectContent>
          </Select>
          {user?.role === "admin" && (
            <div className="flex overflow-hidden rounded-lg border border-input">
              <button onClick={() => setSoloMios(true)} className={`px-3 py-1.5 text-sm ${soloMios ? "bg-primary text-primary-foreground" : "bg-white text-slate-700"}`}>Mis proyectos</button>
              <button onClick={() => setSoloMios(false)} className={`px-3 py-1.5 text-sm ${!soloMios ? "bg-primary text-primary-foreground" : "bg-white text-slate-700"}`}>Todos</button>
            </div>
          )}
        </div>

        {/* Cuadrícula */}
        {visibles === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardHeader className="pb-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="mt-2 h-3 w-1/2" /></CardHeader>
                <CardContent className="space-y-3"><Skeleton className="h-1.5 w-full" /><Skeleton className="h-5 w-32" /><Skeleton className="h-8 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FileSpreadsheet className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium text-slate-900">{busqueda || estado !== "todos" ? "Sin resultados" : "Aún no tienes proyectos"}</p>
                <p className="text-sm text-muted-foreground">{busqueda || estado !== "todos" ? "Ajusta la búsqueda o los filtros." : "Crea el primero para empezar a formular tu plan."}</p>
              </div>
              {!busqueda && estado === "todos" && <Button onClick={() => setOpenNuevo(true)}><Plus /> Crear mi primer proyecto</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibles.map((p) => (
              <ProjectCard key={p.id} p={p} onOpen={abrir} onRename={setRenameTarget} onDuplicate={duplicar} onExport={exportar} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </main>

      {/* Dialog nuevo proyecto */}
      <Dialog open={openNuevo} onOpenChange={setOpenNuevo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
            <DialogDescription>Dale un nombre a tu plan de negocio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={crear} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="np-nombre">Nombre</Label>
              <Input id="np-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Bebida K-KORI" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-rubro">Rubro (opcional)</Label>
              <Input id="np-rubro" value={form.rubro} onChange={(e) => setForm({ ...form, rubro: e.target.value })} placeholder="Ej. Bebidas / Alimentos" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-desc">Descripción (opcional)</Label>
              <Input id="np-desc" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Breve idea del negocio" />
            </div>
            <Button type="submit" className="w-full" disabled={saving || !form.nombre.trim()}>
              {saving && <Loader2 className="animate-spin" />} Crear y empezar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog renombrar */}
      <RenameDialog project={renameTarget} onClose={() => setRenameTarget(null)} onSaved={() => { setRenameTarget(null); reload(); }} />

      {/* Dialog eliminar */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar proyecto</DialogTitle>
            <DialogDescription>
              Esta acción es <b>irreversible</b>. Se eliminará «{deleteTarget?.nombre}» y todos sus datos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={eliminar}><Trash2 /> Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RenameDialog({ project, onClose, onSaved }: { project: Project | null; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = React.useState("");
  const [rubro, setRubro] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (project) {
      setNombre(project.nombre);
      setRubro(project.rubro ?? "");
      setDescripcion(project.descripcion ?? "");
    }
  }, [project]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !nombre.trim()) return;
    setSaving(true);
    try {
      await data.updateProject(project.id, { nombre: nombre.trim(), rubro: rubro.trim() || null, descripcion: descripcion.trim() || null });
      toast.success("Proyecto actualizado");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!project} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renombrar proyecto</DialogTitle>
          <DialogDescription>Actualiza el nombre, rubro o descripción.</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rn-nombre">Nombre</Label>
            <Input id="rn-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rn-rubro">Rubro</Label>
            <Input id="rn-rubro" value={rubro} onChange={(e) => setRubro(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rn-desc">Descripción</Label>
            <Input id="rn-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={saving || !nombre.trim()}>
            {saving && <Loader2 className="animate-spin" />} Guardar cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
