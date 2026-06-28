import type { MercadoInput } from "@/core/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberField } from "@/components/Field";
import { Slider } from "@/components/ui/slider";
import { formatPercent } from "@/core/money";
import { rowId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: MercadoInput;
  onChange: (next: MercadoInput) => void;
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function MercadoForm({ value, onChange }: Props) {
  const set = (patch: Partial<MercadoInput>) => onChange({ ...value, ...patch });

  // ----- Distritos -----
  const updDistrito = (id: string, patch: Partial<MercadoInput["distritos"][number]>) =>
    set({ distritos: value.distritos.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const addDistrito = () =>
    set({ distritos: [...value.distritos, { id: rowId("dist"), nombre: "", poblacion: 0 }] });
  const delDistrito = (id: string) =>
    set({ distritos: value.distritos.filter((d) => d.id !== id) });

  // ----- Filtros de segmentación -----
  const updFiltro = (id: string, patch: Partial<MercadoInput["filtrosSegmentacion"][number]>) =>
    set({ filtrosSegmentacion: value.filtrosSegmentacion.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  const addFiltro = () =>
    set({ filtrosSegmentacion: [...value.filtrosSegmentacion, { id: rowId("seg"), etiqueta: "", fraccion: 0 }] });
  const delFiltro = (id: string) =>
    set({ filtrosSegmentacion: value.filtrosSegmentacion.filter((f) => f.id !== id) });

  // ----- CPC -----
  const updCpc = (id: string, patch: Partial<MercadoInput["consumoPerCapita"][number]>) =>
    set({ consumoPerCapita: value.consumoPerCapita.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCpc = () =>
    set({ consumoPerCapita: [...value.consumoPerCapita, { id: rowId("cpc"), etiqueta: "", marcaClase: 0, fi: 0 }] });
  const delCpc = (id: string) =>
    set({ consumoPerCapita: value.consumoPerCapita.filter((c) => c.id !== id) });

  const dispPct = value.factorDisponibilidad.total
    ? value.factorDisponibilidad.seleccionadas / value.factorDisponibilidad.total
    : 0;
  const efecPct = value.factorEfectividad.total
    ? value.factorEfectividad.seleccionadas / value.factorEfectividad.total
    : 0;

  return (
    <div className="space-y-8">
      {/* Distritos */}
      <section>
        <SectionTitle hint="Población de cada distrito o zona del estudio. El universo es la suma.">
          1 · Universo poblacional
        </SectionTitle>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_140px_36px] items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
            <span>Distrito / zona</span>
            <span>Población</span>
            <span />
          </div>
          {value.distritos.map((d) => (
            <div key={d.id} className="grid grid-cols-[1fr_140px_36px] items-center gap-2">
              <Input value={d.nombre} placeholder="Ej. Comas" onChange={(e) => updDistrito(d.id, { nombre: e.target.value })} />
              <Input
                type="number"
                className="tabular"
                value={d.poblacion || ""}
                onChange={(e) => updDistrito(d.id, { poblacion: Number(e.target.value) || 0 })}
              />
              <Button variant="ghost" size="icon" onClick={() => delDistrito(d.id)} disabled={value.distritos.length <= 1}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addDistrito}>
            <Plus /> Agregar distrito
          </Button>
        </div>
      </section>

      {/* Segmentación */}
      <section>
        <SectionTitle hint="Criterios que reducen el universo al mercado potencial. Se multiplican entre sí.">
          2 · Segmentación (Mercado Potencial)
        </SectionTitle>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_36px] items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
            <span>Criterio</span>
            <span>% del universo</span>
            <span />
          </div>
          {value.filtrosSegmentacion.map((f) => (
            <div key={f.id} className="grid grid-cols-[1fr_120px_36px] items-center gap-2">
              <Input value={f.etiqueta} placeholder="Ej. 18–50 años" onChange={(e) => updFiltro(f.id, { etiqueta: e.target.value })} />
              <div className="relative">
                <Input
                  type="number"
                  className="tabular pr-7"
                  value={f.fraccion ? +(f.fraccion * 100).toFixed(4) : ""}
                  onChange={(e) => updFiltro(f.id, { fraccion: (Number(e.target.value) || 0) / 100 })}
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => delFiltro(f.id)} disabled={value.filtrosSegmentacion.length <= 1}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFiltro}>
            <Plus /> Agregar criterio
          </Button>
        </div>
      </section>

      {/* Factores de encuesta */}
      <section>
        <SectionTitle hint="Provienen de la encuesta: cuántas respuestas de cuántas en total. El % se calcula solo.">
          3 · Factores de la encuesta
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <Label className="text-xs text-muted-foreground">Mercado disponible · frecuencia de consumo</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumberField label="Respuestas filtro" value={value.factorDisponibilidad.seleccionadas}
                onChange={(v) => set({ factorDisponibilidad: { ...value.factorDisponibilidad, seleccionadas: Math.round(v) } })} />
              <NumberField label="Total encuestados" value={value.factorDisponibilidad.total}
                onChange={(v) => set({ factorDisponibilidad: { ...value.factorDisponibilidad, total: Math.round(v) } })} />
            </div>
            <p className="mt-2 text-xs font-medium text-primary">Factor MD = {formatPercent(dispPct)}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <Label className="text-xs text-muted-foreground">Mercado efectivo · intención de compra</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumberField label="Respuestas aceptación" value={value.factorEfectividad.seleccionadas}
                onChange={(v) => set({ factorEfectividad: { ...value.factorEfectividad, seleccionadas: Math.round(v) } })} />
              <NumberField label="Total encuestados" value={value.factorEfectividad.total}
                onChange={(v) => set({ factorEfectividad: { ...value.factorEfectividad, total: Math.round(v) } })} />
            </div>
            <p className="mt-2 text-xs font-medium text-primary">Factor ME = {formatPercent(efecPct)}</p>
          </div>
        </div>
      </section>

      {/* Participación */}
      <section>
        <SectionTitle hint="Cuota del mercado efectivo que planeas captar al inicio.">
          4 · Participación de mercado (Mercado Objetivo)
        </SectionTitle>
        <div className="flex items-center gap-4">
          <Slider
            className="max-w-sm"
            value={[Math.round(value.participacionMercado * 100)]}
            min={1}
            max={100}
            step={1}
            onValueChange={([v]) => set({ participacionMercado: v / 100 })}
          />
          <span className="w-16 text-sm font-semibold tabular text-primary">{formatPercent(value.participacionMercado)}</span>
        </div>
      </section>

      {/* CPC */}
      <section>
        <SectionTitle hint="Marca de clase = veces de consumo en el periodo; fi = nº de respuestas. CPC = Σ (marca × frecuencia).">
          5 · Consumo per cápita (CPC)
        </SectionTitle>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_120px_36px] items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
            <span>Opción</span>
            <span>Marca de clase</span>
            <span>fi (respuestas)</span>
            <span />
          </div>
          {value.consumoPerCapita.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_120px_120px_36px] items-center gap-2">
              <Input value={c.etiqueta} placeholder="Ej. Semanal" onChange={(e) => updCpc(c.id, { etiqueta: e.target.value })} />
              <Input type="number" className="tabular" value={c.marcaClase || ""} onChange={(e) => updCpc(c.id, { marcaClase: Number(e.target.value) || 0 })} />
              <Input type="number" className="tabular" value={c.fi || ""} onChange={(e) => updCpc(c.id, { fi: Number(e.target.value) || 0 })} />
              <Button variant="ghost" size="icon" onClick={() => delCpc(c.id)} disabled={value.consumoPerCapita.length <= 1}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addCpc}>
            <Plus /> Agregar opción
          </Button>
        </div>
      </section>
    </div>
  );
}
