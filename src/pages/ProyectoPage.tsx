import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { Project, ProjectData } from "@/lib/types";
import { MODULOS, MODULO_POR_ID, mercadoInputSchema, type MercadoInput, type ModuloId } from "@/core/schemas";
import { calcularEstados, isModuloCompleto, porcentajeAvance } from "@/lib/wizard";
import { TopBar } from "@/components/TopBar";
import { SidebarWizard } from "@/features/proyecto/SidebarWizard";
import { MercadoForm } from "@/features/mercado/MercadoForm";
import { MercadoResultados } from "@/features/mercado/MercadoResultados";
import { mercadoVacio, mercadoEjemploKkori } from "@/features/mercado/defaults";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CloudUpload, Construction, ListChecks, Sparkles, Zap,
} from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

export function ProyectoPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<Project | null>(null);
  const [projData, setProjData] = React.useState<ProjectData>({});
  const [activo, setActivo] = React.useState<ModuloId>("mercado");
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const p = await data.getProject(id);
      if (!active) return;
      if (!p) {
        toast.error("Proyecto no encontrado");
        navigate("/proyectos", { replace: true });
        return;
      }
      setProject(p);
      setProjData(p.data ?? {});
      setActivo(p.data?.lastModulo ?? "mercado");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const estados = React.useMemo(() => calcularEstados(projData), [projData]);
  const avance = React.useMemo(() => porcentajeAvance(projData), [projData]);

  const scheduleSave = React.useCallback(
    (next: ProjectData) => {
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          await data.saveData(id, next);
          setSaveState("saved");
        } catch (e) {
          setSaveState("idle");
          toast.error(e instanceof Error ? e.message : "No se pudo guardar");
        }
      }, 600);
    },
    [id],
  );

  const patchData = (patch: ProjectData) => {
    setProjData((prev) => {
      const next = { ...prev, ...patch };
      scheduleSave(next);
      return next;
    });
  };

  const updateMercado = (next: MercadoInput) => patchData({ mercado: next, lastModulo: "mercado" });

  const selectModulo = (mid: ModuloId) => {
    setActivo(mid);
    setLeftOpen(false);
    patchData({ lastModulo: mid });
  };

  const mercadoValue = (projData.mercado as MercadoInput | undefined) ?? mercadoVacio();

  const validarYContinuar = () => {
    const parsed = mercadoInputSchema.safeParse(mercadoValue);
    if (!parsed.success) {
      toast.error("Completa los campos requeridos para validar el módulo.");
      return;
    }
    toast.success("Módulo de Mercado completo ✓");
    const next = MODULOS.find((m) => m.orden === MODULO_POR_ID[activo].orden + 1);
    if (next) selectModulo(next.id);
  };

  const cargarEjemplo = () => {
    updateMercado(mercadoEjemploKkori());
    toast.success("Ejemplo K-KORI cargado");
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_360px]">
          <div className="hidden space-y-3 border-r border-border p-4 lg:block">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
          <div className="mx-auto w-full max-w-2xl space-y-4 px-6 py-6">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="hidden space-y-3 border-l border-border p-4 lg:block">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const meta = MODULO_POR_ID[activo];
  const esMercado = activo === "mercado";
  const mercadoCompleto = isModuloCompleto("mercado", projData);

  const resultados = esMercado ? <MercadoResultados value={mercadoValue} /> : (
    <p className="text-sm text-muted-foreground">Los resultados en vivo de este módulo aparecerán aquí.</p>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        leftSlot={
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link to="/proyectos" aria-label="Volver a proyectos"><ArrowLeft /></Link>
          </Button>
        }
        centerSlot={project.nombre}
      />

      {/* Barra móvil: abre los paneles laterales como drawers */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 lg:hidden">
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm"><ListChecks /> Módulos</Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetTitle>Módulos del proyecto</SheetTitle>
            <SidebarWizard estados={estados} activo={activo} onSelect={selectModulo} avance={avance} />
          </SheetContent>
        </Sheet>
        <span className="flex-1 truncate text-sm font-medium text-slate-700">{project.nombre}</span>
        <Sheet open={rightOpen} onOpenChange={setRightOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm"><Zap /> Resultados</Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto p-4">
            <SheetTitle>Resultados en vivo</SheetTitle>
            <div aria-live="polite">{resultados}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[260px_1fr_360px]">
        <aside className="hidden border-r border-border bg-card lg:block">
          <SidebarWizard estados={estados} activo={activo} onSelect={selectModulo} avance={avance} />
        </aside>

        <main className="min-w-0 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900">{meta.nombre}</h1>
                  {esMercado && mercadoCompleto && <Badge variant="success"><Check className="size-3" /> Completo</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{meta.descripcion}</p>
              </div>
              <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                {saveState === "saving" && <><CloudUpload className="size-3.5 animate-pulse" /> Guardando…</>}
                {saveState === "saved" && <><CheckCircle2 className="size-3.5 text-success" /> Guardado</>}
              </span>
            </div>

            {esMercado ? (
              <>
                <div className="mb-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={cargarEjemplo}>
                    <Sparkles /> Cargar ejemplo K-KORI
                  </Button>
                </div>
                <MercadoForm value={mercadoValue} onChange={updateMercado} />
                <Separator className="mt-8" />
                <div className="mt-5 flex justify-end">
                  <Button onClick={validarYContinuar}>
                    Validar y continuar <ArrowRight />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-16 text-center">
                <Construction className="size-10 text-muted-foreground" />
                <div>
                  <p className="font-medium text-slate-900">Módulo en construcción</p>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    {meta.descripcion} Se habilitará en el siguiente sprint, replicando el patrón
                    de cálculo en vivo del módulo de Mercado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden border-l border-border bg-card lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4" aria-live="polite">
            {resultados}
          </div>
        </aside>
      </div>
    </div>
  );
}
