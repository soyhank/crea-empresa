import type { EERRAnio, ESFAnio, RatiosAnio } from "../schemas/estadosFinancieros";

/** Ratios financieros de un año (liquidez, solvencia, rentabilidad). */
export function calcularRatios(esf: ESFAnio, eerr: EERRAnio): RatiosAnio {
  const div = (a: number, b: number) => (b !== 0 ? a / b : 0);
  return {
    anio: esf.anio,
    // Liquidez
    ratioCorriente: div(esf.totalActivoCte, esf.totalPasivoCte),
    pruebaAcida: div(esf.totalActivoCte - esf.inventario, esf.totalPasivoCte),
    ratioTesoreria: div(esf.efectivo, esf.totalPasivoCte),
    relevanciaActCte: div(esf.totalActivoCte, esf.totalActivos),
    capitalTrabajoNeto: esf.totalActivoCte - esf.totalPasivoCte,
    // Solvencia
    solvencia: div(esf.totalActivos, esf.totalPasivo),
    endeudamActivo: div(esf.totalPasivo, esf.totalActivos),
    endeudamPatrim: div(esf.totalPasivo, esf.totalPatrimonio),
    gradoPropiedad: div(esf.totalPatrimonio, esf.totalActivos),
    // Rentabilidad
    margenNeto: div(eerr.resultadoEjercicio, eerr.ventas),
    roa: div(eerr.resultadoEjercicio, esf.totalActivos),
    roe: div(eerr.resultadoEjercicio, esf.totalPatrimonio),
  };
}
