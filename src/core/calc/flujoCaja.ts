import { calcularCOK, irr, npv, payback } from "./finanzas";
import type {
  EscenarioFlujo, FlujoAnioInput, FlujoAnioResult, FlujoCajaInput, FlujoCajaResult, FlujoEscenarioResult,
} from "../schemas/flujoCaja";

/**
 * Motor del flujo de caja económico por escenario (funciones puras).
 * La inflación del escenario incrementa costos fijos, variables e IGV; los
 * ingresos no se ven afectados. Reproduce K-KORI (VANE 95,023 / TIRE 141.75%
 * optimista, etc.).
 */
export function calcularFlujoEscenario(
  inversionInicial: number,
  anios: FlujoAnioInput[],
  escenario: EscenarioFlujo,
  pctIR: number,
): FlujoEscenarioResult {
  const cok = calcularCOK(escenario.inflacion, escenario.tasaMercado, escenario.riesgoInversionista);
  const factor = 1 + escenario.inflacion;

  const resultados: FlujoAnioResult[] = anios.map((a, i) => {
    const costosFijos = a.costosFijos * factor;
    const costosVariables = a.costosVariables * factor;
    const egresos = costosFijos + costosVariables;
    const flujoOperativo = a.ingresos - egresos;
    const igvPagado = a.igvAPagar * factor;
    const flujoAntesIR = flujoOperativo - igvPagado;
    const impuestoRenta = flujoAntesIR * pctIR;
    return {
      anio: i + 1,
      ingresos: a.ingresos,
      costosFijos,
      costosVariables,
      egresos,
      flujoOperativo,
      igvPagado,
      flujoAntesIR,
      impuestoRenta,
      flujoEconomico: flujoAntesIR - impuestoRenta,
    };
  });

  const flujos = [-inversionInicial, ...resultados.map((r) => r.flujoEconomico)];

  return {
    clave: escenario.clave,
    cok,
    anios: resultados,
    flujos,
    vane: npv(cok, flujos),
    tire: irr(flujos),
    payback: payback(inversionInicial, resultados.map((r) => r.flujoEconomico)),
  };
}

export function calcularFlujoCaja(
  input: FlujoCajaInput,
  inversionInicial: number,
  anios: FlujoAnioInput[],
): FlujoCajaResult {
  return {
    inversionInicial,
    escenarios: input.escenarios.map((e) => calcularFlujoEscenario(inversionInicial, anios, e, input.pctIR)),
  };
}
