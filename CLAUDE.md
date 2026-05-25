# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ Advertencia de versión

Este proyecto usa **Next.js 16.2.4** con **React 19**. Las APIs, convenciones y estructura de archivos pueden diferir del conocimiento de entrenamiento. Consultar `node_modules/next/dist/docs/` antes de escribir código nuevo.

---

## Descripción del proyecto

**FERCADI / Josman Texturizados** — Sitio web de catálogo y ventas de materiales de construcción (concretos, acabados texturizados, materiales generales, ferretería con 15k+ productos). Los usuarios pueden explorar el catálogo, buscar, agregar al carrito, confirmar pedidos con forma de pago, ver su historial, cotizar y contactar. Los admins gestionan productos, importan CSV y administran pedidos.

**Stack:** Next.js 16 · React 19 · TypeScript · CSS Modules · **PostgreSQL (Supabase)** · bcrypt · **pg** · Resend (email)

---

## Comandos

```bash
npm run dev      # Servidor de desarrollo (http://localhost:3000)
npm run build    # Build de producción
npm run start    # Ejecutar build de producción
npm run lint     # ESLint
```

El servidor de desarrollo también acepta conexiones desde `192.168.1.23` (configurado en `next.config.ts`).

---

## Estructura de carpetas

```
C:\fercadi-next\
├── src/
│   ├── app/                        # Rutas — Next.js App Router
│   │   ├── layout.tsx              # Layout raíz: Header + Footer + ClientProviders
│   │   ├── page.tsx                # Home (carousel + calculadora + tarjetas)
│   │   ├── globals.css             # Variables CSS globales y reset
│   │   │                           # ⚠️ globals.css tiene `input { color: white !important }`
│   │   │                           #    Siempre sobrescribir con !important en módulos de forms
│   │   ├── login/page.tsx          # Login + Registro combinados (tabs)
│   │   ├── registro/page.tsx       # Página de registro independiente
│   │   ├── perfil/page.tsx         # Dashboard del usuario — muestra órdenes agrupadas
│   │   ├── contacto/page.tsx       # Formulario de contacto
│   │   ├── cotizacion/page.tsx     # Formulario de cotización
│   │   ├── checkout/page.tsx       # Confirmar pedido: items + forma de pago + notas
│   │   ├── pedido-confirmado/page.tsx  # Página de éxito con número de orden
│   │   │
│   │   ├── concretos/
│   │   │   ├── page.tsx                         # Lista categorías desde DB
│   │   │   ├── [categoria]/page.tsx             # Lista productos de la categoría
│   │   │   └── [categoria]/[producto]/page.tsx  # Detalle de producto
│   │   │
│   │   ├── textucos/               # "Acabados" en el menú de navegación
│   │   │   ├── page.tsx
│   │   │   ├── [categoria]/page.tsx
│   │   │   ├── [categoria]/[producto]/page.tsx
│   │   │   └── (rutas directas: adhesivos, morteros, selladores, pinturas, especializados)
│   │   │
│   │   ├── materiales/
│   │   │   ├── page.tsx            # Lista categorías desde materiales_categorias
│   │   │   └── [categoria]/page.tsx
│   │   │
│   │   ├── ferreteria/             # Catálogo público de ferretería (15k+ productos)
│   │   │   ├── page.tsx            # Hero + grid de categorías con totales
│   │   │   └── [categoria]/
│   │   │       ├── page.tsx        # Lista de productos paginada + filtro por marca
│   │   │       └── [producto]/page.tsx  # Detalle de producto + BtnAgregarCarrito
│   │   │
│   │   ├── tips/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   │
│   │   ├── pie-de-pagina/[slug]/page.tsx
│   │   │
│   │   ├── supabase-schema.sql     # Schema PostgreSQL completo listo para Supabase SQL Editor
│   │   │
│   │   ├── admin/                  # Backoffice — solo usuarios con rol='admin'
│   │   │   ├── layout.tsx          # Guard + sidebar (Dashboard, Pedidos, Productos, Nuevo, Importar)
│   │   │   ├── page.tsx            # Dashboard — stats por sección vía /api/admin/stats
│   │   │   ├── importar/page.tsx   # UI para importar catalogo_prueba.csv
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx        # Listado paginado filtrable (50/pág, AbortController)
│   │   │   │   ├── nuevo/page.tsx  # Formulario para crear producto
│   │   │   │   └── [id]/page.tsx   # Formulario para editar producto existente
│   │   │   └── pedidos/
│   │   │       ├── page.tsx        # Listado de órdenes con filtro por estado/cliente
│   │   │       └── [id]/page.tsx   # Detalle de orden + cambio de estado
│   │   │
│   │   └── api/
│   │       ├── login/route.ts              # POST — valida credenciales con bcrypt, devuelve rol
│   │       ├── registro/route.ts           # POST — crea usuario, hashea password
│   │       ├── contacto/route.ts           # POST — envía email vía Resend
│   │       ├── cotizacion/route.ts         # POST — envía cotización vía Resend
│   │       ├── pedidos/route.ts            # POST — crea orden + ítems en transacción, guarda metodo_pago
│   │       ├── perfil/route.ts             # GET  — devuelve órdenes agrupadas/servicios/suscripciones
│   │       ├── productos/route.ts          # GET  — lista pública (solo campos públicos)
│   │       ├── search/route.ts             # GET  — búsqueda LIKE en PostgreSQL (debounced, máx 20)
│   │       └── admin/
│   │           ├── stats/route.ts          # GET  — COUNT por sección + total/inactivos (dashboard)
│   │           ├── seed/route.ts           # GET  — puebla la BD con el catálogo completo
│   │           ├── importar/route.ts       # POST — importa catalogo_prueba.csv (15k+ productos)
│   │           ├── imagenes/route.ts       # GET  — lista imágenes en /public/productos/
│   │           ├── productos/route.ts      # GET (paginado) + POST create (requiere admin)
│   │           ├── productos/[id]/route.ts # GET + PUT + DELETE por id (requiere admin)
│   │           ├── tips/route.ts           # GET + POST — CRUD de tips (admin)
│   │           ├── tips/[id]/route.ts      # GET + PUT + DELETE (soft, activo=0) por id
│   │           ├── pedidos/route.ts        # GET — lista órdenes paginada con info de usuario
│   │           └── pedidos/[id]/route.ts   # GET detalle + PUT cambiar estado (cascada a pedidos)
│   │
│   ├── components/
│   │   ├── Header.tsx              # Header sticky con nav, buscador, carrito y usuario
│   │   ├── Footer.tsx
│   │   ├── ClientProviders.tsx     # Wrapper 'use client': AuthProvider + CartProvider + CartDrawer
│   │   ├── Buscador.tsx            # Buscador spotlight — debounce 200ms + LIKE en PostgreSQL
│   │   ├── Cart.tsx                # Drawer lateral — "Finalizar compra" navega a /checkout
│   │   ├── BtnAgregarCarrito.tsx   # Botón con modal de confirmación + selector de cantidad
│   │   ├── Paginador.tsx           # Paginador Link-based (recibe baseHref del Server Component)
│   │   ├── ProductoDetalle.tsx     # Layout detalle de producto (Server Component)
│   │   ├── ProductCard.tsx         # Tarjeta con selector de opción y botón agregar al carrito
│   │   ├── Carousel.tsx            # Carrusel del home
│   │   ├── CalculadoraVolumen.tsx  # Calculadora de volumen de concreto
│   │   ├── ColorPicker.tsx         # Selector de color decorativo
│   │   ├── ContactForm.tsx         # Formulario de contacto
│   │   └── admin/
│   │       └── ProductoForm.tsx    # Formulario crear/editar producto
│   │   └── ferreteria/
│   │       └── FiltrosMarca.tsx    # Client Component — filtro de marca con useRouter
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # user, login(), logout() — persiste en localStorage
│   │   └── CartContext.tsx         # cart[], addToCart(item, cantidad?), removeFromCart(),
│   │                               # updateQuantity(), clearCart(), isOpen, openCart(), closeCart()
│   │
│   ├── data/
│   │   ├── navigation.ts           # Estructura del menú de navegación del header
│   │   └── tips.ts                 # Artículos de tutoriales y consejos
│   │   # ⚠️  concretos.ts, textucos.ts y materiales.ts fueron ELIMINADOS.
│   │   #     Todo el catálogo ahora viene de MySQL.
│   │
│   ├── lib/
│   │   ├── db.ts                   # Pool PostgreSQL (pg) → Supabase · shim de compatibilidad mysql2
│   │   ├── productos.ts            # Todas las funciones de consulta al catálogo (ver §2)
│   │   ├── searchIndex.ts          # Solo exporta la interfaz SearchItem (sin getDynamicSearchIndex)
│   │   ├── seed.ts                 # seedDatabase() — datos inline, sin dependencias .ts
│   │   ├── admin.ts                # requerirAdmin(req) — valida rol='admin' en endpoints
│   │   └── imagen.ts               # resolverImagenProducto(), construirRutaImagen(), esRutaImagenValida()
│   │
│   └── styles/
│       ├── header.module.css
│       ├── footer.module.css
│       ├── home.module.css
│       ├── product.module.css      # Catálogo + detalle (.detalle, .detalleTitulo, etc.)
│       ├── ferreteria.module.css   # Catálogo ferretería (hero, grid, sidebar, paginador)
│       ├── perfil.module.css       # Dashboard del usuario (tabs, tabla, badges)
│       ├── admin.module.css        # Backoffice completo (sidebar, tabla, formulario, pedidos)
│       ├── cart.module.css
│       ├── checkout.module.css     # Página de checkout (2 cols, formas de pago, inputs)
│       ├── pedidoConfirmado.module.css  # Página de éxito post-compra
│       ├── btnAgregarCarrito.module.css # Botón + modal de confirmación con cantidad
│       ├── buscador.module.css
│       ├── contact.module.css
│       ├── cotizacion.module.css
│       ├── carousel.module.css
│       ├── calculadora.module.css
│       └── colorpicker.module.css
│
├── public/
│   ├── images/
│   ├── icons/
│   └── productos/
│       ├── concretos/
│       ├── adhesivos/
│       ├── mortero_y_afinadores/
│       ├── selladores/
│       ├── pinturas/
│       ├── especialisados/         # (typo intencional en el proyecto)
│       └── materiales/
│
├── catalogo_prueba.csv             # CSV fuente del catálogo de ferretería (15,756 productos)
├── CLAUDE.md
├── next.config.ts                  # allowedDevOrigins: ['192.168.1.23']
├── package.json
└── tsconfig.json
```

