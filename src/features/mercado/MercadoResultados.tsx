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
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <Zap className="size-4 text-primary" /> Resultados de este módulo
      </div>

      {sinDatos ? (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-3 text-center text-xs text-muted-foreground">
          Completa los datos para ver resultados.
        </div>
      ) : (
        <>
          {/* Cascada con sangría progresiva (cada valor deriva del anterior) */}
          <div className="space-y-1">
            {CASCADA.map((c, i) => {
              const valor = (r as unknown as Record<string, number>)[c.clave];
              const esObjetivo = c.clave === "mercadoObjetivo";
              return (
                <div
                  key={c.clave}
                  style={{ marginLeft: i * 8 }}
                  className={
                    "flex min-w-0 items-center justify-between gap-1.5 rounded-r-md border-l-2 py-1.5 pl-2.5 pr-2 " +
                    (esObjetivo ? "border-primary bg-accent" : "border-slate-200 bg-slate-50")
                  }
                >
                  <span className={"flex min-w-0 items-center gap-1 text-xs " + (esObjetivo ? "font-semibold text-primary" : "text-slate-600")}>
                    <Zap className={"size-3 shrink-0 " + (esObjetivo ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{c.etiqueta}</span>
                  </span>
                  <span className={"shrink-0 text-sm tabular " + (esObjetivo ? "font-bold text-primary" : "font-semibold text-slate-900")}>
                    {formatInteger(valor)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Demanda (resaltada en verde) */}
          <div className="rounded-lg border border-success/30 bg-success-soft p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-success">Demanda / año</p>
                <p className="text-xl font-bold tabular leading-tight text-success">{formatNumber(r.demandaAnual)}</p>
                <p className="text-[10px] text-muted-foreground">cajas</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-success">Demanda / mes</p>
                <p className="text-xl font-bold tabular leading-tight text-success">{formatNumber(r.demandaPorPeriodo)}</p>
                <p className="text-[10px] text-muted-foreground">cajas</p>
              </div>
            </div>
            <p className="mt-2 border-t border-success/20 pt-2 text-[11px] text-slate-600">
              Consumo per cápita: <b className="tabular text-slate-800">{formatNumber(r.consumoPerCapita, 4)}</b> cajas
            </p>
          </div>
        </>
      )}
    </div>
  );
}
