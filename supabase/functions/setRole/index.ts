// Edge Function: setRole — cambia el rol (solo admin).
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient, callerIsAdmin } from "../_shared/guard.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const db = adminClient();
  if (!(await callerIsAdmin(req, db))) return json({ error: "Solo un administrador" }, 403);

  const { user_id, role } = await req.json().catch(() => ({}));
  if (!user_id) return json({ error: "user_id requerido" }, 400);
  const finalRole = role === "admin" ? "admin" : "user";

  const { error } = await db.from("profiles").update({ role: finalRole }).eq("id", String(user_id));
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
