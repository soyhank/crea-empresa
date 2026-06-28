import { z } from "zod";

/**
 * MÓDULO 10 · Estados financieros y ratios
 * Sin inputs propios: todo se deriva de Flujo de caja, Ventas, Inversiones y
 * Depreciación. El ESF cuadra por construcción (el efectivo es la cifra de calce).
 */
export const estadosFinancierosInputSchema = z.object({});
export type EstadosFinancierosInput = z.infer<typeof estadosFinancierosInputSchema>;

/** Supuestos contables (por defecto K-KORI). */
export interface SupuestosESF {
  pctVentasCredito: number; // 0.20
  pctComprasCredito: number; // 0.40
  pctInventario: number; // 0.05
}

export const SUPUESTOS_DEFAULT: SupuestosESF = {
  pctVentasCredito: 0.2,
  pctComprasCredito: 0.4,
  pctInventario: 0.05,
};

export interface EERRAnio {
  anio: number;
  ventas: number;
  costoVentas: number;
  gananciaBruta: number;
  gastosAdmin: number;
  uaii: number;
  ir: number;
  resultadoEjercicio: number;
}

export interface ESFAnio {
  anio: number;
  // Activo corriente
  efectivo: number;
  cuentasCobrar: number;
  inventario: number;
  totalActivoCte: number;
  // Activo no corriente
  activoFijoNeto: number;
  deprecAmortAcum: number;
  cuentasCobrarLP: number;
  totalActivoNoCte: number;
  totalActivos: number;
  // Pasivo
  tributosIGV: number;
  cuentasPagar: number;
  irPorPagar: number;
  totalPasivoCte: number;
  totalPasivo: number;
  // Patrimonio
  capitalSocial: number;
  utilidadEjercicio: number;
  totalPatrimonio: number;
  totalPasivoPatrimonio: number;
  cuadra: boolean;
}

export interface RatiosAnio {
  anio: number;
  ratioCorriente: number;
  pruebaAcida: number;
  ratioTesoreria: number;
  relevanciaActCte: number;
  capitalTrabajoNeto: number;
  solvencia: number;
  endeudamActivo: number;
  endeudamPatrim: number;
  gradoPropiedad: number;
  margenNeto: number;
  roa: number;
  roe: number;
}

export interface EstadosEscenario {
  clave: "optimista" | "moderado" | "pesimista";
  eerr: EERRAnio[];
  esf: ESFAnio[];
  ratios: RatiosAnio[];
}

export interface EstadosFinancierosResult {
  escenarios: EstadosEscenario[];
}

/** Contexto heredado de módulos previos. */
export interface EstadosContext {
  inversionTotal: number;
  activoFijoBruto: number;
  adelantoAlquiler: number;
  deprecAnual: number;
  amortAnual: number;
  supuestos: SupuestosESF;
}
