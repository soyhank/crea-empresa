import { MODULOS, MODULO_POR_ID, type ModuloId, type EstadoModulo } from "@/core/schemas";
import type { ProjectModules } from "./types";

export interface ModuloEstado {
  id: ModuloId;
  estado: EstadoModulo;
  /** Si está bloqueado, nombre de la dependencia pendiente (para el tooltip). */
  bloqueadoPor?: string;
}

/** Calcula el estado de cada módulo del wizard a partir de los datos guardados. */
export function calcularEstados(modules: ProjectModules): Record<ModuloId, ModuloEstado> {
  const out = {} as Record<ModuloId, ModuloEstado>;
  for (const meta of MODULOS) {
    const rec = modules[meta.id];
    const completo = rec?.completo === true;
    const tieneDatos = rec?.data != null && Object.keys(rec.data as object).length > 0;

    const depPendiente = meta.dependencias.find((d) => modules[d]?.completo !== true);

    let estado: EstadoModulo;
    if (completo) estado = "completo";
    else if (depPendiente) estado = "bloqueado";
    else if (tieneDatos) estado = "en_progreso";
    else estado = "pendiente";

    out[meta.id] = {
      id: meta.id,
      estado,
      bloqueadoPor: depPendiente ? MODULO_POR_ID[depPendiente].nombre : undefined,
    };
  }
  return out;
}

/** % de avance global del proyecto. */
export function porcentajeAvance(modules: ProjectModules): number {
  const total = MODULOS.length;
  const completos = MODULOS.filter((m) => modules[m.id]?.completo === true).length;
  return Math.round((completos / total) * 100);
}
