import { z } from "zod";
import { montoSchema, positivoSchema } from "./common";

/**
 * MÓDULO 7 · Punto de equilibrio
 * PE (unid) = Costos Fijos / (Precio − Costo Variable Unitario)
 * La mayoría de entradas se derivan de Costeo/Ventas; aquí se permite override.
 */

export const puntoEquilibrioInputSchema = z.object({
  precioVenta: positivoSchema,
  costoVariableUnitario: montoSchema,
  costosFijosMensuales: montoSchema,
});
export type PuntoEquilibrioInput = z.infer<typeof puntoEquilibrioInputSchema>;
