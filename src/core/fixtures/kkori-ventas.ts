import type { ProyeccionVentasContext, ProyeccionVentasInput } from "../schemas/proyeccionVentas";

/** Caso K-KORI · Proyección de ventas (hoja PROYECCION DE VENTAS del Excel). */
export const kkoriVentasInput: ProyeccionVentasInput = {
  pctCrecimientoAnual: 0.05,
  igv: 0.18,
};

export const kkoriVentasContext: ProyeccionVentasContext = {
  demandaMesBase: 2692.5252951308826,
  precioVenta: 13.925031236802234,
  cvu: 3.94,
  cfu: 5.471563208874022,
};

export const kkoriVentasEsperado = {
  pctCrecimientoMensual: 0.05 / 12,
  mes4: 2703.7441505272614,
  mes12: 2795.194285520975,
  anio1: {
    totalCantidad: 32820.80256940497,
    totalIngresos: 457030.7009958832,
    totalIgvVentas: 82265.52617925896,
    totalCV: 129313.96212345561,
    totalCF: 179581.0958244742,
    totalCT: 308895.05794792983,
    totalIgvCompras: 47119.58511070113,
    totalIgvAPagar: 35145.94106855784,
    saldoOperativo: 148135.64304795337,
  },
  anio2: {
    mes1: 2806.8409283773126,
    totalCantidad: 34464.79414749822,
    totalIngresos: 479923.33507387154,
    totalIgvAPagar: 36906.39866244776,
    saldoOperativo: 155555.74647386058,
  },
  // Año 3 CORREGIDO: el Excel tiene un bug en marzo (D58 referencia el promedio
  // del año 2, O33, en vez de continuar desde febrero), que rompe la serie. Aquí
  // se aplica crecimiento continuo correcto. (El Excel buggeado daba 491,558.08.)
  anio3: {
    totalIngresos: 504477.12373398134,
    totalIgvAPagar: 38794.60006199842,
    saldoOperativo: 163514.27368987282,
  },
};
