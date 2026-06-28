import * as React from "react";
import { calcularMercado } from "@/core/calc";
import type { MercadoInput } from "@/core/schemas";
import { formatInteger, formatNumber } from "@/core/money";
import { Zap } from "lucide-react";

const CASCADA = [
  { clave: "universo", etiqueta: "Universo" },
  { clave: "mercadoPotencial", etiqueta: "Mercado potencial" },
  { clave: "mercadoDisponible", etiqueta: "Mercado disponible" },
  { clave: "mercadoEfectivo", etiqueta: "Mercado efectivo" },
  { clave: "mercadoObjetivo", etiqueta: "Mercado objetivo" },
] as const;

export function MercadoResultados({ value }: { value: MercadoInput }) {
  const r = React.useMemo(() => calcularMercado(value), [value]);
  const sinDatos = r.universo <= 0 || r.demandaAnual <= 0;

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
          {/* Cascada con sangría progresiva */}
          <div className="space-y-1.5">
            {CASCADA.map((c, i) => {
              const valor = (r as unknown as Record<string, number>)[c.clave];
              const esObjetivo = c.clave === "mercadoObjetivo";
              return (
                <div
                  key={c.clave}
                  style={{ marginLeft: i * 12 }}
                  className={
                    "flex items-center justify-between gap-2 rounded-r-md border-l-2 py-1.5 pl-3 pr-2 " +
                    (esObjetivo
                      ? "border-primary bg-accent"
                      : "border-slate-200 bg-slate-50")
                  }
                >
                  <span className={"flex items-center gap-1 text-xs " + (esObjetivo ? "font-semibold text-primary" : "text-slate-700")}>
                    <Zap className={"size-3 " + (esObjetivo ? "text-primary" : "text-muted-foreground")} /> {c.etiqueta}
                  </span>
                  <span className={"shrink-0 text-sm tabular " + (esObjetivo ? "font-bold text-primary" : "font-semibold text-slate-900")}>
                    {formatInteger(valor)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Demanda (resaltada verde) */}
          <div className="rounded-lg border border-success/30 bg-success-soft p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] font-medium text-success">Demanda / año</p>
                <p className="text-xl font-bold tabular text-success">{formatNumber(r.demandaAnual)}</p>
                <p className="text-[10px] text-muted-foreground">cajas</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-success">Demanda / mes</p>
                <p className="text-xl font-bold tabular text-success">{formatNumber(r.demandaPorPeriodo)}</p>
                <p className="text-[10px] text-muted-foreground">cajas</p>
              </div>
            </div>
            <p className="mt-2 border-t border-success/20 pt-2 text-xs text-slate-700">
              Consumo per cápita: <b className="tabular">{formatNumber(r.consumoPerCapita, 4)}</b> cajas
            </p>
          </div>
        </>
      )}
    </div>
  );
}
