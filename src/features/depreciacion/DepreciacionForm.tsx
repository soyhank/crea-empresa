import type { ActivoDepreciable, DepreciacionInput, GastoPreOperativo } from "@/core/schemas";
import { TABLA_SUNAT } from "@/core/schemas";
import { filaAmortizacion, filaDepreciacion } from "@/core/calc";
import { formatNumber, formatPercent } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PercentField } from "@/components/Field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CircleCheck, Lock } from "lucide-react";

interface Props {
  value: DepreciacionInput;
  onChange: (next: DepreciacionInput) => void;
  activos: ActivoDepreciable[];
  gastos: GastoPreOperativo[];
  listo: boolean;
  onIrAInversiones: () => void;
}

const ESTANDAR = [3, 5, 10, 20];
const calcTd = "bg-slate-50 px-2 py-1 text-right text-xs font-medium tabular text-slate-900";

export function DepreciacionForm({ value, onChange, activos, gastos, listo, onIrAInversiones }: Props) {
  const setVida = (id: string, anios: number) =>
    onChange({ ...value, vidasUtiles: { ...value.vidasUtiles, [id]: Math.max(1, anios) } });

  if (!listo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-warning/40 bg-warning-soft py-10 text-center">
        <p className="text-sm font-medium text-foreground">Activos pendientes</p>
        <p className="max-w-xs text-xs text-muted-foreground">Completa el activo fijo y los pre-operativos en Inversiones para depreciar y amortizar.</p>
        <Button variant="outline" size="sm" onClick={onIrAInversiones}>Ir a Inversiones</Button>
      </div>
    );
  }

  const totalDeprecAnual = activos.reduce((a, x) => a + filaDepreciacion(x).deprecAnual, 0);

  return (
    <Accordion type="multiple" defaultValue={["sunat", "deprec", "amort"]} className="space-y-3">
      {/* 1. Tabla SUNAT (referencia) */}
      <AccordionItem value="sunat">
        <AccordionTrigger>1 · Tasas SUNAT (referencia)</AccordionTrigger>
        <AccordionContent>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs font-medium text-muted-foreground"><th className="pb-1">Tipo de activo</th><th className="pb-1">Vida útil</th><th className="pb-1 text-right">% anual</th></tr></thead>
            <tbody>
              {TABLA_SUNAT.map((t) => (
                <tr key={t.tipo} className="border-t border-border"><td className="py-1.5 text-slate-700">{t.tipo}</td><td className="py-1.5 tabular">{t.anios} años</td><td className="py-1.5 text-right tabular">{formatPercent(t.pct)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">Referencial: elige la vida útil de cada activo abajo.</p>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Depreciación de activos fijos */}
      <AccordionItem value="deprec">
        <AccordionTrigger>2 · Depreciación de activos fijos</AccordionTrigger>
        <AccordionContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-medium text-muted-foreground">
                  <th className="px-1 py-2">Activo</th><th className="px-2 py-2 text-right">Monto</th>
                  <th className="px-2 py-2 w-28">Vida útil</th><th className="px-2 py-2 text-right">% anual</th>
                  <th className="px-2 py-2 text-right">Deprec. anual</th><th className="px-2 py-2 text-right">Deprec. mensual</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((act) => {
                  const f = filaDepreciacion(act);
                  const esEstandar = ESTANDAR.includes(act.vidaUtil);
                  return (
                    <tr key={act.id} className="border-t border-border">
                      <td className="px-1 py-1.5"><span className="inline-flex items-center gap-1 text-slate-700"><Lock className="size-3 text-muted-foreground" />{act.nombre}</span></td>
                      <td className="px-2 py-1.5 text-right tabular text-slate-700">{formatNumber(act.monto)}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <Select value={esEstandar ? String(act.vidaUtil) : "otro"} onValueChange={(v) => setVida(act.id, v === "otro" ? (esEstandar ? 1 : act.vidaUtil) : Number(v))}>
                            <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{ESTANDAR.map((n) => <SelectItem key={n} value={String(n)}>{n} años</SelectItem>)}<SelectItem value="otro">Otro</SelectItem></SelectContent>
                          </Select>
                          {!esEstandar && <Input type="number" className="h-8 w-14 tabular" value={act.vidaUtil} onChange={(e) => setVida(act.id, Number(e.target.value) || 1)} />}
                        </div>
                      </td>
                      <td className={calcTd}>{formatPercent(f.pctAnual)}</td>
                      <td className={calcTd}>{formatNumber(f.deprecAnual)}</td>
                      <td className={calcTd}>{formatNumber(f.deprecMensual)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="rounded-l-md bg-slate-50 px-3 py-2 text-right text-xs font-medium text-slate-700">Total depreciación</td>
                  <td className="bg-slate-50 px-2 py-2 text-right text-sm font-bold tabular text-primary">{formatNumber(totalDeprecAnual)}</td>
                  <td className="rounded-r-md bg-slate-50 px-2 py-2 text-right text-sm font-bold tabular text-primary">{formatNumber(totalDeprecAnual / 12)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Amortización de pre-operativos */}
      <AccordionItem value="amort">
        <AccordionTrigger>3 · Amortización de intangibles / pre-operativos</AccordionTrigger>
        <AccordionContent>
          <div className="mb-3 max-w-xs">
            <PercentField label="% de amortización anual" value={value.pctAmortizacion} onChange={(v) => onChange({ ...value, pctAmortizacion: v })} />
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] font-medium text-muted-foreground"><th className="px-1 py-2">Concepto</th><th className="px-2 py-2 text-right">Monto</th><th className="px-2 py-2 text-right">Amort. anual</th><th className="px-2 py-2 text-right">Amort. mensual</th></tr></thead>
            <tbody>
              {gastos.map((gp) => {
                const f = filaAmortizacion(gp);
                return (
                  <tr key={gp.id} className="border-t border-border">
                    <td className="px-1 py-1.5"><span className="inline-flex items-center gap-1 text-slate-700"><Lock className="size-3 text-muted-foreground" />{gp.nombre}</span></td>
                    <td className="px-2 py-1.5 text-right tabular text-slate-700">{formatNumber(gp.monto)}</td>
                    <td className={calcTd}>{formatNumber(f.amortAnual)}</td>
                    <td className={calcTd}>{formatNumber(f.amortMensual)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="rounded-l-md bg-slate-50 px-3 py-2 text-right text-xs font-medium text-slate-700">Total amortización</td>
                <td className="bg-slate-50 px-2 py-2 text-right text-sm font-bold tabular text-primary">{formatNumber(gastos.reduce((a, x) => a + filaAmortizacion(x).amortAnual, 0))}</td>
                <td className="rounded-r-md bg-slate-50 px-2 py-2 text-right text-sm font-bold tabular text-primary">{formatNumber(gastos.reduce((a, x) => a + filaAmortizacion(x).amortMensual, 0))}</td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-2 flex items-center gap-1 text-xs text-success"><CircleCheck className="size-3.5" /> Depreciación + amortización mensual se envían a los costos fijos de Costeo.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
