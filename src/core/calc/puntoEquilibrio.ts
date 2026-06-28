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
  const soles = unidades * args.precioVenta;
  return { contribucionUnitaria, unidades, soles };
}
