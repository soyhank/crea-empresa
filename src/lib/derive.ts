import {
  calcularCosteo, calcularDepreciacion, calcularEstadosFinancieros, calcularFlujoCaja,
  calcularInversiones, calcularMercado, calcularProyeccionVentas, derivarEncuesta,
} from "@/core/calc";
import type {
  ActivoDepreciable, CapitalTrabajo, CosteoInput, DepreciacionInput, EncuestaInput, EstadosFinancierosResult,
  FlujoAnioInput, FlujoCajaInput, GastoPreOperativo, InversionesInput, ItemInversion, MercadoInput, MercadoOwn, ProyeccionVentasInput,
} from "@/core/schemas";
import { mercadoOwnSchema, SUPUESTOS_DEFAULT, VIDA_UTIL_SUGERIDA } from "@/core/schemas";

const ESCENARIOS_DEFAULT: FlujoCajaInput = {
  escenarios: [
    { clave: "optimista", inflacion: 0.025, tasaMercado: 0.16, riesgoInversionista: 0.08 },
    { clave: "moderado", inflacion: 0.03, tasaMercado: 0.12, riesgoInversionista: 0.12 },
    { clave: "pesimista", inflacion: 0.04, tasaMercado: 0.08, riesgoInversionista: 0.15 },
  ],
  pctIR: 0.295,
};
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

/** Datos heredados que necesita la Proyección de ventas (de Mercado y Costeo). */
export function contextoVentas(data: ProjectData): {
  demandaMesBase: number; precioVenta: number; cvu: number; cfu: number; listo: boolean;
} {
  const costeo = data.costeo as CosteoInput | undefined;
  const mercadoOk = mercadoOwnSchema.safeParse(data.mercado).success;
  const demandaMesBase = calcularMercado(construirMercado(data)).demandaPorPeriodo;
  if (!costeo || !mercadoOk) return { demandaMesBase, precioVenta: 0, cvu: 0, cfu: 0, listo: false };
  const c = calcularCosteo(costeo, { demandaMensual: demandaMesBase });
  return { demandaMesBase, precioVenta: c.valorVenta, cvu: c.mpUnitario, cfu: c.costoFijoUnitario, listo: true };
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

/** Datos heredados para el Flujo de caja: inversión inicial y totales anuales. */
export function contextoFlujo(data: ProjectData): {
  inversionInicial: number; anios: FlujoAnioInput[]; listo: boolean;
} {
  const inv = data.inversiones as InversionesInput | undefined;
  const cap = contextoCapitalTrabajo(data);
  const cv = contextoVentas(data);
  if (!inv || !cap.listo || !cv.listo) return { inversionInicial: 0, anios: [], listo: false };

  const inversionInicial = calcularInversiones(inv, cap).inversionTotal;
  const ventas = (data.ventas as ProyeccionVentasInput | undefined) ?? { pctCrecimientoAnual: 0.05, igv: 0.18 };
  const proy = calcularProyeccionVentas(ventas, cv);
  const anios: FlujoAnioInput[] = proy.anios.map((a) => ({
    ingresos: a.totalIngresos,
    costosFijos: a.totalCF,
    costosVariables: a.totalCV,
    igvAPagar: a.totalIgvAPagar,
  }));
  return { inversionInicial, anios, listo: true };
}

/** Estados financieros completos derivados de todo el grafo de cálculo. */
export function contextoEstados(data: ProjectData): { result: EstadosFinancierosResult | null; listo: boolean } {
  const cf = contextoFlujo(data);
  if (!cf.listo) return { result: null, listo: false };

  const flujoInput = (data.flujo_caja as FlujoCajaInput | undefined) ?? ESCENARIOS_DEFAULT;
  const flujo = calcularFlujoCaja(flujoInput, cf.inversionInicial, cf.anios);

  const inv = data.inversiones as InversionesInput;
  const cap = contextoCapitalTrabajo(data);
  const invR = calcularInversiones(inv, cap);
  const dep = construirDepreciacion(data);
  const depR = calcularDepreciacion(dep.activos, dep.gastos);
  const adelanto = (inv.preOperativos ?? []).find((p) => /alquiler/i.test(p.rubro));

  const result = calcularEstadosFinancieros(flujo, {
    inversionTotal: invR.inversionTotal,
    activoFijoBruto: invR.totalActivoFijo,
    adelantoAlquiler: adelanto ? adelanto.cantidad * adelanto.precio : 0,
    deprecAnual: depR.totalDeprecAnual,
    amortAnual: depR.totalAmortAnual,
    supuestos: SUPUESTOS_DEFAULT,
  });
  return { result, listo: true };
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
