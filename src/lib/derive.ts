import { calcularCosteo, calcularMercado, derivarEncuesta } from "@/core/calc";
import type { CapitalTrabajo, CosteoInput, EncuestaInput, MercadoInput, MercadoOwn } from "@/core/schemas";
import { mercadoOwnSchema } from "@/core/schemas";
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

/**
 * Capital de trabajo heredado de Costeo: costo variable mensual (MP × demanda)
 * y costos fijos mensuales. `listo` = Costeo y Mercado tienen datos válidos.
 */
export function contextoCapitalTrabajo(data: ProjectData): CapitalTrabajo & { listo: boolean } {
  const costeo = data.costeo as CosteoInput | undefined;
  const mercadoOk = mercadoOwnSchema.safeParse(data.mercado).success;
  if (!costeo || !mercadoOk) return { costoVariable: 0, costoFijo: 0, listo: false };
  const demandaMensual = calcularMercado(construirMercado(data)).demandaPorPeriodo;
  const c = calcularCosteo(costeo, { demandaMensual });
  return {
    costoVariable: c.mpUnitario * demandaMensual,
    costoFijo: c.costosFijosMensuales,
    listo: true,
  };
}
