import type { ModuloId } from "@/core/schemas";
import { normalizeUsername, usernameToEmail } from "@/core/auth/identity";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { AppUser, Project, ProjectModules, Rol } from "./types";

export interface NuevoUsuario {
  displayName: string;
  password: string;
  role: Rol;
}

/**
 * Capa de datos con una interfaz única para la UI. Dos implementaciones:
 *  - Supabase (con credenciales): Auth + Postgres + RLS + Edge Functions.
 *  - Demo (sin credenciales): localStorage con cuentas sembradas.
 *
 * Identidad: el usuario inicia sesión con su NOMBRE DE EMPRESARIO; nunca ve un
 * email. Internamente el nombre → slug → email sintético (ver core/auth/identity).
 */
export interface DataProvider {
  readonly modo: "supabase" | "demo";
  // Auth
  currentUser(): Promise<AppUser | null>;
  onAuthChange(cb: (u: AppUser | null) => void): () => void;
  /** `nombre` = nombre de empresario (display name). */
  signIn(nombre: string, password: string): Promise<AppUser>;
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
  listUsers(): Promise<AppUser[]>;
  createUser(input: NuevoUsuario): Promise<{ slug: string }>;
  resetPassword(userId: string, password: string): Promise<void>;
  setActive(userId: string, activo: boolean): Promise<void>;
  setRole(userId: string, role: Rol): Promise<void>;
  /** true si el slug está disponible. */
  checkUsername(slug: string): Promise<boolean>;
}

