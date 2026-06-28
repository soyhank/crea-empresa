import { z } from "zod";
import { idSchema, fraccionSchema, positivoSchema } from "./common";

/**
 * MÓDULO 1 · Mercado / Demanda
 *
 * Reconstruye la cadena del Excel:
 *   Universo → MP → MD → ME → MO → Demanda (× CPC)
 *
 * Los factores se modelan como fracciones 0..1 (la UI los muestra como %).
 * El caso K-KORI usa fracciones exactas (p. ej. 205/384) para reproducir el
 * Excel sin arrastre de redondeo.
 */

/** Distrito o zona del universo poblacional (tabla editable). */
export const distritoSchema = z.object({
  id: idSchema,
  nombre: z.string().min(1, "Indica el distrito"),
  poblacion: z.number().int("Debe ser entero").min(0, "No puede ser negativo"),
});
export type Distrito = z.infer<typeof distritoSchema>;

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
  /** % del universo en el rango de edad objetivo (p. ej. 18–50 años). */
  porcentajeEdad: fraccionSchema,
  /** % del nivel socioeconómico objetivo (p. ej. B + C). */
  porcentajeNSE: fraccionSchema,
  /** Participación / captación de mercado objetivo (p. ej. 10%). */
  participacionMercado: fraccionSchema,
  /** Crecimiento poblacional anual (reservado para la proyección de ventas). */
  crecimientoPoblacional: fraccionSchema.default(0.02),
  /** Mercado disponible: P3 frecuencia de consumo (p. ej. "Semanal"). */
  factorDisponibilidad: fraccionSchema,
  /** Mercado efectivo: P6 intención/frecuencia de compra. */
  factorEfectividad: fraccionSchema,
  /** Tabla para derivar el consumo per cápita; CPC = Σ marcaClase × (fi/total). */
  consumoPerCapita: z.array(cpcItemSchema).min(1, "Agrega la tabla de frecuencia de compra"),
  /** Periodos por año para la demanda intra-anual (12 = mensual). */
  periodosPorAnio: positivoSchema.default(12),
});
export type MercadoInput = z.infer<typeof mercadoInputSchema>;

/**
 * Campos PROPIOS de Mercado (los que el usuario edita en su formulario).
 * Los factores MD/ME y el consumo per cápita NO están aquí: provienen del
 * módulo Encuesta (P3 y P6). Se usa para evaluar la completitud del módulo.
 */
export const mercadoOwnSchema = z.object({
  distritos: z.array(distritoSchema).min(1, "Agrega al menos un distrito"),
  porcentajeEdad: fraccionSchema,
  porcentajeNSE: fraccionSchema,
  participacionMercado: fraccionSchema,
  crecimientoPoblacional: fraccionSchema.default(0.02),
});
export type MercadoOwn = z.infer<typeof mercadoOwnSchema>;

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
