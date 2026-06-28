import { z } from "zod";
import { idSchema } from "./common";

/**
 * MÓDULO 2 · Encuesta
 *
 * La encuesta NO se aplica en el sistema: el alumno ingresa manualmente las
 * frecuencias absolutas (fi) agregadas por opción. El sistema calcula los % .
 * Cada pregunta declara si alimenta un cálculo (`usadaEnCalculo`) y a qué
 * variable del modelo mapea (badge "Usada en cálculo" vs "Solo informe").
 */

/** Variables del modelo a las que una pregunta puede alimentar. */
export const variableCalculoSchema = z.enum([
  "mercado_disponible", // pregunta filtro de consumo  → MD
  "mercado_efectivo", // pregunta de aceptación/compra → ME
  "consumo_percapita", // frecuencia de compra (marca de clase) → CPC
  "precio_venta", // disposición a pagar → precio referencial
]);
export type VariableCalculo = z.infer<typeof variableCalculoSchema>;

export const opcionEncuestaSchema = z.object({
  id: idSchema,
  etiqueta: z.string().min(1, "Escribe la opción"),
  /** Frecuencia absoluta (entero). El % se deriva: fi / total. */
  fi: z.number().int("Debe ser entero").min(0, "No puede ser negativo"),
  /** Marca util cuando la pregunta alimenta el CPC (veces en el periodo). */
  marcaClase: z.number().min(0).optional(),
  /** Si la pregunta alimenta un factor por suma de opciones, marca cuáles cuentan. */
  cuentaEnFactor: z.boolean().default(false),
});
export type OpcionEncuesta = z.infer<typeof opcionEncuestaSchema>;

export const preguntaEncuestaSchema = z.object({
  id: idSchema,
  orden: z.number().int().min(1),
  texto: z.string().min(1, "Escribe la pregunta"),
  opciones: z.array(opcionEncuestaSchema).min(2, "Agrega al menos dos opciones"),
  usadaEnCalculo: z.boolean().default(false),
  mapeoVariable: variableCalculoSchema.optional(),
});
export type PreguntaEncuesta = z.infer<typeof preguntaEncuestaSchema>;

export const encuestaInputSchema = z.object({
  tamanoMuestra: z.number().int().min(1).optional(),
  preguntas: z.array(preguntaEncuestaSchema),
});
export type EncuestaInput = z.infer<typeof encuestaInputSchema>;
