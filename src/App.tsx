import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProyectoPage } from "@/pages/ProyectoPage";
import { AdminPage } from "@/pages/AdminPage";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="mx-auto max-w-screen-2xl space-y-4 px-6 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
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
      <Route path="/" element={<Navigate to="/proyectos" replace />} />
      <Route path="/proyectos" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/proyectos/:id" element={<RequireAuth><ProyectoPage /></RequireAuth>} />
      <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/admin/usuarios" element={<RequireAuth adminOnly><AdminPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/proyectos" replace />} />
    </Routes>
  );
}