---

## Arquitectura y metodología

### 1. App Router (Next.js 16)
Todo el enrutamiento vive en `src/app/`. No existe directorio `pages/`. Las páginas son **Server Components** por defecto; se usa `'use client'` solo cuando se necesitan hooks o interactividad.

**Patrón async params (Next.js 15+):**
```typescript
type Params = Promise<{ slug: string }>;
export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;  // SIEMPRE await params
}
```

---

### 2. Catálogo de productos — 100 % dinámico desde PostgreSQL (Supabase)

> Los archivos `src/data/concretos.ts`, `src/data/textucos.ts` y `src/data/materiales.ts` fueron **eliminados**. Todo el catálogo ahora vive en la base de datos.

**Agregar o editar un producto = INSERT/UPDATE en Supabase. No hay código que modificar.**

#### Funciones disponibles en `src/lib/productos.ts`
| Función | Descripción |
|---|---|
| `getCategorias(seccion)` | Lista de categorías de una sección |
| `getProductosPorCategoria(seccion, categoriaSlug)` | Todos los productos de una categoría (solo campos públicos) |
| `getProducto(seccion, categoriaSlug, slug)` | Un producto por sus tres identificadores |
| `getMaterialesCategorias()` | Todas las categorías de materiales con sus marcas |
| `getCategoriaMaterial(slug)` | Una categoría de materiales por slug |
| `getFerreteriaCategorias()` | Categorías de ferretería con conteo de productos |
| `getFerreteriaMarcas(categoriaSlug?)` | Marcas únicas en ferretería (filtrable por categoría) |
| `getProductosFerreteria({categoriaSlug?, marca?, page?, limit?})` | Paginación server-side para ferretería |

