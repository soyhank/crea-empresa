import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Endpoint serverless de administración de usuarios.
 *
 * Usa la service_role key (SOLO servidor) para crear/gestionar cuentas, ya que
 * NO hay auto-registro. Acciones: create, deactivate, activate, setRole,
 * resetPassword, list.
 *
 * Autorización: el llamante debe ser admin (Bearer token). Excepción de
 * bootstrap: si aún no existe ningún admin, se permite crear el primero.
 */

type Action =
  | "create"
  | "deactivate"
  | "activate"
  | "setRole"
  | "resetPassword"
  | "list";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function admin(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * El namespace `auth.admin` existe en runtime al usar la service_role key, pero
 * algunos builders (p. ej. el de funciones de Vercel) no lo exponen en los
 * tipos. Lo accedemos con una firma mínima y segura.
 */
interface AuthAdmin {
  createUser(attrs: Record<string, unknown>): Promise<{
    data: { user: { id: string } | null };
    error: { message: string } | null;
  }>;
  updateUserById(id: string, attrs: Record<string, unknown>): Promise<{
    error: { message: string } | null;
  }>;
}
function authAdmin(db: SupabaseClient): AuthAdmin {
  return (db.auth as unknown as { admin: AuthAdmin }).admin;
}

async function callerIsAdmin(req: VercelRequest, db: SupabaseClient): Promise<boolean> {
  const header = req.headers.authorization ?? "";
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

async function existsAnyAdmin(db: SupabaseClient): Promise<boolean> {
  const { count } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return (count ?? 0) > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    res.status(500).json({ error: "Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" });
    return;
  }

  const db = admin();
  const body = (req.body ?? {}) as { action?: Action; [k: string]: unknown };
  const action = body.action;

  try {
    // Bootstrap: permitir crear el PRIMER admin sin token.
    const hayAdmin = await existsAnyAdmin(db);
    const esAdmin = await callerIsAdmin(req, db);
    const bootstrap = action === "create" && !hayAdmin;

    if (!esAdmin && !bootstrap) {
      res.status(403).json({ error: "Solo un administrador puede gestionar usuarios" });
      return;
    }

    switch (action) {
      case "create": {
        const email = String(body.email ?? "").trim().toLowerCase();
        const password = String(body.password ?? "");
        const nombre = body.nombre ? String(body.nombre) : null;
        // En bootstrap el primer usuario es admin sí o sí.
        const role = bootstrap ? "admin" : body.role === "admin" ? "admin" : "user";
        if (!email || password.length < 6) {
          res.status(400).json({ error: "Email válido y contraseña (≥6) requeridos" });
          return;
        }
        const { data: created, error } = await authAdmin(db).createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nombre },
        });
        if (error || !created.user) {
          res.status(400).json({ error: error?.message ?? "No se pudo crear el usuario" });
          return;
        }
        const { error: pErr } = await db.from("profiles").upsert({
          id: created.user.id,
          email,
          nombre,
          role,
          activo: true,
        });
        if (pErr) {
          res.status(500).json({ error: `Usuario creado pero falló el perfil: ${pErr.message}` });
          return;
        }
        res.status(200).json({ ok: true, user: { id: created.user.id, email, role } });
        return;
      }

      case "deactivate":
      case "activate": {
        const userId = String(body.userId ?? "");
        const activo = action === "activate";
        if (!userId) {
          res.status(400).json({ error: "userId requerido" });
          return;
        }
        // Bloquear el login revocando la sesión y marcando el perfil.
        await authAdmin(db).updateUserById(userId, {
          ban_duration: activo ? "none" : "876000h", // ~100 años
        });
        const { error } = await db.from("profiles").update({ activo }).eq("id", userId);
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        res.status(200).json({ ok: true });
        return;
      }

      case "setRole": {
        const userId = String(body.userId ?? "");
        const role = body.role === "admin" ? "admin" : "user";
        if (!userId) {
          res.status(400).json({ error: "userId requerido" });
          return;
        }
        const { error } = await db.from("profiles").update({ role }).eq("id", userId);
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        res.status(200).json({ ok: true });
        return;
      }

      case "resetPassword": {
        const userId = String(body.userId ?? "");
        const password = String(body.password ?? "");
        if (!userId || password.length < 6) {
          res.status(400).json({ error: "userId y contraseña (≥6) requeridos" });
          return;
        }
        const { error } = await authAdmin(db).updateUserById(userId, { password });
        if (error) {
          res.status(400).json({ error: error.message });
          return;
        }
        res.status(200).json({ ok: true });
        return;
      }

      case "list": {
        const { data, error } = await db
          .from("profiles")
          .select("id, email, nombre, role, activo, created_at")
          .order("created_at", { ascending: true });
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        res.status(200).json({ ok: true, users: data });
        return;
      }

      default:
        res.status(400).json({ error: "Acción no soportada" });
        return;
    }
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Error interno" });
  }
}
