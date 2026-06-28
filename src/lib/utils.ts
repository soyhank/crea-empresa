import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Genera un id corto y estable para filas de tablas editables. */
export function rowId(prefix = "row"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
