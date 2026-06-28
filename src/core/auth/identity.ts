/**
 * Identidad por NOMBRE DE EMPRESARIO (sin email visible).
 *
 * Supabase Auth exige un email internamente; lo derivamos de un slug estable a
 * partir del nombre. Esta MISMA normalización debe usarse en el login (cliente)
 * y en la creación (Edge Function), o el usuario no podrá entrar.
 *
 * Módulo puro, sin dependencias: importable tanto por Vite/TS como por Deno
 * (Edge Functions copian este archivo en supabase/functions/_shared/identity.ts;
 * un test de paridad garantiza que no divergan).
 */

/** Dominio sintético interno (nunca visible para el usuario). */
export const IDENTITY_EMAIL_DOMAIN = "empresario.crea-empresa.app";

/**
 * Convierte un nombre de empresario en un slug estable:
 * minúsculas, sin acentos, alfanumérico separado por guiones.
 *  "José Pérez"  → "jose-perez"
 *  "K-KORI S.A.C." → "k-kori-s-a-c"
 */
export function normalizeUsername(input: string): string {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos (marcas combinantes)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico → guion
    .replace(/^-+|-+$/g, "") // recorta guiones extremos
    .replace(/-{2,}/g, "-"); // colapsa guiones repetidos
}

/** Email sintético a partir del slug. */
export function slugToEmail(slug: string): string {
  return `${slug}@${IDENTITY_EMAIL_DOMAIN}`;
}

/** Atajo: nombre → email sintético. */
export function usernameToEmail(input: string): string {
  return slugToEmail(normalizeUsername(input));
}

/** Reglas mínimas de validez del slug (≥ 2 caracteres alfanuméricos). */
export function isValidUsername(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) && slug.replace(/-/g, "").length >= 2;
}
