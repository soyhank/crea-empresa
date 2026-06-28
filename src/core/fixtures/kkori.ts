import type { MercadoInput } from "../schemas/mercado";

/**
 * Caso de referencia "K-KORI" (bebida) extraído del Excel original.
 * Fuente de los valores de prueba (TDD). Hojas: DISTRITAL, ENCUESTA,
 * PROYECCION DE DEMANDA. Los factores se expresan como fracciones exactas
 * (fi/total) para reproducir el Excel sin arrastre de redondeo.
 */
export const kkoriMercadoInput: MercadoInput = {
  // Hoja DISTRITAL: población por distrito (CPI 2025).
  distritos: [
    { id: "comas", nombre: "Comas", poblacion: 617700 },
    { id: "olivos", nombre: "Los Olivos", poblacion: 387300 },
    { id: "independencia", nombre: "Independencia", poblacion: 250300 },
  ],
  porcentajeEdad: 0.62, // 18–50 años
  porcentajeNSE: 0.56, // NSE B + C
  participacionMercado: 0.1, // captación inicial conservadora
  crecimientoPoblacional: 0.02,
  // MD ← P3 frecuencia de consumo "Semanal": 205 de 384.
  factorDisponibilidad: 205 / 384,
  // ME ← P6 frecuencia de compra (a+b+c): 284 de 384.
  factorEfectividad: 284 / 384,
  // CPC ← P6 con marca de clase (veces/semana) × frecuencia.
  consumoPerCapita: [
    { id: "diaria", etiqueta: "Todos los días", marcaClase: 7, fi: 26 },
    { id: "2a3", etiqueta: "2 a 3 veces por semana", marcaClase: 2.5, fi: 154 },
    { id: "1sem", etiqueta: "1 vez por semana", marcaClase: 1, fi: 104 },
    { id: "ocasional", etiqueta: "Ocasionalmente", marcaClase: 0.5, fi: 100 },
  ],
  periodosPorAnio: 12,
};

/** Valores esperados (Excel K-KORI) para los tests. */
export const kkoriEsperado = {
  universo: 1255300,
  mercadoPotencial: 435840.16,
  mercadoDisponible: 232675.09, // 232675.085417
  mercadoEfectivo: 172082.62, // 172082.615256
  mercadoObjetivo: 17208.26, // 17208.261526
  consumoPerCapita: 1.877604,
  demandaAnual: 32310.3, // 32310.303542
  demandaMensual: 2692.53, // 2692.525295
};
