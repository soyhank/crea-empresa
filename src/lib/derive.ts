import { derivarEncuesta } from "@/core/calc";
import type { EncuestaInput, MercadoInput, MercadoOwn } from "@/core/schemas";
import type { ProjectData } from "./types";

/**
 * Construye el input EFECTIVO de Mercado: combina los campos propios del módulo
 * (distritos, segmentación) con los factores derivados de la Encuesta (P3 → MD,
 * P6 → ME y CPC). Los factores nunca se editan ni se guardan en Mercado.
 */
export function construirMercado(data: ProjectData): MercadoInput {
  const own = (data.mercado ?? {}) as Partial<MercadoOwn>;
  const enc = derivarEncuesta(data.encuesta as Partial<EncuestaInput> | undefined);
  return {
    distritos: own.distritos ?? [],
    porcentajeEdad: own.porcentajeEdad ?? 0,
    porcentajeNSE: own.porcentajeNSE ?? 0,
    participacionMercado: own.participacionMercado ?? 0,
    crecimientoPoblacional: own.crecimientoPoblacional ?? 0.02,
    factorDisponibilidad: enc.factorDisponibilidad,
    factorEfectividad: enc.factorEfectividad,
    consumoPerCapita: enc.consumoPerCapita,
    periodosPorAnio: 12,
  };
}
