import type { MercadoInput } from "@/core/schemas";
import { kkoriMercadoInput } from "@/core/fixtures/kkori";
import { rowId } from "@/lib/utils";

/** Estructura inicial vacía para un módulo Mercado nuevo. */
export function mercadoVacio(): MercadoInput {
  return {
    distritos: [{ id: rowId("dist"), nombre: "", poblacion: 0 }],
    porcentajeEdad: 0,
    porcentajeNSE: 0,
    participacionMercado: 0.1,
    crecimientoPoblacional: 0.02,
    factorDisponibilidad: 0,
    factorEfectividad: 0,
    consumoPerCapita: [{ id: rowId("cpc"), etiqueta: "", marcaClase: 0, fi: 0 }],
    periodosPorAnio: 12,
  };
}

/** Copia profunda del ejemplo K-KORI, con ids frescos. */
export function mercadoEjemploKkori(): MercadoInput {
  return JSON.parse(JSON.stringify(kkoriMercadoInput)) as MercadoInput;
}
