# Crea-Empresa

Generador web de **planes de negocio** que **reemplaza** (no imita) el Excel de
formulación de proyectos usado en cursos de formulación. El usuario solo ingresa
los inputs de su negocio; el sistema decide dónde van y los **cálculos
financieros se actualizan en vivo** en un flujo guiado de 10 módulos.

> Caso de referencia: **K-KORI** (una bebida). Los valores de prueba salen de su
> modelo y el motor los reproduce exactamente.

## Stack

- **React 19 + Vite + TypeScript**
- **TailwindCSS + shadcn/ui** (componentes propios) + **Recharts**
- **Zod** como única fuente de verdad de cada esquema de módulo
- **Supabase** (Postgres + Auth + RLS) — opcional en local (ver _modo demo_)
- **Vitest** para los tests de cálculo (TDD)
- Deploy en **Vercel**, repo en **GitHub**, gestor **pnpm**

## Arquitectura (hexagonal-lite)

El **dominio** (cálculo) está separado de la UI y de la persistencia:

```
src/
  core/            ← dominio puro, sin React
    schemas/       ← Zod: los 10 módulos (fuente de verdad de tipos y validación)
    calc/          ← funciones puras (motor financiero) + tests
    fixtures/      ← caso K-KORI (datos de prueba)
    money.ts       ← utilidades de redondeo/formato
  components/      ← UI reutilizable (shadcn-style) y campos contextualizados
  features/        ← módulos de negocio (Mercado: form + resultados en vivo)
  pages/           ← Login, Dashboard, Proyecto (3 paneles), Admin
  lib/             ← auth, capa de datos (Supabase | demo), wizard, supabase client
api/               ← endpoint serverless de administración de usuarios (Vercel)
supabase/          ← migración SQL con RLS
```

**Principio clave:** la base de datos guarda **solo inputs**. Todo valor
financiero (VAN, TIR, demanda, etc.) es **derivado** por funciones puras en
`core/calc` y nunca se persiste.

## Puesta en marcha

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # tests de cálculo (deben pasar)
pnpm build      # typecheck + build de producción
```

### Modo demo (sin Supabase)

Si **no** hay variables de entorno de Supabase, la app corre en **modo demo**
con datos en `localStorage` y cuentas sembradas. El login es por **nombre de
empresario** (no email):

| Rol           | Nombre de empresario | Contraseña  |
| ------------- | -------------------- | ----------- |
| Administrador | `Administrador`      | `admin123`  |
| Empresario    | `Alumno Demo`        | `alumno123` |

Esto permite ejecutar y desplegar la app antes de conectar Supabase.

### Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecuta `supabase/migrations/0001_init.sql`.
3. Despliega las **Edge Functions** (gestión de usuarios con `service_role`):
   ```bash
   supabase link --project-ref TU_REF
   supabase functions deploy createUser resetPassword setActive setRole
   ```
   `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se inyectan automáticamente en
   las funciones; no se exponen jamás al cliente.
4. Copia `.env.example` a `.env` y completa solo lo del cliente:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (también en Vercel → _Project
   Settings → Environment Variables_).
5. Crea el **primer administrador** (bootstrap): invoca la función `createUser`
   con `{ "display_name": "Tu Nombre", "password": "..." }`. Si aún no existe
   ningún admin, ese primer usuario se crea como `admin`. También puedes
   promover manualmente: `update public.profiles set role='admin' where username='tu-slug';`

> Identidad: el usuario inicia sesión con su **nombre de empresario**. Internamente
> el nombre se normaliza a un slug y a un email sintético invisible
> (`src/core/auth/identity.ts`, copiado en `supabase/functions/_shared/identity.ts`;
> un test garantiza que no divergan).

## Modelo de usuarios

- **Sin auto-registro.** Solo el admin crea cuentas (vía Edge Functions con la
  `service_role` key). Login por **nombre de empresario** (sin email visible).
  Roles: `admin` (gestiona usuarios en `/admin/usuarios`, ve todo) y `user`
  (empresario: solo sus proyectos). RLS estricto: `auth.uid() = user_id`.

## Estado (Sprint 1)

Entregado:

- ✅ Scaffolding completo (Vite/TS/Tailwind/shadcn/Zod/Vitest).
- ✅ Esquemas Zod de los **10 módulos**.
- ✅ Motor `core/calc/mercado.ts` + **tests verdes** que reproducen K-KORI:
  Universo 1 255 300 · MP 435 840,16 · MD 232 675,09 · ME 172 082,62 ·
  MO 17 208,26 · CPC 1,877604 · Demanda 32 310,30/año · 2 692,53/mes.
- ✅ SQL Supabase + RLS + Edge Functions (`createUser`/`resetPassword`/`setActive`/
  `setRole`) con bootstrap del primer admin.
- ✅ Login por **nombre de empresario** (sin signup, sin email visible) + guard de
  rutas por rol + vista admin `/admin/usuarios` con CRUD, slug en vivo y
  contraseña temporal copiable.
- ✅ Shell de UI de 3 paneles + sidebar-wizard con estados + módulo **Mercado**
  end-to-end con cálculo en vivo y autoguardado.

Pendiente (próximos sprints): los 9 módulos restantes (Encuesta, Costeo,
Planilla, Inversiones, Depreciación, Punto de equilibrio, Ventas, Flujo de caja,
Estados financieros) y el tablero final de KPIs (VAN/TIR/Payback/PE) con gráficos.

> Corrección sobre el Excel: el motor usa la lógica correcta una sola vez
> (factores derivados de conteos enteros de encuesta, segmentación como filtros
> multiplicativos) evitando las inconsistencias del original (#DIV/0!, fórmulas
> que excluían opciones, sumas de rango incorrectas).
