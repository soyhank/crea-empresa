import * as React from "react";
import { data } from "./data";
import type { AppUser } from "./types";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  modo: "supabase" | "demo";
  /** `nombre` = nombre de empresario (no email). */
  signIn: (nombre: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    data.currentUser().then((u) => {
      if (active) {
        setUser(u);
        setLoading(false);
      }
    });
    const unsub = data.onAuthChange((u) => active && setUser(u));
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const signIn = React.useCallback(async (nombre: string, password: string) => {
    const u = await data.signIn(nombre, password);
    setUser(u);
  }, []);

  const signOut = React.useCallback(async () => {
    await data.signOut();
    setUser(null);
  }, []);

  const value: AuthState = { user, loading, modo: data.modo, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
