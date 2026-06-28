import * as React from "react";
import { calcularProyeccionVentas, calcularPuntoEquilibrio } from "@/core/calc";
import type { ProyeccionVentasContext, ProyeccionVentasInput } from "@/core/schemas";
import { formatInteger, formatPEN } from "@/core/money";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import {
  Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";

export function ProyeccionVentasResultados({ value, ctx }: {
  value: ProyeccionVentasInput;
  ctx: ProyeccionVentasContext & { listo: boolean };
}) {
  const r = React.useMemo(() => calcularProyeccionVentas(value, ctx), [value, ctx]);
  const peSoles = React.useMemo(
    () => calcularPuntoEquilibrio({ precioVenta: ctx.precioVenta, costoVariableUnitario: ctx.cvu, costosFijos: ctx.cfu * ctx.demandaMesBase }).soles,
    [ctx],
  );

  if (!ctx.listo) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Zap className="size-4 text-primary" /> Resultados de este módulo</div>
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-center text-sm text-muted-foreground">Completa los datos para ver resultados.</div>
      </div>
    );
  }

  const data = r.meses.map((m) => ({ mes: m.mes, Ingresos: m.ingresos, "Costo total": m.ct }));
  const mesRentable = r.meses.find((m) => m.saldo > 0)?.mes;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Zap className="size-4 text-primary" /> Resultados de este módulo</div>

      <div className="rounded-lg border border-border bg-card p-2">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="mes" fontSize={9} tickLine={false} interval={5} />
            <YAxis fontSize={9} tickLine={false} width={44} tickFormatter={(v: number) => formatInteger(v)} />
            <RTooltip formatter={(v: number) => formatPEN(v)} labelFormatter={(l) => `Mes ${l}`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={peSoles} stroke="#e11d48" strokeDasharray="4 4" label={{ value: "PE", fontSize: 9, fill: "#e11d48", position: "insideTopRight" }} />
            <Line type="monotone" dataKey="Ingresos" stroke="#16a34a" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="Costo total" stroke="#e11d48" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {mesRentable && (
        <Badge variant="success">Rentable desde el mes {mesRentable}</Badge>
      )}

      <div className="space-y-1.5">
        {r.anios.map((an) => (
          <div key={an.anio} className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-2">
            <span className="text-xs text-slate-700">Ingresos año {an.anio}</span>
            <span className="text-sm font-semibold tabular text-slate-900">{formatPEN(an.totalIngresos)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
