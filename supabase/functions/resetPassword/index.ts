// Edge Function: resetPassword — asigna una nueva contraseña (solo admin).
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient, callerIsAdmin } from "../_shared/guard.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const db = adminClient();
  if (!(await callerIsAdmin(req, db))) return json({ error: "Solo un administrador" }, 403);

  const { user_id, password } = await req.json().catch(() => ({}));
  if (!user_id || !password || String(password).length < 6) {
    return json({ error: "user_id y contraseña (≥ 6) requeridos" }, 400);
  }

  const { error } = await db.auth.admin.updateUserById(String(user_id), { password: String(password) });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
});
