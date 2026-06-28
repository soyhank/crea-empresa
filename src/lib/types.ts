import type { ModuloId } from "@/core/schemas";

export type Rol = "admin" | "user";

export interface AppUser {
  id: string;
  /** Slug estable (no visible salvo en la tabla admin). */
  username: string;
  /** Nombre de empresario tal cual, para mostrar. */
  displayName: string;
  role: Rol;
  activo: boolean;
  createdAt?: string;
}

/**
 * Inputs de todos los módulos del proyecto (JSONB en la BD).
 * `lastModulo` recuerda el último módulo editado para el deep-link.
 * La completitud NO se guarda: se deriva validando cada módulo contra su Zod.
 */
export type ProjectData = Partial<Record<ModuloId, unknown>> & {
  lastModulo?: ModuloId;
};

export interface Project {
  id: string;
  userId: string;
  nombre: string;
  rubro?: string | null;
  descripcion?: string | null;
  data: ProjectData;
  createdAt: string;
  updatedAt: string;
}
