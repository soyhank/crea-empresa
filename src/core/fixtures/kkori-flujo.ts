import type { FlujoAnioInput, FlujoCajaInput } from "../schemas/flujoCaja";

export const kkoriFlujoInput: FlujoCajaInput = {
  escenarios: [
    { clave: "optimista", inflacion: 0.025, tasaMercado: 0.16, riesgoInversionista: 0.08 },
    { clave: "moderado", inflacion: 0.03, tasaMercado: 0.12, riesgoInversionista: 0.12 },
    { clave: "pesimista", inflacion: 0.04, tasaMercado: 0.08, riesgoInversionista: 0.15 },
  ],
  pctIR: 0.295,
};

export const kkoriInversionInicial = 49268.88981455179;

/** Totales anuales exactos del Excel K-KORI (Proyección de ventas). */
export const kkoriFlujoAnios: FlujoAnioInput[] = [
  { ingresos: 457030.7009958832, costosFijos: 179581.0958244742, costosVariables: 129313.9621234556, igvAPagar: 35145.94106855784 },
  { ingresos: 479923.335074, costosFijos: 188576.299659, costosVariables: 135791.288941, igvAPagar: 36906.398662 },
  { ingresos: 491558.084426, costosFijos: 193147.942294, costosVariables: 139083.268088, igvAPagar: 37801.11802 },
];

export const kkoriFlujoEsperado = {
  cok: { optimista: 0.271, moderado: 0.2772, pesimista: 0.2792 },
  flujoEco1: { optimista: 73594.0173, moderado: 72381.2728, pesimista: 69955.7837 },
  vane: { optimista: 95023.0727, moderado: 91363.6759, pesimista: 86255.6246 },
  tire: { optimista: 1.4174630356390585, moderado: 1.3908047129666392, pesimista: 1.3373246679035153 },
};
