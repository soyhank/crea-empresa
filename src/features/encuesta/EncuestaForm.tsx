import type { EncuestaInput, PreguntaEncuesta, VariableCalculo } from "@/core/schemas";
import { factorPregunta } from "@/core/calc";
import { formatPercent } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rowId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

const VARIABLES: { value: VariableCalculo; label: string }[] = [
  { value: "mercado_disponible", label: "Mercado disponible (MD)" },
  { value: "mercado_efectivo", label: "Mercado efectivo (ME) + CPC" },
];
const labelVariable = (v?: VariableCalculo) => VARIABLES.find((x) => x.value === v)?.label ?? "Mercado disponible (MD)";

interface Props {
  value: EncuestaInput;
  onChange: (next: EncuestaInput) => void;
}

export function EncuestaForm({ value, onChange }: Props) {
  const preguntas = value.preguntas ?? [];
  const setPreguntas = (ps: PreguntaEncuesta[]) => onChange({ ...value, preguntas: ps });
  const updP = (id: string, patch: Partial<PreguntaEncuesta>) =>
    setPreguntas(preguntas.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addP = () =>
    setPreguntas([
      ...preguntas,
      { id: rowId("p"), orden: preguntas.length + 1, texto: "", usadaEnCalculo: false, opciones: [{ id: rowId("o"), etiqueta: "", fi: 0, cuentaEnFactor: false }] },
    ]);
  const delP = (id: string) => setPreguntas(preguntas.filter((p) => p.id !== id));

  const updOpt = (pid: string, oid: string, patch: Partial<PreguntaEncuesta["opciones"][number]>) =>
    updP(pid, { opciones: preguntas.find((p) => p.id === pid)!.opciones.map((o) => (o.id === oid ? { ...o, ...patch } : o)) });
  const addOpt = (pid: string) =>
    updP(pid, { opciones: [...preguntas.find((p) => p.id === pid)!.opciones, { id: rowId("o"), etiqueta: "", fi: 0, cuentaEnFactor: false }] });
  const delOpt = (pid: string, oid: string) =>
    updP(pid, { opciones: preguntas.find((p) => p.id === pid)!.opciones.filter((o) => o.id !== oid) });

  const num = (v: string) => Number(v) || 0;

  return (
    <div className="space-y-4">
      {preguntas.map((p) => {
        const total = p.opciones.reduce((a, o) => a + (o.fi || 0), 0);
        const usaCpc = p.mapeoVariable === "mercado_efectivo";
        return (
          <Card key={p.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-2">
                <Input value={p.texto} placeholder="Texto de la pregunta" className="flex-1" onChange={(e) => updP(p.id, { texto: e.target.value })} />
                <Button variant="ghost" size="icon" onClick={() => delP(p.id)} disabled={preguntas.length <= 1} aria-label="Eliminar pregunta"><Trash2 className="text-muted-foreground" /></Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-700">
                  <input type="checkbox" className="size-3.5 accent-indigo-600" checked={p.usadaEnCalculo} onChange={(e) => updP(p.id, { usadaEnCalculo: e.target.checked, mapeoVariable: e.target.checked ? p.mapeoVariable ?? "mercado_disponible" : undefined })} />
                  Usada en cálculo
                </label>
                {p.usadaEnCalculo ? (
                  <>
                    <Select value={p.mapeoVariable ?? "mercado_disponible"} onValueChange={(v) => updP(p.id, { mapeoVariable: v as VariableCalculo })}>
                      <SelectTrigger className="h-8 w-auto min-w-[220px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{VARIABLES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Badge variant="default">Usada en cálculo → {labelVariable(p.mapeoVariable)}</Badge>
                  </>
                ) : (
                  <Badge variant="muted">Solo informe</Badge>
                )}
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-1 pl-1">Opción</th>
                    <th className="pb-1 w-20">fi</th>
                    {usaCpc && <th className="pb-1 w-24">Marca clase</th>}
                    {p.usadaEnCalculo && <th className="pb-1 w-16 text-center">Cuenta</th>}
                    <th className="w-9" />
                  </tr>
                </thead>
                <tbody>
                  {p.opciones.map((o) => (
                    <tr key={o.id}>
                      <td className="py-1 pr-2"><Input value={o.etiqueta} placeholder="Opción" onChange={(e) => updOpt(p.id, o.id, { etiqueta: e.target.value })} /></td>
                      <td className="py-1 pr-2"><Input type="number" className="tabular" value={o.fi || ""} onChange={(e) => updOpt(p.id, o.id, { fi: num(e.target.value) })} /></td>
                      {usaCpc && <td className="py-1 pr-2"><Input type="number" className="tabular" value={o.marcaClase ?? ""} onChange={(e) => updOpt(p.id, o.id, { marcaClase: num(e.target.value) })} /></td>}
                      {p.usadaEnCalculo && <td className="py-1 text-center"><input type="checkbox" className="size-4 accent-indigo-600" checked={o.cuentaEnFactor} onChange={(e) => updOpt(p.id, o.id, { cuentaEnFactor: e.target.checked })} /></td>}
                      <td className="py-1"><Button variant="ghost" size="icon" onClick={() => delOpt(p.id, o.id)} disabled={p.opciones.length <= 1} aria-label="Eliminar opción"><Trash2 className="text-muted-foreground" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => addOpt(p.id)}><Plus /> Agregar opción</Button>
                <span className="text-xs text-muted-foreground">
                  Total fi: <b className="tabular text-slate-700">{total}</b>
                  {p.usadaEnCalculo && <> · Factor: <b className="tabular text-primary">{formatPercent(factorPregunta(p))}</b></>}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" onClick={addP}><Plus /> Agregar pregunta</Button>
    </div>
  );
}
