import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProyectoPage } from "@/pages/ProyectoPage";
import { AdminPage } from "@/pages/AdminPage";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  );
}

function RequireAuth({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/proyecto/:id" element={<RequireAuth><ProyectoPage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth adminOnly><AdminPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
