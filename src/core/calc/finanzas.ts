/**
 * Funciones financieras puras (sin librerías): COK, VAN (NPV) y TIR (IRR).
 */

/**
 * Costo de oportunidad del capital.
 *   COK = inflación + premioRiesgo + (inflación × premioRiesgo)
 *   premioRiesgo = tasaMercado + riesgoInversionista
 */
export function calcularCOK(inflacion: number, tasaMercado: number, riesgoInversionista: number): number {
  const premioRiesgo = tasaMercado + riesgoInversionista;
  return inflacion + premioRiesgo + inflacion * premioRiesgo;
}

/** Valor actual neto: Σ flujos[t] / (1+tasa)^t, con t = 0..n. */
export function npv(tasa: number, flujos: number[]): number {
  return flujos.reduce((acc, f, t) => acc + f / (1 + tasa) ** t, 0);
}

/**
 * Tasa interna de retorno por bisección (robusta, sin derivadas).
 * Devuelve NaN si no hay cambio de signo en el rango analizado.
 */
export function irr(flujos: number[], lo = -0.9, hi = 10): number {
  const f = (r: number) => npv(r, flujos);
  let a = lo;
  let b = hi;
  let fa = f(a);
  let fb = f(b);
  // Expande el extremo superior hasta encontrar cambio de signo.
  for (let k = 0; k < 100 && fa * fb > 0; k++) {
    b *= 1.5;
    fb = f(b);
  }
  if (fa * fb > 0) return NaN;
  for (let i = 0; i < 300; i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (Math.abs(fm) < 1e-7) return m;
    if (fa * fm < 0) {
      b = m;
      fb = fm;
    } else {
      a = m;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

/**
 * Payback simple (años para recuperar la inversión con los flujos sin
 * descontar). Devuelve Infinity si nunca se recupera.
 */
export function payback(inversionInicial: number, flujos: number[]): number {
  let acumulado = 0;
  for (let y = 0; y < flujos.length; y++) {
    if (acumulado + flujos[y] >= inversionInicial) {
      return y + (inversionInicial - acumulado) / flujos[y];
    }
    acumulado += flujos[y];
  }
  return Infinity;
}
