import type { EncuestaInput } from "@/core/schemas";
import { kkoriEncuestaInput } from "@/core/fixtures/kkori-encuesta";
import { rowId } from "@/lib/utils";

/** Encuesta nueva: ya trae las 2 preguntas de cálculo (P3 y P6) en blanco. */
export function encuestaVacia(): EncuestaInput {
  return {
    tamanoMuestra: undefined,
    preguntas: [
      {
        id: rowId("p"),
        orden: 1,
        texto: "Frecuencia de consumo (P3)",
        usadaEnCalculo: true,
        mapeoVariable: "mercado_disponible",
        opciones: [
          { id: rowId("o"), etiqueta: "Semanal", fi: 0, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "Otra", fi: 0, cuentaEnFactor: false },
        ],
      },
      {
        id: rowId("p"),
        orden: 2,
        texto: "Frecuencia de compra (P6)",
        usadaEnCalculo: true,
        mapeoVariable: "mercado_efectivo",
        opciones: [
          { id: rowId("o"), etiqueta: "Frecuente", fi: 0, marcaClase: 1, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "Ocasional", fi: 0, marcaClase: 0.5, cuentaEnFactor: false },
        ],
      },
    ],
  };
}

export function encuestaEjemploKkori(): EncuestaInput {
  return JSON.parse(JSON.stringify(kkoriEncuestaInput)) as EncuestaInput;
}
