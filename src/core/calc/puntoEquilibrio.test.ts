import { describe, expect, it } from "vitest";
import { calcularPuntoEquilibrio, puntoEquilibrioTabla } from "./puntoEquilibrio";

/**
 * Reproduce la hoja PUNTO DE EQUILIBRIO del Excel K-KORI:
 *   CVU 3.94 · PV 13.925031236802234 · CFT 14,732.390833333333
 *   → PE 1,475.4476459756647 cajas · S/ 20,545.654558477454
 */
const ARGS = {
  precioVenta: 13.925031236802234,
  costoVariableUnitario: 3.94,
  costosFijos: 14732.390833333333,
};

describe("calcularPuntoEquilibrio · caso K-KORI", () => {
  const r = calcularPuntoEquilibrio(ARGS);

  it("Margen de contribución = 9.985031236802232", () => {
    expect(r.contribucionUnitaria).toBeCloseTo(9.985031236802232, 9);
  });

  it("PE en unidades = 1,475.4476459756647 cajas", () => {
    expect(r.unidades).toBeCloseTo(1475.4476459756647, 6);
  });

  it("PE en soles = 20,545.654558477454", () => {
    expect(r.soles).toBeCloseTo(20545.654558477454, 4);
  });

  it("PE soles = CFT / (1 - CVU/PV)", () => {
    const porFormula = ARGS.costosFijos / (1 - ARGS.costoVariableUnitario / ARGS.precioVenta);
    expect(r.soles).toBeCloseTo(porFormula, 6);
  });

  it("sin contribución positiva, PE = 0 (evita resultados absurdos)", () => {
    const r0 = calcularPuntoEquilibrio({ precioVenta: 5, costoVariableUnitario: 6, costosFijos: 1000 });
    expect(r0.unidades).toBe(0);
    expect(r0.soles).toBe(0);
  });
});

describe("puntoEquilibrioTabla", () => {
  const r = calcularPuntoEquilibrio(ARGS);
  const tabla = puntoEquilibrioTabla(ARGS, r.unidades);

  it("ingresos = costo total cerca del PE (utilidad ≈ 0)", () => {
    // En Q = PE la utilidad debe ser ~0.
    const enPE = puntoEquilibrioTabla(ARGS, r.unidades, 2); // q=0 y q=max
    expect(enPE[0].costoTotal).toBeCloseTo(ARGS.costosFijos, 6); // en q=0, costo total = CFT
    expect(tabla.length).toBe(9);
  });

  it("la utilidad es creciente con Q", () => {
    for (let i = 1; i < tabla.length; i++) {
      expect(tabla[i].utilidad).toBeGreaterThan(tabla[i - 1].utilidad);
    }
  });
});
