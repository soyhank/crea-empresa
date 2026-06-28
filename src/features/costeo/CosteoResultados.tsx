import * as React from "react";
import { calcularCosteo } from "@/core/calc";
import type { CosteoInput } from "@/core/schemas";
import { formatPEN } from "@/core/money";
import { Zap } from "lucide-react";

function Fila({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={"flex items-center justify-between rounded-md border px-3 py-1.5 " + (fuerte ? "border-primary/30 bg-accent" : "border-border bg-slate-50")}>
      <span className={"flex items-center gap-1 text-xs " + (fuerte ? "font-semibold text-primary" : "text-slate-700")}>
        <Zap className={"size-3 " + (fuerte ? "text-primary" : "text-muted-foreground")} /> {label}
      </span>
      <span className={"text-sm tabular " + (fuerte ? "font-bold text-primary" : "font-semibold text-slate-900")}>{valor}</span>
    </div>
  );
}

export function CosteoResultados({ value, demandaMensual }: { value: CosteoInput; demandaMensual: number }) {
  const r = React.useMemo(() => calcularCosteo(value, { demandaMensual }), [value, demandaMensual]);
  const sinDatos = r.mpUnitario <= 0 && r.mod <= 0;

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
          <div className="space-y-1.5">
            <Fila label="Materia prima (MP)" valor={formatPEN(r.mpUnitario)} />
            <Fila label="Mano de obra (MOD)" valor={formatPEN(r.mod)} />
            <Fila label="Costo variable unit. (CVU)" valor={formatPEN(r.costoVariableUnitario)} />
            <Fila label="Costo fijo unit. (CFU)" valor={demandaMensual > 0 ? formatPEN(r.costoFijoUnitario) : "—"} />
            <Fila label="Costo total unit. (CTU)" valor={formatPEN(r.costoTotalUnitario)} />
          </div>

          {demandaMensual <= 0 && (
            <p className="rounded-md bg-warning-soft px-2 py-1.5 text-xs text-foreground">
              Completa el módulo Mercado para obtener el costo fijo unitario (usa la demanda mensual).
            </p>
          )}

          <div className="space-y-1.5">
            <Fila label="Margen" valor={formatPEN(r.margenValor)} />
            <Fila label="Valor de venta" valor={formatPEN(r.valorVenta)} />
            <Fila label="IGV" valor={formatPEN(r.igvValor)} />
            <Fila label="Precio de venta (con IGV)" valor={formatPEN(r.precioVenta)} fuerte />
          </div>
        </>
      )}
    </div>
  );
}
