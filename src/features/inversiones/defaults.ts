import type { InversionesInput } from "@/core/schemas";
import { kkoriInversionesInput } from "@/core/fixtures/kkori-inversiones";
import { rowId } from "@/lib/utils";

export function inversionesVacia(): InversionesInput {
  return {
    preOperativos: [{ id: rowId("po"), rubro: "", cantidad: 1, precio: 0 }],
    activoFijo: {
      maquinariaEquipos: [{ id: rowId("mq"), rubro: "", cantidad: 1, precio: 0 }],
      equiposUtensilios: [{ id: rowId("ut"), rubro: "", cantidad: 1, precio: 0 }],
      equiposOficinaAdmin: [{ id: rowId("of"), rubro: "", cantidad: 1, precio: 0 }],
      mueblesEnseres: [{ id: rowId("mu"), rubro: "", cantidad: 1, precio: 0 }],
    },
    numSocios: 1,
    nombresSocios: [],
  };
}

export function inversionesEjemploKkori(): InversionesInput {
  return JSON.parse(JSON.stringify(kkoriInversionesInput)) as InversionesInput;
}
