/**
 * Punto de equilibrio (módulo 7, también usado por el Tablero).
 *   PE unidades = Costos Fijos / (Precio − Costo Variable Unitario)
 *   PE soles    = PE unidades × Precio   ( = CF / (1 − CVU/Precio) )
 */

export interface PuntoEquilibrioArgs {
  /** Precio de venta (valor de venta, sin IGV). */
  precioVenta: number;
  /** Costo variable unitario. */
  costoVariableUnitario: number;
  /** Costos fijos del periodo. */
  costosFijos: number;
}

export interface PuntoEquilibrioResult {
  contribucionUnitaria: number;
  unidades: number;
  soles: number;
}

export function calcularPuntoEquilibrio(args: PuntoEquilibrioArgs): PuntoEquilibrioResult {
  const contribucionUnitaria = args.precioVenta - args.costoVariableUnitario;
  const unidades = contribucionUnitaria > 0 ? args.costosFijos / contribucionUnitaria : 0;
  // Equivalente a cft / (1 - cvu/pv); se mantiene como unidades × precio.
  const soles = unidades * args.precioVenta;
  return { contribucionUnitaria, unidades, soles };
}

export interface PuntoSensibilidad {
  q: number;
  ingresos: number;
  costoTotal: number;
  costoVariable: number;
  utilidad: number;
}

/** Tabla de sensibilidad para el gráfico de cruce (ingresos vs costo total). */
export function puntoEquilibrioTabla(args: PuntoEquilibrioArgs, peUnidades: number, puntos = 9): PuntoSensibilidad[] {
  const max = Math.max(Math.ceil(peUnidades * 2), 200);
  const paso = max / (puntos - 1);
  return Array.from({ length: puntos }, (_, i) => {
    const q = Math.round(paso * i);
    const ingresos = q * args.precioVenta;
    const costoVariable = q * args.costoVariableUnitario;
    const costoTotal = args.costosFijos + costoVariable;
    return { q, ingresos, costoTotal, costoVariable, utilidad: ingresos - costoTotal };
  });
}
