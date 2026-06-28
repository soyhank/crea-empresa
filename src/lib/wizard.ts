import { MODULOS, MODULO_POR_ID, mercadoOwnSchema, type ModuloId, type EstadoModulo } from "@/core/schemas";
import { derivarEncuesta } from "@/core/calc";
import type { EncuestaInput, InversionesInput } from "@/core/schemas";
import type { ProjectData } from "./types";

function totalInversiones(inv?: InversionesInput): number {
  if (!inv) return 0;
  const af = inv.activoFijo;
  const listas = [inv.preOperativos, af?.maquinariaEquipos, af?.equiposUtensilios, af?.equiposOficinaAdmin, af?.mueblesEnseres];
  return listas.flatMap((x) => x ?? []).reduce((a, i) => a + i.cantidad * i.precio, 0);
}

/**
 * Reglas de completitud especiales (sobrescriben la validación Zod por defecto):
 *  - Encuesta: lista cuando P3 y P6 tienen frecuencias (las descriptivas no cuentan).
 *  - Mercado: solo sus campos propios; los factores vienen de la Encuesta.
 */
const COMPLETION_OVERRIDES: Partial<Record<ModuloId, (data: ProjectData) => boolean>> = {
  encuesta: (data) => derivarEncuesta(data.encuesta as Partial<EncuestaInput> | undefined).listo,
  mercado: (data) => mercadoOwnSchema.safeParse(data.mercado).success,
  inversiones: (data) => {
    const inv = data.inversiones as InversionesInput | undefined;
    return !!inv && inv.numSocios >= 1 && totalInversiones(inv) > 0;
  },
  // Depreciación se deriva de Inversiones con vidas útiles por defecto.
  depreciacion: (data) => isModuloCompleto("inversiones", data),
  // Punto de equilibrio se deriva por completo de Costeo.
  punto_equilibrio: (data) => isModuloCompleto("costeo", data),
  // Ventas: se desbloquea/deriva con Costeo (usa crecimiento por defecto).
  ventas: (data) => isModuloCompleto("costeo", data),
  // Flujo de caja: requiere ventas e inversiones; usa escenarios por defecto.
  flujo_caja: (data) => isModuloCompleto("ventas", data) && isModuloCompleto("inversiones", data),
};

export interface ModuloEstado {
  id: ModuloId;
  estado: EstadoModulo;
  /** Si está bloqueado, nombre de la dependencia pendiente (para el tooltip). */
  bloqueadoPor?: string;
}

/** ¿El módulo tiene algún input guardado (aunque sea parcial)? */
export function tieneDatos(id: ModuloId, data: ProjectData): boolean {
  const d = data?.[id];
  return !!d && typeof d === "object" && Object.keys(d as object).length > 0;
}

/**
 * Un módulo está COMPLETO cuando sus inputs pasan la validación Zod del módulo.
 * No se persiste: se deriva siempre del JSONB del proyecto.
 */
export function isModuloCompleto(id: ModuloId, data: ProjectData): boolean {
  const override = COMPLETION_OVERRIDES[id];
  if (override) return override(data);
  if (!tieneDatos(id, data)) return false;
  return MODULO_POR_ID[id].schema.safeParse(data[id]).success;
}

/** Estado de cada módulo del wizard a partir de los datos del proyecto. */
export function calcularEstados(data: ProjectData): Record<ModuloId, ModuloEstado> {
  const completos = {} as Record<ModuloId, boolean>;
  for (const m of MODULOS) completos[m.id] = isModuloCompleto(m.id, data);

  const out = {} as Record<ModuloId, ModuloEstado>;
  for (const meta of MODULOS) {
    const depPendiente = meta.dependencias.find((dep) => !completos[dep]);
    let estado: EstadoModulo;
    if (completos[meta.id]) estado = "completo";
    else if (depPendiente) estado = "bloqueado";
    else if (tieneDatos(meta.id, data)) estado = "en_progreso";
    else estado = "pendiente";

    out[meta.id] = {
      id: meta.id,
      estado,
      bloqueadoPor: depPendiente ? MODULO_POR_ID[depPendiente].nombre : undefined,
    };
  }
  return out;
}

export function modulosCompletos(data: ProjectData): number {
  return MODULOS.filter((m) => isModuloCompleto(m.id, data)).length;
}

export function porcentajeAvance(data: ProjectData): number {
  return Math.round((modulosCompletos(data) / MODULOS.length) * 100);
}

export const TOTAL_MODULOS = MODULOS.length;

/** Módulos posteriores (por orden de dependencia) al indicado. */
export function modulosAguasAbajo(id: ModuloId): ModuloId[] {
  const orden = MODULO_POR_ID[id].orden;
  return MODULOS.filter((m) => m.orden > orden).map((m) => m.id);
}

/**
 * Aristas de alimentación que NO siguen el orden (un módulo posterior alimenta
 * uno anterior). P. ej. Planilla y Depreciación alimentan los costos fijos de Costeo.
 */
const ALIMENTA_EXTRA: Partial<Record<ModuloId, ModuloId[]>> = {
  planilla: ["costeo"],
  depreciacion: ["costeo"],
};

/** Todos los módulos afectados por un cambio en `id` (downstream + extras). */
export function modulosAfectados(id: ModuloId): ModuloId[] {
  return Array.from(new Set([...modulosAguasAbajo(id), ...(ALIMENTA_EXTRA[id] ?? [])]));
}
