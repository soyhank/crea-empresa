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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
          <span className="text-xs text-slate-700">P3 → Mercado disponible</span>
          <span className="text-sm font-semibold tabular text-slate-900">{formatPercent(d.factorDisponibilidad)}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
          <span className="text-xs text-slate-700">P6 → Mercado efectivo</span>
          <span className="text-sm font-semibold tabular text-slate-900">{formatPercent(d.factorEfectividad)}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-1.5">
          <span className="text-xs text-slate-700">P6 → Consumo per cápita</span>
          <span className="text-sm font-semibold tabular text-slate-900">{formatNumber(cpc, 6)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Requisito para desbloquear Mercado</p>
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
        <p className="mt-2 text-xs text-muted-foreground">
          {d.listo ? "Mercado desbloqueado ✓" : "Carga P3 y P6 para desbloquear Mercado."}
        </p>
      </div>
    </div>
  );
}
