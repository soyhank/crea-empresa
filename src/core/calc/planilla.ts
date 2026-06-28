import { sum } from "../money";
import type { PlanillaInput, PlanillaResult, Trabajador, TrabajadorResult } from "../schemas/planilla";

/**
 * Motor de cálculo de Planilla (funciones puras). Reproduce K-KORI:
 * total gasto mensual = 11,336.25 (alimenta los costos fijos de Costeo).
 */

export interface ParamsPlanilla {
  pctPensiones: number;
  factorGratificacion: number;
  factorVacaciones: number;
}

export function calcularTrabajador(t: Trabajador, p: ParamsPlanilla): TrabajadorResult {
  const remBruta = t.baseMensual + (t.bonificacion || 0);

  // Honorarios (contador externo): solo su base, sin cargas ni provisiones.
  if (!t.aplicaProvisiones) {
    return {
      id: t.id,
      remBruta,
      pensiones: 0,
      remNeta: remBruta,
      provGratificacion: 0,
      provVacaciones: 0,
      gastoMensual: t.baseMensual,
    };
  }

  const pensiones = remBruta * p.pctPensiones;
  const remNeta = remBruta - pensiones;
  const provGratificacion = remBruta * p.factorGratificacion;
  const provVacaciones = remBruta * p.factorVacaciones;
  const gastoMensual = remBruta + (t.sis || 0) + provGratificacion + provVacaciones;

  return { id: t.id, remBruta, pensiones, remNeta, provGratificacion, provVacaciones, gastoMensual };
}

export function calcularPlanilla(input: PlanillaInput): PlanillaResult {
  const params: ParamsPlanilla = {
    pctPensiones: input.pctPensiones,
    factorGratificacion: input.factorGratificacion,
    factorVacaciones: input.factorVacaciones,
  };
  const trabajadores = input.trabajadores.map((t) => calcularTrabajador(t, params));

  return {
    trabajadores,
    nTrabajadores: trabajadores.length,
    totalBruta: sum(trabajadores.map((t) => t.remBruta)),
    totalPensiones: sum(trabajadores.map((t) => t.pensiones)),
    totalProvisiones: sum(trabajadores.map((t) => t.provGratificacion + t.provVacaciones)),
    totalGastoMensual: sum(trabajadores.map((t) => t.gastoMensual)),
  };
}
