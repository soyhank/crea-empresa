import type { ModuloId } from "@/core/schemas";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { AppUser, Project, ProjectModules } from "./types";

/**
 * Capa de datos con una interfaz única para la UI. Dos implementaciones:
 *  - Supabase (cuando hay credenciales): Auth + Postgres + RLS + /api/admin.
 *  - Demo (sin credenciales): localStorage con cuentas sembradas, para que la
 *    app corra y se despliegue antes de conectar Supabase.
 */
export interface DataProvider {
  readonly modo: "supabase" | "demo";
  // Auth
  currentUser(): Promise<AppUser | null>;
  onAuthChange(cb: (u: AppUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<AppUser>;
  signOut(): Promise<void>;
  // Proyectos
  listProjects(): Promise<Project[]>;
  createProject(nombre: string, descripcion?: string): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getProject(id: string): Promise<Project | null>;
  // Módulos
  loadModules(projectId: string): Promise<ProjectModules>;
  saveModule(projectId: string, modulo: ModuloId, data: unknown, completo: boolean): Promise<void>;
  // Admin
  adminAction(action: string, payload: Record<string, unknown>): Promise<{ users?: AppUser[] }>;
}

const nowIso = () => new Date().toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(36).slice(2)}`);

// ============================================================================
// Demo provider (localStorage)
// ============================================================================
interface DemoUser extends AppUser {
  password: string;
}

const K = {
  users: "ce_demo_users",
  session: "ce_demo_session",
  projects: "ce_demo_projects",
  modules: "ce_demo_modules",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedDemo() {
  if (read<DemoUser[] | null>(K.users, null)) return;
  const seed: DemoUser[] = [
    { id: uid(), email: "admin@demo.com", nombre: "Administrador", role: "admin", activo: true, password: "admin123", createdAt: nowIso() },
    { id: uid(), email: "alumno@demo.com", nombre: "Alumno Demo", role: "user", activo: true, password: "alumno123", createdAt: nowIso() },
  ];
  write(K.users, seed);
}

class DemoProvider implements DataProvider {
  readonly modo = "demo" as const;
  private listeners = new Set<(u: AppUser | null) => void>();

  constructor() {
    seedDemo();
  }

  private strip(u: DemoUser): AppUser {
    const { password: _pw, ...rest } = u;
    void _pw;
    return rest;
  }

  async currentUser(): Promise<AppUser | null> {
    const id = read<string | null>(K.session, null);
    if (!id) return null;
    const u = read<DemoUser[]>(K.users, []).find((x) => x.id === id);
    return u ? this.strip(u) : null;
  }

  onAuthChange(cb: (u: AppUser | null) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  private emit(u: AppUser | null) {
    this.listeners.forEach((l) => l(u));
  }

  async signIn(email: string, password: string): Promise<AppUser> {
    const u = read<DemoUser[]>(K.users, []).find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!u || u.password !== password) throw new Error("Credenciales inválidas");
    if (!u.activo) throw new Error("Tu cuenta está desactivada. Contacta al administrador.");
    write(K.session, u.id);
    const app = this.strip(u);
    this.emit(app);
    return app;
  }

  async signOut() {
    localStorage.removeItem(K.session);
    this.emit(null);
  }

  private async requireUser(): Promise<AppUser> {
    const u = await this.currentUser();
    if (!u) throw new Error("No autenticado");
    return u;
  }

  async listProjects(): Promise<Project[]> {
    const u = await this.requireUser();
    const all = read<Project[]>(K.projects, []);
    const list = u.role === "admin" ? all : all.filter((p) => p.userId === u.id);
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createProject(nombre: string, descripcion?: string): Promise<Project> {
    const u = await this.requireUser();
    const p: Project = { id: uid(), userId: u.id, nombre, descripcion: descripcion ?? null, createdAt: nowIso(), updatedAt: nowIso() };
    const all = read<Project[]>(K.projects, []);
    write(K.projects, [...all, p]);
    return p;
  }

  async deleteProject(id: string) {
    const all = read<Project[]>(K.projects, []).filter((p) => p.id !== id);
    write(K.projects, all);
    const mods = read<Record<string, ProjectModules>>(K.modules, {});
    delete mods[id];
    write(K.modules, mods);
  }

  async getProject(id: string): Promise<Project | null> {
    const u = await this.requireUser();
    const p = read<Project[]>(K.projects, []).find((x) => x.id === id);
    if (!p) return null;
    if (u.role !== "admin" && p.userId !== u.id) return null;
    return p;
  }

  async loadModules(projectId: string): Promise<ProjectModules> {
    const mods = read<Record<string, ProjectModules>>(K.modules, {});
    return mods[projectId] ?? {};
  }

  async saveModule(projectId: string, modulo: ModuloId, data: unknown, completo: boolean) {
    const mods = read<Record<string, ProjectModules>>(K.modules, {});
    const current = mods[projectId] ?? {};
    current[modulo] = { data, completo, updatedAt: nowIso() };
    mods[projectId] = current;
    write(K.modules, mods);
    const projects = read<Project[]>(K.projects, []);
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
      projects[idx] = { ...projects[idx], updatedAt: nowIso() };
      write(K.projects, projects);
    }
  }

  async adminAction(action: string, payload: Record<string, unknown>) {
    const users = read<DemoUser[]>(K.users, []);
    switch (action) {
      case "list":
        return { users: users.map((u) => this.strip(u)) };
      case "create": {
        const email = String(payload.email ?? "").trim().toLowerCase();
        if (users.some((u) => u.email === email)) throw new Error("Ese email ya existe");
        const nu: DemoUser = {
          id: uid(),
          email,
          nombre: (payload.nombre as string) ?? null,
          role: payload.role === "admin" ? "admin" : "user",
          activo: true,
          password: String(payload.password ?? "123456"),
          createdAt: nowIso(),
        };
        write(K.users, [...users, nu]);
        return { users: [...users, nu].map((u) => this.strip(u)) };
      }
      case "deactivate":
      case "activate": {
        const id = String(payload.userId);
        const next = users.map((u) => (u.id === id ? { ...u, activo: action === "activate" } : u));
        write(K.users, next);
        return { users: next.map((u) => this.strip(u)) };
      }
      case "setRole": {
        const id = String(payload.userId);
        const role = payload.role === "admin" ? "admin" : "user";
        const next = users.map((u) => (u.id === id ? { ...u, role } : u));
        write(K.users, next as DemoUser[]);
        return { users: next.map((u) => this.strip(u as DemoUser)) };
      }
      case "resetPassword": {
        const id = String(payload.userId);
        const next = users.map((u) => (u.id === id ? { ...u, password: String(payload.password) } : u));
        write(K.users, next);
        return {};
      }
      default:
        throw new Error("Acción no soportada");
    }
  }
}

// ============================================================================
// Supabase provider
// ============================================================================
class SupabaseProvider implements DataProvider {
  readonly modo = "supabase" as const;
  private sb = supabase!;

  private async profileOf(id: string, email: string): Promise<AppUser> {
    const { data } = await this.sb
      .from("profiles")
      .select("id, email, nombre, role, activo, created_at")
      .eq("id", id)
      .single();
    if (data) {
      return { id: data.id, email: data.email, nombre: data.nombre, role: data.role, activo: data.activo, createdAt: data.created_at };
    }
    return { id, email, role: "user", activo: true };
  }

  async currentUser(): Promise<AppUser | null> {
    const { data } = await this.sb.auth.getUser();
    if (!data.user) return null;
    return this.profileOf(data.user.id, data.user.email ?? "");
  }

  onAuthChange(cb: (u: AppUser | null) => void) {
    const { data } = this.sb.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) cb(await this.profileOf(session.user.id, session.user.email ?? ""));
      else cb(null);
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string): Promise<AppUser> {
    const { data, error } = await this.sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) throw new Error(error?.message ?? "Credenciales inválidas");
    const profile = await this.profileOf(data.user.id, data.user.email ?? "");
    if (!profile.activo) {
      await this.sb.auth.signOut();
      throw new Error("Tu cuenta está desactivada. Contacta al administrador.");
    }
    return profile;
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async listProjects(): Promise<Project[]> {
    const { data, error } = await this.sb
      .from("proyectos")
      .select("id, user_id, nombre, descripcion, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id, userId: p.user_id, nombre: p.nombre, descripcion: p.descripcion,
      createdAt: p.created_at, updatedAt: p.updated_at,
    }));
  }

  async createProject(nombre: string, descripcion?: string): Promise<Project> {
    const { data: u } = await this.sb.auth.getUser();
    const { data, error } = await this.sb
      .from("proyectos")
      .insert({ nombre, descripcion: descripcion ?? null, user_id: u.user?.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id, userId: data.user_id, nombre: data.nombre, descripcion: data.descripcion, createdAt: data.created_at, updatedAt: data.updated_at };
  }

  async deleteProject(id: string) {
    const { error } = await this.sb.from("proyectos").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getProject(id: string): Promise<Project | null> {
    const { data } = await this.sb
      .from("proyectos")
      .select("id, user_id, nombre, descripcion, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return { id: data.id, userId: data.user_id, nombre: data.nombre, descripcion: data.descripcion, createdAt: data.created_at, updatedAt: data.updated_at };
  }

  async loadModules(projectId: string): Promise<ProjectModules> {
    const { data, error } = await this.sb
      .from("proyecto_modulos")
      .select("modulo, data, completo, updated_at")
      .eq("proyecto_id", projectId);
    if (error) throw new Error(error.message);
    const out: ProjectModules = {};
    (data ?? []).forEach((r) => {
      out[r.modulo as ModuloId] = { data: r.data, completo: r.completo, updatedAt: r.updated_at };
    });
    return out;
  }

  async saveModule(projectId: string, modulo: ModuloId, data: unknown, completo: boolean) {
    const { error } = await this.sb
      .from("proyecto_modulos")
      .upsert({ proyecto_id: projectId, modulo, data, completo }, { onConflict: "proyecto_id,modulo" });
    if (error) throw new Error(error.message);
  }

  async adminAction(action: string, payload: Record<string, unknown>) {
    const { data: sess } = await this.sb.auth.getSession();
    const token = sess.session?.access_token ?? "";
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Error del servidor");
    return json;
  }
}

export const data: DataProvider = isSupabaseConfigured ? new SupabaseProvider() : new DemoProvider();
