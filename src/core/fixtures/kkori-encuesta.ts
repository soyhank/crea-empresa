import type { EncuestaInput } from "../schemas/encuesta";

/**
 * Caso K-KORI · Encuesta (hoja ENCUESTA del Excel).
 * Solo P3 y P6 alimentan cálculo; el resto es descriptivo (informe).
 */
export const kkoriEncuestaInput: EncuestaInput = {
  tamanoMuestra: 384,
  preguntas: [
    {
      id: "p3",
      orden: 3,
      texto: "¿Cuál es tu frecuencia de consumo de bebidas fuera de casa?",
      usadaEnCalculo: true,
      mapeoVariable: "mercado_disponible",
      opciones: [
        { id: "p3a", etiqueta: "Diaria", fi: 93, cuentaEnFactor: false },
        { id: "p3b", etiqueta: "Semanal", fi: 205, cuentaEnFactor: true },
        { id: "p3c", etiqueta: "Mensual", fi: 86, cuentaEnFactor: false },
      ],
    },
    {
      id: "p6",
      orden: 6,
      texto: "¿Con qué frecuencia comprarías una bebida como K-KORI?",
      usadaEnCalculo: true,
      mapeoVariable: "mercado_efectivo",
      opciones: [
        { id: "p6a", etiqueta: "Todos los días", fi: 26, marcaClase: 7, cuentaEnFactor: true },
        { id: "p6b", etiqueta: "2 a 3 veces por semana", fi: 154, marcaClase: 2.5, cuentaEnFactor: true },
        { id: "p6c", etiqueta: "1 vez por semana", fi: 104, marcaClase: 1, cuentaEnFactor: true },
        { id: "p6d", etiqueta: "Ocasionalmente", fi: 100, marcaClase: 0.5, cuentaEnFactor: false },
      ],
    },
    {
      id: "p4",
      orden: 4,
      texto: "¿Qué te parece combinar tendencias coreanas con sabores peruanos?",
      usadaEnCalculo: false,
      opciones: [
        { id: "p4a", etiqueta: "Muy interesante", fi: 216, cuentaEnFactor: false },
        { id: "p4b", etiqueta: "Interesante", fi: 133, cuentaEnFactor: false },
        { id: "p4c", etiqueta: "Normal", fi: 21, cuentaEnFactor: false },
        { id: "p4d", etiqueta: "Poco interesante", fi: 14, cuentaEnFactor: false },
      ],
    },
  ],
};

export const kkoriEncuestaEsperado = {
  factorDisponibilidad: 205 / 384, // 0.533854
  factorEfectividad: 284 / 384, // 0.739583
  consumoPerCapita: 721 / 384, // 1.877604
};
