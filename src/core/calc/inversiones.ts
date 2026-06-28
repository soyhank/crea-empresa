import { sum } from "../money";
import type {
  CapitalTrabajo, InversionesInput, InversionesResult, ItemInversion,
} from "../schemas/inversiones";

/**
 * Motor de cálculo de Inversiones (funciones puras). Reproduce K-KORI:
 * inversión total 49,268.89 · aporte por socio 12,317.22 (4 socios).
 */

export function costoTotalItem(i: ItemInversion): number {
  return i.cantidad * i.precio;
}

export function sumaItems(items: ItemInversion[]): number {
  return sum(items.map(costoTotalItem));
}

export function calcularInversiones(input: InversionesInput, capital: CapitalTrabajo): InversionesResult {
  const af = input.activoFijo;
  const totalPreOperativos = sumaItems(input.preOperativos);
  const totalMaquinaria = sumaItems(af.maquinariaEquipos);
  const totalUtensilios = sumaItems(af.equiposUtensilios);
  const totalOficina = sumaItems(af.equiposOficinaAdmin);
  const totalMuebles = sumaItems(af.mueblesEnseres);
  const totalActivoFijo = totalMaquinaria + totalUtensilios + totalOficina + totalMuebles;

  const totalCapitalTrabajo = (capital.costoVariable || 0) + (capital.costoFijo || 0);
  const inversionTotal = totalPreOperativos + totalActivoFijo + totalCapitalTrabajo;
  const aportePorSocio = input.numSocios > 0 ? inversionTotal / input.numSocios : 0;

  return {
    totalPreOperativos,
    totalMaquinaria,
    totalUtensilios,
    totalOficina,
    totalMuebles,
    totalActivoFijo,
    totalCapitalTrabajo,
    inversionTotal,
    aportePorSocio,
    // Agrupación: "Maquinaria y equipo" reúne maquinaria + utensilios + oficina.
    grupoMaquinariaEquipo: totalMaquinaria + totalUtensilios + totalOficina,
    grupoMueblesEnseres: totalMuebles,
  };
}
