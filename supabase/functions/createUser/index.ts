// Edge Function: createUser
// Crea una cuenta (solo admin) a partir del nombre de empresario.
// nombre → slug → email sintético → auth.admin.createUser → insert profile.
// Bootstrap: si aún no existe ningún admin, el primer usuario se crea como admin.
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminClient, anyAdminExists, callerIsAdmin } from "../_shared/guard.ts";
import { isValidUsername, normalizeUsername, slugToEmail } from "../_shared/identity.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const db = adminClient();
  const { display_name, password, role } = await req.json().catch(() => ({}));

  const hayAdmin = await anyAdminExists(db);
  const esAdmin = await callerIsAdmin(req, db);
  const bootstrap = !hayAdmin;
  if (!esAdmin && !bootstrap) {
    return json({ error: "Solo un administrador puede crear usuarios" }, 403);
  }

  const slug = normalizeUsername(String(display_name ?? ""));
  if (!isValidUsername(slug)) return json({ error: "El nombre genera un usuario inválido" }, 400);
  if (!password || String(password).length < 6) {
    return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
  }

  const { data: existing } = await db.from("profiles").select("id").eq("username", slug).maybeSingle();
  if (existing) return json({ error: `El usuario «${slug}» ya existe` }, 409);

  const finalRole = bootstrap ? "admin" : role === "admin" ? "admin" : "user";

  const { data: created, error } = await db.auth.admin.createUser({
    email: slugToEmail(slug),
    password: String(password),
    email_confirm: true,
  });
  if (error || !created.user) {
    return json({ error: error?.message ?? "No se pudo crear el usuario" }, 400);
  }

  const { error: pErr } = await db.from("profiles").insert({
    id: created.user.id,
    username: slug,
    display_name: String(display_name).trim(),
    role: finalRole,
    activo: true,
  });
  if (pErr) {
    // Limpia el usuario de Auth para no dejar huérfanos.
    await db.auth.admin.deleteUser(created.user.id);
    return json({ error: `No se pudo crear el perfil: ${pErr.message}` }, 500);
  }

  return json({ ok: true, slug });
});
