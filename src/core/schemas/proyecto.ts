import { z } from "zod";
import { mercadoInputSchema } from "./mercado";
import { encuestaInputSchema } from "./encuesta";
import { costeoInputSchema } from "./costeo";
import { planillaInputSchema } from "./planilla";
import { inversionesInputSchema } from "./inversiones";
import { depreciacionInputSchema } from "./depreciacion";
import { puntoEquilibrioInputSchema } from "./puntoEquilibrio";
import { ventasInputSchema } from "./proyeccionVentas";
import { flujoCajaInputSchema } from "./flujoCaja";
import { estadosFinancierosInputSchema } from "./estadosFinancieros";

/** Identificadores estables de los 10 módulos (orden = dependencias). */
export const moduloIdSchema = z.enum([
  "mercado",
  "encuesta",
  "costeo",
  "planilla",
  "inversiones",
  "depreciacion",
  "punto_equilibrio",
  "ventas",
  "flujo_caja",
  "estados_financieros",
]);
export type ModuloId = z.infer<typeof moduloIdSchema>;

/**
 * Datos del proyecto = SOLO inputs por módulo (parciales mientras se completa).
 * Ningún valor financiero derivado se guarda aquí: todo se recalcula.
 */
export const proyectoDataSchema = z.object({
  mercado: mercadoInputSchema.partial().optional(),
  encuesta: encuestaInputSchema.partial().optional(),
  costeo: costeoInputSchema.partial().optional(),
  planilla: planillaInputSchema.partial().optional(),
  inversiones: inversionesInputSchema.partial().optional(),
  depreciacion: depreciacionInputSchema.partial().optional(),
  punto_equilibrio: puntoEquilibrioInputSchema.partial().optional(),
  ventas: ventasInputSchema.partial().optional(),
  flujo_caja: flujoCajaInputSchema.partial().optional(),
  estados_financieros: estadosFinancierosInputSchema.partial().optional(),
});
export type ProyectoData = z.infer<typeof proyectoDataSchema>;

/** Metadatos del proyecto (la fila `proyectos` en la BD). */
export const proyectoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  nombre: z.string().min(1, "Ponle un nombre al proyecto"),
  descripcion: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Proyecto = z.infer<typeof proyectoSchema>;

/** Estado de un módulo en el wizard. */
export type EstadoModulo = "completo" | "en_progreso" | "bloqueado" | "pendiente";
