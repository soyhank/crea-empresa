import { calcularProyeccionVentas } from "@/core/calc";
import type { MesProyeccion, ProyeccionVentasContext, ProyeccionVentasInput } from "@/core/schemas";
import { formatNumber, formatPEN, formatPercent } from "@/core/money";
import { Button } from "@/components/ui/button";
import { PercentField } from "@/components/Field";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";

interface Props {
  value: ProyeccionVentasInput;
  onChange: (next: ProyeccionVentasInput) => void;
  ctx: ProyeccionVentasContext & { listo: boolean };
  onIrACosteo: () => void;
}

const MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const FILAS: { key: keyof MesProyeccion; label: string }[] = [
  { key: "cantidad", label: "Cantidad" },
  { key: "ingresos", label: "Ingresos" },
  { key: "igvVentas", label: "IGV ventas" },
  { key: "cv", label: "CV mensual" },
  { key: "cf", label: "CF mensual" },
  { key: "ct", label: "CT mensual" },
  { key: "igvCompras", label: "IGV compras" },
  { key: "igvAPagar", label: "IGV a pagar" },
];

export function ProyeccionVentasForm({ value, onChange, ctx, onIrACosteo }: Props) {
  if (!ctx.listo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-warning/40 bg-warning-soft py-10 text-center">
        <p className="text-sm font-medium text-foreground">Datos pendientes</p>
        <p className="max-w-xs text-xs text-muted-foreground">Completa Costeo y Mercado para proyectar las ventas.</p>
        <Button variant="outline" size="sm" onClick={onIrACosteo}>Ir a Costeo</Button>
      </div>
    );
  }

  const r = calcularProyeccionVentas(value, ctx);

  const heredados = [
    { label: "Demanda base (mes)", valor: `${formatNumber(ctx.demandaMesBase)} cajas` },
    { label: "Precio de venta", valor: formatPEN(ctx.precioVenta) },
    { label: "CVU", valor: formatPEN(ctx.cvu) },
    { label: "CFU", valor: formatPEN(ctx.cfu) },
  ];

  const tablaAnio = (anio: number) => {
    const bloque = r.meses.slice((anio - 1) * 12, anio * 12);
    const total = r.anios[anio - 1];
    const totalKey: Record<string, number> = {
      cantidad: total.totalCantidad, ingresos: total.totalIngresos, igvVentas: total.totalIgvVentas,
      cv: total.totalCV, cf: total.totalCF, ct: total.totalCT, igvCompras: total.totalIgvCompras, igvAPagar: total.totalIgvAPagar,
    };
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-xs">
          <thead>
            <tr className="text-right text-[10px] font-medium text-muted-foreground">
              <th className="px-1 py-1 text-left">Concepto</th>
              {MES.map((m) => <th key={m} className="px-1 py-1">{m}</th>)}
              <th className="px-2 py-1 text-primary">Total</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) => (
              <tr key={f.key} className="border-t border-border">
                <td className="px-1 py-1 text-left text-slate-700">{f.label}</td>
                {bloque.map((m) => (
                  <td key={m.mes} className="bg-slate-50 px-1 py-1 text-right tabular text-slate-700">{formatNumber(m[f.key], f.key === "cantidad" ? 0 : 0)}</td>
                ))}
                <td className="px-2 py-1 text-right font-semibold tabular text-slate-900">{formatNumber(totalKey[f.key], 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Accordion type="multiple" defaultValue={["params", "heredados", "tabla"]} className="space-y-3">
      <AccordionItem value="params">
        <AccordionTrigger>1 · Parámetros</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentField label="Crecimiento anual" helper={`Crecimiento mensual resultante: ${formatPercent(r.pctCrecimientoMensual)}`} value={value.pctCrecimientoAnual} onChange={(v) => onChange({ ...value, pctCrecimientoAnual: v })} />
            <PercentField label="IGV" value={value.igv} onChange={(v) => onChange({ ...value, igv: v })} />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="heredados">
        <AccordionTrigger>2 · Datos heredados</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heredados.map((h) => (
              <div key={h.label} className="rounded-lg border border-border bg-slate-50 p-3">
                <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-slate-700">{h.label}</span><Lock className="size-3 text-muted-foreground" /></div>
                <p className="mt-1 text-base font-bold tabular text-slate-900">{h.valor}</p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tabla">
        <AccordionTrigger>3 · Tabla de proyección (36 meses)</AccordionTrigger>
        <AccordionContent>
          <Tabs defaultValue="1">
            <TabsList>
              <TabsTrigger value="1">Año 1</TabsTrigger>
              <TabsTrigger value="2">Año 2</TabsTrigger>
              <TabsTrigger value="3">Año 3</TabsTrigger>
            </TabsList>
            <TabsContent value="1">{tablaAnio(1)}</TabsContent>
            <TabsContent value="2">{tablaAnio(2)}</TabsContent>
            <TabsContent value="3">{tablaAnio(3)}</TabsContent>
          </Tabs>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-900">Resumen comparativo</p>
            <table className="w-full text-sm">
              <thead><tr className="text-right text-xs font-medium text-muted-foreground"><th className="px-2 py-1 text-left">Concepto</th><th className="px-2 py-1">Año 1</th><th className="px-2 py-1">Año 2</th><th className="px-2 py-1">Año 3</th></tr></thead>
              <tbody>
                {([
                  ["Ingresos", "totalIngresos"], ["Costo total", "totalCT"], ["IGV a pagar", "totalIgvAPagar"], ["Saldo operativo", "saldoOperativo"],
                ] as const).map(([label, key]) => (
                  <tr key={key} className="border-t border-border">
                    <td className="px-2 py-1.5 text-left text-slate-700">{label}</td>
                    {r.anios.map((an) => <td key={an.anio} className="px-2 py-1.5 text-right tabular text-slate-900">{formatPEN(an[key])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
