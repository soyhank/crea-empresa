import { z } from "zod";
import { idSchema, fraccionSchema, positivoSchema } from "./common";

/**
 * MÓDULO 1 · Mercado / Demanda
 *
 * Reconstruye la cadena del Excel:
 *   Universo → MP → MD → ME → MO → Demanda (× CPC)
 *
 * Corrección sobre el Excel: la segmentación deja de estar cableada (edad+NSE)
 * y pasa a ser una lista de filtros multiplicativos. Los factores de mercado
 * (disponibilidad, efectividad) se modelan como conteos de encuesta
 * (seleccionadas/total) para conservar PLENA PRECISIÓN y reproducir K-KORI
 * exacto, en lugar de porcentajes redondeados que arrastran error.
 */

/** Distrito o zona del universo poblacional (tabla editable). */
export const distritoSchema = z.object({
  id: idSchema,
  nombre: z.string().min(1, "Indica el distrito"),
  poblacion: z.number().int("Debe ser entero").min(0, "No puede ser negativo"),
});
export type Distrito = z.infer<typeof distritoSchema>;

/**
 * Filtro de segmentación: una fracción del universo (edad, NSE, género, etc.).
 * MP = Universo × Π(fracciones). Mínimo recomendado: 1 filtro.
 */
export const filtroSegmentacionSchema = z.object({
  id: idSchema,
  etiqueta: z.string().min(1, "Describe el filtro"),
  fraccion: fraccionSchema,
});
export type FiltroSegmentacion = z.infer<typeof filtroSegmentacionSchema>;

/**
 * Factor proveniente de la encuesta (pregunta filtro/aceptación).
 * fraccion = seleccionadas / total, calculada con precisión completa.
 */
export const factorEncuestaSchema = z.object({
  seleccionadas: z.number().int().min(0),
  total: z.number().int().min(0),
  /** Referencia informativa: qué pregunta/opciones lo alimentan. */
  referencia: z.string().optional(),
});
export type FactorEncuesta = z.infer<typeof factorEncuestaSchema>;

/** Renglón de la tabla de consumo per cápita (marca de clase × frecuencia). */
export const cpcItemSchema = z.object({
  id: idSchema,
  etiqueta: z.string().min(1),
  /** Marca de clase: veces de consumo en el periodo (p. ej. diaria≈7/sem). */
  marcaClase: z.number().min(0),
  /** Frecuencia absoluta (fi) de la encuesta para esa opción. */
  fi: z.number().int().min(0),
});
export type CpcItem = z.infer<typeof cpcItemSchema>;

export const mercadoInputSchema = z.object({
  distritos: z.array(distritoSchema).min(1, "Agrega al menos un distrito"),
  filtrosSegmentacion: z
    .array(filtroSegmentacionSchema)
    .min(1, "Agrega al menos un criterio de segmentación"),
  /** Factor de mercado disponible (pregunta filtro de consumo). */
  factorDisponibilidad: factorEncuestaSchema,
  /** Factor de mercado efectivo (pregunta de aceptación / intención de compra). */
  factorEfectividad: factorEncuestaSchema,
  /** Participación de mercado objetivo (captación inicial, p. ej. 10%). */
  participacionMercado: fraccionSchema,
  /** Tabla para derivar el consumo per cápita; CPC = Σ marcaClase × (fi/total). */
  consumoPerCapita: z.array(cpcItemSchema).min(1, "Agrega la tabla de frecuencia de compra"),
  /** Periodos por año para la demanda intra-anual (12 = mensual). */
  periodosPorAnio: positivoSchema.default(12),
});
export type MercadoInput = z.infer<typeof mercadoInputSchema>;

/** Resultado derivado (NUNCA se persiste; se recalcula siempre). */
export interface MercadoResult {
  universo: number;
  mercadoPotencial: number;
  mercadoDisponible: number;
  mercadoEfectivo: number;
  mercadoObjetivo: number;
  consumoPerCapita: number;
  demandaAnual: number;
  demandaPorPeriodo: number;
  /** Traza paso a paso para el panel "Resultados en vivo". */
  pasos: Array<{ clave: string; etiqueta: string; valor: number; detalle: string }>;
}