**Importante:** estas funciones usan `db` directamente (PostgreSQL/Supabase) → solo llamarlas desde **Server Components** o **API Routes**. Nunca desde Client Components.

**Importante:** usan `SELECT` con `PUBLIC_COLS` explícitos — nunca `SELECT *` — para no exponer datos comerciales.

#### Separación público / admin
- **Usuarios normales:** `lib/productos.ts` y `api/productos/route.ts` usan `PUBLIC_COLS` (13 campos visibles).
- **Admin:** `api/admin/productos/route.ts` usa `SELECT *` devolviendo todos los 32+ campos.

---

### 3. Layout global
```
layout.tsx (Server)
  └── ClientProviders (Client)
        ├── AuthProvider
        ├── CartProvider
        │     └── CartDrawer (drawer lateral, position: fixed)
        ├── Header
        ├── <main>{children}</main>
        └── Footer
```

---

### 4. Estado global — React Context + localStorage

| Contexto | Persiste en | Contiene |
|---|---|---|
| `AuthContext` | `fercadi_user` | `user {id, nombre, correo, rol?}`, `isAdmin`, `login()`, `logout()` |
| `CartContext` | `fercadi_cart` | `cart[]`, `addToCart(item, cantidad?)`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `isOpen`, `openCart()`, `closeCart()` |

**`addToCart` acepta cantidad opcional** (default 1). Si el ítem ya existe, suma la cantidad al existente.

**No hay sesiones reales (JWT/cookies httpOnly).** La autenticación es solo `localStorage`. El API devuelve el objeto usuario (incluyendo `rol`) y el frontend lo guarda.

---

### 5. API Routes

| Ruta | Método | Propósito |
|---|---|---|
| `/api/login` | POST | Valida credenciales con bcrypt, devuelve `{id, nombre, correo, rol}` |
| `/api/registro` | POST | Crea usuario, hashea password |
| `/api/contacto` | POST | Envía email vía Resend |
| `/api/cotizacion` | POST | Envía cotización vía Resend |
| `/api/pedidos` | POST | Crea orden + ítems en transacción PostgreSQL, guarda metodo_pago |
| `/api/perfil` | GET | Órdenes agrupadas + servicios + suscripciones del usuario |
| `/api/productos` | GET | Lista pública de productos (solo campos públicos) |
| `/api/search` | GET | `?q=` → LIKE en PostgreSQL, máx 20 resultados, mín 2 chars |
| `/api/admin/stats` | GET 🔒 | COUNT por sección + total/inactivos (para dashboard) |
| `/api/admin/seed` | GET | Puebla la BD con el catálogo completo (concretos, textucos, materiales) |
| `/api/admin/importar` | POST 🔒 | Importa `catalogo_prueba.csv` (15k+ productos, lotes de 500, placeholders `$n`) |
| `/api/admin/tips` | GET 🔒 | Listado paginado de tips `?q=` |
| `/api/admin/tips` | POST 🔒 | Crea tip nuevo |
| `/api/admin/tips/[id]` | GET / PUT / DELETE 🔒 | CRUD por id (DELETE = soft, activo=0) |
| `/api/admin/imagenes` | GET 🔒 | Lista imágenes en `/public/productos/` por carpeta |
| `/api/admin/productos` | GET 🔒 | Listado paginado con filtros `?seccion=&q=&page=&limit=` |
| `/api/admin/productos` | POST 🔒 | Crea producto nuevo |
| `/api/admin/productos/[id]` | GET / PUT / DELETE 🔒 | CRUD por id (DELETE = soft, activo=0) |
| `/api/admin/pedidos` | GET 🔒 | Listado de órdenes paginado con info de usuario, filtro `?estado=&q=` |
| `/api/admin/pedidos/[id]` | GET 🔒 | Detalle de orden con ítems |
| `/api/admin/pedidos/[id]` | PUT 🔒 | Cambiar estado (actualiza `ordenes` y todos los `pedidos` vinculados) |

🔒 = requieren header `x-usuario-id` de un usuario con `rol = 'admin'` (`lib/admin.ts > requerirAdmin()`)

