import { sum } from "../money";
import type { CpcItem, MercadoInput, MercadoResult } from "../schemas/mercado";

/**
 * Motor de cálculo del módulo Mercado / Demanda (funciones puras, testeables).
 *
 * Reproduce EXACTAMENTE la cadena del Excel K-KORI conservando plena precisión:
 *   Universo → MP → MD → ME → MO → Demanda
 */

/** Universo = suma de la población de todos los distritos/zonas. */
export function calcularUniverso(distritos: Array<{ poblacion: number }>): number {
  return sum(distritos.map((d) => d.poblacion));
}

/**
 * Consumo per cápita = Σ (marca de clase × frecuencia relativa).
 * frecuencia relativa = fi / Σfi. Mantiene precisión completa.
 */
export function calcularCPC(items: CpcItem[]): number {
  const total = sum(items.map((i) => i.fi));
  if (!total) return 0;
  return sum(items.map((i) => i.marcaClase * (i.fi / total)));
}

/** Cálculo completo del módulo. NO redondea: el redondeo es de presentación. */
export function calcularMercado(input: MercadoInput): MercadoResult {
  const universo = calcularUniverso(input.distritos);

  const mercadoPotencial = universo * input.porcentajeEdad * input.porcentajeNSE;
  const mercadoDisponible = mercadoPotencial * input.factorDisponibilidad;
  const mercadoEfectivo = mercadoDisponible * input.factorEfectividad;
  const mercadoObjetivo = mercadoEfectivo * input.participacionMercado;

  const consumoPerCapita = calcularCPC(input.consumoPerCapita);
  const demandaAnual = mercadoObjetivo * consumoPerCapita;

  const periodos = input.periodosPorAnio || 12;
  const demandaPorPeriodo = demandaAnual / periodos;

  const pct = (f: number) => `${(f * 100).toFixed(2)}%`;
  const pasos: MercadoResult["pasos"] = [
    {
      clave: "universo",
      etiqueta: "Universo",
      valor: universo,
      detalle: `Suma de población de ${input.distritos.length} zona(s)`,
    },
    {
      clave: "mercadoPotencial",
      etiqueta: "Mercado potencial",
      valor: mercadoPotencial,
      detalle: `Universo × ${pct(input.porcentajeEdad)} × ${pct(input.porcentajeNSE)}`,
    },
    {
      clave: "mercadoDisponible",
      etiqueta: "Mercado disponible",
      valor: mercadoDisponible,
      detalle: `× ${pct(input.factorDisponibilidad)} (frecuencia de consumo)`,
    },
    {
      clave: "mercadoEfectivo",
      etiqueta: "Mercado efectivo",
      valor: mercadoEfectivo,
      detalle: `× ${pct(input.factorEfectividad)} (intención de compra)`,
    },
    {
      clave: "mercadoObjetivo",
      etiqueta: "Mercado objetivo",
      valor: mercadoObjetivo,
      detalle: `× ${pct(input.participacionMercado)} (captación)`,
    },
    {
      clave: "consumoPerCapita",
      etiqueta: "Consumo per cápita",
      valor: consumoPerCapita,
      detalle: "Σ marca de clase × frecuencia",
    },
    {
      clave: "demandaAnual",
      etiqueta: "Demanda anual",
      valor: demandaAnual,
      detalle: "Mercado objetivo × CPC",
    },
    {
      clave: "demandaPorPeriodo",
      etiqueta: `Demanda por periodo (1/${periodos})`,
      valor: demandaPorPeriodo,
      detalle: `Demanda anual ÷ ${periodos}`,
    },
  ];

  return {
    universo,
    mercadoPotencial,
    mercadoDisponible,
    mercadoEfectivo,
    mercadoObjetivo,
    consumoPerCapita,
    demandaAnual,
    demandaPorPeriodo,
    pasos,
  };
}
