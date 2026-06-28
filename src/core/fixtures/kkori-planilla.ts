import type { PlanillaInput } from "../schemas/planilla";

/** Caso K-KORI · Planilla (hoja PLANILLA del Excel). */
export const kkoriPlanillaInput: PlanillaInput = {
  trabajadores: [
    { id: "gg", cargo: "Gerente General", baseMensual: 2000, bonificacion: 0, sis: 15, aplicaProvisiones: true },
    { id: "gmkt", cargo: "Gerente de Marketing y Ventas", baseMensual: 1800, bonificacion: 0, sis: 15, aplicaProvisiones: true },
    { id: "gaf", cargo: "Gerente de Administración, Finanzas y RRHH", baseMensual: 1800, bonificacion: 0, sis: 15, aplicaProvisiones: true },
    { id: "gop", cargo: "Gerente de Operaciones", baseMensual: 1800, bonificacion: 0, sis: 15, aplicaProvisiones: true },
    { id: "ejv", cargo: "Ejecutivo de Ventas", baseMensual: 1200, bonificacion: 0, sis: 15, aplicaProvisiones: true },
    { id: "ope", cargo: "Operario de Producción", baseMensual: 1130, bonificacion: 0, sis: 15, aplicaProvisiones: true },
    { id: "cont", cargo: "Contador externo", baseMensual: 300, bonificacion: 0, sis: 0, aplicaProvisiones: false },
  ],
  pctPensiones: 0.13,
  factorGratificacion: 1 / 24,
  factorVacaciones: 1 / 12,
  ctsAplica: false,
};

export const kkoriPlanillaEsperado = {
  totalGastoMensual: 11336.25,
  gerenteGeneral: { remBruta: 2000, pensiones: 260, remNeta: 1740, gasto: 2265 },
  ejecutivo: { pensiones: 156, remNeta: 1044, gasto: 1365 },
  operario: { pensiones: 146.9, remNeta: 983.1, gasto: 1286.25 },
  contador: { gasto: 300 },
};
