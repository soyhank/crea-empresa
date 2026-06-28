import type { DepreciacionInput } from "@/core/schemas";

export function depreciacionVacia(): DepreciacionInput {
  return { vidasUtiles: {}, pctAmortizacion: 0.1, horizonteAnios: 3 };
}

/** Ejemplo K-KORI: cómputo a 3 años (claves = slug de Inversiones K-KORI). */
export function depreciacionEjemploKkori(): DepreciacionInput {
  return { vidasUtiles: { computadora: 3, impresora: 3 }, pctAmortizacion: 0.1, horizonteAnios: 3 };
}
