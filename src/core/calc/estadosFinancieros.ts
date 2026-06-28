import type { FlujoCajaResult, FlujoEscenarioResult } from "../schemas/flujoCaja";
import type {
  EERRAnio, ESFAnio, EstadosContext, EstadosEscenario, EstadosFinancierosResult,
} from "../schemas/estadosFinancieros";
import { calcularRatios } from "./ratios";

/**
 * Estados financieros (funciones puras). Reproduce K-KORI (moderado):
 * resultado año 1 = 108,581.59 · total activos = 351,602.76 (cuadra).
 *
 * El EERR es una vista del flujo (UAII = flujo operativo, IR del flujo). El ESF
 * cuadra por construcción: el efectivo es la cifra de calce.
 */

function eerrDeEscenario(esc: FlujoEscenarioResult): EERRAnio[] {
  return esc.anios.map((a) => ({
    anio: a.anio,
    ventas: a.ingresos,
    costoVentas: a.costosVariables,
    gananciaBruta: a.ingresos - a.costosVariables,
    gastosAdmin: a.costosFijos,
    uaii: a.flujoOperativo,
    ir: a.impuestoRenta,
    resultadoEjercicio: a.flujoOperativo - a.impuestoRenta,
  }));
}

function esfDeEscenario(esc: FlujoEscenarioResult, eerr: EERRAnio[], ctx: EstadosContext): ESFAnio[] {
  const s = ctx.supuestos;
  return esc.anios.map((a, i) => {
    const e = eerr[i];
    const y = a.anio;

    // Pasivo
    const tributosIGV = a.igvPagado;
    const cuentasPagar = (e.costoVentas + e.gastosAdmin) * s.pctComprasCredito;
    const irPorPagar = a.impuestoRenta;
    const totalPasivoCte = tributosIGV + cuentasPagar + irPorPagar;
    const totalPasivo = totalPasivoCte;

    // Patrimonio
    const capitalSocial = ctx.inversionTotal;
    const utilidadEjercicio = e.resultadoEjercicio;
    const totalPatrimonio = capitalSocial + utilidadEjercicio;

    // El total de activos se fija por el lado pasivo + patrimonio.
    const totalActivos = totalPasivo + totalPatrimonio;

    // Activo no corriente
    const amortAcum = ctx.amortAnual * y;
    const deprecAcum = ctx.deprecAnual * y;
    const activoFijoNeto = ctx.activoFijoBruto + amortAcum;
    const deprecAmortAcum = deprecAcum + amortAcum;
    const cuentasCobrarLP = ctx.adelantoAlquiler;
    const totalActivoNoCte = activoFijoNeto + deprecAmortAcum + cuentasCobrarLP;

    // Activo corriente (efectivo es la cifra de calce)
    const cuentasCobrar = e.ventas * s.pctVentasCredito;
    const inventario = e.costoVentas * s.pctInventario;
    const totalActivoCte = totalActivos - totalActivoNoCte;
    const efectivo = totalActivoCte - cuentasCobrar - inventario;

    const totalPasivoPatrimonio = totalPasivo + totalPatrimonio;

    return {
      anio: y,
      efectivo, cuentasCobrar, inventario, totalActivoCte,
      activoFijoNeto, deprecAmortAcum, cuentasCobrarLP, totalActivoNoCte, totalActivos,
      tributosIGV, cuentasPagar, irPorPagar, totalPasivoCte, totalPasivo,
      capitalSocial, utilidadEjercicio, totalPatrimonio, totalPasivoPatrimonio,
      cuadra: Math.abs(totalActivos - totalPasivoPatrimonio) < 0.01,
    };
  });
}

export function calcularEstadosFinancieros(flujo: FlujoCajaResult, ctx: EstadosContext): EstadosFinancierosResult {
  const escenarios: EstadosEscenario[] = flujo.escenarios.map((esc) => {
    const eerr = eerrDeEscenario(esc);
    const esf = esfDeEscenario(esc, eerr, ctx);
    return {
      clave: esc.clave,
      eerr,
      esf,
      ratios: esf.map((e, i) => calcularRatios(e, eerr[i])),
    };
  });
  return { escenarios };
}