#### `POST /api/pedidos` — detalles importantes
- Body: `{ usuario_id, items: CartItem[], notas?, direccion?, metodo_pago? }`
- Usa **transacción PostgreSQL** (`getConnection → beginTransaction → commit/rollback → release`).
- Recalcula precios desde la BD — **no confía en los precios del cliente**.
- Crea registro en `ordenes` con `metodo_pago` → luego inserta ítems en `pedidos` con `orden_id`.
- Valida `metodo_pago` contra lista: `['efectivo', 'transferencia', 'tarjeta']`.
- Devuelve `{ ok, orden_id, total, items }`.

---

### 6. Base de datos (PostgreSQL — Supabase)

**URL del proyecto:** `hykrbwzmavpenprwqsqi.supabase.co`  
**Driver:** `pg` (node-postgres) — **No mysql2**  
**Conexión:** Session Pooler, puerto 5432 (`DATABASE_URL` en `.env.local`)

#### Shim de compatibilidad (`src/lib/db.ts`)
`db.ts` convierte automáticamente la sintaxis mysql2 a PostgreSQL:
- `?` → `$1, $2, $3 …` (placeholders posicionales)
- `INSERT …` → añade `RETURNING id` automáticamente para exponer `insertId`
- Devuelve `[rows | metaInsert, fields]` igual que mysql2
- `db.getConnection()` → cliente dedicado para transacciones (`BEGIN/COMMIT/ROLLBACK`)

#### Tablas
| Tabla | Propósito |
|---|---|
| `usuarios` | Registro con bcrypt. Incluye `rol VARCHAR CHECK ('usuario','admin')` |
| `productos` | Catálogo completo: concretos, acabados, ferretería. 32+ columnas |
| `materiales_categorias` | Categorías de materiales con marcas en `JSONB` |
| `ordenes` | Una fila por carrito confirmado. Contiene total, estado, notas, dirección, metodo_pago |
| `pedidos` | Ítems individuales vinculados a una orden via `orden_id` |
| `servicios_contratados` | Servicios contratados por usuario |
| `suscripciones` | Planes de suscripción con fecha inicio/fin |
| `tips` | Tutoriales y consejos gestionados desde el admin |

**Schema completo:** `src/app/supabase-schema.sql` — ejecutar en Supabase → SQL Editor → New Query → Run.

#### Esquema de `ordenes`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | |
| `usuario_id` | INT | FK → usuarios |
| `total` | NUMERIC(10,2) | Calculado en servidor, no del cliente |
| `estado` | VARCHAR CHECK | `pendiente` \| `confirmado` \| `en_preparacion` \| `enviado` \| `entregado` \| `cancelado` |
| `notas` | TEXT | Instrucciones del cliente |
| `direccion_entrega` | TEXT | |
| `metodo_pago` | VARCHAR(50) | `efectivo` \| `transferencia` \| `tarjeta` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Actualizado por trigger automático |

#### Esquema de `pedidos` (ítems)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | |
| `orden_id` | INT NULL | FK → ordenes.id |
| `usuario_id` | INT | |
| `producto` | VARCHAR(255) | Nombre del producto al momento de la compra |
| `opciones` | VARCHAR(255) | Variante elegida (ej: "50 kg", "Azul Rey") |
| `cantidad` | INT | |
| `precio_unitario` | NUMERIC(10,2) | Precio real validado desde la BD |
| `total` | NUMERIC(10,2) | precio_unitario × cantidad |
| `estado` | VARCHAR CHECK | Se sincroniza cuando el admin cambia el estado de la orden |
| `fecha` | TIMESTAMPTZ | |

#### Diferencias clave MySQL → PostgreSQL (para queries futuras)
| MySQL | PostgreSQL |
|---|---|
| `?` placeholder | `$1, $2, $3` (el shim lo convierte automáticamente) |
| `INT AUTO_INCREMENT` | `SERIAL` |
| `TINYINT(1)` | `SMALLINT` |
| `ENUM(...)` | `VARCHAR CHECK (col IN (...))` |
| `JSON` | `JSONB` |
| `ON DUPLICATE KEY UPDATE col=VALUES(col)` | `ON CONFLICT (...) DO UPDATE SET col=EXCLUDED.col` |
| `LIMIT ?, ?` (offset, limit) | `LIMIT $n OFFSET $m` |
| `CURRENT_TIMESTAMP ON UPDATE` | trigger `trigger_set_updated_at()` |

#### Variables de entorno (`.env.local`)
```env
DATABASE_URL=postgresql://postgres.hykrbwzmavpenprwqsqi:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
RESEND_API_KEY=re_xxxxx
CONTACTO_EMAIL=contacto@josmantexturizados.com
```
Password en Supabase → Settings → Database → Connection string → Session pooler.

#### Para activar el primer admin
```sql
-- En Supabase → SQL Editor
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```
(Luego cerrar sesión y volver a iniciar para actualizar el localStorage.)

---

### 7. Sistema de ventas — flujo completo

#### Flujo de compra (usuario)
```
Página de producto (/ferreteria/[cat]/[prod])
  → BtnAgregarCarrito: click abre modal de confirmación
      - Muestra imagen, nombre, precio unitario
      - Selector de cantidad (1–99) con subtotal en tiempo real
      - Aviso de verificación
      - Botón "Agregar al carrito"
  → addToCart(item, cantidad) → CartContext → localStorage
  → openCart() → CartDrawer se abre para revisar
  → Botón "Finalizar compra" → /checkout
  → Seleccionar forma de pago (Efectivo / Transferencia / Tarjeta)
  → Llenar dirección y notas (opcionales)
  → "Confirmar pedido" → POST /api/pedidos
      - Servidor valida productos, recalcula precios
      - INSERT ordenes + INSERT pedidos (transacción)
  → clearCart() → redirect /pedido-confirmado?id=X
```

