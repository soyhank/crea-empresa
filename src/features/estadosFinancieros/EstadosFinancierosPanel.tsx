import * as React from "react";
import type { EstadosEscenario, EstadosFinancierosResult, RatiosAnio } from "@/core/schemas";
import { formatPEN, formatPercent, formatNumber } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

type Clave = "moderado" | "optimista" | "pesimista";
const ESCENARIOS: Clave[] = ["moderado", "optimista", "pesimista"];
const NOMBRE: Record<Clave, string> = { moderado: "Moderado", optimista: "Optimista", pesimista: "Pesimista" };

/** Negativos con signo "-" (no entre paréntesis). */
const contable = (v: number) => (v < 0 ? `- ${formatPEN(-v)}` : formatPEN(v));

function EscenarioSelector({ value, onChange }: { value: Clave; onChange: (c: Clave) => void }) {
  return (
    <div className="mb-3 inline-flex overflow-hidden rounded-lg border border-input">
      {ESCENARIOS.map((c) => (
        <button key={c} onClick={() => onChange(c)} className={cn("px-3 py-1.5 text-sm", value === c ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 hover:bg-slate-50")}>
          {NOMBRE[c]}
        </button>
      ))}
    </div>
  );
}

const TH = "px-4 py-2 text-right text-xs font-medium text-muted-foreground";
const LBL = "px-4 py-1.5 text-left";
const VAL = "px-4 py-1.5 text-right tabular";

function EERR({ esc }: { esc: EstadosEscenario }) {
  return (
    <Card><CardContent className="overflow-x-auto p-0">
      <table className="w-full min-w-[480px] text-sm">
        <thead><tr className="border-b border-border"><th className={TH + " text-left"}>Concepto</th>{esc.eerr.map((a) => <th key={a.anio} className={TH}>Año {a.anio}</th>)}</tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className={LBL + " font-medium text-slate-900"}>Ventas</td>{esc.eerr.map((a) => <td key={a.anio} className={VAL + " font-medium"}>{contable(a.ventas)}</td>)}</tr>
          <tr><td className={LBL + " text-slate-600"}>(-) Costo de ventas</td>{esc.eerr.map((a) => <td key={a.anio} className={VAL + " text-slate-600"}>{contable(-a.costoVentas)}</td>)}</tr>
          <tr className="bg-slate-50"><td className={LBL + " font-medium"}>Ganancia bruta</td>{esc.eerr.map((a) => <td key={a.anio} className={VAL + " font-medium"}>{contable(a.gananciaBruta)}</td>)}</tr>
          <tr><td className={LBL + " text-slate-600"}>(-) Gastos administrativos</td>{esc.eerr.map((a) => <td key={a.anio} className={VAL + " text-slate-600"}>{contable(-a.gastosAdmin)}</td>)}</tr>
          <tr className="bg-slate-50"><td className={LBL + " font-medium"}>Resultado antes de IR (UAII)</td>{esc.eerr.map((a) => <td key={a.anio} className={VAL + " font-medium"}>{contable(a.uaii)}</td>)}</tr>
          <tr><td className={LBL + " text-slate-600"}>(-) Impuesto a la renta (29.5%)</td>{esc.eerr.map((a) => <td key={a.anio} className={VAL + " text-slate-600"}>{contable(-a.ir)}</td>)}</tr>
          <tr className="bg-accent"><td className={LBL + " font-bold text-primary"}>Resultado del ejercicio</td>{esc.eerr.map((a) => <td key={a.anio} className={cn(VAL, "font-bold", a.resultadoEjercicio >= 0 ? "text-success" : "text-danger")}>{contable(a.resultadoEjercicio)}</td>)}</tr>
        </tbody>
      </table>
    </CardContent></Card>
  );
}

function ESF({ esc }: { esc: EstadosEscenario }) {
  const filas: Array<[string, (i: number) => number, "h" | "sub" | "tot" | "neg" | ""]> = [
    ["Activos corrientes", () => NaN, "h"],
    ["Efectivo y equivalente", (i) => esc.esf[i].efectivo, ""],
    ["Cuentas por cobrar comerciales", (i) => esc.esf[i].cuentasCobrar, ""],
    ["Inventario", (i) => esc.esf[i].inventario, ""],
    ["Total activos corrientes", (i) => esc.esf[i].totalActivoCte, "sub"],
    ["Activos no corrientes", () => NaN, "h"],
    ["Inmueble, maquinaria y equipos", (i) => esc.esf[i].activoFijoNeto, ""],
    ["(-) Depreciación y amortización", (i) => -esc.esf[i].deprecAmortAcum, "neg"],
    ["Cuentas por cobrar LP", (i) => esc.esf[i].cuentasCobrarLP, ""],
    ["Total activos no corrientes", (i) => esc.esf[i].totalActivoNoCte, "sub"],
    ["TOTAL ACTIVOS", (i) => esc.esf[i].totalActivos, "tot"],
  ];
  const filasPP: Array<[string, (i: number) => number, "h" | "sub" | "tot" | ""]> = [
    ["Pasivos corrientes", () => NaN, "h"],
    ["Tributos - IGV", (i) => esc.esf[i].tributosIGV, ""],
    ["Cuentas por pagar", (i) => esc.esf[i].cuentasPagar, ""],
    ["Impuesto a la renta", (i) => esc.esf[i].irPorPagar, ""],
    ["Total pasivos corrientes", (i) => esc.esf[i].totalPasivoCte, "sub"],
    ["TOTAL PASIVO", (i) => esc.esf[i].totalPasivo, "sub"],
    ["Patrimonio", () => NaN, "h"],
    ["Capital social", (i) => esc.esf[i].capitalSocial, ""],
    ["Utilidad del ejercicio", (i) => esc.esf[i].utilidadEjercicio, ""],
    ["Total patrimonio", (i) => esc.esf[i].totalPatrimonio, "sub"],
    ["TOTAL PASIVO Y PATRIMONIO", (i) => esc.esf[i].totalPasivoPatrimonio, "tot"],
  ];
  const render = (filas: Array<[string, (i: number) => number, string]>) =>
    filas.map(([label, fn, kind]) =>
      kind === "h" ? (
        <tr key={label} className="bg-slate-100"><td colSpan={4} className="px-4 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</td></tr>
      ) : (
        <tr key={label} className={cn("border-b border-border", kind === "tot" && "bg-slate-50")}>
          <td className={cn(LBL, kind === "sub" && "font-medium", kind === "tot" && "font-bold")}>{label}</td>
          {[0, 1, 2].map((i) => <td key={i} className={cn(VAL, kind === "sub" && "font-medium", kind === "tot" && "font-bold")}>{contable(fn(i))}</td>)}
        </tr>
      ),
    );

  return (
    <Card><CardContent className="overflow-x-auto p-0">
      <table className="w-full min-w-[520px] text-sm">
        <thead><tr className="border-b border-border"><th className={TH + " text-left"}>Concepto</th>{esc.esf.map((a) => <th key={a.anio} className={TH}>Año {a.anio}</th>)}</tr></thead>
        <tbody>
          {render(filas)}
          <tr><td colSpan={4} className="h-2" /></tr>
          {render(filasPP)}
          <tr><td className={LBL}>Cuadre</td>{esc.esf.map((a) => <td key={a.anio} className="px-4 py-1.5 text-right">{a.cuadra ? <Badge variant="success"><CheckCircle2 className="size-3" /> Cuadra</Badge> : <Badge variant="danger"><XCircle className="size-3" /> Descuadre</Badge>}</td>)}</tr>
        </tbody>
      </table>
    </CardContent></Card>
  );
}

// Semáforo por ratio.
type Tono = "ok" | "warn" | "bad";
const claseTono: Record<Tono, string> = { ok: "text-success", warn: "text-warning", bad: "text-danger" };
const tono = (key: string, v: number): Tono => {
  switch (key) {
    case "ratioCorriente": case "solvencia": return v > 1.5 ? "ok" : v >= 1 ? "warn" : "bad";
    case "pruebaAcida": return v > 1 ? "ok" : v >= 0.7 ? "warn" : "bad";
    case "endeudamActivo": return v < 0.5 ? "ok" : v <= 0.7 ? "warn" : "bad";
    case "margenNeto": return v > 0.2 ? "ok" : v >= 0.1 ? "warn" : "bad";
    case "roa": return v > 0.15 ? "ok" : v >= 0.08 ? "warn" : "bad";
    case "roe": return v > 0.2 ? "ok" : v >= 0.1 ? "warn" : "bad";
    default: return "ok";
  }
};

const FILA_RATIO = (key: keyof RatiosAnio, label: string, formula: string, fmt: (v: number) => string) => ({ key, label, formula, fmt });
const pen = (v: number) => formatPEN(v);
const num = (v: number) => formatNumber(v, 4);
const pctf = (v: number) => formatPercent(v);

function RatiosTab({ esc }: { esc: EstadosEscenario }) {
  const SECCIONES = {
    LIQUIDEZ: [
      FILA_RATIO("ratioCorriente", "Ratio corriente", "Act. Cte / Pas. Cte", num),
      FILA_RATIO("pruebaAcida", "Prueba ácida", "(Act.Cte − Inv.) / Pas.Cte", num),
      FILA_RATIO("ratioTesoreria", "Ratio de tesorería", "Efectivo / Pas.Cte", num),
      FILA_RATIO("relevanciaActCte", "Relevancia act. cte", "Act.Cte / Act.Total", num),
      FILA_RATIO("capitalTrabajoNeto", "Capital de trabajo neto", "Act.Cte − Pas.Cte", pen),
    ],
    SOLVENCIA: [
      FILA_RATIO("solvencia", "Solvencia", "Act.Total / Pas.Total", num),
      FILA_RATIO("endeudamActivo", "Endeudamiento / activo", "Pas.Total / Act.Total", num),
      FILA_RATIO("endeudamPatrim", "Endeudamiento / patrimonio", "Pas.Total / Patrimonio", num),
      FILA_RATIO("gradoPropiedad", "Grado de propiedad", "Patrimonio / Act.Total", num),
    ],
    RENTABILIDAD: [
      FILA_RATIO("margenNeto", "Margen neto", "Utilidad / Ventas", pctf),
      FILA_RATIO("roa", "ROA", "Utilidad / Act.Total", pctf),
      FILA_RATIO("roe", "ROE", "Utilidad / Patrimonio", pctf),
    ],
  };

  const r1 = esc.ratios[0];
  const radar = [
    { k: "Liquidez", v: Math.min(1, r1.ratioCorriente / 2) },
    { k: "Solvencia", v: Math.min(1, r1.solvencia / 2) },
    { k: "Propiedad", v: Math.min(1, r1.gradoPropiedad) },
    { k: "Margen", v: Math.min(1, r1.margenNeto / 0.3) },
    { k: "ROE", v: Math.min(1, r1.roe) },
  ];
  const liq = r1.ratioCorriente > 1.5 ? "sólida" : r1.ratioCorriente >= 1 ? "moderada" : "baja";
  const end = r1.endeudamActivo < 0.5 ? "bajo" : r1.endeudamActivo <= 0.7 ? "moderado" : "alto";
  const rent = r1.margenNeto > 0.2 ? "alta" : r1.margenNeto >= 0.1 ? "media" : "baja";

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["LIQUIDEZ", "SOLVENCIA", "RENTABILIDAD"]} className="space-y-3">
        {Object.entries(SECCIONES).map(([sec, filas]) => (
          <AccordionItem key={sec} value={sec}>
            <AccordionTrigger>{sec.charAt(0) + sec.slice(1).toLowerCase()}</AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead><tr className="text-right text-xs font-medium text-muted-foreground"><th className="px-2 py-1 text-left">Ratio</th><th className="px-2 py-1 text-left">Fórmula</th><th className="px-2 py-1">Año 1</th><th className="px-2 py-1">Año 2</th><th className="px-2 py-1">Año 3</th></tr></thead>
                  <tbody>
                    {filas.map((f) => (
                      <tr key={f.key} className="border-t border-border">
                        <td className="px-2 py-1.5 text-left font-medium text-slate-700">{f.label}</td>
                        <td className="px-2 py-1.5 text-left text-xs text-muted-foreground">{f.formula}</td>
                        {esc.ratios.map((r) => {
                          const v = r[f.key] as number;
                          const semaforo = ["ratioCorriente", "pruebaAcida", "solvencia", "endeudamActivo", "margenNeto", "roa", "roe"].includes(f.key as string);
                          return <td key={r.anio} className={cn("px-2 py-1.5 text-right tabular", semaforo && claseTono[tono(f.key as string, v)])}>{f.fmt(v)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card>
        <CardContent className="grid items-center gap-4 p-4 sm:grid-cols-[200px_1fr]">
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radar} outerRadius={70}>
              <PolarGrid />
              <PolarAngleAxis dataKey="k" fontSize={10} />
              <Radar dataKey="v" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-sm leading-relaxed text-slate-700">
            El proyecto presenta <b>liquidez {liq}</b> (ratio corriente {num(r1.ratioCorriente)}),
            nivel de <b>endeudamiento {end}</b> ({formatPercent(r1.endeudamActivo)} sobre activos) y
            <b> rentabilidad {rent}</b> (margen neto {formatPercent(r1.margenNeto)}, ROE {formatPercent(r1.roe)}).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function EstadosFinancierosPanel({ result, onIrAFlujo }: { result: EstadosFinancierosResult | null; onIrAFlujo: () => void }) {
  const [esc, setEsc] = React.useState<Clave>("moderado");

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-warning/40 bg-warning-soft py-10 text-center">
        <p className="text-sm font-medium text-foreground">Datos pendientes</p>
        <p className="max-w-xs text-xs text-muted-foreground">Completa el Flujo de caja para generar los estados financieros.</p>
        <Button variant="outline" size="sm" onClick={onIrAFlujo}>Ir a Flujo de caja</Button>
      </div>
    );
  }

  const escActual = result.escenarios.find((e) => e.clave === esc) ?? result.escenarios[0];

  return (
    <Tabs defaultValue="eerr">
      <TabsList>
        <TabsTrigger value="eerr">Estado de Resultados</TabsTrigger>
        <TabsTrigger value="esf">Situación Financiera</TabsTrigger>
        <TabsTrigger value="ratios">Ratios</TabsTrigger>
      </TabsList>
      {(["eerr", "esf", "ratios"] as const).map((t) => (
        <TabsContent key={t} value={t}>
          <EscenarioSelector value={esc} onChange={setEsc} />
          {t === "eerr" && <EERR esc={escActual} />}
          {t === "esf" && <ESF esc={escActual} />}
          {t === "ratios" && <RatiosTab esc={escActual} />}
        </TabsContent>
      ))}
    </Tabs>
  );
}
