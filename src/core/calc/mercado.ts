import { fraccion, product, sum } from "../money";
import type {
  CpcItem,
  FactorEncuesta,
  MercadoInput,
  MercadoResult,
} from "../schemas/mercado";

/**
 * Motor de cálculo del módulo Mercado / Demanda (funciones puras, testeables).
 *
 * Reproduce EXACTAMENTE la cadena del Excel K-KORI conservando plena precisión:
 *   Universo → MP → MD → ME → MO → Demanda
 *
 * Corrección sobre el Excel: los factores se derivan de conteos enteros de la
 * encuesta (fi/total) en vez de porcentajes redondeados, evitando el arrastre
 * de error que en el original desplazaba los resultados.
 */

/** Universo = suma de la población de todos los distritos/zonas. */
export function calcularUniverso(distritos: Array<{ poblacion: number }>): number {
  return sum(distritos.map((d) => d.poblacion));
}

/** Convierte un factor de encuesta {seleccionadas,total} a fracción exacta. */
export function factorAFraccion(factor: FactorEncuesta): number {
  return fraccion(factor.seleccionadas, factor.total);
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

/** Mercado potencial = Universo × producto de los filtros de segmentación. */
export function calcularMercadoPotencial(
  universo: number,
  filtros: Array<{ fraccion: number }>,
): number {
  return universo * product(filtros.map((f) => f.fraccion));
}

/** Cálculo completo del módulo. NO redondea: el redondeo es de presentación. */
export function calcularMercado(input: MercadoInput): MercadoResult {
  const universo = calcularUniverso(input.distritos);

  const fSegment = product(input.filtrosSegmentacion.map((f) => f.fraccion));
  const mercadoPotencial = universo * fSegment;

  const fDisp = factorAFraccion(input.factorDisponibilidad);
  const mercadoDisponible = mercadoPotencial * fDisp;

  const fEfec = factorAFraccion(input.factorEfectividad);
  const mercadoEfectivo = mercadoDisponible * fEfec;

  const mercadoObjetivo = mercadoEfectivo * input.participacionMercado;

  const consumoPerCapita = calcularCPC(input.consumoPerCapita);
  const demandaAnual = mercadoObjetivo * consumoPerCapita;

  const periodos = input.periodosPorAnio || 12;
  const demandaPorPeriodo = demandaAnual / periodos;

  const pasos: MercadoResult["pasos"] = [
    {
      clave: "universo",
      etiqueta: "Universo",
      valor: universo,
      detalle: `Suma de población de ${input.distritos.length} zona(s)`,
    },
    {
      clave: "mercadoPotencial",
      etiqueta: "Mercado potencial (MP)",
      valor: mercadoPotencial,
      detalle: `Universo × ${(fSegment * 100).toFixed(2)}% (segmentación)`,
    },
    {
      clave: "mercadoDisponible",
      etiqueta: "Mercado disponible (MD)",
      valor: mercadoDisponible,
      detalle: `MP × ${(fDisp * 100).toFixed(2)}% (frecuencia de consumo)`,
    },
    {
      clave: "mercadoEfectivo",
      etiqueta: "Mercado efectivo (ME)",
      valor: mercadoEfectivo,
      detalle: `MD × ${(fEfec * 100).toFixed(2)}% (intención de compra)`,
    },
    {
      clave: "mercadoObjetivo",
      etiqueta: "Mercado objetivo (MO)",
      valor: mercadoObjetivo,
      detalle: `ME × ${(input.participacionMercado * 100).toFixed(2)}% (captación)`,
    },
    {
      clave: "consumoPerCapita",
      etiqueta: "Consumo per cápita (CPC)",
      valor: consumoPerCapita,
      detalle: "Σ marca de clase × frecuencia",
    },
    {
      clave: "demandaAnual",
      etiqueta: "Demanda anual",
      valor: demandaAnual,
      detalle: "MO × CPC",
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
