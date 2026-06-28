import type { ModuloId } from "@/core/schemas";

export type Rol = "admin" | "user";

export interface AppUser {
  id: string;
  email: string;
  nombre?: string | null;
  role: Rol;
  activo: boolean;
  createdAt?: string;
}

export interface Project {
  id: string;
  userId: string;
  nombre: string;
  descripcion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleRecord {
  data: unknown;
  completo: boolean;
  updatedAt: string;
}

export type ProjectModules = Partial<Record<ModuloId, ModuleRecord>>;
