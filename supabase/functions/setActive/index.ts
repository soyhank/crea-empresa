// Edge Function: setActive — activa/desactiva una cuenta (solo admin).
// Al desactivar se banea el login en Auth y se marca profiles.activo = false.
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient, callerIsAdmin } from "../_shared/guard.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const db = adminClient();
  if (!(await callerIsAdmin(req, db))) return json({ error: "Solo un administrador" }, 403);

  const { user_id, activo } = await req.json().catch(() => ({}));
  if (!user_id || typeof activo !== "boolean") return json({ error: "user_id y activo requeridos" }, 400);

  await db.auth.admin.updateUserById(String(user_id), {
    ban_duration: activo ? "none" : "876000h", // ~100 años
  });
  const { error } = await db.from("profiles").update({ activo }).eq("id", String(user_id));
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
