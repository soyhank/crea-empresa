import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Cliente con service_role (omite RLS). SUPABASE_URL y SERVICE_ROLE_KEY los
 *  inyecta Supabase automáticamente en el entorno de la Edge Function. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Verifica que el llamante (Bearer token) sea un admin activo. */
export async function callerIsAdmin(req: Request, db: SupabaseClient): Promise<boolean> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: profile } = await db
    .from("profiles")
    .select("role, activo")
    .eq("id", data.user.id)
    .single();
  return !!profile && profile.role === "admin" && profile.activo === true;
}

/** ¿Existe al menos un admin? (para el bootstrap del primero). */
export async function anyAdminExists(db: SupabaseClient): Promise<boolean> {
  const { count } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return (count ?? 0) > 0;
}
