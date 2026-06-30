import type { EncuestaInput } from "@/core/schemas";
import { kkoriEncuestaInput } from "@/core/fixtures/kkori-encuesta";
import { rowId } from "@/lib/utils";

/**
 * Encuesta nueva: trae las 2 preguntas de cálculo (P3 y P6) ESTANDARIZADAS.
 *
 * Opciones, marca de clase y "cuenta" (qué respuestas forman parte del mercado)
 * vienen predefinidas por metodología y NO se muestran al alumno. El alumno solo
 * ingresa el N° de personas (fi) que marcó cada opción; el sistema deriva %,
 * factores de mercado y consumo per cápita.
 */
export function encuestaVacia(): EncuestaInput {
  return {
    tamanoMuestra: undefined,
    preguntas: [
      {
        id: rowId("p"),
        orden: 1,
        texto: "¿Con qué frecuencia consumes este tipo de producto?",
        usadaEnCalculo: true,
        mapeoVariable: "mercado_disponible",
        opciones: [
          { id: rowId("o"), etiqueta: "Diariamente", fi: 0, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "Semanalmente", fi: 0, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "Mensualmente", fi: 0, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "Rara vez o nunca", fi: 0, cuentaEnFactor: false },
        ],
      },
      {
        id: rowId("p"),
        orden: 2,
        texto: "¿Con qué frecuencia comprarías el producto ofrecido?",
        usadaEnCalculo: true,
        mapeoVariable: "mercado_efectivo",
        opciones: [
          { id: rowId("o"), etiqueta: "Todos los días", fi: 0, marcaClase: 7, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "2 o 3 veces por semana", fi: 0, marcaClase: 2.5, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "1 vez por semana", fi: 0, marcaClase: 1, cuentaEnFactor: true },
          { id: rowId("o"), etiqueta: "Ocasionalmente", fi: 0, marcaClase: 0.5, cuentaEnFactor: false },
        ],
      },
    ],
  };
}

export function encuestaEjemploKkori(): EncuestaInput {
  return JSON.parse(JSON.stringify(kkoriEncuestaInput)) as EncuestaInput;
}
