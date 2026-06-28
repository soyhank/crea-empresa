import { calcularCosteo, calcularMercado, derivarEncuesta } from "@/core/calc";
import type {
  ActivoDepreciable, CapitalTrabajo, CosteoInput, DepreciacionInput, EncuestaInput,
  GastoPreOperativo, InversionesInput, ItemInversion, MercadoInput, MercadoOwn,
} from "@/core/schemas";
import { mercadoOwnSchema, VIDA_UTIL_SUGERIDA } from "@/core/schemas";
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

/** Datos heredados que necesita el Punto de equilibrio (de Costeo y Mercado). */
export function contextoPuntoEquilibrio(data: ProjectData): {
  cvu: number; pv: number; cft: number; demandaMensual: number; listo: boolean;
} {
  const costeo = data.costeo as CosteoInput | undefined;
  const mercadoOk = mercadoOwnSchema.safeParse(data.mercado).success;
  const demandaMensual = calcularMercado(construirMercado(data)).demandaPorPeriodo;
  if (!costeo || !mercadoOk) return { cvu: 0, pv: 0, cft: 0, demandaMensual, listo: false };
  const c = calcularCosteo(costeo, { demandaMensual });
  // El PE usa la materia prima como costo variable (criterio del modelo K-KORI).
  return { cvu: c.mpUnitario, pv: c.valorVenta, cft: c.costosFijosMensuales, demandaMensual, listo: true };
}

const GRUPO_LABEL: Record<keyof InversionesInput["activoFijo"], string> = {
  maquinariaEquipos: "Maquinaria y equipos",
  equiposUtensilios: "Equipos y utensilios",
  equiposOficinaAdmin: "Equipos de oficina",
  mueblesEnseres: "Muebles y enseres",
};

/**
 * Construye los activos depreciables y los gastos amortizables a partir de
 * Inversiones (montos heredados) y de la vida útil / % elegidos en Depreciación.
 */
export function construirDepreciacion(data: ProjectData): {
  activos: ActivoDepreciable[];
  gastos: GastoPreOperativo[];
  listo: boolean;
} {
  const inv = data.inversiones as InversionesInput | undefined;
  const dep = (data.depreciacion ?? {}) as Partial<DepreciacionInput>;
  const vidas = dep.vidasUtiles ?? {};
  const pct = dep.pctAmortizacion ?? 0.1;
  if (!inv) return { activos: [], gastos: [], listo: false };

  const activos: ActivoDepreciable[] = (Object.keys(GRUPO_LABEL) as Array<keyof InversionesInput["activoFijo"]>)
    .flatMap((key) =>
      (inv.activoFijo[key] ?? []).map((it: ItemInversion) => ({
        id: it.id,
        nombre: it.rubro,
        monto: it.cantidad * it.precio,
        vidaUtil: vidas[it.id] ?? VIDA_UTIL_SUGERIDA[key] ?? 10,
        grupo: GRUPO_LABEL[key],
      })),
    );

  const gastos: GastoPreOperativo[] = (inv.preOperativos ?? []).map((it) => ({
    id: it.id,
    nombre: it.rubro,
    monto: it.cantidad * it.precio,
    pctAmortizacion: pct,
  }));

  return { activos, gastos, listo: activos.length > 0 };
}
