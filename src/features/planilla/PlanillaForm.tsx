import type { PlanillaInput } from "@/core/schemas";
import { calcularTrabajador } from "@/core/calc";
import { formatNumber } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PercentField } from "@/components/Field";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { rowId } from "@/lib/utils";
import { Lock, Plus, Trash2 } from "lucide-react";

interface Props {
  value: PlanillaInput;
  onChange: (next: PlanillaInput) => void;
}

const calcTh = "px-2 py-2 text-right text-[11px] font-medium text-muted-foreground";
const calcTd = "bg-slate-50 px-2 py-1 text-right text-xs font-medium tabular text-slate-900";

export function PlanillaForm({ value, onChange }: Props) {
  const set = (patch: Partial<PlanillaInput>) => onChange({ ...value, ...patch });
  const params = { pctPensiones: value.pctPensiones, factorGratificacion: value.factorGratificacion, factorVacaciones: value.factorVacaciones };

  const upd = (id: string, patch: Partial<PlanillaInput["trabajadores"][number]>) =>
    set({ trabajadores: value.trabajadores.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const add = () => set({ trabajadores: [...value.trabajadores, { id: rowId("tr"), cargo: "", baseMensual: 0, bonificacion: 0, sis: 15, aplicaProvisiones: true }] });
  const del = (id: string) => set({ trabajadores: value.trabajadores.filter((t) => t.id !== id) });

  const num = (v: string) => Number(v) || 0;
  const enterAdds = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); add(); } };

  const totalGasto = value.trabajadores.reduce((a, t) => a + calcularTrabajador(t, params).gastoMensual, 0);

  return (
    <Accordion type="multiple" defaultValue={["params", "cuadro"]} className="space-y-3">
      <AccordionItem value="params">
        <AccordionTrigger>Parámetros (SUNAT)</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <PercentField label="Pensiones (AFP/ONP)" value={value.pctPensiones} onChange={(v) => set({ pctPensiones: v })} />
            <PercentField label="Provisión gratificación" value={value.factorGratificacion} onChange={(v) => set({ factorGratificacion: v })} />
            <PercentField label="Provisión vacaciones" value={value.factorVacaciones} onChange={(v) => set({ factorVacaciones: v })} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Valores referenciales SUNAT/SIS.</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="cuadro">
        <AccordionTrigger>Cuadro de remuneraciones</AccordionTrigger>
        <AccordionContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-medium text-muted-foreground">
                  <th className="px-1 py-2">Cargo</th>
                  <th className="px-2 py-2 w-20">Base</th>
                  <th className="px-2 py-2 w-20">Bonif.</th>
                  <th className="px-2 py-2 w-16">SIS</th>
                  <th className="px-2 py-2 w-14 text-center">Prov.</th>
                  <th className={calcTh}><span className="inline-flex items-center gap-0.5"><Lock className="size-2.5" />Bruta</span></th>
                  <th className={calcTh}>Pens. 13%</th>
                  <th className={calcTh}>Neta</th>
                  <th className={calcTh}>P.Grat</th>
                  <th className={calcTh}>P.Vac</th>
                  <th className={calcTh}>Gasto</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {value.trabajadores.map((t) => {
                  const c = calcularTrabajador(t, params);
                  return (
                    <tr key={t.id}>
                      <td className="px-1 py-1"><Input value={t.cargo} placeholder="Cargo" className="min-w-[140px]" onChange={(e) => upd(t.id, { cargo: e.target.value })} /></td>
                      <td className="px-1 py-1"><Input type="number" className="tabular" value={t.baseMensual || ""} onChange={(e) => upd(t.id, { baseMensual: num(e.target.value) })} /></td>
                      <td className="px-1 py-1"><Input type="number" className="tabular" value={t.bonificacion || ""} onChange={(e) => upd(t.id, { bonificacion: num(e.target.value) })} /></td>
                      <td className="px-1 py-1"><Input type="number" className="tabular" value={t.sis || ""} onKeyDown={enterAdds} onChange={(e) => upd(t.id, { sis: num(e.target.value) })} /></td>
                      <td className="px-1 py-1 text-center"><input type="checkbox" className="size-4 accent-indigo-600" checked={t.aplicaProvisiones} onChange={(e) => upd(t.id, { aplicaProvisiones: e.target.checked })} /></td>
                      <td className={calcTd}>{formatNumber(c.remBruta)}</td>
                      <td className={calcTd}>{formatNumber(c.pensiones)}</td>
                      <td className={calcTd}>{formatNumber(c.remNeta)}</td>
                      <td className={calcTd}>{formatNumber(c.provGratificacion)}</td>
                      <td className={calcTd}>{formatNumber(c.provVacaciones)}</td>
                      <td className={calcTd + " text-primary"}>{formatNumber(c.gastoMensual)}</td>
                      <td className="px-1 py-1"><Button variant="ghost" size="icon" onClick={() => del(t.id)} disabled={value.trabajadores.length <= 1} aria-label="Eliminar"><Trash2 className="text-muted-foreground" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={10} className="rounded-l-md bg-slate-50 px-3 py-2 text-right text-xs font-medium text-slate-700">TOTAL gasto mensual de planilla</td>
                  <td className="bg-slate-50 px-2 py-2 text-right text-sm font-bold tabular text-primary">{formatNumber(totalGasto)}</td>
                  <td className="rounded-r-md bg-slate-50" />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-2"><Button variant="outline" size="sm" onClick={add}><Plus /> Agregar trabajador</Button></div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
