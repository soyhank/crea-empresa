import type { EncuestaInput, PreguntaEncuesta } from "@/core/schemas";
import { formatPercent } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rowId } from "@/lib/utils";
import { Lock, Plus, Trash2 } from "lucide-react";

interface Props {
  value: EncuestaInput;
  onChange: (next: EncuestaInput) => void;
}

/**
 * Formulario de Encuesta orientado al alumno:
 *  - P3 y P6 (usadaEnCalculo) son FIJAS: opciones, marca de clase y "cuenta"
 *    vienen predefinidas y no se muestran. El alumno solo escribe el N° de
 *    personas (fi) por opción; %, factores y CPC se calculan solos.
 *  - Las demás preguntas son "solo informe" (texto + opciones + personas) y se
 *    pueden agregar/editar libremente.
 */
export function EncuestaForm({ value, onChange }: Props) {
  const preguntas = value.preguntas ?? [];
  const setPreguntas = (ps: PreguntaEncuesta[]) => onChange({ ...value, preguntas: ps });
  const updP = (id: string, patch: Partial<PreguntaEncuesta>) =>
    setPreguntas(preguntas.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delP = (id: string) => setPreguntas(preguntas.filter((p) => p.id !== id));
  const addInforme = () =>
    setPreguntas([
      ...preguntas,
      { id: rowId("p"), orden: preguntas.length + 1, texto: "", usadaEnCalculo: false, opciones: [{ id: rowId("o"), etiqueta: "", fi: 0, cuentaEnFactor: false }] },
    ]);

  const updOpt = (pid: string, oid: string, patch: Partial<PreguntaEncuesta["opciones"][number]>) =>
    updP(pid, { opciones: preguntas.find((p) => p.id === pid)!.opciones.map((o) => (o.id === oid ? { ...o, ...patch } : o)) });
  const addOpt = (pid: string) =>
    updP(pid, { opciones: [...preguntas.find((p) => p.id === pid)!.opciones, { id: rowId("o"), etiqueta: "", fi: 0, cuentaEnFactor: false }] });
  const delOpt = (pid: string, oid: string) =>
    updP(pid, { opciones: preguntas.find((p) => p.id === pid)!.opciones.filter((o) => o.id !== oid) });

  const num = (v: string) => Math.max(0, Math.trunc(Number(v) || 0));

  return (
    <div className="space-y-4">
      {preguntas.map((p) => {
        const total = p.opciones.reduce((a, o) => a + (o.fi || 0), 0);

        // ── Pregunta de cálculo (P3 / P6): fija, solo N° de personas ──
        if (p.usadaEnCalculo) {
          return (
            <Card key={p.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{p.texto}</p>
                    <p className="text-xs text-muted-foreground">Pregunta del estudio de mercado · escribe cuántas personas marcaron cada opción.</p>
                  </div>
                  <Badge variant="muted" className="shrink-0"><Lock className="size-3" /> Fija</Badge>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-foreground">
                      <th className="pb-1 pl-1">Opción</th>
                      <th className="pb-1 w-36">N° de personas</th>
                      <th className="pb-1 w-16 pr-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.opciones.map((o) => (
                      <tr key={o.id}>
                        <td className="py-1 pr-2 text-slate-700">{o.etiqueta}</td>
                        <td className="py-1 pr-2">
                          <Input type="number" min={0} step={1} className="tabular" placeholder="0" value={o.fi || ""} onChange={(e) => updOpt(p.id, o.id, { fi: num(e.target.value) })} />
                        </td>
                        <td className="py-1 pr-2 text-right tabular text-muted-foreground">{total ? formatPercent(o.fi / total) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right text-xs text-muted-foreground">
                  Total de personas: <b className="tabular text-slate-700">{total}</b>
                </div>
              </CardContent>
            </Card>
          );
        }

        // ── Pregunta "solo informe": editable y simple ──
        return (
          <Card key={p.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-2">
                <Input value={p.texto} placeholder="Texto de la pregunta (opcional, solo informe)" className="flex-1" onChange={(e) => updP(p.id, { texto: e.target.value })} />
                <Button variant="ghost" size="icon" onClick={() => delP(p.id)} aria-label="Eliminar pregunta"><Trash2 className="text-muted-foreground" /></Button>
              </div>
              <Badge variant="muted">Solo informe</Badge>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-1 pl-1">Opción</th>
                    <th className="pb-1 w-36">N° de personas</th>
                    <th className="w-9" />
                  </tr>
                </thead>
                <tbody>
                  {p.opciones.map((o) => (
                    <tr key={o.id}>
                      <td className="py-1 pr-2"><Input value={o.etiqueta} placeholder="Opción" onChange={(e) => updOpt(p.id, o.id, { etiqueta: e.target.value })} /></td>
                      <td className="py-1 pr-2"><Input type="number" min={0} step={1} className="tabular" placeholder="0" value={o.fi || ""} onChange={(e) => updOpt(p.id, o.id, { fi: num(e.target.value) })} /></td>
                      <td className="py-1"><Button variant="ghost" size="icon" onClick={() => delOpt(p.id, o.id)} disabled={p.opciones.length <= 1} aria-label="Eliminar opción"><Trash2 className="text-muted-foreground" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => addOpt(p.id)}><Plus /> Agregar opción</Button>
                <span className="text-xs text-muted-foreground">Total de personas: <b className="tabular text-slate-700">{total}</b></span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" onClick={addInforme}><Plus /> Agregar pregunta (solo informe)</Button>
    </div>
  );
}
