import type { ProyeccionVentasInput } from "@/core/schemas";

export function ventasVacia(): ProyeccionVentasInput {
  return { pctCrecimientoAnual: 0.05, igv: 0.18 };
}

export function ventasEjemploKkori(): ProyeccionVentasInput {
  return { pctCrecimientoAnual: 0.05, igv: 0.18 };
}
