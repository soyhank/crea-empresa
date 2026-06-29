import * as React from "react";
import { calcularFlujoCaja } from "@/core/calc";
import type { FlujoAnioInput, FlujoCajaInput } from "@/core/schemas";
import { formatInteger, formatPEN, formatPercent } from "@/core/money";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";

const COLOR = { optimista: "#16a34a", moderado: "#6366f1", pesimista: "#f59e0b" };

export function FlujoCajaResultados({ value, ctx }: {
  value: FlujoCajaInput;
  ctx: { inversionInicial: number; anios: FlujoAnioInput[]; listo: boolean };
}) {
  const r = React.useMemo(
    () => (ctx.listo ? calcularFlujoCaja(value, ctx.inversionInicial, ctx.anios) : null),
    [value, ctx],
  );

  if (!r) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Zap className="size-4 text-primary" /> Resultados de este módulo</div>
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-center text-sm text-muted-foreground">Completa los datos para ver resultados.</div>
      </div>
    );
  }

  const mod = r.escenarios.find((e) => e.clave === "moderado")!;
  const data = [1, 2, 3].map((anio) => {
    const row: Record<string, number | string> = { anio: `Año ${anio}` };
    r.escenarios.forEach((e) => { row[e.clave] = e.anios[anio - 1].flujoEconomico; });
    return row;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Zap className="size-4 text-primary" /> Resultados de este módulo</div>

      <div className="rounded-lg border border-primary/20 bg-accent p-3 text-center">
        <p className="text-[11px] font-medium text-accent-foreground">VAN (moderado)</p>
        <p className="text-3xl font-bold tabular text-primary">{formatPEN(mod.vane)}</p>
        <div className="mt-2 flex justify-center gap-2">
          <Badge variant={mod.vane > 0 ? "success" : "danger"}>VAN {mod.vane > 0 ? "> 0" : "< 0"}</Badge>
          <Badge variant={mod.tire > mod.cok ? "success" : "danger"}>TIR {formatPercent(mod.tire)} {mod.tire > mod.cok ? ">" : "<"} COK</Badge>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Payback {mod.payback.toFixed(2)} años</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-2">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="anio" fontSize={10} tickLine={false} />
            <YAxis fontSize={9} tickLine={false} width={42} tickFormatter={(v: number) => formatInteger(v)} />
            <RTooltip formatter={(v: number) => formatPEN(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="optimista" name="Optimista" fill={COLOR.optimista} radius={[3, 3, 0, 0]} />
            <Bar dataKey="moderado" name="Moderado" fill={COLOR.moderado} radius={[3, 3, 0, 0]} />
            <Bar dataKey="pesimista" name="Pesimista" fill={COLOR.pesimista} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1">
        {r.escenarios.map((e) => (
          <div key={e.clave} className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5 text-xs">
            <span className="capitalize text-slate-700">{e.clave}</span>
            <span className="tabular text-slate-900">VAN {formatInteger(e.vane)} · TIR {formatPercent(e.tire)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
