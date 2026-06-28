import { describe, expect, it } from "vitest";
import { derivarEncuesta } from "./encuesta";
import { calcularCPC } from "./mercado";
import { kkoriEncuestaEsperado, kkoriEncuestaInput } from "../fixtures/kkori-encuesta";

describe("derivarEncuesta · caso K-KORI", () => {
  const d = derivarEncuesta(kkoriEncuestaInput);

  it("P3 → factor de Mercado Disponible = 205/384", () => {
    expect(d.factorDisponibilidad).toBeCloseTo(kkoriEncuestaEsperado.factorDisponibilidad, 6);
  });

  it("P6 → factor de Mercado Efectivo = 284/384 (excluye 'Ocasionalmente')", () => {
    expect(d.factorEfectividad).toBeCloseTo(kkoriEncuestaEsperado.factorEfectividad, 6);
  });

  it("P6 → tabla de CPC reproduce 1.877604 (721/384)", () => {
    expect(calcularCPC(d.consumoPerCapita)).toBeCloseTo(kkoriEncuestaEsperado.consumoPerCapita, 6);
  });

  it("P3 y P6 cargadas → listo = true (desbloquea Mercado)", () => {
    expect(d.p3Cargada).toBe(true);
    expect(d.p6Cargada).toBe(true);
    expect(d.listo).toBe(true);
  });

  it("sin frecuencias, no está listo y no bloquea por preguntas descriptivas", () => {
    const vacia = derivarEncuesta({ preguntas: [] });
    expect(vacia.listo).toBe(false);
    expect(vacia.factorDisponibilidad).toBe(0);
  });
});