#### Panel de admin — pedidos
```
/admin/pedidos → listado con filtro por estado/cliente (paginado)
/admin/pedidos/[id] → detalle: info cliente, forma de pago, notas, ítems
  → Selector de estado → PUT /api/admin/pedidos/[id]
  → Actualiza ordenes.estado + todos los pedidos.estado vinculados
```

#### Formas de pago
| id | Etiqueta |
|---|---|
| `efectivo` | 💵 Efectivo contra entrega |
| `transferencia` | 🏦 Transferencia bancaria |
| `tarjeta` | 💳 Tarjeta de crédito / débito |

---

### 8. Catálogo de ferretería (`/ferreteria`)

15,756 productos importados desde `catalogo_prueba.csv` con `seccion = 'ferreteria'`.

**Páginas:**
- `/ferreteria` — Hero con stats + grid de categorías (Server Component, `getFerreteriaCategorias()`)
- `/ferreteria/[categoria]` — Lista paginada (50/pág) + sidebar de marcas + `Paginador`
- `/ferreteria/[categoria]/[producto]` — Detalle + `BtnAgregarCarrito` (si tiene precio)

**Paginación sin `useSearchParams`:**
```typescript
// Server Component computa baseHref y lo pasa al Paginador (Client Component)
const baseHref = `/ferreteria/${categoria}?${marca ? `marca=${marca}&` : ''}page=`;
// Paginador hace: <Link href={baseHref + pageNum}>
```

**Filtro de marca:**
`FiltrosMarca.tsx` usa `useRouter` + `usePathname` para navegar sin `useSearchParams`, evitando el requisito de Suspense boundary.

---

### 9. Buscador (debounced, real-time)

`Buscador.tsx` hace consultas PostgreSQL al escribir, **no** descarga un índice completo:

```
Keystroke → debounce 200ms → fetch /api/search?q=...
→ ILIKE '%q%' en nombre, categoria_nombre, marca (PostgreSQL: case-insensitive)
→ ORDER BY: primero los que empiezan por q, luego por longitud
→ máx 20 resultados
→ AbortController cancela fetch anterior si el usuario sigue escribiendo
```

`src/lib/searchIndex.ts` — solo exporta la interfaz `SearchItem`. La lógica vive en `api/search/route.ts`.

**Mínimo 2 caracteres** para disparar la consulta.

---

### 10. Panel de administración — `/admin`

**Flujo de autorización:**
1. `admin/layout.tsx` (Client) → verifica `isAdmin` desde `AuthContext`. Si no, redirige.
2. Cada API call envía `x-usuario-id`. El servidor corre `requerirAdmin()` → verifica en MySQL.

**Sidebar actual:**
- Dashboard → `/admin`
- Pedidos → `/admin/pedidos`
- Productos → `/admin/productos`
- Nuevo producto → `/admin/productos/nuevo`
- Importar CSV → `/admin/importar`
- Tips → `/admin/tips`

**Para activar el primer admin:**
```sql
-- En Supabase → SQL Editor
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```
(Luego cerrar sesión y volver a iniciar para actualizar el localStorage.)

**Dashboard:** llama `GET /api/admin/stats` (COUNT por sección, no descarga todos los productos).

**Admin productos:** paginado (50/pág), `AbortController` cancela fetch previo al cambiar filtros, `qInput`/`qActivo` split para evitar búsqueda on-every-keystroke.

---

### 11. Componente `BtnAgregarCarrito`

Client Component. Props: `{ id: string, nombre: string, precio: number, imagen?: string, opciones?: string }`

**Flujo:**
1. Click → abre modal overlay con animación
2. Modal muestra producto + selector de cantidad + subtotal calculado
3. "Cancelar" → cierra sin agregar
4. "Agregar al carrito" → `addToCart(item, cantidad)` + `openCart()` → cierra modal
5. Estado `confirmado` muestra ✅ por 900ms antes de cerrar

Usado actualmente en: `ferreteria/[categoria]/[producto]/page.tsx`.
Para usarlo en otras secciones: importar y pasar los 4-5 props.

---

### 12. Sistema de Tips y Tutoriales (`/tips`)

**Páginas públicas:**
- `/tips` — Grid de artículos desde `lib/tips.ts` → `getTips()` (solo activos). `dynamic = 'force-dynamic'`.
- `/tips/[slug]` — Detalle con renderizado de markdown básico (`**bold**`, párrafos). `dynamic = 'force-dynamic'`.

**Admin:**
- `/admin/tips` — Listado con búsqueda, botones: ver en sitio, editar, desactivar.
- `/admin/tips/nuevo` — Formulario 2 columnas: título, slug (auto-generado), descripción, imagen, contenido markdown, toggle activo.
- `/admin/tips/[id]` — Igual que nuevo pero pre-cargado desde la API.

**Funciones en `src/lib/tips.ts`:**
| Función | Descripción |
|---|---|
| `getTips()` | Lista todos los tips activos para páginas públicas |
| `getTipBySlug(slug)` | Tip por slug (público) |
| `getTipSlugs()` | Solo slugs (para fallback de rutas estáticas) |

