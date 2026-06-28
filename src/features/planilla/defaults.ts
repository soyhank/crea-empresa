import type { PlanillaInput } from "@/core/schemas";
import { kkoriPlanillaInput } from "@/core/fixtures/kkori-planilla";
import { rowId } from "@/lib/utils";

export function planillaVacia(): PlanillaInput {
  return {
    trabajadores: [{ id: rowId("tr"), cargo: "", baseMensual: 0, bonificacion: 0, sis: 15, aplicaProvisiones: true }],
    pctPensiones: 0.13,
    factorGratificacion: 1 / 24,
    factorVacaciones: 1 / 12,
    ctsAplica: false,
  };
}

export function planillaEjemploKkori(): PlanillaInput {
  return JSON.parse(JSON.stringify(kkoriPlanillaInput)) as PlanillaInput;
}
