-- =============================================================================
-- Crea-Empresa · Esquema inicial
-- La BD guarda SOLO inputs. Todo valor financiero es derivado en /core/calc.
-- Identidad: login por NOMBRE DE EMPRESARIO (sin email visible). El email es
-- sintético (slug@dominio) y se deriva del nombre con la misma normalización
-- en cliente y Edge Function. SIN auto-registro: el admin crea las cuentas.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- profiles: 1-a-1 con auth.users. `username` = slug estable; `display_name` =
-- nombre tal cual para mostrar.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  role          text not null default 'user' check (role in ('user', 'admin')),
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- proyectos: pertenecen a un usuario (empresario).
-- ----------------------------------------------------------------------------
create table if not exists public.proyectos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  nombre      text not null,
  descripcion text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists proyectos_user_id_idx on public.proyectos (user_id);

-- ----------------------------------------------------------------------------
-- proyecto_modulos: inputs por módulo como JSONB (uno por módulo y proyecto).
-- ----------------------------------------------------------------------------
create table if not exists public.proyecto_modulos (
  id          uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  modulo      text not null check (modulo in (
                'mercado','encuesta','costeo','planilla','inversiones',
                'depreciacion','punto_equilibrio','ventas','flujo_caja',
                'estados_financieros')),
  data        jsonb not null default '{}'::jsonb,
  completo    boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique (proyecto_id, modulo)
);
create index if not exists proyecto_modulos_proyecto_idx
  on public.proyecto_modulos (proyecto_id);

-- ----------------------------------------------------------------------------
-- Helper: ¿el usuario actual es admin? SECURITY DEFINER evita recursión de RLS.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and activo = true
  );
$$;

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_proyectos_touch on public.proyectos;
create trigger trg_proyectos_touch before update on public.proyectos
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_modulos_touch on public.proyecto_modulos;
create trigger trg_modulos_touch before update on public.proyecto_modulos
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- RLS: cada usuario solo ve/escribe lo suyo; el admin ve todo. La escritura de
-- profiles ocurre solo vía Edge Functions con service_role (que omiten RLS).
-- =============================================================================
alter table public.profiles         enable row level security;
alter table public.proyectos        enable row level security;
alter table public.proyecto_modulos enable row level security;

-- profiles: un user lee su fila; el admin lee todas.
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- (Opcional) el admin puede actualizar perfiles desde el cliente; la creación y
-- la gestión sensible se hacen por Edge Function con service_role.
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- proyectos
drop policy if exists proyectos_select on public.proyectos;
create policy proyectos_select on public.proyectos
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists proyectos_insert on public.proyectos;
create policy proyectos_insert on public.proyectos
  for insert with check (user_id = auth.uid());

drop policy if exists proyectos_update on public.proyectos;
create policy proyectos_update on public.proyectos
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists proyectos_delete on public.proyectos;
create policy proyectos_delete on public.proyectos
  for delete using (user_id = auth.uid());

-- proyecto_modulos (a través del dueño del proyecto)
drop policy if exists modulos_select on public.proyecto_modulos;
create policy modulos_select on public.proyecto_modulos
  for select using (
    exists (select 1 from public.proyectos p
            where p.id = proyecto_id and (p.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists modulos_write on public.proyecto_modulos;
create policy modulos_write on public.proyecto_modulos
  for all using (
    exists (select 1 from public.proyectos p
            where p.id = proyecto_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.proyectos p
            where p.id = proyecto_id and p.user_id = auth.uid())
  );

-- =============================================================================
-- Bootstrap del primer admin: la Edge Function `createUser` permite crear el
-- primer usuario como admin si aún no existe ninguno. Alternativamente, tras
-- crear un usuario, promuévelo manualmente:
--   update public.profiles set role = 'admin' where username = 'tu-slug';
-- =============================================================================
