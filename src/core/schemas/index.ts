import type { ZodTypeAny } from "zod";
import { mercadoInputSchema } from "./mercado";
import { encuestaInputSchema } from "./encuesta";
import { costeoInputSchema } from "./costeo";
import { planillaInputSchema } from "./planilla";
import { inversionesInputSchema } from "./inversiones";
import { depreciacionInputSchema } from "./depreciacion";
import { puntoEquilibrioInputSchema } from "./puntoEquilibrio";
import { ventasInputSchema } from "./ventas";
import { flujoCajaInputSchema } from "./flujoCaja";
import { estadosFinancierosInputSchema } from "./estadosFinancieros";
import type { ModuloId } from "./proyecto";

export * from "./common";
export * from "./mercado";
export * from "./encuesta";
export * from "./costeo";
export * from "./planilla";
export * from "./inversiones";
export * from "./depreciacion";
export * from "./puntoEquilibrio";
export * from "./ventas";
export * from "./flujoCaja";
export * from "./estadosFinancieros";
export * from "./proyecto";

export interface ModuloMeta {
  id: ModuloId;
  orden: number;
  nombre: string;
  descripcion: string;
  /** Módulos que deben estar completos para desbloquear este (wizard). */
  dependencias: ModuloId[];
  schema: ZodTypeAny;
}

/**
 * Registro de los 10 módulos. El orden codifica el grafo de dependencias del
 * Excel: cada módulo se desbloquea cuando el anterior está completo.
 */
export const MODULOS: readonly ModuloMeta[] = [
  {
    id: "encuesta",
    orden: 1,
    nombre: "Encuesta",
    descripcion: "Frecuencias (fi) de la encuesta; P3 y P6 alimentan el mercado.",
    dependencias: [],
    schema: encuestaInputSchema,
  },
  {
    id: "mercado",
    orden: 2,
    nombre: "Mercado y demanda",
    descripcion: "Universo, segmentación y demanda. Usa P3 y P6 de la encuesta.",
    dependencias: ["encuesta"],
    schema: mercadoInputSchema,
  },
  {
    id: "costeo",
    orden: 3,
    nombre: "Costeo",
    descripcion: "Materia prima, mano de obra, costos fijos y costo unitario.",
    dependencias: ["mercado"],
    schema: costeoInputSchema,
  },
  {
    id: "planilla",
    orden: 4,
    nombre: "Planilla",
    descripcion: "Cuadro de remuneraciones; su gasto mensual alimenta los costos fijos.",
    dependencias: ["mercado"],
    schema: planillaInputSchema,
  },
  {
    id: "inversiones",
    orden: 5,
    nombre: "Inversiones",
    descripcion: "Pre-operativos, activo fijo y capital de trabajo (de Costeo).",
    dependencias: ["costeo"],
    schema: inversionesInputSchema,
  },
  {
    id: "depreciacion",
    orden: 6,
    nombre: "Depreciación y amortización",
    descripcion: "Distribución del costo de los activos en su vida útil.",
    dependencias: ["inversiones"],
    schema: depreciacionInputSchema,
  },
  {
    id: "punto_equilibrio",
    orden: 7,
    nombre: "Punto de equilibrio",
    descripcion: "Unidades y ventas necesarias para no perder ni ganar.",
    dependencias: ["costeo"],
    schema: puntoEquilibrioInputSchema,
  },
  {
    id: "ventas",
    orden: 8,
    nombre: "Proyección de ventas",
    descripcion: "Demanda e ingresos proyectados al horizonte del proyecto.",
    dependencias: ["costeo"],
    schema: ventasInputSchema,
  },
  {
    id: "flujo_caja",
    orden: 9,
    nombre: "Flujo de caja",
    descripcion: "Tres escenarios y COK → VANE, TIRE y Payback.",
    dependencias: ["ventas", "inversiones"],
    schema: flujoCajaInputSchema,
  },
  {
    id: "estados_financieros",
    orden: 10,
    nombre: "Estados financieros",
    descripcion: "EERR, estado de situación financiera y ratios.",
    dependencias: ["flujo_caja"],
    schema: estadosFinancierosInputSchema,
  },
] as const;

export const MODULO_POR_ID: Record<ModuloId, ModuloMeta> = Object.fromEntries(
  MODULOS.map((m) => [m.id, m]),
) as Record<ModuloId, ModuloMeta>;
