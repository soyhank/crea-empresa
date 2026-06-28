import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ShieldCheck } from "lucide-react";

export function TopBar({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Link to="/">
        <Brand />
      </Link>
      <div className="flex-1">{children}</div>
      {user?.role === "admin" && (
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ShieldCheck /> Admin
          </Link>
        </Button>
      )}
      {user && (
        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium leading-tight">{user.nombre ?? user.email}</p>
            <Badge variant={user.role === "admin" ? "default" : "muted"} className="text-[10px]">
              {user.role === "admin" ? "Administrador" : "Alumno"}
            </Badge>
          </div>
          <Button variant="outline" size="icon" onClick={onLogout} title="Cerrar sesión">
            <LogOut />
          </Button>
        </div>
      )}
    </header>
  );
}
