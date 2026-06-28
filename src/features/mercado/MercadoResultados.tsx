import * as React from "react";
import { calcularMercado } from "@/core/calc";
import type { MercadoInput } from "@/core/schemas";
import { formatInteger, formatNumber } from "@/core/money";
import { Lock, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
} from "recharts";

const COLORS = ["#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5"];

export function MercadoResultados({ value }: { value: MercadoInput }) {
  const r = React.useMemo(() => calcularMercado(value), [value]);

  const embudo = [
    { nombre: "Universo", valor: r.universo },
    { nombre: "MP", valor: r.mercadoPotencial },
    { nombre: "MD", valor: r.mercadoDisponible },
    { nombre: "ME", valor: r.mercadoEfectivo },
    { nombre: "MO", valor: r.mercadoObjetivo },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Zap className="size-3.5 text-primary" /> Resultados en vivo
      </div>

      {/* Demanda destacada */}
      <div className="rounded-xl border border-primary/20 bg-accent/60 p-4">
        <p className="text-xs font-medium text-accent-foreground">Demanda del proyecto</p>
        <p className="mt-1 text-3xl font-bold tabular text-primary">
          {formatNumber(r.demandaAnual)} <span className="text-base font-medium text-muted-foreground">/ año</span>
        </p>
        <p className="text-sm tabular text-muted-foreground">
          {formatNumber(r.demandaPorPeriodo)} por periodo · CPC {formatNumber(r.consumoPerCapita, 6)}
        </p>
      </div>

      {/* Embudo */}
      <div className="rounded-xl border border-border bg-card p-3">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={embudo} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
            <XAxis dataKey="nombre" tickLine={false} axisLine={false} fontSize={11} />
            <RTooltip
              formatter={(v: number) => [formatInteger(v), "Personas"]}
              cursor={{ fill: "rgba(99,102,241,0.06)" }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {embudo.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
              <LabelList dataKey="valor" position="top" fontSize={9} formatter={(v: number) => formatInteger(v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cadena de cálculo (no editable) */}
      <div className="space-y-2">
        {r.pasos
          .filter((p) => !["demandaAnual", "demandaPorPeriodo"].includes(p.clave))
          .map((p) => (
            <div key={p.clave} className="flex items-start justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <Lock className="size-3 text-muted-foreground" /> {p.etiqueta}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{p.detalle}</p>
              </div>
              <span className="ml-2 shrink-0 text-sm font-semibold tabular text-foreground">
                {p.clave === "consumoPerCapita" ? formatNumber(p.valor, 6) : formatInteger(p.valor)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
