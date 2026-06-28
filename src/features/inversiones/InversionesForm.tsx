import type { ActivoFijo, CapitalTrabajo, InversionesInput } from "@/core/schemas";
import { sumaItems } from "@/core/calc";
import { formatNumber, formatPEN } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ItemTable } from "./ItemTable";
import { CircleCheck, Lock } from "lucide-react";

interface Props {
  value: InversionesInput;
  onChange: (next: InversionesInput) => void;
  capital: CapitalTrabajo & { listo: boolean };
  onIrACosteo: () => void;
}

const GRUPOS: { key: keyof ActivoFijo; label: string; prefijo: string }[] = [
  { key: "maquinariaEquipos", label: "Maquinaria y equipos", prefijo: "mq" },
  { key: "equiposUtensilios", label: "Equipos y utensilios", prefijo: "ut" },
  { key: "equiposOficinaAdmin", label: "Equipos de oficina y administración", prefijo: "of" },
  { key: "mueblesEnseres", label: "Muebles y enseres", prefijo: "mu" },
];

export function InversionesForm({ value, onChange, capital, onIrACosteo }: Props) {
  const set = (patch: Partial<InversionesInput>) => onChange({ ...value, ...patch });
  const setAF = (key: keyof ActivoFijo, items: ActivoFijo[keyof ActivoFijo]) =>
    set({ activoFijo: { ...value.activoFijo, [key]: items } });

  const totalActivoFijo = GRUPOS.reduce((a, g) => a + sumaItems(value.activoFijo[g.key] ?? []), 0);

  return (
    <Accordion type="multiple" defaultValue={["pre", "af", "capital", "socios"]} className="space-y-3">
      {/* 1. Pre-operativos */}
      <AccordionItem value="pre">
        <AccordionTrigger>1 · Gastos pre-operativos</AccordionTrigger>
        <AccordionContent>
          <ItemTable items={value.preOperativos} onChange={(items) => set({ preOperativos: items })} prefijo="po" subtotalLabel="Total pre-operativos" />
        </AccordionContent>
      </AccordionItem>

      {/* 2. Activo fijo */}
      <AccordionItem value="af">
        <AccordionTrigger>
          <span className="flex items-center gap-2">2 · Activo fijo <span className="text-xs font-normal text-muted-foreground">S/ {formatNumber(totalActivoFijo)}</span></span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-5">
            {GRUPOS.map((g) => (
              <div key={g.key}>
                <p className="mb-2 text-sm font-semibold text-slate-900">{g.label}</p>
                <ItemTable items={value.activoFijo[g.key] ?? []} onChange={(items) => setAF(g.key, items)} prefijo={g.prefijo} subtotalLabel={`Subtotal ${g.label.toLowerCase()}`} />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-accent px-3 py-2">
              <span className="text-sm font-semibold text-accent-foreground">Total activo fijo</span>
              <span className="text-base font-bold tabular text-primary">{formatPEN(totalActivoFijo)}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Capital de trabajo (heredado de Costeo) */}
      <AccordionItem value="capital">
        <AccordionTrigger>3 · Capital de trabajo</AccordionTrigger>
        <AccordionContent>
          {capital.listo ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Costo variable mensual", valor: capital.costoVariable },
                { label: "Costo fijo mensual", valor: capital.costoFijo },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-border bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">{c.label}</span>
                    <Lock className="size-3.5 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-xl font-bold tabular text-slate-900">{formatPEN(c.valor)}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-success"><CircleCheck className="size-3" /> proviene de Costeo</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-warning/40 bg-warning-soft py-8 text-center">
              <p className="text-sm font-medium text-foreground">Capital de trabajo pendiente</p>
              <p className="max-w-xs text-xs text-muted-foreground">Completa el módulo Costeo para heredar el costo variable y el costo fijo mensual.</p>
              <Button variant="outline" size="sm" onClick={onIrACosteo}>Ir a Costeo</Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* 4. Socios */}
      <AccordionItem value="socios">
        <AccordionTrigger>4 · Socios</AccordionTrigger>
        <AccordionContent>
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="num-socios">Número de socios</Label>
            <Input id="num-socios" type="number" className="tabular" min={1} value={value.numSocios || ""} onChange={(e) => set({ numSocios: Math.max(1, Math.round(Number(e.target.value) || 1)) })} />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Nombres de socios (opcional)</Label>
            {Array.from({ length: value.numSocios }).map((_, i) => (
              <Input key={i} value={value.nombresSocios[i] ?? ""} placeholder={`Socio ${i + 1}`} onChange={(e) => {
                const nombres = [...value.nombresSocios];
                nombres[i] = e.target.value;
                set({ nombresSocios: nombres });
              }} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
