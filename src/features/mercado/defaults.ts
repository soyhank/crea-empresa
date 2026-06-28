import type { MercadoOwn } from "@/core/schemas";
import { rowId } from "@/lib/utils";

/** Campos propios de Mercado vacíos (los factores vienen de Encuesta). */
export function mercadoVacio(): MercadoOwn {
  return {
    distritos: [{ id: rowId("dist"), nombre: "", poblacion: 0 }],
    porcentajeEdad: 0,
    porcentajeNSE: 0,
    participacionMercado: 0.1,
    crecimientoPoblacional: 0.02,
  };
}

/** Ejemplo K-KORI (solo campos propios; P3/P6 vienen del ejemplo de Encuesta). */
export function mercadoEjemploKkori(): MercadoOwn {
  return {
    distritos: [
      { id: rowId("dist"), nombre: "Comas", poblacion: 617700 },
      { id: rowId("dist"), nombre: "Los Olivos", poblacion: 387300 },
      { id: rowId("dist"), nombre: "Independencia", poblacion: 250300 },
    ],
    porcentajeEdad: 0.62,
    porcentajeNSE: 0.56,
    participacionMercado: 0.1,
    crecimientoPoblacional: 0.02,
  };
}
