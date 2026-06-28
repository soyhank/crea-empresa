import type { ActivoDepreciable, GastoPreOperativo } from "../schemas/depreciacion";

const a = (nombre: string, monto: number, vidaUtil: number, grupo: string): ActivoDepreciable => ({
  id: nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  nombre, monto, vidaUtil, grupo,
});

/**
 * Caso K-KORI · Depreciación (hoja AMORTIZACION Y DEPRECIACION del Excel).
 * Usa los montos REALES de esa hoja (p. ej. Caja 59, Adelanto 2500), que en el
 * Excel difieren de la hoja de Inversiones.
 */
export const kkoriActivosDeprec: ActivoDepreciable[] = [
  a("Mezcladora", 1500, 10, "Maquinaria y equipos"),
  a("Pasteurizador", 2500, 10, "Maquinaria y equipos"),
  a("Selladora", 315, 10, "Maquinaria y equipos"),
  a("Sistema de enfriamiento", 1500, 10, "Maquinaria y equipos"),
  a("Cocina semi industrial", 120, 10, "Maquinaria y equipos"),
  a("Termómetro maq", 50, 10, "Maquinaria y equipos"),
  a("Cocina semi industrial 2", 249, 10, "Maquinaria y equipos"),
  a("Refrigeradora", 1300, 10, "Maquinaria y equipos"),
  a("Tanques", 500, 10, "Maquinaria y equipos"),
  a("Aire acondicionado", 500, 10, "Maquinaria y equipos"),
  a("Balanza", 120, 10, "Equipos y utensilios"),
  a("Termómetro ut", 50, 10, "Equipos y utensilios"),
  a("Jarras", 20, 10, "Equipos y utensilios"),
  a("Cucharas", 30, 10, "Equipos y utensilios"),
  a("Bowls", 50, 10, "Equipos y utensilios"),
  a("Cuchillos", 60, 10, "Equipos y utensilios"),
  a("Estantería", 150, 10, "Equipos y utensilios"),
  a("Computadoras", 6000, 3, "Equipos de oficina"),
  a("Impresora", 600, 3, "Equipos de oficina"),
  a("Teléfono", 150, 10, "Equipos de oficina"),
  a("Caja registradora", 59, 10, "Equipos de oficina"),
  a("Escritorio", 1600, 10, "Muebles y enseres"),
  a("Sillas", 240, 10, "Muebles y enseres"),
  a("Estantes", 360, 10, "Muebles y enseres"),
  a("Archivadores", 46.4, 10, "Muebles y enseres"),
];

const g = (nombre: string, monto: number): GastoPreOperativo => ({
  id: nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-"), nombre, monto, pctAmortizacion: 0.1,
});

export const kkoriGastosAmort: GastoPreOperativo[] = [
  g("Constitución legal", 927.5),
  g("Patente de marca", 0),
  g("Licencia de funcionamiento", 2240),
  g("Adelanto de alquiler", 2500),
];

export const kkoriDepreciacionEsperado = {
  totalDeprecAnual: 3346.94,
  totalDeprecMensual: 278.911667,
  totalAmortAnual: 566.75,
  totalAmortMensual: 47.229167,
  combinadoMensual: 326.140833,
};
