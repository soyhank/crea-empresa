import { sum } from "../money";
import type { EncuestaInput, PreguntaEncuesta } from "../schemas/encuesta";
import type { CpcItem } from "../schemas/mercado";

/**
 * Derivación del módulo Encuesta hacia Mercado.
 * P3 (frecuencia de consumo) → factor de Mercado Disponible.
 * P6 (frecuencia de compra)  → factor de Mercado Efectivo + tabla de CPC.
 *
 * Un factor = Σ fi de las opciones marcadas "cuentaEnFactor" / Σ fi total.
 */
export interface FactoresEncuesta {
  factorDisponibilidad: number;
  factorEfectividad: number;
  consumoPerCapita: CpcItem[];
  p3Cargada: boolean;
  p6Cargada: boolean;
  /** P3 y P6 tienen frecuencias cargadas → Mercado puede desbloquearse. */
  listo: boolean;
}

function totalFi(p: PreguntaEncuesta): number {
  return sum(p.opciones.map((o) => o.fi));
}

/** Factor = fracción de fi de las opciones que cuentan, sobre el total. */
export function factorPregunta(p: PreguntaEncuesta): number {
  const total = totalFi(p);
  if (!total) return 0;
  const seleccionadas = sum(p.opciones.filter((o) => o.cuentaEnFactor).map((o) => o.fi));
  return seleccionadas / total;
}

/** Tabla de consumo per cápita a partir de las opciones de una pregunta. */
export function cpcDesdePregunta(p: PreguntaEncuesta): CpcItem[] {
  return p.opciones.map((o) => ({
    id: o.id,
    etiqueta: o.etiqueta,
    marcaClase: o.marcaClase ?? 0,
    fi: o.fi,
  }));
}

export function derivarEncuesta(encuesta?: Partial<EncuestaInput> | null): FactoresEncuesta {
  const preguntas = (encuesta?.preguntas ?? []) as PreguntaEncuesta[];
  const pMD = preguntas.find((p) => p.usadaEnCalculo && p.mapeoVariable === "mercado_disponible");
  const pME = preguntas.find((p) => p.usadaEnCalculo && p.mapeoVariable === "mercado_efectivo");

  const p3Cargada = !!pMD && totalFi(pMD) > 0;
  const p6Cargada = !!pME && totalFi(pME) > 0;

  return {
    factorDisponibilidad: pMD ? factorPregunta(pMD) : 0,
    factorEfectividad: pME ? factorPregunta(pME) : 0,
    consumoPerCapita: pME ? cpcDesdePregunta(pME) : [],
    p3Cargada,
    p6Cargada,
    listo: p3Cargada && p6Cargada,
  };
}