**Tabla `tips` en PostgreSQL:**
```sql
id, slug (UNIQUE), titulo, descripcion, imagen (ruta /productos/tips/...), contenido (TEXT),
activo (SMALLINT DEFAULT 1), created_at, updated_at (trigger automático)
```

**Soft delete:** El DELETE del admin pone `activo = 0`, no elimina el registro.

---

### 13. Paginador (`components/Paginador.tsx`)

Recibe `{ page, pages, total, limit, baseHref }` desde un Server Component.
`baseHref` es el string de URL hasta `page=` (ej: `/ferreteria/p085?marca=truper&page=`).
Renderiza Links `<a>` sin `useSearchParams`. Muestra ventana de 5 páginas + primera/última.

---

### 14. Estilos — CSS Modules

**Sin Tailwind.** Variables globales en `globals.css`:

| Variable | Valor | Uso |
|---|---|---|
| `--azul-profundo` | `#011b4f` | Fondos oscuros principales |
| `--azul-oscuro` | `#21225e` | Header, títulos |
| `--azul-medio` | `#446ec2` | Textos secundarios |
| `--azul-boton` | `#3565c5` | Botones de acción |
| `--dorado` | `rgb(255,191,0)` | Acentos, botones primarios |
| `--fondo-claro` | `aliceblue` | Fondo de página |

**⚠️ Reglas críticas de `globals.css`:**
- `button { background: var(--azul-boton); margin: 15px auto 0; }` — Siempre sobrescribir en el módulo.
- `input { color: white !important; }` — En formularios sobre fondo claro, agregar `color: #1a1a1a !important` y `background: white` en el módulo CSS.
- `input::placeholder { color: rgba(255,255,255,0.7) !important; }` — Sobrescribir con `color: #aaa !important`.

---

### 14. Imágenes del catálogo (`lib/imagen.ts`)

Las imágenes viven en `public/productos/{seccion}/{categoria}/{archivo}`.  
En la BD se guarda la ruta relativa desde `/`: `/productos/concretos/clase-a/fc150.png`.

| Función | Propósito |
|---|---|
| `resolverImagenProducto(ref?)` | Normaliza cualquier referencia → ruta válida para `<Image>`. Devuelve `undefined` si vacío |
| `construirRutaImagen(seccion, cat, archivo)` | Construye `/productos/{seccion}/{cat}/{archivo}` |
| `esRutaImagenValida(ruta)` | Valida que la ruta sea `/productos/...` o URL `http(s)` |

---

### 15. Importación masiva de catálogo (`/admin/importar`)

El CSV `catalogo_prueba.csv` en la raíz del proyecto contiene **15,756 productos** con 26 columnas.

1. Admin va a `/admin/importar` → clic "Importar catálogo".
2. `POST /api/admin/importar` (header `x-usuario-id`).
3. Lee el CSV, procesa en lotes de 500, `INSERT ... ON CONFLICT (slug, seccion) DO UPDATE SET` con placeholders `$n` explícitos.
4. Todos los productos quedan con `seccion = 'ferreteria'`.

---

## Flujos principales

### Flujo del catálogo
```
/ferreteria → getFerreteriaCategorias() → grid de categorías
/ferreteria/[cat]?marca=X&page=2 → getProductosFerreteria({cat, marca, page}) → lista paginada
/ferreteria/[cat]/[prod] → getProducto('ferreteria', cat, prod) → detalle + BtnAgregarCarrito
```

### Flujo de autenticación
```
/login → POST /api/login → bcrypt.compare → devuelve user{id, nombre, correo, rol}
→ AuthContext.login(user) → localStorage → Header muestra nombre
```

### Flujo de carrito y compra
```
BtnAgregarCarrito → modal → addToCart(item, cantidad) → openCart()
→ CartDrawer → "Finalizar compra" → /checkout
→ Seleccionar forma de pago (requerida)
→ Llenar dirección y notas
→ POST /api/pedidos → transacción: INSERT ordenes + INSERT pedidos[]
→ clearCart() → /pedido-confirmado?id=X
```

### Flujo de buscador
```
Header → Buscador trigger → overlay
→ Keystroke → debounce 200ms → fetch /api/search?q=
→ LIKE en MySQL → máx 20 resultados
→ Clic resultado → router.push(href) → overlay cierra
```

### Flujo admin — gestión de pedidos
```
/admin/pedidos → GET /api/admin/pedidos?estado=&q=&page=
→ Clic orden → /admin/pedidos/[id]
→ GET /api/admin/pedidos/[id] → orden + items
→ Cambiar estado → PUT /api/admin/pedidos/[id] { estado }
→ UPDATE ordenes + UPDATE pedidos WHERE orden_id
→ Cliente ve el nuevo estado en /perfil → tab Compras
```

---

## Variables de entorno necesarias

Archivo: `.env.local` (no se sube al repo — ver `.env.example` como plantilla)

```env
# Base de datos Supabase (Session Pooler — puerto 5432)
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres

# Email (Resend)
RESEND_API_KEY=re_xxxxx           # Para envío de emails (contacto y cotización)
CONTACTO_EMAIL=email@empresa.com  # Destinatario de formularios (opcional, tiene fallback)
```

Sin `RESEND_API_KEY` los formularios responden `ok: true` y loguean en consola.  
Sin `DATABASE_URL` la app no puede conectarse a Supabase y lanzará error de conexión.

---

## Errores de TypeScript conocidos (pre-existentes, no bloquean build)

