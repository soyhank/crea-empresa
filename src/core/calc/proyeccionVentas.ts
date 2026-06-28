import { sum } from "../money";
import type {
  MesProyeccion, ProyeccionVentasContext, ProyeccionVentasInput, ProyeccionVentasResult, ResumenAnualVentas,
} from "../schemas/proyeccionVentas";

/**
 * Motor de Proyección de ventas a 36 meses (funciones puras). Reproduce K-KORI:
 * ingresos año 1 = 457,030.70 · IGV a pagar año 1 = 35,145.94 · saldo 148,135.64.
 *
 * Meses 1–3 a demanda base; desde el mes 4 crece de forma compuesta al ritmo
 * mensual (= crecimiento anual / 12).
 */
export function calcularProyeccionVentas(
  input: ProyeccionVentasInput,
  ctx: ProyeccionVentasContext,
): ProyeccionVentasResult {
  const pm = input.pctCrecimientoAnual / 12;
  const meses: MesProyeccion[] = [];

  for (let i = 0; i < 36; i++) {
    const cantidad = i < 3 ? ctx.demandaMesBase : meses[i - 1].cantidad * (1 + pm);
    const ingresos = cantidad * ctx.precioVenta;
    const igvVentas = ingresos * input.igv;
    const cv = cantidad * ctx.cvu;
    const cf = cantidad * ctx.cfu;
    const ct = cv + cf;
    const igvCompras = ct - ct / (1 + input.igv);
    const igvAPagar = igvVentas - igvCompras;
    meses.push({
      mes: i + 1, cantidad, ingresos, igvVentas, cv, cf, ct, igvCompras, igvAPagar,
      saldo: ingresos - ct,
    });
  }

  const anios: ResumenAnualVentas[] = [0, 1, 2].map((a) => {
    const bloque = meses.slice(a * 12, a * 12 + 12);
    const totalIngresos = sum(bloque.map((m) => m.ingresos));
    const totalCT = sum(bloque.map((m) => m.ct));
    return {
      anio: a + 1,
      totalCantidad: sum(bloque.map((m) => m.cantidad)),
      totalIngresos,
      totalCV: sum(bloque.map((m) => m.cv)),
      totalCF: sum(bloque.map((m) => m.cf)),
      totalCT,
      totalIgvVentas: sum(bloque.map((m) => m.igvVentas)),
      totalIgvCompras: sum(bloque.map((m) => m.igvCompras)),
      totalIgvAPagar: sum(bloque.map((m) => m.igvAPagar)),
      saldoOperativo: totalIngresos - totalCT,
    };
  });

  return { meses, anios, pctCrecimientoMensual: pm };
}
