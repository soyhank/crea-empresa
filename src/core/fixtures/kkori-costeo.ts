import type { CosteoInput } from "../schemas/costeo";

/**
 * Caso K-KORI · Costeo (hojas COSTO UNITARIO MP, COSTOS FIJOS Y VARIABLES,
 * COSTO UNITARIO CON Y SIN TERCERO del Excel).
 */
export const kkoriCosteoInput: CosteoInput = {
  materiaPrima: [
    { id: "extracto", nombre: "Extracto natural de fruta", medida: "kg", precioUnitario: 8, requerimiento: 0.3 },
    { id: "azucar", nombre: "Azúcar", medida: "kg", precioUnitario: 2.5, requerimiento: 0.2 },
    { id: "acido", nombre: "Ácido cítrico", medida: "kg", precioUnitario: 8, requerimiento: 0.02 },
    { id: "saborizante", nombre: "Saborizante natural", medida: "kg", precioUnitario: 8, requerimiento: 0.01 },
    { id: "colorante", nombre: "Colorante natural", medida: "kg", precioUnitario: 8, requerimiento: 0.01 },
    { id: "sachet", nombre: "Sachet trilaminado", medida: "unid", precioUnitario: 0.2, requerimiento: 1 },
    { id: "vaso", nombre: "Vaso plástico 500 ml", medida: "unid", precioUnitario: 0.3, requerimiento: 1 },
    { id: "pipote", nombre: "Pipote", medida: "unid", precioUnitario: 0.1, requerimiento: 1 },
    { id: "hielo", nombre: "Hielo", medida: "unid", precioUnitario: 0.05, requerimiento: 1 },
    { id: "etiqueta", nombre: "Etiqueta", medida: "unid", precioUnitario: 0.05, requerimiento: 1 },
    { id: "caja", nombre: "Caja de cartón", medida: "unid", precioUnitario: 0.2, requerimiento: 0.1 },
  ],
  manoObra: [
    { id: "elab", proceso: "Elaboración y preparación", sueldo: 1130, minutos: 4, eficiencia: 0.75 },
    { id: "mezcla", proceso: "Mezclado y formulación", sueldo: 1130, minutos: 3, eficiencia: 0.75 },
    { id: "envase", proceso: "Envasado y sellado", sueldo: 1130, minutos: 2, eficiencia: 0.75 },
    { id: "etiquetado", proceso: "Etiquetado y control", sueldo: 1130, minutos: 1, eficiencia: 0.75 },
  ],
  costosFijos: [
    { id: "sueldos", concepto: "Sueldos y salarios", monto: 11336.25 },
    { id: "luz", concepto: "Luz", monto: 220 },
    { id: "agua", concepto: "Agua", monto: 120 },
    { id: "telefono", concepto: "Teléfono – Internet – cable", monto: 130 },
    { id: "alquiler", concepto: "Alquiler de local", monto: 2300 },
    { id: "marketing", concepto: "Marketing", monto: 300 },
    { id: "amortizacion", concepto: "Amortización", monto: 47.229167 },
    { id: "depreciacion", concepto: "Depreciación", monto: 278.911667 },
  ],
  minutosDisponiblesMes: 11589.75,
  margen: 0.3,
  igv: 0.18,
};

/** Demanda mensual de Mercado usada por el Excel para el CFU. */
export const kkoriDemandaMensual = 2692.537812;

export const kkoriCosteoEsperado = {
  mpUnitario: 3.94,
  mod: 1.3, // 1.299999
  costoVariableUnitario: 5.24, // 5.239999
  costosFijosMensuales: 14732.390833,
  costoFijoUnitario: 5.471563,
  costoTotalUnitario: 10.711562,
  margenValor: 3.213469,
  valorVenta: 13.925031,
  igvValor: 2.506506,
  precioVenta: 16.431537,
};
