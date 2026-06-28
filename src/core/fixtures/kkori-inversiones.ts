import type { CapitalTrabajo, InversionesInput } from "../schemas/inversiones";

const it = (rubro: string, precio: number, cantidad = 1) => ({ id: rubro.toLowerCase().replace(/[^a-z0-9]+/g, "-"), rubro, cantidad, precio });

/** Caso K-KORI · Inversiones (hoja INVERSIONES del Excel). */
export const kkoriInversionesInput: InversionesInput = {
  preOperativos: [
    it("Constitución legal", 927.5),
    it("Patente de marca", 0),
    it("Licencia de funcionamiento", 2240),
    it("Trámite Digesa", 300),
    it("Adelanto de alquiler", 2300),
  ],
  activoFijo: {
    maquinariaEquipos: [
      it("Mezcladora", 1500), it("Pasteurizador", 2500), it("Selladora", 315),
      it("Sistema de enfriamiento", 1500), it("Cocina semi industrial", 120),
      it("Termómetro", 50), it("Cocina semi industrial 2", 249),
      it("Refrigeradora", 1300), it("Tanques", 500), it("Aire acondicionado", 500),
    ],
    equiposUtensilios: [
      it("Balanza", 120), it("Termómetro", 50), it("Jarras", 10, 2),
      it("Cucharas", 10, 3), it("Bowls", 10, 5), it("Cuchillos", 12, 5), it("Estantería", 150),
    ],
    equiposOficinaAdmin: [
      it("Computadora", 1500, 4), it("Impresora", 600), it("Teléfono", 150), it("Caja registradora", 150),
    ],
    mueblesEnseres: [
      it("Escritorio", 400, 4), it("Silla", 60, 4), it("Estante", 90, 4), it("Archivadores", 5.8, 8),
    ],
  },
  numSocios: 4,
  nombresSocios: [],
};

/** Capital de trabajo heredado de Costeo (MP×demanda y costos fijos mensuales). */
export const kkoriCapitalTrabajo: CapitalTrabajo = {
  costoVariable: 10608.598981218458,
  costoFijo: 14732.390833333333,
};

export const kkoriInversionesEsperado = {
  totalPreOperativos: 5767.5,
  totalMaquinaria: 8534,
  totalUtensilios: 480,
  totalOficina: 6900,
  totalMuebles: 2246.4,
  totalActivoFijo: 18160.4,
  grupoMaquinariaEquipo: 15914,
  grupoMueblesEnseres: 2246.4,
  totalCapitalTrabajo: 25340.98981455179,
  inversionTotal: 49268.88981455179,
  aportePorSocio: 12317.222453637947,
};
