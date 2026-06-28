import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { Project, ProjectData } from "@/lib/types";
import {
  MODULOS, MODULO_POR_ID, moduloIdSchema, type CosteoInput, type MercadoInput, type ModuloId,
} from "@/core/schemas";
import { calcularMercado } from "@/core/calc";
import { calcularEstados, isModuloCompleto, modulosAguasAbajo, modulosCompletos, tieneDatos } from "@/lib/wizard";
import { TopBar } from "@/components/TopBar";
import { SidebarWizard } from "@/features/proyecto/SidebarWizard";
import { MercadoForm } from "@/features/mercado/MercadoForm";
import { MercadoResultados } from "@/features/mercado/MercadoResultados";
import { mercadoVacio, mercadoEjemploKkori } from "@/features/mercado/defaults";
import { CosteoForm } from "@/features/costeo/CosteoForm";
import { CosteoResultados } from "@/features/costeo/CosteoResultados";
import { costeoVacio, costeoEjemploKkori } from "@/features/costeo/defaults";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CloudUpload, Construction, ListChecks, Sparkles, Zap,
} from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

export function ProyectoPage() {
  const { id = "", modulo } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<Project | null>(null);
  const [projData, setProjData] = React.useState<ProjectData>({});
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const moduloValido = moduloIdSchema.safeParse(modulo).success ? (modulo as ModuloId) : null;

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
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  // Normaliza la URL: si el módulo es inválido, redirige al último editado.
  React.useEffect(() => {
    if (!loading && project && !moduloValido) {
      navigate(`/proyectos/${id}/${projData.lastModulo ?? "mercado"}`, { replace: true });
    }
  }, [loading, project, moduloValido, id, projData.lastModulo, navigate]);

  const activo: ModuloId = moduloValido ?? "mercado";

  const estados = React.useMemo(() => calcularEstados(projData), [projData]);
  const completos = React.useMemo(() => modulosCompletos(projData), [projData]);
  const needsReview = React.useMemo(() => new Set(projData._needsReview ?? []), [projData._needsReview]);

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
      }, 300);
    },
    [id],
  );

  // Editar un módulo: guarda + marca aguas abajo (con datos) como "necesita revisión".
  const editarModulo = (mod: ModuloId, inputs: unknown) => {
    setProjData((prev) => {
      const downstream = modulosAguasAbajo(mod).filter((mid) => tieneDatos(mid, prev));
      const review = Array.from(new Set([...(prev._needsReview ?? []), ...downstream]));
      const next: ProjectData = { ...prev, [mod]: inputs, lastModulo: mod, _needsReview: review };
      scheduleSave(next);
      return next;
    });
  };

  const selectModulo = (mid: ModuloId) => {
    setLeftOpen(false);
    setProjData((prev) => {
      const next: ProjectData = { ...prev, lastModulo: mid, _needsReview: (prev._needsReview ?? []).filter((x) => x !== mid) };
      scheduleSave(next);
      return next;
    });
    navigate(`/proyectos/${id}/${mid}`);
  };

  const cargarEjemplo = (mod: ModuloId) => {
    if (mod === "mercado") editarModulo("mercado", mercadoEjemploKkori());
    else if (mod === "costeo") editarModulo("costeo", costeoEjemploKkori());
    toast.success("Ejemplo K-KORI cargado");
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_230px]">
          <div className="hidden space-y-3 border-r border-border p-4 md:block">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
          <div className="mx-auto w-full max-w-2xl space-y-4 px-6 py-6">
            <Skeleton className="h-7 w-1/2" /><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" />
          </div>
          <div className="hidden space-y-3 border-l border-border p-4 xl:block">
            <Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const meta = MODULO_POR_ID[activo];

  // Contexto aguas arriba para módulos que dependen de cálculos previos.
  const demandaMensual = isModuloCompleto("mercado", projData)
    ? calcularMercado(projData.mercado as MercadoInput).demandaPorPeriodo
    : 0;

  const mercadoValue = (projData.mercado as MercadoInput | undefined) ?? mercadoVacio();
  const costeoValue = (projData.costeo as CosteoInput | undefined) ?? costeoVacio();
  const tieneForm = activo === "mercado" || activo === "costeo";

  const formNode =
    activo === "mercado" ? (
      <MercadoForm value={mercadoValue} onChange={(n) => editarModulo("mercado", n)} />
    ) : activo === "costeo" ? (
      <CosteoForm value={costeoValue} onChange={(n) => editarModulo("costeo", n)} />
    ) : null;

  const prevMod = MODULOS.find((m) => m.orden === meta.orden - 1);
  const nextMod = MODULOS.find((m) => m.orden === meta.orden + 1);
  const nextBloqueado = nextMod ? estados[nextMod.id].estado === "bloqueado" : true;

  const revisarAbajo = (projData._needsReview ?? []).filter((mid) => MODULO_POR_ID[mid].orden > meta.orden);

  const wizard = (
    <SidebarWizard
      estados={estados}
      activo={activo}
      onSelect={selectModulo}
      completos={completos}
      needsReview={needsReview}
      tableroHabilitado={estados.flujo_caja.estado === "completo"}
      onVerTablero={() => navigate(`/proyectos/${id}/tablero`)}
    />
  );

  const resultados =
    activo === "mercado" ? <MercadoResultados value={mercadoValue} /> :
    activo === "costeo" ? <CosteoResultados value={costeoValue} demandaMensual={demandaMensual} /> : (
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

      {/* Barra para abrir el wizard en móvil (<md) */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 md:hidden">
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm"><ListChecks /> Módulos</Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetTitle>Módulos del proyecto</SheetTitle>
            {wizard}
          </SheetContent>
        </Sheet>
        <span className="flex-1 truncate text-sm font-medium text-slate-700">{project.nombre}</span>
      </div>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_230px]">
        <aside className="hidden border-r border-border bg-card md:block">{wizard}</aside>

        <main className="min-w-0 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900">{meta.nombre}</h1>
                  {estados[activo].estado === "completo" && <Badge variant="success">Completo</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{meta.descripcion}</p>
              </div>
              <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                {saveState === "saving" && <><CloudUpload className="size-3.5 animate-pulse" /> Guardando…</>}
                {saveState === "saved" && <><CheckCircle2 className="size-3.5 text-success" /> Guardado</>}
              </span>
            </div>

            {revisarAbajo.length > 0 && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangle />
                <AlertDescription>
                  Cambiaste datos que afectan a {revisarAbajo.map((m) => MODULO_POR_ID[m].nombre).join(", ")}. Se recalcularán.
                </AlertDescription>
              </Alert>
            )}

            {tieneForm ? (
              <>
                <div className="mb-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => cargarEjemplo(activo)}><Sparkles /> Cargar ejemplo K-KORI</Button>
                </div>
                {formNode}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-16 text-center">
                <Construction className="size-10 text-muted-foreground" />
                <div>
                  <p className="font-medium text-slate-900">Módulo en construcción</p>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    {meta.descripcion} Se habilitará en el siguiente sprint, replicando el patrón del módulo de Mercado.
                  </p>
                </div>
              </div>
            )}

            {/* Footer navegación */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <Button variant="outline" disabled={!prevMod} onClick={() => prevMod && selectModulo(prevMod.id)}>
                <ArrowLeft /> Anterior
              </Button>
              <Button disabled={!nextMod || nextBloqueado} onClick={() => nextMod && selectModulo(nextMod.id)}>
                Siguiente módulo <ArrowRight />
              </Button>
            </div>
          </div>
        </main>

        {/* Panel derecho (xl) */}
        <aside className="hidden border-l border-border bg-card xl:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4" aria-live="polite">{resultados}</div>
        </aside>
      </div>

      {/* Botón flotante "Ver resultados" (<xl) */}
      <Sheet open={rightOpen} onOpenChange={setRightOpen}>
        <SheetTrigger asChild>
          <Button className="fixed bottom-6 right-6 z-20 shadow-md xl:hidden" size="lg">
            <Zap /> Ver resultados
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="overflow-y-auto p-4">
          <SheetTitle>Resultados de este módulo</SheetTitle>
          <div aria-live="polite">{resultados}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
