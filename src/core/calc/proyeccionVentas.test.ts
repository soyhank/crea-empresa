import { describe, expect, it } from "vitest";
import { calcularProyeccionVentas } from "./proyeccionVentas";
import { kkoriVentasContext, kkoriVentasEsperado, kkoriVentasInput } from "../fixtures/kkori-ventas";

describe("calcularProyeccionVentas · caso K-KORI", () => {
  const r = calcularProyeccionVentas(kkoriVentasInput, kkoriVentasContext);
  const e = kkoriVentasEsperado;
  const [a1, a2, a3] = r.anios;

  it("crecimiento mensual = 0.05/12", () => {
    expect(r.pctCrecimientoMensual).toBeCloseTo(e.pctCrecimientoMensual, 9);
  });

  it("cantidades: mes 1–3 base, mes 4 y mes 12 compuestos", () => {
    expect(r.meses[0].cantidad).toBeCloseTo(kkoriVentasContext.demandaMesBase, 6);
    expect(r.meses[2].cantidad).toBeCloseTo(kkoriVentasContext.demandaMesBase, 6);
    expect(r.meses[3].cantidad).toBeCloseTo(e.mes4, 6);
    expect(r.meses[11].cantidad).toBeCloseTo(e.mes12, 6);
  });

  it("Año 1: cantidad / ingresos / IGV ventas", () => {
    expect(a1.totalCantidad).toBeCloseTo(e.anio1.totalCantidad, 4);
    expect(a1.totalIngresos).toBeCloseTo(e.anio1.totalIngresos, 3);
    expect(a1.totalIgvVentas).toBeCloseTo(e.anio1.totalIgvVentas, 3);
  });

  it("Año 1: CV / CF / CT", () => {
    expect(a1.totalCV).toBeCloseTo(e.anio1.totalCV, 3);
    expect(a1.totalCF).toBeCloseTo(e.anio1.totalCF, 3);
    expect(a1.totalCT).toBeCloseTo(e.anio1.totalCT, 3);
  });

  it("Año 1: IGV compras / IGV a pagar / saldo operativo", () => {
    expect(a1.totalIgvCompras).toBeCloseTo(e.anio1.totalIgvCompras, 3);
    expect(a1.totalIgvAPagar).toBeCloseTo(e.anio1.totalIgvAPagar, 3);
    expect(a1.saldoOperativo).toBeCloseTo(e.anio1.saldoOperativo, 3);
  });

  it("Año 2: mes 1 (continuación), totales y saldo", () => {
    expect(r.meses[12].cantidad).toBeCloseTo(e.anio2.mes1, 6);
    expect(a2.totalCantidad).toBeCloseTo(e.anio2.totalCantidad, 4);
    expect(a2.totalIngresos).toBeCloseTo(e.anio2.totalIngresos, 3);
    expect(a2.totalIgvAPagar).toBeCloseTo(e.anio2.totalIgvAPagar, 3);
    expect(a2.saldoOperativo).toBeCloseTo(e.anio2.saldoOperativo, 3);
  });

  // Año 3 con crecimiento continuo corregido (el Excel tenía un bug en marzo).
  it("Año 3: totales y saldo (lógica continua corregida)", () => {
    expect(a3.totalIngresos).toBeCloseTo(e.anio3.totalIngresos, 3);
    expect(a3.totalIgvAPagar).toBeCloseTo(e.anio3.totalIgvAPagar, 3);
    expect(a3.saldoOperativo).toBeCloseTo(e.anio3.saldoOperativo, 3);
  });
});
