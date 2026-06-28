import * as React from "react";
import { calcularPlanilla } from "@/core/calc";
import type { PlanillaInput } from "@/core/schemas";
import { formatPEN } from "@/core/money";
import { Users, Zap } from "lucide-react";

export function PlanillaResultados({ value }: { value: PlanillaInput }) {
  const r = React.useMemo(() => calcularPlanilla(value), [value]);
  const sinDatos = r.totalBruta <= 0;

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
          <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-700"><Users className="size-3.5 text-muted-foreground" /> Trabajadores</span>
            <span className="text-sm font-semibold tabular text-slate-900">{r.nTrabajadores}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-2">
            <span className="text-xs text-slate-700">Remuneración bruta mensual</span>
            <span className="text-sm font-semibold tabular text-slate-900">{formatPEN(r.totalBruta)}</span>
          </div>

          <div className="rounded-lg border border-primary/20 bg-accent p-3">
            <p className="text-xs font-medium text-accent-foreground">Gasto mensual de planilla</p>
            <p className="mt-1 text-3xl font-bold tabular text-primary">{formatPEN(r.totalGastoMensual)}</p>
            <p className="text-[11px] text-muted-foreground">→ alimenta los costos fijos de Costeo</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
              <span className="text-xs text-slate-700">Σ Pensiones</span>
              <span className="text-sm tabular text-slate-900">{formatPEN(r.totalPensiones)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
              <span className="text-xs text-slate-700">Σ Provisiones</span>
              <span className="text-sm tabular text-slate-900">{formatPEN(r.totalProvisiones)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
