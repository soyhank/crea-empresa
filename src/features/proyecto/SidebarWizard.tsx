import { MODULOS, type ModuloId } from "@/core/schemas";
import type { ModuloEstado } from "@/lib/wizard";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, CircleDashed, Loader, Lock } from "lucide-react";

interface Props {
  estados: Record<ModuloId, ModuloEstado>;
  activo: ModuloId;
  onSelect: (id: ModuloId) => void;
  avance: number;
}

const ICON = {
  completo: <Check className="size-3.5" />,
  en_progreso: <Loader className="size-3.5" />,
  bloqueado: <Lock className="size-3" />,
  pendiente: <CircleDashed className="size-3.5" />,
};

export function SidebarWizard({ estados, activo, onSelect, avance }: Props) {
  return (
    <nav className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <p className="text-xs font-medium text-muted-foreground">Avance del proyecto</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avance}%` }} />
        </div>
        <p className="mt-1 text-xs tabular text-muted-foreground">{avance}% completo</p>
      </div>

      <ol className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {MODULOS.map((m) => {
          const st = estados[m.id];
          const bloqueado = st.estado === "bloqueado";
          const isActive = m.id === activo;

          const item = (
            <button
              type="button"
              disabled={bloqueado}
              onClick={() => !bloqueado && onSelect(m.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive && "bg-accent text-accent-foreground",
                !isActive && !bloqueado && "hover:bg-secondary",
                bloqueado && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  st.estado === "completo" && "border-success bg-success text-success-foreground",
                  st.estado === "en_progreso" && "border-warning bg-warning-soft text-warning",
                  st.estado === "bloqueado" && "border-border bg-muted text-muted-foreground",
                  st.estado === "pendiente" && "border-border bg-background text-muted-foreground",
                )}
              >
                {ICON[st.estado]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium leading-tight">{m.orden}. {m.nombre}</span>
              </span>
            </button>
          );

          return (
            <li key={m.id}>
              {bloqueado ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block">{item}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Completa «{st.bloqueadoPor}» para desbloquear este módulo.
                  </TooltipContent>
                </Tooltip>
              ) : (
                item
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
