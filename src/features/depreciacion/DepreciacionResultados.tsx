import * as React from "react";
import { calcularDepreciacion } from "@/core/calc";
import type { ActivoDepreciable, GastoPreOperativo } from "@/core/schemas";
import { formatPEN } from "@/core/money";
import { CircleCheck, Zap } from "lucide-react";

export function DepreciacionResultados({ activos, gastos, horizonte }: {
  activos: ActivoDepreciable[];
  gastos: GastoPreOperativo[];
  horizonte: number;
}) {
  const r = React.useMemo(() => calcularDepreciacion(activos, gastos, horizonte), [activos, gastos, horizonte]);
  const sinDatos = activos.length === 0 && gastos.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Zap className="size-4 text-primary" /> Resultados de este módulo
      </div>

      {sinDatos ? (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-center text-sm text-muted-foreground">
          Completa los datos para ver resultados.
        </div>
      ) : (
        <>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Depreciación</p>
            <div className="space-y-1">
              {r.porGrupo.map((g) => (
                <div key={g.grupo} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1 text-xs">
                  <span className="text-slate-700">{g.grupo}</span>
                  <span className="tabular text-slate-900">{formatPEN(g.mensual)}/mes</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
                <span className="text-xs font-medium text-slate-700">Total deprec. (anual / mensual)</span>
                <span className="text-sm font-semibold tabular text-slate-900">{formatPEN(r.totalDeprecMensual)}/mes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
            <span className="text-xs font-medium text-slate-700">Amortización mensual</span>
            <span className="text-sm font-semibold tabular text-slate-900">{formatPEN(r.totalAmortMensual)}</span>
          </div>

          <div className="rounded-lg border border-primary/20 bg-accent p-3">
            <p className="text-xs font-medium text-accent-foreground">Deprec. + amort. mensual</p>
            <p className="mt-1 text-3xl font-bold tabular text-primary">{formatPEN(r.combinadoMensual)}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-success"><CircleCheck className="size-3" /> Enviado a Costos fijos</p>
          </div>
        </>
      )}
    </div>
  );
}
