import { describe, expect, it } from "vitest";
import { calcularDepreciacion } from "./depreciacion";
import {
  kkoriActivosDeprec, kkoriDepreciacionEsperado, kkoriGastosAmort,
} from "../fixtures/kkori-depreciacion";

describe("calcularDepreciacion · caso K-KORI", () => {
  const r = calcularDepreciacion(kkoriActivosDeprec, kkoriGastosAmort, 3);
  const e = kkoriDepreciacionEsperado;

  it("Computadoras (6000, vida 3) → 2000 anual / 166.667 mensual", () => {
    const f = r.filasDeprec.find((x) => x.id === "computadoras")!;
    expect(f.deprecAnual).toBeCloseTo(2000, 3);
    expect(f.deprecMensual).toBeCloseTo(166.666667, 4);
  });

  it("Mezcladora (1500, vida 10) → 150 anual / 12.5 mensual", () => {
    const f = r.filasDeprec.find((x) => x.id === "mezcladora")!;
    expect(f.deprecAnual).toBeCloseTo(150, 4);
    expect(f.deprecMensual).toBeCloseTo(12.5, 4);
  });

  it("Total depreciación anual = 3,346.94", () => {
    expect(r.totalDeprecAnual).toBeCloseTo(e.totalDeprecAnual, 2);
  });

  it("Total depreciación mensual = 278.9117 (→ Costos fijos)", () => {
    expect(r.totalDeprecMensual).toBeCloseTo(e.totalDeprecMensual, 4);
  });

  it("Total amortización anual = 566.75 / mensual = 47.229", () => {
    expect(r.totalAmortAnual).toBeCloseTo(e.totalAmortAnual, 2);
    expect(r.totalAmortMensual).toBeCloseTo(e.totalAmortMensual, 4);
  });

  it("Combinado mensual (deprec + amort) = 326.141", () => {
    expect(r.combinadoMensual).toBeCloseTo(e.combinadoMensual, 3);
  });

  it("Depreciación acumulada año 1 = total anual; año 2 = ×2", () => {
    expect(r.acumuladaPorAnio[0].acumulada).toBeCloseTo(e.totalDeprecAnual, 2);
    expect(r.acumuladaPorAnio[1].acumulada).toBeCloseTo(e.totalDeprecAnual * 2, 2);
  });
});
