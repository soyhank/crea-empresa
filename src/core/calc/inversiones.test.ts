import { describe, expect, it } from "vitest";
import { calcularInversiones } from "./inversiones";
import { kkoriCapitalTrabajo, kkoriInversionesEsperado, kkoriInversionesInput } from "../fixtures/kkori-inversiones";

describe("calcularInversiones · caso K-KORI", () => {
  const r = calcularInversiones(kkoriInversionesInput, kkoriCapitalTrabajo);
  const e = kkoriInversionesEsperado;

  it("Pre-operativos = 5,767.5", () => expect(r.totalPreOperativos).toBeCloseTo(e.totalPreOperativos, 4));
  it("Maquinaria y equipos = 8,534", () => expect(r.totalMaquinaria).toBeCloseTo(e.totalMaquinaria, 4));
  it("Equipos y utensilios = 480", () => expect(r.totalUtensilios).toBeCloseTo(e.totalUtensilios, 4));
  it("Equipos de oficina = 6,900", () => expect(r.totalOficina).toBeCloseTo(e.totalOficina, 4));
  it("Muebles y enseres = 2,246.4", () => expect(r.totalMuebles).toBeCloseTo(e.totalMuebles, 4));
  it("Activo fijo total = 18,160.4", () => expect(r.totalActivoFijo).toBeCloseTo(e.totalActivoFijo, 4));

  it("Agrupación Maquinaria y equipo = 15,914 · Muebles y enseres = 2,246.4", () => {
    expect(r.grupoMaquinariaEquipo).toBeCloseTo(e.grupoMaquinariaEquipo, 4);
    expect(r.grupoMueblesEnseres).toBeCloseTo(e.grupoMueblesEnseres, 4);
  });

  it("Capital de trabajo (heredado) = 25,340.99", () => expect(r.totalCapitalTrabajo).toBeCloseTo(e.totalCapitalTrabajo, 6));

  it("Inversión total = 49,268.89", () => expect(r.inversionTotal).toBeCloseTo(e.inversionTotal, 6));

  it("Aporte por socio = 12,317.22 (4 socios)", () => expect(r.aportePorSocio).toBeCloseTo(e.aportePorSocio, 6));
});
