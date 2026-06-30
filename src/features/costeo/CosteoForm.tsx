import type { CosteoInput } from "@/core/schemas";
import { calcularMP, calcularMOD, totalInsumo, valorProcesoMOD } from "@/core/calc";
import { formatNumber } from "@/core/money";
import { UNIDADES, normalizeUnidad, subUnidadPorDefecto, unidadesCompatibles } from "@/core/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PercentField } from "@/components/Field";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { rowId } from "@/lib/utils";
import { Lock, Plus, Trash2 } from "lucide-react";

interface Props {
  value: CosteoInput;
  onChange: (next: CosteoInput) => void;
}

/** <select> nativo y compacto para elegir unidad dentro de la tabla. */
function UnidadSelect({ value, opciones, onChange }: { value: string; opciones: string[]; onChange: (u: string) => void }) {
  return (
    <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {opciones.map((k) => <option key={k} value={k}>{UNIDADES[k]?.label ?? k}</option>)}
    </select>
  );
}

export function CosteoForm({ value, onChange }: Props) {
  const set = (patch: Partial<CosteoInput>) => onChange({ ...value, ...patch });

  const updMp = (id: string, patch: Partial<CosteoInput["materiaPrima"][number]>) =>
    set({ materiaPrima: value.materiaPrima.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const addMp = () => set({ materiaPrima: [...value.materiaPrima, { id: rowId("mp"), nombre: "", medida: "kg", unidadRequerimiento: "g", precioUnitario: 0, requerimiento: 0 }] });

  /** Al cambiar la unidad de compra, ajusta la del requerimiento si quedó incompatible. */
  const cambiarUnidadCompra = (id: string, medida: string) => {
    const actual = value.materiaPrima.find((x) => x.id === id);
    const compatibles = unidadesCompatibles(medida);
    const req = actual?.unidadRequerimiento && compatibles.includes(normalizeUnidad(actual.unidadRequerimiento) ?? "") ? actual.unidadRequerimiento : subUnidadPorDefecto(medida);
    updMp(id, { medida, unidadRequerimiento: req });
  };
  const delMp = (id: string) => set({ materiaPrima: value.materiaPrima.filter((x) => x.id !== id) });

  const updMod = (id: string, patch: Partial<CosteoInput["manoObra"][number]>) =>
    set({ manoObra: value.manoObra.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const addMod = () => set({ manoObra: [...value.manoObra, { id: rowId("mod"), proceso: "", sueldo: 0, minutos: 0, eficiencia: 0.75 }] });
  const delMod = (id: string) => set({ manoObra: value.manoObra.filter((x) => x.id !== id) });

  const updCf = (id: string, patch: Partial<CosteoInput["costosFijos"][number]>) =>
    set({ costosFijos: value.costosFijos.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const addCf = () => set({ costosFijos: [...value.costosFijos, { id: rowId("cf"), concepto: "", monto: 0 }] });
  const delCf = (id: string) => set({ costosFijos: value.costosFijos.filter((x) => x.id !== id) });

  const mp = calcularMP(value.materiaPrima);
  const mod = calcularMOD(value.manoObra, value.minutosDisponiblesMes);
  const cf = value.costosFijos.reduce((a, c) => a + (c.monto || 0), 0);

  const enterAdds = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); fn(); }
  };
  const num = (v: string) => Number(v) || 0;

  return (
    <Accordion type="multiple" defaultValue={["mp", "mod", "cf", "margen"]} className="space-y-3">
      {/* 1. Materia prima */}
      <AccordionItem value="mp">
        <AccordionTrigger>1 · Materia prima e insumos</AccordionTrigger>
        <AccordionContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pl-1">Insumo</th>
                <th className="pb-2 w-24">Precio (S/)</th><th className="pb-2 w-24">por</th>
                <th className="pb-2 w-24">Requerim.</th><th className="pb-2 w-24">en</th>
                <th className="pb-2 w-20 text-right">Total</th><th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {value.materiaPrima.map((x) => {
                const compraUnit = normalizeUnidad(x.medida) ?? "unidad";
                const reqUnit = normalizeUnidad(x.unidadRequerimiento) ?? normalizeUnidad(x.medida) ?? "unidad";
                return (
                  <tr key={x.id}>
                    <td className="py-1 pr-2"><Input value={x.nombre} placeholder="Ej. Azúcar" onChange={(e) => updMp(x.id, { nombre: e.target.value })} /></td>
                    <td className="py-1 pr-2"><Input type="number" className="tabular" value={x.precioUnitario || ""} onChange={(e) => updMp(x.id, { precioUnitario: num(e.target.value) })} /></td>
                    <td className="py-1 pr-2"><UnidadSelect value={compraUnit} opciones={Object.keys(UNIDADES)} onChange={(u) => cambiarUnidadCompra(x.id, u)} /></td>
                    <td className="py-1 pr-2"><Input type="number" className="tabular" value={x.requerimiento || ""} onKeyDown={enterAdds(addMp)} onChange={(e) => updMp(x.id, { requerimiento: num(e.target.value) })} /></td>
                    <td className="py-1 pr-2"><UnidadSelect value={reqUnit} opciones={unidadesCompatibles(x.medida)} onChange={(u) => updMp(x.id, { unidadRequerimiento: u })} /></td>
                    <td className="py-1 pr-2 text-right text-sm font-medium tabular text-slate-700">{formatNumber(totalInsumo(x))}</td>
                    <td className="py-1"><Button variant="ghost" size="icon" onClick={() => delMp(x.id)} disabled={value.materiaPrima.length <= 1} aria-label="Eliminar"><Trash2 className="text-muted-foreground" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="rounded-l-md bg-slate-50 py-2 pl-3 text-xs font-medium text-slate-700"><span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" /> Materia prima unitaria</span></td>
                <td className="bg-slate-50 py-2 text-right text-sm font-semibold tabular text-slate-900">S/ {formatNumber(mp)}</td>
                <td className="rounded-r-md bg-slate-50" />
              </tr>
            </tfoot>
          </table>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={addMp}><Plus /> Agregar insumo</Button>
            <span className="text-xs text-muted-foreground">El precio es por la unidad de compra; el requerimiento puede ir en g/ml y se convierte solo.</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Mano de obra directa */}
      <AccordionItem value="mod">
        <AccordionTrigger>2 · Mano de obra directa</AccordionTrigger>
        <AccordionContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pl-1">Proceso</th><th className="pb-2 w-24">Sueldo/mes</th>
                <th className="pb-2 w-20">Minutos</th><th className="pb-2 w-20">Efic.</th>
                <th className="pb-2 w-20">Valor</th><th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {value.manoObra.map((x) => (
                <tr key={x.id}>
                  <td className="py-1 pr-2"><Input value={x.proceso} placeholder="Ej. Envasado" onChange={(e) => updMod(x.id, { proceso: e.target.value })} /></td>
                  <td className="py-1 pr-2"><Input type="number" className="tabular" value={x.sueldo || ""} onChange={(e) => updMod(x.id, { sueldo: num(e.target.value) })} /></td>
                  <td className="py-1 pr-2"><Input type="number" className="tabular" value={x.minutos || ""} onChange={(e) => updMod(x.id, { minutos: num(e.target.value) })} /></td>
                  <td className="py-1 pr-2">
                    <div className="relative"><Input type="number" className="tabular pr-6" value={x.eficiencia ? +(x.eficiencia * 100).toFixed(2) : ""} onKeyDown={enterAdds(addMod)} onChange={(e) => updMod(x.id, { eficiencia: num(e.target.value) / 100 })} /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span></div>
                  </td>
                  <td className="py-1 pr-2 text-right text-sm font-medium tabular text-slate-700">{formatNumber(valorProcesoMOD(x, value.minutosDisponiblesMes), 4)}</td>
                  <td className="py-1"><Button variant="ghost" size="icon" onClick={() => delMod(x.id)} disabled={value.manoObra.length <= 1} aria-label="Eliminar"><Trash2 className="text-muted-foreground" /></Button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="rounded-l-md bg-slate-50 py-2 pl-3 text-xs font-medium text-slate-700"><span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" /> Mano de obra directa (MOD)</span></td>
                <td className="bg-slate-50 py-2 text-right text-sm font-semibold tabular text-slate-900">S/ {formatNumber(mod, 4)}</td>
                <td className="rounded-r-md bg-slate-50" />
              </tr>
            </tfoot>
          </table>
          <div className="mt-2 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addMod}><Plus /> Agregar proceso</Button>
            <span className="text-xs text-muted-foreground">Minutos productivos/mes: {formatNumber(value.minutosDisponiblesMes)}</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Costos fijos mensuales */}
      <AccordionItem value="cf">
        <AccordionTrigger>3 · Costos fijos mensuales</AccordionTrigger>
        <AccordionContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pl-1">Concepto</th><th className="pb-2 w-32">Monto mensual</th><th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {value.costosFijos.map((x) => (
                <tr key={x.id}>
                  <td className="py-1 pr-2"><Input value={x.concepto} placeholder="Ej. Alquiler de local" onChange={(e) => updCf(x.id, { concepto: e.target.value })} /></td>
                  <td className="py-1 pr-2"><Input type="number" className="tabular" value={x.monto || ""} onKeyDown={enterAdds(addCf)} onChange={(e) => updCf(x.id, { monto: num(e.target.value) })} /></td>
                  <td className="py-1"><Button variant="ghost" size="icon" onClick={() => delCf(x.id)} disabled={value.costosFijos.length <= 1} aria-label="Eliminar"><Trash2 className="text-muted-foreground" /></Button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="rounded-l-md bg-slate-50 py-2 pl-3 text-xs font-medium text-slate-700"><span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" /> Total costos fijos</span></td>
                <td className="bg-slate-50 py-2 text-sm font-semibold tabular text-slate-900">S/ {formatNumber(cf)}</td>
                <td className="rounded-r-md bg-slate-50" />
              </tr>
            </tfoot>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">Incluye sueldos (planilla), depreciación y amortización; se integrarán automáticamente desde sus módulos.</p>
          <div className="mt-2"><Button variant="outline" size="sm" onClick={addCf}><Plus /> Agregar costo fijo</Button></div>
        </AccordionContent>
      </AccordionItem>

      {/* 4. Margen e IGV */}
      <AccordionItem value="margen">
        <AccordionTrigger>4 · Margen e impuestos</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentField label="Margen de ganancia" helper="Sobre el costo total unitario" value={value.margen} onChange={(v) => set({ margen: v })} />
            <PercentField label="IGV" helper="Sobre el valor de venta" value={value.igv} onChange={(v) => set({ igv: v })} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
