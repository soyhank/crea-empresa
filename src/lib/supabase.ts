import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * El cliente solo se crea si hay credenciales. Sin ellas, la app funciona en
 * "modo demo" (datos en localStorage) para poder ejecutarse/desplegarse antes
 * de conectar Supabase. Ver src/lib/data.ts.
 */
export const isSupabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anon as string)
  : null;
