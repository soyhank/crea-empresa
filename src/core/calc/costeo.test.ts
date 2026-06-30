import { describe, expect, it } from "vitest";
import { calcularCosteo, calcularMOD, calcularMP, totalInsumo } from "./costeo";
import { kkoriCosteoEsperado, kkoriCosteoInput, kkoriDemandaMensual } from "../fixtures/kkori-costeo";

describe("calcularCosteo · caso K-KORI", () => {
  const r = calcularCosteo(kkoriCosteoInput, { demandaMensual: kkoriDemandaMensual });

  it("Materia prima unitaria = 3.94", () => {
    expect(calcularMP(kkoriCosteoInput.materiaPrima)).toBeCloseTo(3.94, 5);
    expect(r.mpUnitario).toBeCloseTo(kkoriCosteoEsperado.mpUnitario, 5);
  });

  it("Mano de obra directa = 1.30", () => {
    expect(calcularMOD(kkoriCosteoInput.manoObra, 11589.75)).toBeCloseTo(1.3, 3);
    expect(r.mod).toBeCloseTo(kkoriCosteoEsperado.mod, 3);
  });

  it("Costo variable unitario = 5.24 (MP + MOD)", () => {
    expect(r.costoVariableUnitario).toBeCloseTo(kkoriCosteoEsperado.costoVariableUnitario, 3);
  });

  it("Costos fijos mensuales = 14,732.39", () => {
    expect(r.costosFijosMensuales).toBeCloseTo(kkoriCosteoEsperado.costosFijosMensuales, 4);
  });

  it("Costo fijo unitario = 5.471563 (CF / demanda mes)", () => {
    expect(r.costoFijoUnitario).toBeCloseTo(kkoriCosteoEsperado.costoFijoUnitario, 4);
  });

  it("Costo total unitario = 10.711562", () => {
    expect(r.costoTotalUnitario).toBeCloseTo(kkoriCosteoEsperado.costoTotalUnitario, 3);
  });

  it("Margen (30%) = 3.213469", () => {
    expect(r.margenValor).toBeCloseTo(kkoriCosteoEsperado.margenValor, 3);
  });

  it("Valor de venta = 13.925031", () => {
    expect(r.valorVenta).toBeCloseTo(kkoriCosteoEsperado.valorVenta, 3);
  });

  it("IGV (18%) = 2.506506", () => {
    expect(r.igvValor).toBeCloseTo(kkoriCosteoEsperado.igvValor, 3);
  });

  it("Precio de venta (con IGV) = 16.431537", () => {
    expect(r.precioVenta).toBeCloseTo(kkoriCosteoEsperado.precioVenta, 3);
  });

  it("CFU es 0 si no hay demanda (evita división por cero)", () => {
    const r0 = calcularCosteo(kkoriCosteoInput, { demandaMensual: 0 });
    expect(r0.costoFijoUnitario).toBe(0);
  });
});

describe("totalInsumo · conversión de unidades", () => {
  it("requerimiento en gramos con precio por kg se convierte", () => {
    // S/2.5 por kg, 200 g → 0.2 kg → S/0.50
    expect(totalInsumo({ id: "a", nombre: "Azúcar", medida: "kg", unidadRequerimiento: "g", precioUnitario: 2.5, requerimiento: 200 })).toBeCloseTo(0.5, 6);
  });

  it("requerimiento en ml con precio por L se convierte", () => {
    // S/8 por L, 30 ml → 0.03 L → S/0.24
    expect(totalInsumo({ id: "b", nombre: "Esencia", medida: "L", unidadRequerimiento: "ml", precioUnitario: 8, requerimiento: 30 })).toBeCloseTo(0.24, 6);
  });

  it("sin unidadRequerimiento se comporta como antes (factor 1)", () => {
    // legado K-KORI: 0.02 kg × S/8 = 0.16
    expect(totalInsumo({ id: "c", nombre: "Ácido", medida: "kg", precioUnitario: 8, requerimiento: 0.02 })).toBeCloseTo(0.16, 6);
  });

  it("misma unidad de compra y requerimiento → sin cambio", () => {
    expect(totalInsumo({ id: "d", nombre: "Sachet", medida: "unidad", unidadRequerimiento: "unidad", precioUnitario: 0.2, requerimiento: 1 })).toBeCloseTo(0.2, 6);
  });
});
