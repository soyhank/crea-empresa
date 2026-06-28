import { calcularPuntoEquilibrio } from "@/core/calc";
import { formatInteger, formatPEN } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Lock } from "lucide-react";

export interface CtxPE {
  cvu: number; pv: number; cft: number; demandaMensual: number; listo: boolean;
}

export function PuntoEquilibrioPanel({ ctx, onIrACosteo }: { ctx: CtxPE; onIrACosteo: () => void }) {
  if (!ctx.listo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-warning/40 bg-warning-soft py-10 text-center">
        <p className="text-sm font-medium text-foreground">Datos pendientes</p>
        <p className="max-w-xs text-xs text-muted-foreground">Completa Costeo (y Mercado) para calcular el punto de equilibrio.</p>
        <Button variant="outline" size="sm" onClick={onIrACosteo}>Ir a Costeo</Button>
      </div>
    );
  }

  const r = calcularPuntoEquilibrio({ precioVenta: ctx.pv, costoVariableUnitario: ctx.cvu, costosFijos: ctx.cft });
  const superavit = ctx.demandaMensual - r.unidades;
  const pct = r.unidades > 0 ? (superavit / r.unidades) * 100 : 0;
  const cubre = superavit >= 0;

  const heredados = [
    { label: "Costo variable unit. (CVU)", valor: formatPEN(ctx.cvu) },
    { label: "Precio de venta (s/IGV)", valor: formatPEN(ctx.pv) },
    { label: "Costo fijo total (mensual)", valor: formatPEN(ctx.cft) },
    { label: "Demanda mensual", valor: `${formatInteger(ctx.demandaMensual)} cajas` },
  ];

  return (
    <div className="space-y-6">
      <Alert variant="info">
        <Info />
        <AlertDescription>Los datos provienen de Costeo y Mercado. <button onClick={onIrACosteo} className="font-medium text-primary underline-offset-2 hover:underline">Editar en Costeo</button>.</AlertDescription>
      </Alert>

      <div className="grid gap-3 sm:grid-cols-2">
        {heredados.map((h) => (
          <div key={h.label} className="rounded-lg border border-border bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">{h.label}</span>
              <Lock className="size-3.5 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xl font-bold tabular text-slate-900">{h.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/20 bg-accent p-5 text-center">
          <p className="text-xs font-medium text-accent-foreground">Punto de equilibrio</p>
          <p className="mt-1 text-4xl font-bold tabular text-primary">{formatInteger(r.unidades)}</p>
          <p className="text-sm text-muted-foreground">cajas / mes</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-accent p-5 text-center">
          <p className="text-xs font-medium text-accent-foreground">Punto de equilibrio</p>
          <p className="mt-1 text-4xl font-bold tabular text-primary">{formatPEN(r.soles)}</p>
          <p className="text-sm text-muted-foreground">en ventas / mes</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={cubre ? "success" : "danger"}>{cubre ? "Demanda cubre el PE" : "Demanda bajo el PE"}</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          La demanda mensual estimada (<b className="tabular">{formatInteger(ctx.demandaMensual)}</b> cajas){" "}
          {cubre ? "supera" : "no alcanza"} el punto de equilibrio (<b className="tabular">{formatInteger(r.unidades)}</b> cajas)
          {" "}en <b className="tabular">{formatInteger(Math.abs(pct))}%</b>.
        </p>
      </div>
    </div>
  );
}
