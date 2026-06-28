import type { EstadosContext } from "../schemas/estadosFinancieros";
import { SUPUESTOS_DEFAULT } from "../schemas/estadosFinancieros";

/** Contexto K-KORI para estados financieros (de Inversiones y Depreciación). */
export const kkoriEstadosContext: EstadosContext = {
  inversionTotal: 49268.88981455179,
  activoFijoBruto: 18160.4,
  adelantoAlquiler: 2300,
  deprecAnual: 3346.94,
  amortAnual: 566.75,
  supuestos: SUPUESTOS_DEFAULT,
};

export const kkoriEstadosEsperado = {
  // EERR moderado
  eerr: {
    anio1: { ventas: 457030.7, costoVentas: 133193.38, gananciaBruta: 323837.32, gastosAdmin: 184968.53, uaii: 138868.79, ir: 30287.2, resultadoEjercicio: 108581.59 },
    anio2: { ventas: 479923.34, resultadoEjercicio: 114020.44 },
    anio3: { ventas: 491558.08, resultadoEjercicio: 116784.63 },
  },
  // ESF moderado
  esf: {
    anio1: { totalActivos: 351602.76, totalPasivo: 193752.28, totalPatrimonio: 157850.48 },
    anio2: { totalActivos: 366746.65, totalPasivo: 203457.32, totalPatrimonio: 163289.33 },
    anio3: { totalActivos: 374443.24, totalPasivo: 208389.72, totalPatrimonio: 166053.52 },
  },
  // Ratios moderado año 1
  ratios1: {
    ratioCorriente: 1.686, pruebaAcida: 1.6516, ratioTesoreria: 1.1798, relevanciaActCte: 0.9291,
    capitalTrabajoNeto: 132909.64, solvencia: 1.8147, endeudamActivo: 0.5511, endeudamPatrim: 1.2274,
    gradoPropiedad: 0.4489, margenNeto: 0.2376, roa: 0.3088, roe: 0.6879,
  },
};
