import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { data } from "@/lib/data";
import type { Project, ProjectData } from "@/lib/types";
import { MODULO_POR_ID, type CosteoInput, type ModuloId } from "@/core/schemas";
import { calcularCosteo, calcularMercado, calcularPuntoEquilibrio } from "@/core/calc";
import { construirMercado } from "@/lib/derive";
import { isModuloCompleto } from "@/lib/wizard";
import { formatInteger, formatPEN } from "@/core/money";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { CircleAlert, CircleCheck, FileDown, FileSpreadsheet, Lock, Pencil } from "lucide-react";

/** Módulos cuyo cálculo alimenta el tablero completo (hasta flujo de caja). */
const REQUERIDOS: ModuloId[] = ["encuesta", "mercado", "costeo", "inversiones", "depreciacion", "ventas", "flujo_caja"];

const DONUT_COLORS = ["#6366f1", "#a5b4fc"];

function Scorecard({ label, valor, contexto, tono = "neutral", pendiente }: {
  label: string; valor: string; contexto?: React.ReactNode;
  tono?: "ok" | "bad" | "neutral"; pendiente?: boolean;
}) {
  const color = pendiente ? "text-muted-foreground" : tono === "ok" ? "text-success" : tono === "bad" ? "text-danger" : "text-slate-900";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <p className={`mt-1 text-4xl font-bold tabular ${color}`}>{valor}</p>
        {contexto && <p className="mt-1 text-xs text-muted-foreground">{contexto}</p>}
      </CardContent>
    </Card>
  );
}

function PendienteCard({ titulo, modulo }: { titulo: string; modulo: ModuloId }) {
  return (
    <Card className="border-dashed">
      <CardHeader><CardTitle className="text-sm text-muted-foreground">{titulo}</CardTitle></CardHeader>
      <CardContent className="flex h-32 items-center justify-center text-center text-xs text-muted-foreground">
        Disponible al completar «{MODULO_POR_ID[modulo].nombre}».
      </CardContent>
    </Card>
  );
}

