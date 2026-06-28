import { MODULOS, type ModuloId } from "@/core/schemas";
import { TOTAL_MODULOS, type ModuloEstado } from "@/lib/wizard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart3, Circle, CircleCheck, CircleDot, Lock } from "lucide-react";

interface Props {
  estados: Record<ModuloId, ModuloEstado>;
  activo: ModuloId;
  onSelect: (id: ModuloId) => void;
  completos: number;
  needsReview: Set<ModuloId>;
  tableroHabilitado: boolean;
  onVerTablero: () => void;
}

function IconoEstado({ estado, activo }: { estado: ModuloEstado["estado"]; activo: boolean }) {
  if (estado === "completo") return <CircleCheck className="size-4 text-success" />;
  if (estado === "bloqueado") return <Lock className="size-3.5 text-muted-foreground" />;
  if (activo || estado === "en_progreso") return <CircleDot className="size-4 text-primary" />;
  return <Circle className="size-4 text-muted-foreground" />;
}

export function SidebarWizard({ estados, activo, onSelect, completos, needsReview, tableroHabilitado, onVerTablero }: Props) {
  const avance = Math.round((completos / TOTAL_MODULOS) * 100);

  return (
    <nav className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <p className="text-xs font-medium text-muted-foreground">Avance del proyecto</p>
        <p className="mt-0.5 text-sm font-semibold tabular text-slate-900">{completos}/{TOTAL_MODULOS} módulos</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avance}%` }} />
        </div>
      </div>

      <ol className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {MODULOS.map((m) => {
          const st = estados[m.id];
          const bloqueado = st.estado === "bloqueado";
          const isActive = m.id === activo;
          const revisar = needsReview.has(m.id) && !isActive;

          const item = (
            <button
              type="button"
              disabled={bloqueado}
              onClick={() => !bloqueado && onSelect(m.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md border-l-2 py-2 pl-2.5 pr-2 text-left text-sm transition-colors",
                isActive ? "border-primary bg-accent text-accent-foreground" : "border-transparent",
                !isActive && !bloqueado && "hover:bg-slate-50",
                bloqueado && "cursor-not-allowed opacity-50",
              )}
            >
              <IconoEstado estado={st.estado} activo={isActive} />
              <span className="min-w-0 flex-1 truncate font-medium leading-tight">
                {m.orden}. {m.nombre}
              </span>
              {revisar && <Badge variant="warning" className="px-1.5 py-0 text-[9px]">revisar</Badge>}
            </button>
          );

          return (
            <li key={m.id}>
              {bloqueado ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block">{item}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right">Completa «{st.bloqueadoPor}» primero.</TooltipContent>
                </Tooltip>
              ) : (
                item
              )}
            </li>
          );
        })}
      </ol>

      <div className="border-t border-border p-3">
        <Button variant={tableroHabilitado ? "default" : "secondary"} className="w-full" onClick={onVerTablero}>
          <BarChart3 /> Ver tablero
        </Button>
      </div>
    </nav>
  );
}
