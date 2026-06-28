import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ShieldCheck } from "lucide-react";

interface TopBarProps {
  /** Contenido pegado al logo (a la izquierda), p. ej. botón volver. */
  leftSlot?: React.ReactNode;
  /** Contenido centrado (p. ej. nombre del proyecto). */
  centerSlot?: React.ReactNode;
}

export function TopBar({ leftSlot, centerSlot }: TopBarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 shadow-sm backdrop-blur">
      {/* Izquierda */}
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/">
          <Brand />
        </Link>
        {leftSlot}
      </div>

      {/* Centro (nombre del proyecto) */}
      {centerSlot && (
        <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 sm:block">
          <div className="pointer-events-auto max-w-[40vw] truncate text-sm font-medium text-slate-700">
            {centerSlot}
          </div>
        </div>
      )}

      {/* Derecha */}
      <div className="flex items-center gap-2">
        {user?.role === "admin" && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/usuarios">
              <ShieldCheck /> <span className="hidden sm:inline">Usuarios</span>
            </Link>
          </Button>
        )}
        {user && (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight text-slate-900">{user.displayName}</p>
              <Badge variant={user.role === "admin" ? "default" : "muted"} className="text-[10px]">
                {user.role === "admin" ? "Administrador" : "Alumno"}
              </Badge>
            </div>
            <Button variant="outline" size="icon" onClick={onLogout} title="Cerrar sesión">
              <LogOut />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