export function TableroPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<Project | null>(null);
  const [projData, setProjData] = React.useState<ProjectData>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const p = await data.getProject(id);
      if (!active) return;
      if (!p) { toast.error("Proyecto no encontrado"); navigate("/proyectos", { replace: true }); return; }
      setProject(p); setProjData(p.data ?? {}); setLoading(false);
    })();
    return () => { active = false; };
  }, [id, navigate]);

  const completo = (m: ModuloId) => isModuloCompleto(m, projData);
  const mercadoOk = completo("mercado");
  const costeoOk = completo("costeo");
  const flujoOk = completo("flujo_caja");
  const pendientes = REQUERIDOS.filter((m) => !completo(m));

  const mercadoR = mercadoOk ? calcularMercado(construirMercado(projData)) : null;
  const demandaMensual = mercadoR?.demandaPorPeriodo ?? 0;
  const costeoR = costeoOk && mercadoOk ? calcularCosteo(projData.costeo as CosteoInput, { demandaMensual }) : null;
  const peR = costeoR
    ? calcularPuntoEquilibrio({ precioVenta: costeoR.valorVenta, costoVariableUnitario: costeoR.mpUnitario, costosFijos: costeoR.costosFijosMensuales })
    : null;

  const baseListo = mercadoOk && costeoOk;

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="mb-6 h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const volverUrl = `/proyectos/${id}/${projData.lastModulo ?? "mercado"}`;

  // Datos para gráficos disponibles.
  const donutData = costeoR ? [
    { name: "Costo variable unit.", value: costeoR.costoVariableUnitario },
    { name: "Costo fijo unit.", value: costeoR.costoFijoUnitario },
  ] : [];

  const peChart = (costeoR && peR && peR.unidades > 0)
    ? Array.from({ length: 9 }, (_, i) => {
        const u = Math.round((peR.unidades * 2 / 8) * i);
        return {
          u,
          Ingresos: u * costeoR.valorVenta,
          "Costo total": costeoR.costosFijosMensuales + u * costeoR.mpUnitario,
          "Costo variable": u * costeoR.mpUnitario,
        };
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="no-print sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <Link to="/proyectos"><Brand /></Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-900">{project.nombre}</h1>
          <p className="truncate text-xs text-muted-foreground">{project.rubro || "Sin rubro"} · Tablero de resultados</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}><FileDown /> Exportar PDF</Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <span><Button variant="outline" size="sm" disabled><FileSpreadsheet /> Exportar Excel</Button></span>
          </TooltipTrigger>
          <TooltipContent>Próximamente</TooltipContent>
        </Tooltip>
        <Button size="sm" asChild><Link to={volverUrl}><Pencil /> Volver a editar</Link></Button>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        {!baseListo ? (
          // Estado bloqueado
          <Card className="mx-auto max-w-xl">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary"><Lock className="size-6 text-muted-foreground" /></div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tablero bloqueado</h2>
                <p className="text-sm text-muted-foreground">Para ver el tablero completa:</p>
              </div>
              <ul className="w-full max-w-sm space-y-1.5 text-left">
                {pendientes.map((m) => (
                  <li key={m}>
                    <Link to={`/proyectos/${id}/${m}`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary">
                      <CircleAlert className="size-4 text-warning" /> {MODULO_POR_ID[m].nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {!flujoOk && (
              <Alert variant="warning" className="no-print">
                <CircleAlert />
                <AlertTitle>Tablero parcial</AlertTitle>
                <AlertDescription>
                  VAN, TIR, Payback, inversión, proyección a 36 meses y estados financieros aparecerán al completar:{" "}
                  {pendientes.filter((m) => !["encuesta", "mercado", "costeo"].includes(m)).map((m, i, arr) => (
                    <React.Fragment key={m}>
                      <Link to={`/proyectos/${id}/${m}`} className="font-medium text-primary underline-offset-2 hover:underline">{MODULO_POR_ID[m].nombre}</Link>
                      {i < arr.length - 1 ? ", " : ""}
                    </React.Fragment>
                  ))}.
                </AlertDescription>
              </Alert>
            )}

            {/* 1. Scorecards */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Indicadores clave</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Scorecard label="VAN (VANE)" valor="—" contexto="Completa Flujo de caja" pendiente />
                <Scorecard label="TIR (TIRE)" valor="—" contexto="Completa Flujo de caja" pendiente />
                <Scorecard label="Payback" valor="—" contexto="Completa Flujo de caja" pendiente />
                <Scorecard label="Punto de equilibrio" valor={peR ? `${formatInteger(peR.unidades)}` : "—"} contexto={peR ? <>unid · {formatPEN(peR.soles)}</> : undefined} />
                <Scorecard label="Inversión total" valor="—" contexto="Completa Inversiones" pendiente />
                <Scorecard label="Precio de venta" valor={costeoR ? formatPEN(costeoR.precioVenta) : "—"} contexto="con IGV" tono="neutral" />
              </div>
            </section>

            {/* 2. Gráficos */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Gráficos</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Composición del costo unitario</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                          {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                        </Pie>
                        <RTooltip formatter={(v: number) => formatPEN(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm">Punto de equilibrio</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={peChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <XAxis dataKey="u" fontSize={11} tickLine={false} label={{ value: "unidades", position: "insideBottom", offset: -2, fontSize: 10 }} />
                        <YAxis fontSize={11} tickLine={false} width={48} tickFormatter={(v: number) => formatInteger(v)} />
                        <RTooltip formatter={(v: number) => formatPEN(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {peR && <ReferenceLine x={Math.round(peR.unidades)} stroke="#e11d48" strokeDasharray="4 4" label={{ value: "PE", fontSize: 10, fill: "#e11d48" }} />}
                        <Line type="monotone" dataKey="Ingresos" stroke="#16a34a" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="Costo total" stroke="#6366f1" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="Costo variable" stroke="#f59e0b" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <PendienteCard titulo="Demanda / ventas a 36 meses" modulo="ventas" />
                <PendienteCard titulo="Flujo de caja por escenario" modulo="flujo_caja" />
              </div>
            </section>

            {/* 3. Comparativa de escenarios */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Comparativa de escenarios</h2>
              <PendienteCard titulo="Optimista / Moderado / Pesimista" modulo="flujo_caja" />
            </section>

            {/* 4. Estados financieros */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Estados financieros</h2>
              <PendienteCard titulo="EERR · Situación financiera · Ratios" modulo="estados_financieros" />
            </section>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CircleCheck className="size-3.5 text-success" /> Todos los valores se recalculan desde los inputs; nada se persiste.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