| Archivo | Error | Causa |
|---|---|---|
| `src/app/concretos/[categoria]/[producto]/page.tsx:29` | `Type 'string \| null \| undefined' not assignable to 'string \| undefined'` | `descripcion2` de la BD puede ser `null`. Fix: `descripcion2={p.descripcion2 ?? undefined}` — ya aplicado en ferretería, pendiente en concretos |
| `src/components/CalculadoraVolumen.tsx:114` | `Cannot find namespace 'JSX'` | Uso de JSX namespace legacy en React 19 |

---

## Errores de hidratación conocidos — SOLUCIÓN APLICADA

| Extensión | Atributo inyectado | Fix |
|---|---|---|
| Katalon Recorder | `katalonextensionid` | `suppressHydrationWarning` en `<html>` en `layout.tsx` |
| ColorZilla | `cz-shortcut-listen` | `suppressHydrationWarning` en `<body>` en `layout.tsx` |

---

## Historial de cambios relevantes

### Sesión 4 — Correcciones post-migración

**10. Correcciones después de conectar Supabase:**
- `src/lib/db.ts`: cambiado `RETURNING id` → `RETURNING *` para soportar tablas sin columna `id` (ej: `materiales_categorias` usa `slug` como PK). Se extrae `rows?.[0]?.id ?? null` del resultado.
- `src/app/registro/page.tsx`: reemplazado por redirect a `/login` — el formulario completo vive en `/login` (tabs Login/Registro con campos: nombre, correo, password, edad, profesión, domicilio, colonia, ciudad, estado, fecha de nacimiento).
- `src/app/supabase-schema.sql`: tabla `usuarios` actualizada con columnas extra: `edad SMALLINT`, `domicilio VARCHAR(255)`, `colonia VARCHAR(100)`, `ciudad VARCHAR(100)`, `estado VARCHAR(100)`, `fecha_nacimiento DATE`, `profesion VARCHAR(100)` + ALTER TABLE IF NOT EXISTS incluidos.
- `src/app/api/login/route.ts`: comentario "XAMPP" eliminado.
- **Pooler URL correcta**: el host del Session Pooler es `aws-1-us-west-1.pooler.supabase.com` (no `aws-0`). La región del proyecto es `us-west-1`.
- `Base de datos.txt` es el schema MySQL original — **obsoleto**, solo valor histórico. El schema activo es `supabase-schema.sql`.

---

### Sesión 3 — Migración a Supabase (PostgreSQL)

**8. Base de datos migrada de MySQL/XAMPP a Supabase/PostgreSQL:**
- Driver `mysql2` reemplazado por `pg` (node-postgres).
- `src/lib/db.ts` reescrito: shim de compatibilidad que convierte `?` → `$n`, agrega `RETURNING *` a INSERTs (no `RETURNING id`), preserva la API mysql2 (tuplas `[rows, meta]`, transacciones `getConnection`).
- `src/lib/seed.ts`: 3 `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE SET EXCLUDED.col`.
- `src/app/api/admin/importar/route.ts`: placeholders explícitos `$n` para bulk INSERT + `ON CONFLICT ... DO UPDATE SET`.
- `.env.local` creado con `DATABASE_URL` apuntando al proyecto Supabase.
- `.env.example` creado como plantilla de referencia.
- `src/app/supabase-schema.sql` creado: schema PostgreSQL completo (todas las tablas + índices + triggers + seed de tips) listo para ejecutar en Supabase SQL Editor.

**9. Sistema de Tips y Tutoriales:**
- Migrado de datos estáticos en `data/tips.ts` a tabla `tips` en PostgreSQL.
- `src/lib/tips.ts`: funciones `getTips()`, `getTipBySlug()`, `getTipSlugs()`.
- `src/app/tips/page.tsx`: grid dinámico desde BD (antes estático).
- `src/app/tips/[slug]/page.tsx`: detalle dinámico con `dynamic = 'force-dynamic'`.
- `src/app/api/admin/tips/route.ts`: GET paginado + POST crear.
- `src/app/api/admin/tips/[id]/route.ts`: GET + PUT + DELETE (soft, activo=0).
- `src/app/admin/tips/page.tsx`: listado con búsqueda, acciones editar/ver/desactivar.
- `src/app/admin/tips/nuevo/page.tsx`: formulario con auto-slug + preview de imagen + toggle activo.
- `src/app/admin/tips/[id]/page.tsx`: igual que nuevo, pre-cargado desde API.
- `src/styles/adminTips.module.css`: layout 2 columnas, sideCard sticky.
- `src/styles/tips.module.css`: estilos para páginas públicas.
- `admin/layout.tsx`: enlace "Tips" agregado al sidebar.

---

### Sesión 2 — Sistema de ventas completo

**1. Sistema de pedidos con `ordenes`:**
- Nueva tabla `ordenes` (agrupa ítems del carrito). `pedidos` ahora tiene `orden_id` (FK).
- Campo `metodo_pago` en `ordenes`: `efectivo` | `transferencia` | `tarjeta`.
- `api/pedidos/route.ts` reescrito: crea `ordenes` → `pedidos` en una transacción, recalcula precios desde BD.
- `api/perfil/route.ts` actualizado: devuelve órdenes agrupadas en vez de pedidos individuales.
- `perfil/page.tsx` actualizado: tab Compras muestra órdenes (nº orden, ítems, total, estado).

**2. Flujo de checkout:**
- `Cart.tsx`: botón "Finalizar compra" ahora navega a `/checkout` (antes llamaba la API directamente).
- `checkout/page.tsx`: dos columnas — lista de productos (izq) + resumen con formas de pago, dirección, notas y botón confirmar (der). Requiere seleccionar forma de pago.
- `pedido-confirmado/page.tsx`: pantalla de éxito con número de orden.

