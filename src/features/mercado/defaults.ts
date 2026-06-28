import type { MercadoInput } from "@/core/schemas";
import { kkoriMercadoInput } from "@/core/fixtures/kkori";
import { rowId } from "@/lib/utils";

/** Estructura inicial vacía para un módulo Mercado nuevo. */
export function mercadoVacio(): MercadoInput {
  return {
    distritos: [{ id: rowId("dist"), nombre: "", poblacion: 0 }],
    filtrosSegmentacion: [
      { id: rowId("seg"), etiqueta: "Rango de edad objetivo", fraccion: 0 },
      { id: rowId("seg"), etiqueta: "Nivel socioeconómico", fraccion: 0 },
    ],
    factorDisponibilidad: { seleccionadas: 0, total: 0, referencia: "Frecuencia de consumo" },
    factorEfectividad: { seleccionadas: 0, total: 0, referencia: "Intención de compra" },
    participacionMercado: 0.1,
    consumoPerCapita: [{ id: rowId("cpc"), etiqueta: "", marcaClase: 0, fi: 0 }],
    periodosPorAnio: 12,
  };
}

/** Copia profunda del ejemplo K-KORI, con ids frescos. */
export function mercadoEjemploKkori(): MercadoInput {
  return JSON.parse(JSON.stringify(kkoriMercadoInput)) as MercadoInput;
}
