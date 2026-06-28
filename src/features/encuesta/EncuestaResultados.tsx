import * as React from "react";
import { calcularCPC, derivarEncuesta } from "@/core/calc";
import type { EncuestaInput } from "@/core/schemas";
import { formatNumber, formatPercent } from "@/core/money";
import { CircleCheck, CircleDashed, Zap } from "lucide-react";

export function EncuestaResultados({ value }: { value: EncuestaInput }) {
  const d = React.useMemo(() => derivarEncuesta(value), [value]);
  const cpc = React.useMemo(() => calcularCPC(d.consumoPerCapita), [d.consumoPerCapita]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Zap className="size-4 text-primary" /> Resultados de este módulo
      </div>

      <p className="text-xs text-muted-foreground">Lo que esta encuesta entrega a Mercado:</p>
      <div className="space-y-1.5">
        <div className="rounded-md border border-border bg-slate-50 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">P3 · % consumo semanal → Mercado disponible</p>
          <p className="text-lg font-bold tabular text-slate-900">{formatPercent(d.factorDisponibilidad)}</p>
        </div>
        <div className="rounded-md border border-border bg-slate-50 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">P6 · Consumo per cápita → Mercado</p>
          <p className="text-lg font-bold tabular text-slate-900">{formatNumber(cpc, 2)} <span className="text-xs font-medium text-muted-foreground">cajas</span></p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-3">
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            {d.p3Cargada ? <CircleCheck className="size-4 text-success" /> : <CircleDashed className="size-4 text-muted-foreground" />}
            P3 con frecuencias
          </li>
          <li className="flex items-center gap-2">
            {d.p6Cargada ? <CircleCheck className="size-4 text-success" /> : <CircleDashed className="size-4 text-muted-foreground" />}
            P6 con frecuencias
          </li>
        </ul>
        <p className={"mt-2 flex items-center gap-1 text-xs font-medium " + (d.listo ? "text-success" : "text-muted-foreground")}>
          {d.listo ? <><CircleCheck className="size-3.5" /> Listo para Mercado</> : "Carga P3 y P6 para desbloquear Mercado."}
        </p>
      </div>
    </div>
  );
}