const nowIso = () => new Date().toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(36).slice(2)}`);

// ============================================================================
// Demo provider (localStorage)
// ============================================================================
interface DemoUser extends AppUser {
  password: string;
}

// v2: nuevo modelo de identidad (username/display_name). Versionar invalida el
// localStorage del esquema anterior (email/nombre) sin romper a quien ya entró.
const K = {
  users: "ce_demo_users_v2",
  session: "ce_demo_session_v2",
  projects: "ce_demo_projects_v2",
  modules: "ce_demo_modules_v2",
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
    { id: uid(), username: "administrador", displayName: "Administrador", role: "admin", activo: true, password: "admin123", createdAt: nowIso() },
    { id: uid(), username: "alumno-demo", displayName: "Alumno Demo", role: "user", activo: true, password: "alumno123", createdAt: nowIso() },
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
    return u && u.activo ? this.strip(u) : null;
  }

  onAuthChange(cb: (u: AppUser | null) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  private emit(u: AppUser | null) {
    this.listeners.forEach((l) => l(u));
  }

  async signIn(nombre: string, password: string): Promise<AppUser> {
    const slug = normalizeUsername(nombre);
    const u = read<DemoUser[]>(K.users, []).find((x) => x.username === slug);
    if (!u || u.password !== password) throw new Error("Usuario o contraseña incorrectos");
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
    write(K.projects, [...read<Project[]>(K.projects, []), p]);
    return p;
  }

  async deleteProject(id: string) {
    write(K.projects, read<Project[]>(K.projects, []).filter((p) => p.id !== id));
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
    return read<Record<string, ProjectModules>>(K.modules, {})[projectId] ?? {};
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

  // ----- Admin -----
  private async requireAdmin(): Promise<void> {
    const u = await this.currentUser();
    if (u?.role !== "admin") throw new Error("Solo un administrador puede gestionar usuarios");
  }

  async listUsers(): Promise<AppUser[]> {
    await this.requireAdmin();
    return read<DemoUser[]>(K.users, []).map((u) => this.strip(u));
  }

  async checkUsername(slug: string): Promise<boolean> {
    return !read<DemoUser[]>(K.users, []).some((u) => u.username === slug);
  }

  async createUser(input: NuevoUsuario): Promise<{ slug: string }> {
    await this.requireAdmin();
    const slug = normalizeUsername(input.displayName);
    const users = read<DemoUser[]>(K.users, []);
    if (users.some((u) => u.username === slug)) throw new Error(`El usuario «${slug}» ya existe`);
    const nu: DemoUser = {
      id: uid(),
      username: slug,
      displayName: input.displayName.trim(),
      role: input.role,
      activo: true,
      password: input.password,
      createdAt: nowIso(),
    };
    write(K.users, [...users, nu]);
    return { slug };
  }

  async resetPassword(userId: string, password: string) {
    await this.requireAdmin();
    write(K.users, read<DemoUser[]>(K.users, []).map((u) => (u.id === userId ? { ...u, password } : u)));
  }

  async setActive(userId: string, activo: boolean) {
    await this.requireAdmin();
    write(K.users, read<DemoUser[]>(K.users, []).map((u) => (u.id === userId ? { ...u, activo } : u)));
  }

  async setRole(userId: string, role: Rol) {
    await this.requireAdmin();
    write(K.users, read<DemoUser[]>(K.users, []).map((u) => (u.id === userId ? { ...u, role } : u)));
  }
}

// ============================================================================
// Supabase provider
// ============================================================================
class SupabaseProvider implements DataProvider {
  readonly modo = "supabase" as const;
  private sb = supabase!;

  private async profileOf(id: string): Promise<AppUser | null> {
    const { data } = await this.sb
      .from("profiles")
      .select("id, username, display_name, role, activo, created_at")
      .eq("id", id)
      .single();
    if (!data) return null;
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      role: data.role,
      activo: data.activo,
      createdAt: data.created_at,
    };
  }

  async currentUser(): Promise<AppUser | null> {
    const { data } = await this.sb.auth.getUser();
    if (!data.user) return null;
    return this.profileOf(data.user.id);
  }

  onAuthChange(cb: (u: AppUser | null) => void) {
    const { data } = this.sb.auth.onAuthStateChange(async (_e, session) => {
      cb(session?.user ? await this.profileOf(session.user.id) : null);
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(nombre: string, password: string): Promise<AppUser> {
    const email = usernameToEmail(nombre);
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error("Usuario o contraseña incorrectos");
    const profile = await this.profileOf(data.user.id);
    if (!profile || !profile.activo) {
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

  // ----- Admin (Edge Functions con service_role + lectura por RLS) -----
  async listUsers(): Promise<AppUser[]> {
    const { data, error } = await this.sb
      .from("profiles")
      .select("id, username, display_name, role, activo, created_at")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((d) => ({
      id: d.id, username: d.username, displayName: d.display_name, role: d.role, activo: d.activo, createdAt: d.created_at,
    }));
  }

  async checkUsername(slug: string): Promise<boolean> {
    const { count } = await this.sb
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("username", slug);
    return (count ?? 0) === 0;
  }

  private async invoke(fn: string, body: Record<string, unknown>) {
    const { data, error } = await this.sb.functions.invoke(fn, { body });
    if (error) {
      // Intenta extraer el mensaje del cuerpo de la respuesta de la función.
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const j = await ctx.json();
          if (j?.error) throw new Error(j.error);
        } catch {
          /* usa el mensaje genérico */
        }
      }
      throw new Error(error.message ?? "Error en la función");
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }

  async createUser(input: NuevoUsuario): Promise<{ slug: string }> {
    const data = await this.invoke("createUser", {
      display_name: input.displayName,
      password: input.password,
      role: input.role,
    });
    return { slug: data?.slug ?? normalizeUsername(input.displayName) };
  }

  async resetPassword(userId: string, password: string) {
    await this.invoke("resetPassword", { user_id: userId, password });
  }

  async setActive(userId: string, activo: boolean) {
    await this.invoke("setActive", { user_id: userId, activo });
  }

  async setRole(userId: string, role: Rol) {
    await this.invoke("setRole", { user_id: userId, role });
  }
}

export const data: DataProvider = isSupabaseConfigured ? new SupabaseProvider() : new DemoProvider();
