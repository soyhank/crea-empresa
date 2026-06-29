import { describe, expect, it } from "vitest";
import { calcularCOK, irr, npv } from "./finanzas";
import { calcularFlujoCaja } from "./flujoCaja";
import {
  kkoriFlujoAnios, kkoriFlujoEsperado, kkoriFlujoInput, kkoriInversionInicial,
} from "../fixtures/kkori-flujo";

describe("finanzas · COK / NPV / IRR", () => {
  it("calcularCOK(0.03, 0.12, 0.12) = 0.2772", () => {
    expect(calcularCOK(0.03, 0.12, 0.12)).toBeCloseTo(0.2772, 6);
  });
  it("calcularCOK optimista = 0.271 · pesimista = 0.2792", () => {
    expect(calcularCOK(0.025, 0.16, 0.08)).toBeCloseTo(0.271, 6);
    expect(calcularCOK(0.04, 0.08, 0.15)).toBeCloseTo(0.2792, 6);
  });
  it("npv(0.271, [...]) ≈ 95,023.07", () => {
    expect(npv(0.271, [-49268.89, 73594.02, 77280.34, 79153.84])).toBeCloseTo(95023.07, 0);
  });
  it("irr de los 3 escenarios", () => {
    expect(irr([-49268.89, 73594.02, 77280.34, 79153.84])).toBeCloseTo(1.4175, 4);
    expect(irr([-49268.89, 72381.27, 76006.85, 77849.47])).toBeCloseTo(1.3908, 4);
    expect(irr([-49268.89, 69955.78, 73459.86, 75240.75])).toBeCloseTo(1.3373, 4);
  });
});

describe("calcularFlujoCaja · caso K-KORI", () => {
  const r = calcularFlujoCaja(kkoriFlujoInput, kkoriInversionInicial, kkoriFlujoAnios);
  const e = kkoriFlujoEsperado;
  const esc = (k: "optimista" | "moderado" | "pesimista") => r.escenarios.find((x) => x.clave === k)!;

  (["optimista", "moderado", "pesimista"] as const).forEach((k) => {
    it(`${k}: COK ${e.cok[k]}`, () => {
      expect(esc(k).cok).toBeCloseTo(e.cok[k], 6);
    });
    it(`${k}: flujo económico año 1 = ${e.flujoEco1[k]}`, () => {
      expect(esc(k).anios[0].flujoEconomico).toBeCloseTo(e.flujoEco1[k], 3);
    });
    it(`${k}: VAN ≈ ${e.vane[k]}`, () => {
      expect(esc(k).vane).toBeCloseTo(e.vane[k], 1);
    });
    it(`${k}: TIR ≈ ${e.tire[k]}`, () => {
      expect(esc(k).tire).toBeCloseTo(e.tire[k], 4);
    });
  });

  it("inversión inicial = año 0 negativo", () => {
    expect(esc("moderado").flujos[0]).toBeCloseTo(-kkoriInversionInicial, 6);
  });

  it("Payback < 1 año (recupera en el año 1)", () => {
    expect(esc("optimista").payback).toBeGreaterThan(0);
    expect(esc("optimista").payback).toBeLessThan(1);
  });
});
