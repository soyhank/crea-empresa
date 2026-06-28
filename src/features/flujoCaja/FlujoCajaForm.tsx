import { calcularCOK, calcularFlujoCaja } from "@/core/calc";
import type { FlujoAnioInput, FlujoCajaInput } from "@/core/schemas";
import { formatPEN, formatPercent } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";

interface Props {
  value: FlujoCajaInput;
  onChange: (next: FlujoCajaInput) => void;
  ctx: { inversionInicial: number; anios: FlujoAnioInput[]; listo: boolean };
  onIr: () => void;
}

const NOMBRE: Record<string, string> = { optimista: "Optimista", moderado: "Moderado", pesimista: "Pesimista" };
const FILAS: { key: "ingresos" | "egresos" | "flujoOperativo" | "igvPagado" | "impuestoRenta" | "flujoEconomico"; label: string }[] = [
  { key: "ingresos", label: "Ingresos" },
  { key: "egresos", label: "Egresos (CF+CV)" },
  { key: "flujoOperativo", label: "Flujo operativo" },
  { key: "igvPagado", label: "IGV pagado" },
  { key: "impuestoRenta", label: "IR (29.5%)" },
  { key: "flujoEconomico", label: "Flujo económico" },
];

export function FlujoCajaForm({ value, onChange, ctx, onIr }: Props) {
  if (!ctx.listo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-warning/40 bg-warning-soft py-10 text-center">
        <p className="text-sm font-medium text-foreground">Datos pendientes</p>
        <p className="max-w-xs text-xs text-muted-foreground">Completa Inversiones y Proyección de ventas para calcular el flujo de caja.</p>
        <Button variant="outline" size="sm" onClick={onIr}>Ir a Inversiones</Button>
      </div>
    );
  }

  const r = calcularFlujoCaja(value, ctx.inversionInicial, ctx.anios);
  const updEsc = (i: number, patch: Partial<FlujoCajaInput["escenarios"][number]>) =>
    onChange({ ...value, escenarios: value.escenarios.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });
  const pct = (v: string) => (Number(v) || 0) / 100;

  return (
    <Accordion type="multiple" defaultValue={["params", "heredados", "flujo"]} className="space-y-3">
      <AccordionItem value="params">
        <AccordionTrigger>1 · Parámetros por escenario</AccordionTrigger>
        <AccordionContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-xs font-medium text-muted-foreground"><th className="px-1 py-2">Escenario</th><th className="px-2 py-2">Inflación</th><th className="px-2 py-2">Tasa mercado</th><th className="px-2 py-2">Riesgo</th><th className="px-2 py-2 text-right">COK</th></tr></thead>
              <tbody>
                {value.escenarios.map((e, i) => (
                  <tr key={e.clave} className="border-t border-border">
                    <td className="px-1 py-1.5 font-medium text-slate-700">{NOMBRE[e.clave]}</td>
                    {(["inflacion", "tasaMercado", "riesgoInversionista"] as const).map((k) => (
                      <td key={k} className="px-1 py-1.5">
                        <div className="relative"><Input type="number" className="h-8 w-20 tabular pr-6" value={+(e[k] * 100).toFixed(2)} onChange={(ev) => updEsc(i, { [k]: pct(ev.target.value) })} /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span></div>
                      </td>
                    ))}
                    <td className="bg-slate-50 px-2 py-1.5 text-right text-sm font-semibold tabular text-primary">{formatPercent(calcularCOK(e.inflacion, e.tasaMercado, e.riesgoInversionista))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 max-w-[200px]">
            <label className="text-xs font-medium text-slate-700">Impuesto a la renta</label>
            <div className="relative mt-1"><Input type="number" className="tabular pr-6" value={+(value.pctIR * 100).toFixed(2)} onChange={(e) => onChange({ ...value, pctIR: pct(e.target.value) })} /><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span></div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="heredados">
        <AccordionTrigger>2 · Datos heredados</AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border bg-slate-50 p-3">
            <div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-700">Inversión inicial (Año 0)</span><Lock className="size-3.5 text-muted-foreground" /></div>
            <p className="mt-1 text-xl font-bold tabular text-slate-900">−{formatPEN(ctx.inversionInicial)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Ingresos y costos anuales provienen de Proyección de ventas.</p>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="flujo">
        <AccordionTrigger>3 · Flujo económico por escenario</AccordionTrigger>
        <AccordionContent>
          <Tabs defaultValue="moderado">
            <TabsList>
              {value.escenarios.map((e) => <TabsTrigger key={e.clave} value={e.clave}>{NOMBRE[e.clave]}</TabsTrigger>)}
            </TabsList>
            {r.escenarios.map((esc) => (
              <TabsContent key={esc.clave} value={esc.clave}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[460px] text-sm">
                    <thead><tr className="text-right text-xs font-medium text-muted-foreground"><th className="px-1 py-1 text-left">Concepto</th>{esc.anios.map((a) => <th key={a.anio} className="px-2 py-1">Año {a.anio}</th>)}</tr></thead>
                    <tbody>
                      {FILAS.map((f) => (
                        <tr key={f.key} className="border-t border-border">
                          <td className="px-1 py-1 text-left text-slate-700">{f.label}</td>
                          {esc.anios.map((a) => <td key={a.anio} className={"px-2 py-1 text-right tabular " + (f.key === "flujoEconomico" ? "font-semibold text-slate-900" : "text-slate-700")}>{formatPEN(a[f.key])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-primary/20 bg-accent p-2 text-center"><p className="text-[10px] text-accent-foreground">VANE</p><p className="text-base font-bold tabular text-primary">{formatPEN(esc.vane)}</p></div>
                  <div className="rounded-lg border border-primary/20 bg-accent p-2 text-center"><p className="text-[10px] text-accent-foreground">TIRE</p><p className="text-base font-bold tabular text-primary">{formatPercent(esc.tire)}</p></div>
                  <div className="rounded-lg border border-primary/20 bg-accent p-2 text-center"><p className="text-[10px] text-accent-foreground">Payback</p><p className="text-base font-bold tabular text-primary">{esc.payback.toFixed(2)} años</p></div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">COK del escenario: {formatPercent(esc.cok)} · TIRE {esc.tire > esc.cok ? "supera" : "no supera"} el COK.</p>
              </TabsContent>
            ))}
          </Tabs>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
