import * as React from "react";
import { calcularPuntoEquilibrio, puntoEquilibrioTabla } from "@/core/calc";
import { formatInteger, formatPEN } from "@/core/money";
import { Zap } from "lucide-react";
import {
  Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import type { CtxPE } from "./PuntoEquilibrioPanel";

export function PuntoEquilibrioGrafico({ ctx }: { ctx: CtxPE }) {
  const r = React.useMemo(
    () => calcularPuntoEquilibrio({ precioVenta: ctx.pv, costoVariableUnitario: ctx.cvu, costosFijos: ctx.cft }),
    [ctx],
  );
  const tabla = React.useMemo(
    () => puntoEquilibrioTabla({ precioVenta: ctx.pv, costoVariableUnitario: ctx.cvu, costosFijos: ctx.cft }, r.unidades, 9),
    [ctx, r.unidades],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Zap className="size-4 text-primary" /> Resultados de este módulo
      </div>

      {!ctx.listo || r.unidades <= 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-center text-sm text-muted-foreground">
          Completa los datos para ver el gráfico.
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card p-2">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={tabla} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}>
                <XAxis dataKey="q" fontSize={10} tickLine={false} tickFormatter={(v: number) => formatInteger(v)} label={{ value: "unidades", position: "insideBottom", offset: -2, fontSize: 9 }} />
                <YAxis fontSize={10} tickLine={false} width={42} tickFormatter={(v: number) => formatInteger(v)} />
                <RTooltip formatter={(v: number) => formatPEN(v)} labelFormatter={(l) => `${formatInteger(Number(l))} cajas`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine x={Math.round(r.unidades)} stroke="#e11d48" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#16a34a" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="costoTotal" name="Costo total" stroke="#e11d48" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="costoVariable" name="Costo variable" stroke="#6366f1" strokeDasharray="5 3" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-center text-xs font-medium text-danger">
            PE: {formatInteger(r.unidades)} cajas / {formatPEN(r.soles)}
          </div>
        </>
      )}
    </div>
  );
}
