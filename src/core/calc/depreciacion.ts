import { sum } from "../money";
import type {
  ActivoDepreciable, DepreciacionResult, FilaAmortizacion, FilaDepreciacion, GastoPreOperativo,
} from "../schemas/depreciacion";

/**
 * Motor de cálculo de Depreciación / Amortización (línea recta, funciones puras).
 * Reproduce K-KORI: depreciación 278.9117/mes · amortización 47.229/mes ·
 * combinado 326.141/mes (alimenta los costos fijos de Costeo).
 */

export function filaDepreciacion(a: ActivoDepreciable): FilaDepreciacion {
  const pctAnual = a.vidaUtil > 0 ? 1 / a.vidaUtil : 0;
  const deprecAnual = a.monto * pctAnual;
  return {
    id: a.id,
    nombre: a.nombre,
    grupo: a.grupo,
    monto: a.monto,
    vidaUtil: a.vidaUtil,
    pctAnual,
    deprecAnual,
    deprecMensual: deprecAnual / 12,
  };
}

export function filaAmortizacion(g: GastoPreOperativo): FilaAmortizacion {
  const amortAnual = g.monto * g.pctAmortizacion;
  return {
    id: g.id,
    nombre: g.nombre,
    monto: g.monto,
    pctAmortizacion: g.pctAmortizacion,
    amortAnual,
    amortMensual: amortAnual / 12,
  };
}

export function calcularDepreciacion(
  activos: ActivoDepreciable[],
  gastos: GastoPreOperativo[],
  horizonteAnios = 3,
): DepreciacionResult {
  const filasDeprec = activos.map(filaDepreciacion);
  const filasAmort = gastos.map(filaAmortizacion);

  const totalDeprecAnual = sum(filasDeprec.map((f) => f.deprecAnual));
  const totalDeprecMensual = sum(filasDeprec.map((f) => f.deprecMensual));
  const totalAmortAnual = sum(filasAmort.map((f) => f.amortAnual));
  const totalAmortMensual = sum(filasAmort.map((f) => f.amortMensual));

  // Subtotales por grupo.
  const grupos = new Map<string, { anual: number; mensual: number }>();
  for (const f of filasDeprec) {
    const g = grupos.get(f.grupo) ?? { anual: 0, mensual: 0 };
    g.anual += f.deprecAnual;
    g.mensual += f.deprecMensual;
    grupos.set(f.grupo, g);
  }
  const porGrupo = Array.from(grupos.entries()).map(([grupo, v]) => ({ grupo, ...v }));

  // Tabla acumulada (depreciación total por año).
  const acumuladaPorAnio = Array.from({ length: horizonteAnios }, (_, i) => {
    const anio = i + 1;
    const acumulada = totalDeprecAnual * anio;
    const baseTotal = sum(activos.map((a) => a.monto));
    return { anio, depreciacion: totalDeprecAnual, acumulada, valorResidual: baseTotal - acumulada };
  });

  return {
    filasDeprec,
    filasAmort,
    porGrupo,
    totalDeprecAnual,
    totalDeprecMensual,
    totalAmortAnual,
    totalAmortMensual,
    combinadoMensual: totalDeprecMensual + totalAmortMensual,
    acumuladaPorAnio,
  };
}