**3. BtnAgregarCarrito con modal:**
- Modal de confirmación antes de agregar al carrito: imagen, nombre, precio, selector de cantidad 1–99, subtotal, aviso de verificación.
- `CartContext.addToCart` ahora acepta segundo argumento `cantidad?: number`.
- Al confirmar: `addToCart(item, cantidad)` + `openCart()` → drawer del carrito se abre.

**4. Admin — gestión de pedidos:**
- `api/admin/pedidos/route.ts`: lista paginada con join a usuarios.
- `api/admin/pedidos/[id]/route.ts`: detalle + PUT para cambiar estado (cascada a `pedidos`).
- `admin/pedidos/page.tsx`: tabla con filtro por estado/cliente + paginador.
- `admin/pedidos/[id]/page.tsx`: detalle con info del cliente, forma de pago, ítems, selector de estado.
- `admin/layout.tsx`: enlace "Pedidos" agregado al sidebar.

**5. Ferretería pública:**
- `app/ferreteria/page.tsx`: hero + grid de categorías con totales desde BD.
- `app/ferreteria/[categoria]/page.tsx`: lista paginada + filtro de marca en sidebar.
- `app/ferreteria/[categoria]/[producto]/page.tsx`: detalle + `BtnAgregarCarrito` + info (marca, unidad, precio).
- `components/Paginador.tsx`: paginador Link-based sin `useSearchParams`.
- `components/ferreteria/FiltrosMarca.tsx`: filtro de marca client-side con `useRouter`.
- `lib/productos.ts`: nuevas funciones `getFerreteriaCategorias`, `getFerreteriaMarcas`, `getProductosFerreteria`.
- `data/navigation.ts`: enlace "Ferretería" agregado al menú.

**6. Buscador optimizado:**
- `Buscador.tsx` reescrito: debounce 200ms + AbortController + LIKE en PostgreSQL. No descarga índice completo.
- `api/search/route.ts` reescrito: `WHERE nombre ILIKE $1 OR categoria_nombre ILIKE $1 OR marca ILIKE $1 LIMIT 20`.
- `lib/searchIndex.ts` simplificado: solo exporta la interfaz `SearchItem`.

**7. Admin dashboard y productos:**
- `api/admin/stats/route.ts`: COUNT por sección (no descarga todos los productos).
- `admin/page.tsx` reescrito: stats dinámicas por sección, `statCardDestacado`, `statCardWarn`.
- `admin/productos/page.tsx`: paginación (50/pág), AbortController, sección Ferretería en filtros.
- `api/admin/productos/route.ts`: paginación server-side + búsqueda por `codigo_interno`.

---

## Estado actual del proyecto ✅

### Migración a Supabase — COMPLETADA

- **Conexión activa**: `aws-1-us-west-1.pooler.supabase.com:5432` (Session Pooler)
- **Project ID**: `hykrbwzmavpenprwqsqi`
- **Password BD**: `fercadinext1`
- **Schema ejecutado**: ✅ (tablas creadas en Supabase)
- **`/api/admin/seed`**: pendiente de correr tras completar registro + admin

### Pasos restantes para dejar 100% operativa:

1. **Ejecutar ALTER TABLE usuarios** en Supabase SQL Editor (columnas extra del registro):
   ```sql
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS edad             SMALLINT;
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS domicilio        VARCHAR(255);
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS colonia          VARCHAR(100);
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ciudad           VARCHAR(100);
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado           VARCHAR(100);
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
   ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS profesion        VARCHAR(100);
   ```

2. **Registrar cuenta** en `/registro` (redirige a `/login`) o `/login` tab Registro.

3. **Activar admin** en Supabase SQL Editor:
   ```sql
   UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
   ```

4. **Cargar catálogo base**: visitar `GET /api/admin/seed`

5. **Importar ferretería**: ir a `/admin/importar` → "Importar catálogo" (15k+ productos del CSV)

6. **Opcional — desinstalar mysql2**:
   ```bash
   npm uninstall mysql2
   ```

## Tareas pendientes de código

1. **Fix TypeScript en concretos:** `src/app/concretos/[categoria]/[producto]/page.tsx:29` — cambiar `descripcion2={p.descripcion2}` a `descripcion2={p.descripcion2 ?? undefined}`.

2. **`BtnAgregarCarrito` en otras secciones** — actualmente solo en ferretería. Para habilitarlo en concretos/acabados: importar el componente y pasar `id={String(p.id)}`, `nombre`, `precio`, `imagen`.

3. **`Base de datos.txt`** — archivo MySQL obsoleto en `src/app/`. Puede eliminarse; el schema activo es `src/app/supabase-schema.sql`.

7. **Opcional:** desinstalar mysql2 cuando la migración esté confirmada:
   ```bash
   npm uninstall mysql2
   ```

### Pendientes de código:

8. **Fix TypeScript en concretos:** `src/app/concretos/[categoria]/[producto]/page.tsx:29` — cambiar `descripcion2={p.descripcion2}` a `descripcion2={p.descripcion2 ?? undefined}`.

9. **`BtnAgregarCarrito` en otras secciones** — actualmente solo en ferretería. Para habilitarlo en concretos/acabados: importar el componente en las páginas de detalle correspondientes y pasar `id={String(p.id)}`, `nombre`, `precio`, `imagen`.