import { describe, expect, it } from "vitest";
import { calcularEstadosFinancieros } from "./estadosFinancieros";
import { calcularFlujoCaja } from "./flujoCaja";
import { kkoriFlujoAnios, kkoriFlujoInput, kkoriInversionInicial } from "../fixtures/kkori-flujo";
import { kkoriEstadosContext, kkoriEstadosEsperado } from "../fixtures/kkori-estados";

const flujo = calcularFlujoCaja(kkoriFlujoInput, kkoriInversionInicial, kkoriFlujoAnios);
const r = calcularEstadosFinancieros(flujo, kkoriEstadosContext);
const moderado = r.escenarios.find((e) => e.clave === "moderado")!;
const e = kkoriEstadosEsperado;

describe("Estado de Resultados · K-KORI moderado", () => {
  it("Año 1 completo", () => {
    const a = moderado.eerr[0];
    expect(a.ventas).toBeCloseTo(e.eerr.anio1.ventas, 1);
    expect(a.costoVentas).toBeCloseTo(e.eerr.anio1.costoVentas, 1);
    expect(a.gananciaBruta).toBeCloseTo(e.eerr.anio1.gananciaBruta, 1);
    expect(a.gastosAdmin).toBeCloseTo(e.eerr.anio1.gastosAdmin, 1);
    expect(a.uaii).toBeCloseTo(e.eerr.anio1.uaii, 1);
    expect(a.ir).toBeCloseTo(e.eerr.anio1.ir, 1);
    expect(a.resultadoEjercicio).toBeCloseTo(e.eerr.anio1.resultadoEjercicio, 1);
  });
  it("Resultado del ejercicio año 2 y 3", () => {
    expect(moderado.eerr[1].resultadoEjercicio).toBeCloseTo(e.eerr.anio2.resultadoEjercicio, 1);
    expect(moderado.eerr[2].resultadoEjercicio).toBeCloseTo(e.eerr.anio3.resultadoEjercicio, 1);
  });
});

describe("Estado de Situación Financiera · K-KORI moderado (cuadra)", () => {
  ([0, 1, 2] as const).forEach((i) => {
    const esf = moderado.esf[i];
    const esp = [e.esf.anio1, e.esf.anio2, e.esf.anio3][i];
    it(`Año ${i + 1}: totales y cuadre`, () => {
      expect(esf.totalActivos).toBeCloseTo(esp.totalActivos, 1);
      expect(esf.totalPasivo).toBeCloseTo(esp.totalPasivo, 1);
      expect(esf.totalPatrimonio).toBeCloseTo(esp.totalPatrimonio, 1);
      expect(esf.totalActivos).toBeCloseTo(esf.totalPasivo + esf.totalPatrimonio, 6);
      expect(esf.cuadra).toBe(true);
    });
  });
});

describe("ESF cuadra en los 3 escenarios × 3 años", () => {
  it("todos los años de todos los escenarios cuadran", () => {
    for (const esc of r.escenarios) {
      for (const esf of esc.esf) {
        expect(Math.abs(esf.totalActivos - (esf.totalPasivo + esf.totalPatrimonio))).toBeLessThan(0.01);
      }
    }
  });
});

describe("Ratios · K-KORI moderado año 1", () => {
  const x = moderado.ratios[0];
  const r1 = e.ratios1;
  it("liquidez", () => {
    expect(x.ratioCorriente).toBeCloseTo(r1.ratioCorriente, 3);
    expect(x.pruebaAcida).toBeCloseTo(r1.pruebaAcida, 3);
    expect(x.ratioTesoreria).toBeCloseTo(r1.ratioTesoreria, 3);
    expect(x.relevanciaActCte).toBeCloseTo(r1.relevanciaActCte, 3);
    expect(x.capitalTrabajoNeto).toBeCloseTo(r1.capitalTrabajoNeto, 1);
  });
  it("solvencia", () => {
    expect(x.solvencia).toBeCloseTo(r1.solvencia, 3);
    expect(x.endeudamActivo).toBeCloseTo(r1.endeudamActivo, 3);
    expect(x.endeudamPatrim).toBeCloseTo(r1.endeudamPatrim, 3);
    expect(x.gradoPropiedad).toBeCloseTo(r1.gradoPropiedad, 3);
  });
  it("rentabilidad", () => {
    expect(x.margenNeto).toBeCloseTo(r1.margenNeto, 3);
    expect(x.roa).toBeCloseTo(r1.roa, 3);
    expect(x.roe).toBeCloseTo(r1.roe, 3);
  });
});
