// IMPORTANTE: copia EXACTA de src/core/auth/identity.ts para uso en Deno.
// La normalización debe ser idéntica en cliente y Edge Function, o el login
// generaría un slug/email distinto al de la creación y el usuario no entraría.

export const IDENTITY_EMAIL_DOMAIN = "empresario.crea-empresa.app";

export function normalizeUsername(input: string): string {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function slugToEmail(slug: string): string {
  return `${slug}@${IDENTITY_EMAIL_DOMAIN}`;
}

export function isValidUsername(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) && slug.replace(/-/g, "").length >= 2;
}
