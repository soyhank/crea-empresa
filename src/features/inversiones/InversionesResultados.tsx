import * as React from "react";
import { calcularInversiones } from "@/core/calc";
import type { CapitalTrabajo, InversionesInput } from "@/core/schemas";
import { formatPEN } from "@/core/money";
import { Zap } from "lucide-react";

function Fila({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={"flex items-center justify-between rounded-md border px-3 py-1.5 " + (fuerte ? "border-primary/30 bg-accent" : "border-border bg-slate-50")}>
      <span className={"text-xs " + (fuerte ? "font-semibold text-primary" : "text-slate-700")}>{label}</span>
      <span className={"text-sm tabular " + (fuerte ? "font-bold text-primary" : "font-semibold text-slate-900")}>{valor}</span>
    </div>
  );
}

export function InversionesResultados({ value, capital }: { value: InversionesInput; capital: CapitalTrabajo }) {
  const r = React.useMemo(() => calcularInversiones(value, capital), [value, capital]);
  const sinDatos = r.totalActivoFijo <= 0 && r.totalPreOperativos <= 0;

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
          <p className="text-xs font-medium text-muted-foreground">Estructura de inversión</p>
          <div className="space-y-1.5">
            <Fila label="Pre-operativo" valor={formatPEN(r.totalPreOperativos)} />
            <Fila label="Activo fijo" valor={formatPEN(r.totalActivoFijo)} />
            <Fila label="Capital de trabajo" valor={formatPEN(r.totalCapitalTrabajo)} />
            <Fila label="Inversión total" valor={formatPEN(r.inversionTotal)} fuerte />
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Aporte de socios</p>
            <p className="text-2xl font-bold tabular text-slate-900">{formatPEN(r.aportePorSocio)}</p>
            <p className="text-[11px] text-muted-foreground">por socio ({value.numSocios})</p>
            {value.nombresSocios.some((n) => n.trim()) && (
              <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs">
                {value.nombresSocios.filter((n) => n.trim()).map((n, i) => (
                  <li key={i} className="flex items-center justify-between"><span className="text-slate-700">{n}</span><span className="tabular text-slate-900">{formatPEN(r.aportePorSocio)}</span></li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
