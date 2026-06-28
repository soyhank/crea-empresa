import { describe, expect, it } from "vitest";
import { calcularCPC, calcularMercado, calcularUniverso } from "./mercado";
import { kkoriEsperado, kkoriMercadoInput } from "../fixtures/kkori";

/**
 * TDD: el motor debe reproducir EXACTAMENTE el caso K-KORI del Excel.
 * Tolerancia de 2 decimales (los objetivos están redondeados a céntimo).
 */
describe("calcularMercado · caso K-KORI", () => {
  const r = calcularMercado(kkoriMercadoInput);

  it("Universo = 1,255,300 (suma de distritos)", () => {
    expect(calcularUniverso(kkoriMercadoInput.distritos)).toBe(1255300);
    expect(r.universo).toBe(kkoriEsperado.universo);
  });

  it("Mercado Potencial = 435,840.16 (Universo × 62% × 56%)", () => {
    expect(r.mercadoPotencial).toBeCloseTo(kkoriEsperado.mercadoPotencial, 2);
  });

  it("Mercado Disponible = 232,675.09 (MP × 205/384)", () => {
    expect(r.mercadoDisponible).toBeCloseTo(kkoriEsperado.mercadoDisponible, 2);
  });

  it("Mercado Efectivo = 172,082.62 (MD × 284/384)", () => {
    expect(r.mercadoEfectivo).toBeCloseTo(kkoriEsperado.mercadoEfectivo, 2);
  });

  it("Mercado Objetivo = 17,208.26 (ME × 10%)", () => {
    expect(r.mercadoObjetivo).toBeCloseTo(kkoriEsperado.mercadoObjetivo, 2);
  });

  it("Consumo per cápita = 1.877604 (721/384)", () => {
    expect(r.consumoPerCapita).toBeCloseTo(kkoriEsperado.consumoPerCapita, 6);
  });

  it("Demanda anual = 32,310.30 (MO × CPC)", () => {
    expect(r.demandaAnual).toBeCloseTo(kkoriEsperado.demandaAnual, 2);
  });

  it("Demanda mensual = 2,692.53 (anual ÷ 12)", () => {
    expect(r.demandaPorPeriodo).toBeCloseTo(kkoriEsperado.demandaMensual, 2);
  });
});

describe("helpers de cálculo", () => {
  it("calcularCPC = Σ marca de clase × frecuencia relativa", () => {
    expect(calcularCPC(kkoriMercadoInput.consumoPerCapita)).toBeCloseTo(721 / 384, 9);
  });

  it("calcularCPC evita división por cero", () => {
    expect(calcularCPC([])).toBe(0);
  });

  it("la cadena es monótona decreciente: U ≥ MP ≥ MD ≥ ME ≥ MO", () => {
    const r = calcularMercado(kkoriMercadoInput);
    expect(r.universo).toBeGreaterThanOrEqual(r.mercadoPotencial);
    expect(r.mercadoPotencial).toBeGreaterThanOrEqual(r.mercadoDisponible);
    expect(r.mercadoDisponible).toBeGreaterThanOrEqual(r.mercadoEfectivo);
    expect(r.mercadoEfectivo).toBeGreaterThanOrEqual(r.mercadoObjetivo);
  });
});
