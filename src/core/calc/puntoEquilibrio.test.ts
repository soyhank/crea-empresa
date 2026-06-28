import { describe, expect, it } from "vitest";
import { calcularPuntoEquilibrio } from "./puntoEquilibrio";

/**
 * Reproduce la hoja PUNTO DE EQUILIBRIO del Excel K-KORI:
 *   CF 14,732.390833 · Valor venta 13.925031 · CVU 3.94
 *   → PE 1,475.447646 cajas · S/ 20,545.654558
 */
describe("calcularPuntoEquilibrio · caso K-KORI", () => {
  const r = calcularPuntoEquilibrio({
    precioVenta: 13.925031,
    costoVariableUnitario: 3.94,
    costosFijos: 14732.390833,
  });

  it("PE en unidades = 1,475.447646 cajas", () => {
    expect(r.unidades).toBeCloseTo(1475.447646, 4);
  });

  it("PE en soles = 20,545.654558", () => {
    expect(r.soles).toBeCloseTo(20545.654558, 3);
  });

  it("sin contribución positiva, PE = 0 (evita resultados absurdos)", () => {
    const r0 = calcularPuntoEquilibrio({ precioVenta: 5, costoVariableUnitario: 6, costosFijos: 1000 });
    expect(r0.unidades).toBe(0);
    expect(r0.soles).toBe(0);
  });
});
