import { describe, expect, it } from "vitest";
import { calcularCosteo, calcularMOD, calcularMP } from "./costeo";
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
