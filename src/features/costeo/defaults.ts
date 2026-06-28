import type { CosteoInput } from "@/core/schemas";
import { kkoriCosteoInput } from "@/core/fixtures/kkori-costeo";
import { rowId } from "@/lib/utils";

export function costeoVacio(): CosteoInput {
  return {
    materiaPrima: [{ id: rowId("mp"), nombre: "", medida: "", precioUnitario: 0, requerimiento: 0 }],
    manoObra: [{ id: rowId("mod"), proceso: "", sueldo: 0, minutos: 0, eficiencia: 0.75 }],
    costosFijos: [{ id: rowId("cf"), concepto: "", monto: 0 }],
    minutosDisponiblesMes: 11589.75,
    margen: 0.3,
    igv: 0.18,
  };
}

export function costeoEjemploKkori(): CosteoInput {
  return JSON.parse(JSON.stringify(kkoriCosteoInput)) as CosteoInput;
}
