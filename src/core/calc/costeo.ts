import { sum } from "../money";
import { factorConversion } from "../units";
import type { CosteoInput, CosteoResult, Insumo, ProcesoMOD } from "../schemas/costeo";

/**
 * Motor de cálculo del módulo Costeo (funciones puras).
 * Reproduce el caso K-KORI: MP 3.94 · MOD 1.30 · CVU 5.24 · CFU 5.471563 ·
 * CTU 10.711562 · valor venta 13.925031 · IGV 2.506506 · PV 16.431537.
 */

/** Contexto aguas arriba que necesita Costeo. */
export interface CosteoContext {
  /** Demanda mensual (cajas) del módulo Mercado; divisor del CFU. */
  demandaMensual: number;
}

/**
 * Total de un insumo = precio × requerimiento, convirtiendo el requerimiento
 * de su unidad (g, ml…) a la unidad de compra (kg, L…) del precio.
 * Sin `unidadRequerimiento`, el factor es 1 (requerimiento ya en unidad de compra).
 */
export function totalInsumo(i: Insumo): number {
  const factor = factorConversion(i.unidadRequerimiento, i.medida);
  return i.precioUnitario * i.requerimiento * factor;
}

/** Materia prima unitaria = Σ totales de insumos. */
export function calcularMP(insumos: Insumo[]): number {
  return sum(insumos.map(totalInsumo));
}

/**
 * Valor de un proceso de MOD por unidad:
 *   minutos × (sueldo / minutosMes) / eficiencia
 */
export function valorProcesoMOD(p: ProcesoMOD, minutosMes: number): number {
  if (!minutosMes || !p.eficiencia) return 0;
  const valorMinuto = p.sueldo / minutosMes;
  return (p.minutos * valorMinuto) / p.eficiencia;
}

/** Mano de obra directa unitaria = Σ procesos. */
export function calcularMOD(procesos: ProcesoMOD[], minutosMes: number): number {
  return sum(procesos.map((p) => valorProcesoMOD(p, minutosMes)));
}

export function calcularCosteo(input: CosteoInput, ctx: CosteoContext): CosteoResult {
  const minutosMes = input.minutosDisponiblesMes || 11589.75;

  const insumosTotales = input.materiaPrima.map((i) => ({ id: i.id, total: totalInsumo(i) }));
  const modPorProceso = input.manoObra.map((p) => ({ id: p.id, valor: valorProcesoMOD(p, minutosMes) }));

  const mpUnitario = calcularMP(input.materiaPrima);
  const mod = calcularMOD(input.manoObra, minutosMes);
  const costoVariableUnitario = mpUnitario + mod;

  const costosFijosMensuales = sum(input.costosFijos.map((c) => c.monto));
  const costoFijoUnitario = ctx.demandaMensual > 0 ? costosFijosMensuales / ctx.demandaMensual : 0;

  const costoTotalUnitario = costoVariableUnitario + costoFijoUnitario;
  const margenValor = costoTotalUnitario * input.margen;
  const valorVenta = costoTotalUnitario + margenValor;
  const igvValor = valorVenta * input.igv;
  const precioVenta = valorVenta + igvValor;

  return {
    insumosTotales,
    modPorProceso,
    mpUnitario,
    mod,
    costoVariableUnitario,
    costosFijosMensuales,
    costoFijoUnitario,
    costoTotalUnitario,
    margenValor,
    valorVenta,
    igvValor,
    precioVenta,
  };
}
