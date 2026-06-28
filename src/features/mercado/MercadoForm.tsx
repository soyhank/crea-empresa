import type { MercadoInput } from "@/core/schemas";
import { calcularCPC, calcularUniverso } from "@/core/calc";
import { formatInteger, formatNumber } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PercentField } from "@/components/Field";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { rowId } from "@/lib/utils";
import { Lock, Plus, Trash2 } from "lucide-react";

interface Props {
  value: MercadoInput;
  onChange: (next: MercadoInput) => void;
}

export function MercadoForm({ value, onChange }: Props) {
  const set = (patch: Partial<MercadoInput>) => onChange({ ...value, ...patch });

  // ----- Distritos -----
  const updDistrito = (id: string, patch: Partial<MercadoInput["distritos"][number]>) =>
    set({ distritos: value.distritos.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const addDistrito = () => set({ distritos: [...value.distritos, { id: rowId("dist"), nombre: "", poblacion: 0 }] });
  const delDistrito = (id: string) => set({ distritos: value.distritos.filter((d) => d.id !== id) });

  // ----- CPC -----
  const updCpc = (id: string, patch: Partial<MercadoInput["consumoPerCapita"][number]>) =>
    set({ consumoPerCapita: value.consumoPerCapita.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCpc = () => set({ consumoPerCapita: [...value.consumoPerCapita, { id: rowId("cpc"), etiqueta: "", marcaClase: 0, fi: 0 }] });
  const delCpc = (id: string) => set({ consumoPerCapita: value.consumoPerCapita.filter((c) => c.id !== id) });

  const universo = calcularUniverso(value.distritos);
  const cpc = calcularCPC(value.consumoPerCapita);

  const enterAdds = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <Accordion type="multiple" defaultValue={["poblacion", "segmentacion", "encuesta", "cpc"]} className="space-y-3">
      {/* 1. Datos poblacionales */}
      <AccordionItem value="poblacion">
        <AccordionTrigger>1 · Datos poblacionales</AccordionTrigger>
        <AccordionContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pl-1">Distrito / zona</th>
                <th className="pb-2">Población</th>
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {value.distritos.map((d) => (
                <tr key={d.id}>
                  <td className="py-1 pr-2">
                    <Input value={d.nombre} placeholder="Ej. Comas" onChange={(e) => updDistrito(d.id, { nombre: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <Input type="number" className="tabular" value={d.poblacion || ""} onKeyDown={enterAdds(addDistrito)} onChange={(e) => updDistrito(d.id, { poblacion: Number(e.target.value) || 0 })} />
                  </td>
                  <td className="py-1">
                    <Button variant="ghost" size="icon" onClick={() => delDistrito(d.id)} disabled={value.distritos.length <= 1} aria-label="Eliminar fila">
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="rounded-l-md bg-slate-50 py-2 pl-3 text-xs font-medium text-slate-700">
                  <span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" /> Universo (calculado)</span>
                </td>
                <td className="bg-slate-50 py-2 text-sm font-semibold tabular text-slate-900">{formatInteger(universo)}</td>
                <td className="rounded-r-md bg-slate-50" />
              </tr>
            </tfoot>
          </table>
          <div className="mt-2 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addDistrito}><Plus /> Agregar distrito</Button>
            <span className="text-xs text-muted-foreground">Fuente sugerida: CPI 2025</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Segmentación */}
      <AccordionItem value="segmentacion">
        <AccordionTrigger>2 · Segmentación del mercado</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentField label="Segmento de edad (18–50)" helper="% del universo en el rango objetivo" value={value.porcentajeEdad} onChange={(v) => set({ porcentajeEdad: v })} />
            <PercentField label="NSE B + C" helper="% del nivel socioeconómico objetivo" value={value.porcentajeNSE} onChange={(v) => set({ porcentajeNSE: v })} />
            <PercentField label="Captación de mercado" helper="Participación objetivo del mercado efectivo" value={value.participacionMercado} onChange={(v) => set({ participacionMercado: v })} />
            <PercentField label="Crecimiento poblacional anual" helper="Para la proyección de ventas" value={value.crecimientoPoblacional} onChange={(v) => set({ crecimientoPoblacional: v })} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Inputs de encuesta */}
      <AccordionItem value="encuesta">
        <AccordionTrigger>
          <span className="flex items-center gap-2">3 · Inputs de encuesta <Badge variant="default">2 usadas en cálculo</Badge></span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentField
              label="P3 · Frecuencia de consumo (semanal)"
              annotation="→ Mercado disponible"
              helper="% que consume con la frecuencia filtro"
              value={value.factorDisponibilidad}
              onChange={(v) => set({ factorDisponibilidad: v })}
            />
            <PercentField
              label="P6 · Frecuencia de compra"
              annotation="→ Mercado efectivo"
              helper="% con intención de compra"
              value={value.factorEfectividad}
              onChange={(v) => set({ factorEfectividad: v })}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 4. Consumo per cápita */}
      <AccordionItem value="cpc">
        <AccordionTrigger>4 · Consumo per cápita</AccordionTrigger>
        <AccordionContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Marca de clase = veces de consumo en el periodo; fi = nº de respuestas. CPC = Σ (marca × frecuencia).
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pl-1">Opción</th>
                <th className="pb-2">Marca de clase</th>
                <th className="pb-2">fi</th>
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {value.consumoPerCapita.map((c) => (
                <tr key={c.id}>
                  <td className="py-1 pr-2"><Input value={c.etiqueta} placeholder="Ej. Semanal" onChange={(e) => updCpc(c.id, { etiqueta: e.target.value })} /></td>
                  <td className="py-1 pr-2"><Input type="number" className="tabular" value={c.marcaClase || ""} onChange={(e) => updCpc(c.id, { marcaClase: Number(e.target.value) || 0 })} /></td>
                  <td className="py-1 pr-2"><Input type="number" className="tabular" value={c.fi || ""} onKeyDown={enterAdds(addCpc)} onChange={(e) => updCpc(c.id, { fi: Number(e.target.value) || 0 })} /></td>
                  <td className="py-1">
                    <Button variant="ghost" size="icon" onClick={() => delCpc(c.id)} disabled={value.consumoPerCapita.length <= 1} aria-label="Eliminar fila">
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="rounded-l-md bg-slate-50 py-2 pl-3 text-xs font-medium text-slate-700">
                  <span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" /> CPC (calculado)</span>
                </td>
                <td colSpan={2} className="rounded-r-md bg-slate-50 py-2 text-sm font-semibold tabular text-slate-900">{formatNumber(cpc, 6)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={addCpc}><Plus /> Agregar opción</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
