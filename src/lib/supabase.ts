import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Saneo defensivo de las credenciales: si la variable de entorno se pegó en
 * Vercel desde un archivo guardado como UTF-8-con-BOM (típico en Windows), el
 * valor llega con un BOM (U+FEFF) al inicio. Ese carácter no es Latin-1, así
 * que al inyectarlo en los headers `apikey`/`Authorization`, el navegador
 * rechaza el fetch con "String contains non ISO-8859-1 code point" y el login
 * falla con un genérico "usuario o contraseña incorrectos". `.trim()` elimina
 * el BOM (cuenta como whitespace en ECMAScript) y cualquier espacio accidental.
 */
const clean = (v: string | undefined) => v?.trim() || undefined;

const url = clean(import.meta.env.VITE_SUPABASE_URL);
const anon = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

/**
 * El cliente solo se crea si hay credenciales. Sin ellas, la app funciona en
 * "modo demo" (datos en localStorage) para poder ejecutarse/desplegarse antes
 * de conectar Supabase. Ver src/lib/data.ts.
 */
export const isSupabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anon as string)
  : null;
