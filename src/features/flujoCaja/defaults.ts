import type { FlujoCajaInput } from "@/core/schemas";

const ESCENARIOS_KKORI: FlujoCajaInput["escenarios"] = [
  { clave: "optimista", inflacion: 0.025, tasaMercado: 0.16, riesgoInversionista: 0.08 },
  { clave: "moderado", inflacion: 0.03, tasaMercado: 0.12, riesgoInversionista: 0.12 },
  { clave: "pesimista", inflacion: 0.04, tasaMercado: 0.08, riesgoInversionista: 0.15 },
];

export function flujoVacio(): FlujoCajaInput {
  return { escenarios: ESCENARIOS_KKORI.map((e) => ({ ...e })), pctIR: 0.295 };
}

export function flujoEjemploKkori(): FlujoCajaInput {
  return { escenarios: ESCENARIOS_KKORI.map((e) => ({ ...e })), pctIR: 0.295 };
}
