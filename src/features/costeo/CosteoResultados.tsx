import * as React from "react";
import { calcularCosteo } from "@/core/calc";
import type { CosteoInput } from "@/core/schemas";
import { formatPEN } from "@/core/money";
import { Separator } from "@/components/ui/separator";
import { Lock, Zap } from "lucide-react";

/** Fila de valor calculado (label + Lock a la izquierda, monto a la derecha). */
function Fila({ label, valor, subtotal }: { label: string; valor: string; subtotal?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1">
      <span className="flex min-w-0 items-center gap-1 text-xs text-slate-500">
        <Lock className="size-2.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className={"shrink-0 text-sm tabular " + (subtotal ? "font-medium text-slate-700" : "text-slate-700")}>{valor}</span>
    </div>
  );
}

function BloqueTitulo({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{children}</p>;
}

export function CosteoResultados({ value, demandaMensual }: { value: CosteoInput; demandaMensual: number }) {
  const r = React.useMemo(() => calcularCosteo(value, { demandaMensual }), [value, demandaMensual]);
  const sinDatos = r.mpUnitario <= 0 && r.mod <= 0;
  const sinDemanda = demandaMensual <= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <Zap className="size-4 text-primary" /> Resultados
      </div>

      {sinDatos ? (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-3 text-center text-xs text-muted-foreground">
          Completa los datos para ver resultados.
        </div>
      ) : (
        <>
          {/* Bloque 1 · Costos unitarios */}
          <section>
            <BloqueTitulo>Costos unitarios</BloqueTitulo>
            <div className="space-y-1">
              <Fila label="Materia prima (MP)" valor={formatPEN(r.mpUnitario)} />
              <Fila label="Mano de obra (MOD)" valor={formatPEN(r.mod)} />
              <Separator className="my-1" />
              <Fila label="CVU" valor={formatPEN(r.costoVariableUnitario)} subtotal />
            </div>
          </section>

          {/* Bloque 2 · Estructura de precio */}
          <section>
            <BloqueTitulo>Estructura de precio</BloqueTitulo>
            <div className="space-y-1">
              <Fila label="Costo fijo unit. (CFU)" valor={sinDemanda ? "—" : formatPEN(r.costoFijoUnitario)} />
              <Separator className="my-1" />
              <Fila label="CTU" valor={formatPEN(r.costoTotalUnitario)} subtotal />
              <Fila label="Margen (30%)" valor={formatPEN(r.margenValor)} />
              <Fila label="Valor de venta" valor={formatPEN(r.valorVenta)} />
            </div>
            {sinDemanda && (
              <p className="mt-1.5 rounded bg-warning-soft px-2 py-1 text-[11px] text-foreground">
                Completa Mercado para el CFU (usa la demanda mensual).
              </p>
            )}
          </section>

          {/* Bloque 3 · Precio final (KPI principal, siempre visible) */}
          <section>
            <BloqueTitulo>Precio final</BloqueTitulo>
            <Fila label="IGV (18%)" valor={formatPEN(r.igvValor)} />
            <div className="mt-1.5 rounded-lg border border-primary/20 bg-accent p-3">
              <div className="flex items-center gap-1 text-[11px] font-medium text-accent-foreground">
                <Zap className="size-3" /> Precio de venta
              </div>
              <p className="mt-0.5 text-xl font-bold tabular text-accent-foreground">{formatPEN(r.precioVenta)}</p>
              <p className="text-[10px] text-muted-foreground">con IGV</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
