import { describe, expect, it } from "vitest";
import { calcularPlanilla } from "./planilla";
import { kkoriPlanillaEsperado, kkoriPlanillaInput } from "../fixtures/kkori-planilla";

describe("calcularPlanilla · caso K-KORI", () => {
  const r = calcularPlanilla(kkoriPlanillaInput);
  const byId = (id: string) => r.trabajadores.find((t) => t.id === id)!;

  it("Gerente General: bruta 2000, pensiones 260, neta 1740, gasto 2265", () => {
    const t = byId("gg");
    expect(t.remBruta).toBeCloseTo(2000, 2);
    expect(t.pensiones).toBeCloseTo(260, 2);
    expect(t.remNeta).toBeCloseTo(1740, 2);
    expect(t.gastoMensual).toBeCloseTo(2265, 2);
  });

  it("Gerentes de 1800 → gasto 2040", () => {
    expect(byId("gmkt").gastoMensual).toBeCloseTo(2040, 2);
    expect(byId("gaf").gastoMensual).toBeCloseTo(2040, 2);
    expect(byId("gop").gastoMensual).toBeCloseTo(2040, 2);
  });

  it("Ejecutivo de Ventas: pensiones 156, neta 1044, gasto 1365", () => {
    const t = byId("ejv");
    expect(t.pensiones).toBeCloseTo(kkoriPlanillaEsperado.ejecutivo.pensiones, 2);
    expect(t.remNeta).toBeCloseTo(kkoriPlanillaEsperado.ejecutivo.remNeta, 2);
    expect(t.gastoMensual).toBeCloseTo(kkoriPlanillaEsperado.ejecutivo.gasto, 2);
  });

  it("Operario: pensiones 146.9, neta 983.1, gasto 1286.25", () => {
    const t = byId("ope");
    expect(t.pensiones).toBeCloseTo(kkoriPlanillaEsperado.operario.pensiones, 2);
    expect(t.remNeta).toBeCloseTo(kkoriPlanillaEsperado.operario.remNeta, 2);
    expect(t.gastoMensual).toBeCloseTo(kkoriPlanillaEsperado.operario.gasto, 2);
  });

  it("Contador externo (honorarios): gasto = base 300, sin pensiones", () => {
    const t = byId("cont");
    expect(t.pensiones).toBe(0);
    expect(t.gastoMensual).toBeCloseTo(300, 2);
  });

  it("TOTAL planilla gasto mensual = 11,336.25", () => {
    expect(r.totalGastoMensual).toBeCloseTo(kkoriPlanillaEsperado.totalGastoMensual, 2);
    expect(r.nTrabajadores).toBe(7);
  });
});
