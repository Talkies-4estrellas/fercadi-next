# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ Advertencia de versión

Este proyecto usa **Next.js 16.2.4** con **React 19**. Las APIs, convenciones y estructura de archivos pueden diferir del conocimiento de entrenamiento. Consultar `node_modules/next/dist/docs/` antes de escribir código nuevo.

---

## Descripción del proyecto

**FERCADI / Josman Texturizados** — Sitio web de catálogo y ventas de materiales de construcción (concretos, acabados texturizados, materiales generales, ferretería). Permite a usuarios explorar productos, cotizar, contactar, registrarse, iniciar sesión, agregar productos al carrito y ver su historial en un perfil personal.

**Stack:** Next.js 16 · React 19 · TypeScript · CSS Modules · MySQL (XAMPP) · bcrypt · mysql2 · Resend (email)

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
│   │   │
│   │   ├── login/page.tsx          # Login + Registro combinados (tabs)
│   │   ├── registro/page.tsx       # Página de registro independiente
│   │   ├── perfil/page.tsx         # Dashboard del usuario autenticado
│   │   ├── contacto/page.tsx       # Formulario de contacto
│   │   ├── cotizacion/page.tsx     # Formulario de cotización
│   │   │
│   │   ├── concretos/
│   │   │   ├── page.tsx                         # Lista categorías desde DB
│   │   │   ├── [categoria]/page.tsx             # Lista productos de la categoría desde DB
│   │   │   └── [categoria]/[producto]/page.tsx  # Detalle de producto desde DB
│   │   │
│   │   ├── textucos/               # "Acabados" en el menú de navegación
│   │   │   ├── page.tsx                         # Lista categorías desde DB
│   │   │   ├── [categoria]/page.tsx             # Lista productos de la categoría desde DB
│   │   │   ├── [categoria]/[producto]/page.tsx  # Detalle genérico (fallback)
│   │   │   ├── adhesivos/page.tsx               # Lista adhesivos (ruta directa)
│   │   │   ├── adhesivos/[producto]/page.tsx
│   │   │   ├── morteros/page.tsx
│   │   │   ├── morteros/[producto]/page.tsx
│   │   │   ├── selladores/page.tsx
│   │   │   ├── selladores/[producto]/page.tsx
│   │   │   ├── pinturas/page.tsx
│   │   │   ├── pinturas/[producto]/page.tsx
│   │   │   ├── especializados/page.tsx
│   │   │   └── especializados/[producto]/page.tsx
│   │   │
│   │   ├── materiales/
│   │   │   ├── page.tsx            # Lista categorías desde materiales_categorias
│   │   │   └── [categoria]/page.tsx  # Detalle con marcas (JSON de la BD)
│   │   │
│   │   ├── tips/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   │
│   │   ├── pie-de-pagina/[slug]/page.tsx
│   │   │
│   │   ├── Base de datos.txt       # SQL completo: schema + seed (ejecutar en phpMyAdmin)
│   │   │
│   │   ├── admin/                  # Backoffice — solo usuarios con rol='admin'
│   │   │   ├── layout.tsx          # Guard: redirige a /login si !user o !isAdmin
│   │   │   ├── page.tsx            # Dashboard con estadísticas del catálogo
│   │   │   ├── importar/page.tsx   # UI para importar catalogo_prueba.csv
│   │   │   └── productos/
│   │   │       ├── page.tsx        # Listado filtrable de todos los productos
│   │   │       ├── nuevo/page.tsx  # Formulario para crear producto
│   │   │       └── [id]/page.tsx   # Formulario para editar producto existente
│   │   │
│   │   └── api/
│   │       ├── login/route.ts              # POST — valida credenciales con bcrypt, devuelve rol
│   │       ├── registro/route.ts           # POST — crea usuario, hashea password
│   │       ├── contacto/route.ts           # POST — envía email vía Resend
│   │       ├── cotizacion/route.ts         # POST — envía cotización vía Resend
│   │       ├── pedidos/route.ts            # POST — guarda items del carrito en DB (transacción)
│   │       ├── perfil/route.ts             # GET  — devuelve pedidos/servicios/suscripciones
│   │       ├── productos/route.ts          # GET  — lista pública de productos (solo campos públicos)
│   │       ├── search/route.ts             # GET  — índice de búsqueda desde MySQL
│   │       └── admin/
│   │           ├── seed/route.ts           # GET  — puebla la BD con el catálogo completo
│   │           ├── importar/route.ts       # POST — importa catalogo_prueba.csv (15k+ productos)
│   │           ├── imagenes/route.ts       # GET  — lista imágenes en /public/productos/
│   │           ├── productos/route.ts      # GET list + POST create  (requiere admin)
│   │           └── productos/[id]/route.ts # GET + PUT + DELETE por id (requiere admin)
│   │
│   ├── components/
│   │   ├── Header.tsx              # Header sticky con nav, buscador, carrito y usuario
│   │   ├── Footer.tsx
│   │   ├── ClientProviders.tsx     # Wrapper 'use client': AuthProvider + CartProvider + CartDrawer
│   │   ├── Buscador.tsx            # Buscador spotlight — fetcha /api/search al primer uso
│   │   ├── Cart.tsx                # Drawer lateral del carrito de compras
│   │   ├── ProductoDetalle.tsx     # Layout detalle de producto (imagen opcional con fallback)
│   │   ├── ProductCard.tsx         # Tarjeta con selector de opción y botón agregar al carrito
│   │   ├── Carousel.tsx            # Carrusel del home
│   │   ├── CalculadoraVolumen.tsx  # Calculadora de volumen de concreto
│   │   ├── ColorPicker.tsx         # Selector de color decorativo
│   │   ├── ContactForm.tsx         # Formulario de contacto
│   │   └── admin/
│   │       └── ProductoForm.tsx    # Formulario crear/editar producto (con selector de imagen + campos comerciales)
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # user, login(), logout() — persiste en localStorage
│   │   └── CartContext.tsx         # cart[], addToCart(), removeFromCart(), updateQuantity(),
│   │                               # clearCart(), isOpen, openCart(), closeCart()
│   │
│   ├── data/                       # Solo datos NO relacionados al catálogo de productos
│   │   ├── navigation.ts           # Estructura del menú de navegación del header
│   │   └── tips.ts                 # Artículos de tutoriales y consejos
│   │   # ⚠️  concretos.ts, textucos.ts y materiales.ts fueron ELIMINADOS.
│   │   #     Todo el catálogo ahora viene de MySQL.
│   │
│   ├── lib/
│   │   ├── db.ts                   # Pool MySQL (mysql2/promise) → josman_db en XAMPP
│   │   ├── productos.ts            # Todas las funciones de consulta al catálogo (ver §2)
│   │   ├── searchIndex.ts          # getDynamicSearchIndex() — lee MySQL para el buscador
│   │   ├── seed.ts                 # seedDatabase() — datos inline, sin dependencias .ts
│   │   ├── admin.ts                # requerirAdmin(req) — valida rol='admin' en endpoints
│   │   └── imagen.ts               # resolverImagenProducto(), construirRutaImagen(), esRutaImagenValida()
│   │
│   └── styles/
│       ├── header.module.css
│       ├── footer.module.css
│       ├── home.module.css
│       ├── product.module.css      # Catálogo + detalle (.detalle, .detalleTitulo, etc.)
│       ├── perfil.module.css       # Dashboard del usuario (tabs, tabla, badges)
│       ├── admin.module.css        # Backoffice (sidebar, tabla, formulario, galería modal)
│       ├── cart.module.css
│       ├── buscador.module.css
│       ├── contact.module.css
│       ├── cotizacion.module.css
│       ├── carousel.module.css
│       ├── calculadora.module.css
│       └── colorpicker.module.css
│
├── public/
│   ├── images/                     # Logo, imágenes generales
│   ├── icons/                      # Íconos SVG de navegación
│   └── productos/                  # Imágenes del catálogo
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

---

### 2. Catálogo de productos — 100 % dinámico desde MySQL

> **Cambio importante (sesión anterior):** los archivos `src/data/concretos.ts`, `src/data/textucos.ts` y `src/data/materiales.ts` fueron **eliminados**. Todo el catálogo ahora vive en la base de datos.

**Agregar o editar un producto = INSERT/UPDATE en MySQL. No hay código que modificar.**

#### Flujo de datos del catálogo
```
MySQL josman_db
  ├── tabla: productos           → concretos, acabados (textucos) y ferretería
  └── tabla: materiales_categorias → materiales (categorías con marcas en JSON)
         ↓
  src/lib/productos.ts           → funciones de consulta directo a DB (sin API intermedia)
         ↓
  Server Components de catálogo  → renderizan en cada request (dinámicos por defecto)
```

#### Funciones disponibles en `src/lib/productos.ts`
| Función | Descripción |
|---|---|
| `getCategorias(seccion)` | Lista de categorías de una sección, en orden de inserción. Devuelve `{slug, nombre}[]` |
| `getProductosPorCategoria(seccion, categoriaSlug)` | Todos los productos de una categoría (solo campos públicos) |
| `getProducto(seccion, categoriaSlug, slug)` | Un producto por sus tres identificadores (solo campos públicos) |
| `getMaterialesCategorias()` | Todas las categorías de materiales con sus marcas |
| `getCategoriaMaterial(slug)` | Una categoría de materiales por slug |

**Importante:** estas funciones usan `db` directamente → solo llamarlas desde **Server Components** o **API Routes**. Nunca desde Client Components.

**Importante:** estas funciones usan `SELECT` con columnas **explícitas** (`PUBLIC_COLS`) — nunca `SELECT *` — para evitar filtrar datos comerciales al usuario normal.

#### Esquema completo de la tabla `productos`

**Campos base (visibles para todos los usuarios):**
| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT AUTO_INCREMENT | PK |
| `nombre` | VARCHAR(255) | Nombre visible |
| `slug` | VARCHAR(255) | Segmento de URL. UNIQUE por `(slug, seccion)` |
| `descripcion` | TEXT | Descripción principal |
| `descripcion2` | TEXT | Segunda descripción (algunos concretos) |
| `precio` | DECIMAL(10,2) | Precio público con IVA. Default 0.00 |
| `imagen_url` | VARCHAR(500) | Ruta local `/productos/...` o URL externa |
| `seccion` | ENUM | `'concretos'` \| `'textucos'` \| `'materiales'` \| `'ferreteria'` |
| `categoria_slug` | VARCHAR(100) | Ej: `'adhesivos'`, `'clase-a'`, `'p085'` |
| `categoria_nombre` | VARCHAR(255) | Nombre legible de la categoría |
| `stock` | INT | Default 0 |
| `activo` | BOOLEAN | Solo se muestran los activos (`activo = 1`) |
| `marca` | VARCHAR(100) | Marca del producto (del CSV, col 17) |
| `unidad` | VARCHAR(50) | Unidad de venta (del CSV, col 7) |

**Campos comerciales (solo admin — nunca devueltos por `lib/productos.ts`):**
| Columna | Fuente CSV | Notas |
|---|---|---|
| `codigo_interno` | col 0 | Código interno del proveedor |
| `ean` | col 8 | Código de barras (puede estar en notación científica) |
| `margen` | col 3 | Margen comercial |
| `caja` | col 4 | Unidades por caja (INT) |
| `master` | col 5 | Unidades por master (INT) |
| `alta_rotacion` | col 10 | TINYINT 0/1 |
| `precio_minimo` | col 9 | Precio mínimo de venta |
| `precio_mayoreo_con_iva` | col 11 | |
| `precio_distribuidor_con_iva` | col 12 | |
| `precio_publico_con_iva` | col 13 | = campo `precio` |
| `precio_mayoreo_sin_iva` | col 14 | |
| `precio_distribuidor_sin_iva` | col 15 | |
| `precio_publico_sin_iva` | col 16 | |
| `precio_medio_mayoreo_sin_iva` | col 18 | |
| `precio_medio_mayoreo_con_iva` | col 19 | |
| `codigo_sat` | col 20 | Clave SAT del producto |
| `descripcion_sat` | col 21 | Descripción SAT |
| `peso_kg` | col 24 | |
| `volumen_cm3` | col 25 | |

#### Separación público / admin
- **Usuarios normales:** `lib/productos.ts` y `api/productos/route.ts` usan `SELECT` explícito con solo los 13 campos públicos.
- **Admin:** `api/admin/productos/route.ts` usa `SELECT *` devolviendo todos los 32+ campos.

#### Esquema de la tabla `materiales_categorias`
| Columna | Tipo | Notas |
|---|---|---|
| `slug` | VARCHAR(100) UNIQUE | Segmento de URL |
| `nombre` | VARCHAR(255) | Nombre visible |
| `descripcion` | TEXT | Descripción de la categoría |
| `marcas` | JSON | Array `[{nombre, logo}]` |
| `activo` | BOOLEAN | |

#### Patrón de rutas del catálogo
```
/concretos/{categoria_slug}/{slug}      → seccion='concretos'
/textucos/{categoria_slug}/{slug}       → seccion='textucos'
/materiales/{slug}                      → materiales_categorias.slug (sin nivel de producto)
/ferreteria/...                         ← ⚠️ pendiente de crear frontend (solo admin por ahora)
```

#### Seed / primer arranque
Visitar con el servidor corriendo:
```
http://localhost:3000/api/admin/seed
```
Ejecuta `src/lib/seed.ts` → inserta/actualiza todos los productos y categorías de materiales con `ON DUPLICATE KEY UPDATE`. Seguro ejecutar múltiples veces.

El SQL completo (schema + seed) también está en `src/app/Base de datos.txt` para ejecutar desde phpMyAdmin.

---

### 3. Layout global
`layout.tsx` es Server Component. Envuelve todo con `<ClientProviders>`:

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
| `CartContext` | `fercadi_cart` | `cart[]`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `isOpen`, `openCart()`, `closeCart()` |

**No hay sesiones reales (JWT/cookies httpOnly).** La autenticación es solo `localStorage`. Al hacer login el API devuelve el objeto usuario (incluyendo `rol`) y el frontend lo guarda.

`isAdmin = user?.rol === 'admin'` — usado por `admin/layout.tsx` para el guard de la ruta.

---

### 5. API Routes
Todas en `src/app/api/*/route.ts`. Patrón consistente: reciben JSON, usan `db`, devuelven `NextResponse.json()`.

| Ruta | Método | Propósito |
|---|---|---|
| `/api/login` | POST | Valida credenciales con bcrypt, devuelve `{id, nombre, correo, rol}` |
| `/api/registro` | POST | Crea usuario, hashea password |
| `/api/contacto` | POST | Envía email vía Resend |
| `/api/cotizacion` | POST | Envía cotización vía Resend |
| `/api/pedidos` | POST | Guarda ítems del carrito en DB (con transacción, valida stock y activo) |
| `/api/perfil` | GET | Devuelve pedidos/servicios/suscripciones del usuario |
| `/api/productos` | GET | Lista pública de productos (solo campos públicos, sin datos comerciales) |
| `/api/search` | GET | Índice de búsqueda desde MySQL (`getDynamicSearchIndex`) |
| `/api/admin/seed` | GET | Puebla la BD con el catálogo completo |
| `/api/admin/importar` | POST 🔒 | Importa `catalogo_prueba.csv` a la tabla `productos` (sección `ferreteria`) |
| `/api/admin/imagenes` | GET 🔒 | Lista imágenes en `/public/productos/` por carpeta |
| `/api/admin/productos` | GET 🔒 | Listado con filtros `?seccion=&q=` (devuelve SELECT *) |
| `/api/admin/productos` | POST 🔒 | Crea producto nuevo |
| `/api/admin/productos/[id]` | GET / PUT / DELETE 🔒 | CRUD por id (DELETE = soft, activo=0) |

🔒 = requieren header `x-usuario-id` de un usuario con `rol = 'admin'` (`lib/admin.ts > requerirAdmin()`)

#### `POST /api/pedidos` — detalles importantes
- Usa **transacción MySQL** (`getConnection → beginTransaction → commit/rollback`).
- Por cada ítem: verifica que el producto exista y esté activo antes de insertar.
- Los IDs del carrito tienen formato `"5-Estándar"` (compuesto) — se extrae el número con `parseInt(String(item.id), 10)`.
- Inserta una fila por ítem en la tabla `pedidos` (no hay tabla `pedido_items`).

---

### 6. Base de datos (MySQL — XAMPP)
**Host:** localhost · **Usuario:** root · **Password:** (vacío) · **DB:** `josman_db`

| Tabla | Propósito |
|---|---|
| `usuarios` | Registro con bcrypt. Incluye `rol ENUM('usuario','admin')` — necesario para /admin |
| `productos` | Catálogo completo: concretos, acabados, ferretería. 32+ columnas (ver §2) |
| `materiales_categorias` | Categorías de materiales con marcas en JSON |
| `pedidos` | Ítems del carrito confirmados. Incluye `opciones`, `precio_unitario`, `total`, `estado` |
| `servicios_contratados` | Servicios contratados por usuario |
| `suscripciones` | Planes de suscripción con fecha inicio/fin |

**SQL completo:** `src/app/Base de datos.txt` — incluye `CREATE TABLE` y `INSERT` seed para todas las tablas. Ejecutar desde phpMyAdmin para instalación desde cero.

#### ALTER TABLE para bases de datos ya existentes
Si la BD fue creada antes de esta sesión, ejecutar en phpMyAdmin:
```sql
-- Expandir ENUM de sección para incluir ferretería
ALTER TABLE productos MODIFY seccion ENUM('concretos','textucos','materiales','ferreteria') NOT NULL;

-- Campos públicos nuevos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS marca VARCHAR(100) AFTER unidad;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS unidad VARCHAR(50) AFTER marca;

-- Campos comerciales admin-only
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(100) AFTER unidad,
  ADD COLUMN IF NOT EXISTS ean VARCHAR(100) AFTER codigo_interno,
  ADD COLUMN IF NOT EXISTS margen VARCHAR(50) AFTER ean,
  ADD COLUMN IF NOT EXISTS caja INT AFTER margen,
  ADD COLUMN IF NOT EXISTS master INT AFTER caja,
  ADD COLUMN IF NOT EXISTS alta_rotacion TINYINT(1) DEFAULT 0 AFTER master,
  ADD COLUMN IF NOT EXISTS precio_minimo DECIMAL(10,2) AFTER alta_rotacion,
  ADD COLUMN IF NOT EXISTS precio_mayoreo_con_iva DECIMAL(10,2) AFTER precio_minimo,
  ADD COLUMN IF NOT EXISTS precio_distribuidor_con_iva DECIMAL(10,2) AFTER precio_mayoreo_con_iva,
  ADD COLUMN IF NOT EXISTS precio_publico_con_iva DECIMAL(10,2) AFTER precio_distribuidor_con_iva,
  ADD COLUMN IF NOT EXISTS precio_mayoreo_sin_iva DECIMAL(10,2) AFTER precio_publico_con_iva,
  ADD COLUMN IF NOT EXISTS precio_distribuidor_sin_iva DECIMAL(10,2) AFTER precio_mayoreo_sin_iva,
  ADD COLUMN IF NOT EXISTS precio_publico_sin_iva DECIMAL(10,2) AFTER precio_distribuidor_sin_iva,
  ADD COLUMN IF NOT EXISTS precio_medio_mayoreo_sin_iva DECIMAL(10,2) AFTER precio_publico_sin_iva,
  ADD COLUMN IF NOT EXISTS precio_medio_mayoreo_con_iva DECIMAL(10,2) AFTER precio_medio_mayoreo_sin_iva,
  ADD COLUMN IF NOT EXISTS codigo_sat VARCHAR(50) AFTER precio_medio_mayoreo_con_iva,
  ADD COLUMN IF NOT EXISTS descripcion_sat VARCHAR(255) AFTER codigo_sat,
  ADD COLUMN IF NOT EXISTS peso_kg DECIMAL(10,3) AFTER descripcion_sat,
  ADD COLUMN IF NOT EXISTS volumen_cm3 DECIMAL(12,3) AFTER peso_kg;

-- Índices de rendimiento
ALTER TABLE productos
  ADD INDEX IF NOT EXISTS idx_codigo_interno (codigo_interno),
  ADD INDEX IF NOT EXISTS idx_marca (marca),
  ADD INDEX IF NOT EXISTS idx_categoria (seccion, categoria_slug);

-- Columna rol para usuarios admin
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol ENUM('usuario','admin') DEFAULT 'usuario' AFTER password;

-- Columnas nuevas en pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS opciones VARCHAR(255) AFTER producto,
  ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) AFTER cantidad;
```

---

### 7. Importación masiva de catálogo (`/admin/importar`)

El CSV `catalogo_prueba.csv` en la raíz del proyecto contiene **15,756 productos** con 26 columnas.

**Flujo:**
1. Admin va a `/admin/importar` y hace clic en "Importar".
2. Frontend `POST /api/admin/importar` con header `x-usuario-id`.
3. API lee el CSV con un parser propio (maneja comillas/comas internas), procesa en lotes de 500, hace `INSERT ... ON DUPLICATE KEY UPDATE` usando `(slug, seccion)` como clave única.
4. Todos los productos importados quedan con `seccion = 'ferreteria'`.
5. Responde `{ok, insertados, errores, duracion_ms, detalles[]}`.

**Mapeo de columnas del CSV:**
```
col 0  → codigo_interno     col 1  → slug (base)
col 2  → nombre             col 3  → margen
col 4  → caja               col 5  → master
col 7  → unidad             col 8  → ean
col 9  → precio_minimo      col 10 → alta_rotacion
col 11 → precio_mayoreo_iva col 12 → precio_distribuidor_iva
col 13 → precio_publico_iva (= campo precio)
col 14 → precio_mayoreo_sin col 15 → precio_distribuidor_sin
col 16 → precio_publico_sin col 17 → marca
col 18 → pmm_sin_iva        col 19 → pmm_con_iva
col 20 → codigo_sat         col 21 → descripcion_sat
col 22 → familia (→ categoria_slug)  col 23 → desc.familia (→ categoria_nombre)
col 24 → peso_kg            col 25 → volumen_cm3
```
Valores `*` o vacíos → `NULL`. EAN en notación científica se guarda tal cual como VARCHAR.

---

### 8. Estilos — CSS Modules
**Sin Tailwind.** Cada componente tiene su propio `.module.css`. Variables globales en `globals.css`:

| Variable | Valor | Uso |
|---|---|---|
| `--azul-profundo` | `#011b4f` | Fondos oscuros principales |
| `--azul-oscuro` | `#21225e` | Header, títulos |
| `--azul-medio` | `#446ec2` | Textos secundarios |
| `--azul-boton` | `#3565c5` | Botones de acción |
| `--dorado` | `rgb(255,191,0)` | Acentos, botones primarios, badges |
| `--fondo-claro` | `aliceblue` | Fondo de página |

**Regla crítica:** Cualquier `<button>` hereda estilos globales de `globals.css`. Siempre sobrescribir `background`, `color`, `margin` y `border-radius` explícitamente en el CSS del componente.

---

### 9. Buscador
`Buscador.tsx` es un Client Component. Arquitectura lazy:

1. Al **primer abrir** → `fetch('/api/search')` → guarda el índice en `useState` (la ref `indexLoaded` evita re-fetches).
2. **`/api/search`** (Server Route) → llama `getDynamicSearchIndex()` que lee la tabla `productos` de MySQL.
3. Filtra en memoria (mínimo 2 caracteres), agrupa resultados por sección, resalta coincidencias con `<mark>`.

**Archivos:**
- `src/components/Buscador.tsx` — UI del buscador
- `src/lib/searchIndex.ts` — solo `getDynamicSearchIndex()`, sin fallback estático
- `src/app/api/search/route.ts` — endpoint GET

---

### 10. Componente de detalle de producto
`ProductoDetalle.tsx` es un **Server Component** reutilizado por todas las páginas de detalle.

Props: `{ nombre, descripcion, descripcion2?: string | null, imagen?: string | null, categoria, breadcrumb: React.ReactNode }`

`imagen` es opcional: si es `null`/`undefined`/vacío, `resolverImagenProducto()` devuelve `undefined` y se muestra un placeholder con ícono en lugar de `<Image>`. Esto evita que productos sin imagen rompan la página.

Layout: 2 columnas — izquierda (badge de categoría + título con borde dorado + descripción + botones Cotizar/Contactar), derecha (imagen o placeholder).

---

### 11. Panel de administración — `/admin`
Ruta protegida solo para usuarios con `rol = 'admin'` en la tabla `usuarios`.

**Flujo de autorización:**
1. `admin/layout.tsx` (Client) → verifica `isAdmin` desde `AuthContext`. Si no, redirige a `/login` o `/`.
2. Cada API call de admin envía el header `x-usuario-id`. El servidor corre `requerirAdmin()` que verifica en MySQL que el usuario existe Y tiene `rol = 'admin'`. Sin esta verificación, cualquiera con un id podría llamar las APIs.

**Cómo crear el primer admin:**
```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```
(Luego cerrar y volver a iniciar sesión para que el localStorage se actualice con el nuevo rol.)

**Funcionalidades:**
- Dashboard con conteo de productos por sección
- Listado filtrable (por sección + búsqueda por texto)
- Crear producto nuevo — formulario con todas las columnas + galería de imágenes
- Editar producto existente — mismo formulario con datos precargados
- Desactivar producto (soft delete: `activo = 0`, el histórico de pedidos se preserva)
- Selector de imagen — abre galería de `/public/productos/` con filtro por carpeta
- **Importar CSV** — `/admin/importar` importa `catalogo_prueba.csv` masivamente

**Secciones disponibles en el formulario:**
`'concretos'` | `'textucos'` | `'materiales'` | `'ferreteria'`

**Campos del formulario (`ProductoForm.tsx`):**
- Básicos: nombre, slug, descripcion, descripcion2, imagen_url, seccion, categoria_slug, categoria_nombre, precio, activo, marca, unidad
- Comerciales (en sección `<details>` colapsable): codigo_interno, ean, margen, caja, master, alta_rotacion, precio_minimo, todos los precios con/sin IVA, codigo_sat, descripcion_sat, peso_kg, volumen_cm3

---

### 12. Imágenes del catálogo (`lib/imagen.ts`)
**Convención:**  
Las imágenes viven en `public/productos/{seccion}/{categoria}/{archivo}.png`.  
En la BD se guarda la ruta relativa empezando con `/`: `/productos/concretos/clase-a/fc150.png`.

| Función | Propósito |
|---|---|
| `resolverImagenProducto(ref?)` | Normaliza cualquier referencia → ruta válida para `<Image>`. Devuelve `undefined` si vacío |
| `construirRutaImagen(seccion, cat, archivo)` | Construye `/productos/{seccion}/{cat}/{archivo}` |
| `esRutaImagenValida(ruta)` | Valida que la ruta sea `/productos/...` o URL `http(s)` |

`ProductCard.tsx` y `ProductoDetalle.tsx` usan `resolverImagenProducto`. Para URLs externas (CDN), agregar el host a `next.config.ts > images.remotePatterns`.

---

## Flujos principales

### Flujo del catálogo
```
Usuario visita /concretos
→ ConcretosPage (Server Component)
→ getCategorias('concretos') → SELECT DISTINCT categoria_slug, categoria_nombre FROM productos
→ renderiza tarjetas de categorías

Usuario abre /concretos/clase-a
→ getProductosPorCategoria('concretos', 'clase-a') → SELECT <cols públicas> FROM productos WHERE ...
→ renderiza tarjetas de productos

Usuario abre /concretos/clase-a/fc150
→ getProducto('concretos', 'clase-a', 'fc150') → SELECT <cols públicas> FROM productos WHERE slug=...
→ ProductoDetalle renderiza el detalle
```

### Flujo de autenticación
```
/login → POST /api/login → bcrypt.compare → devuelve user{}
→ AuthContext.login(user) → localStorage → Header muestra nombre
→ redirect /
```

### Flujo de registro
```
/login (tab registro) → POST /api/registro → bcrypt.hash → INSERT usuarios
→ cambia a tab login
```

### Flujo de carrito
```
ProductCard.addToCart() → CartContext → localStorage
→ CartDrawer se abre automáticamente
→ "Finalizar compra" → POST /api/pedidos → INSERT pedidos[] (una fila por ítem, con transacción)
→ redirect /perfil
```

### Flujo de buscador
```
Header → <Buscador> trigger → overlay se abre
→ (primera vez) fetch('/api/search') → getDynamicSearchIndex() → MySQL
→ input onChange → filtra índice en memoria (mín. 2 chars)
→ clic resultado → router.push(href) → overlay cierra
```

### Flujo de importación CSV
```
Admin va a /admin/importar
→ clic "Importar catálogo"
→ POST /api/admin/importar (header x-usuario-id)
→ Lee catalogo_prueba.csv desde process.cwd()
→ Procesa en lotes de 500 con INSERT ... ON DUPLICATE KEY UPDATE
→ Muestra resultado: insertados, errores, duración
```

---

## Variables de entorno necesarias

```env
RESEND_API_KEY=re_xxxxx           # Para envío de emails (contacto y cotización)
CONTACTO_EMAIL=email@empresa.com  # Destinatario de formularios (opcional, tiene fallback)
```

Sin `RESEND_API_KEY` los formularios responden `ok: true` y loguean en consola.

---

## Errores de hidratación conocidos — SOLUCIÓN APLICADA

React lanza un hydration warning cuando una extensión del navegador modifica el HTML **antes** de que React hidrate. Fix: `suppressHydrationWarning` en el elemento afectado.

| Extensión | Atributo inyectado | Elemento | Fix aplicado en |
|---|---|---|---|
| Katalon Recorder | `katalonextensionid` | `<html>` | `layout.tsx` línea `<html>` |
| ColorZilla | `cz-shortcut-listen="true"` | `<body>` | `layout.tsx` línea `<body>` |

**Regla:** si aparece un nuevo warning del mismo tipo, agregar `suppressHydrationWarning` al elemento señalado en el stack trace dentro de `src/app/layout.tsx`. La prop solo suprime el warning en el elemento donde se aplica, no en sus hijos.

---

## Historial de cambios relevantes

### Sesión más reciente — Importación masiva de catálogo + nuevos campos

**1. Corrección de `api/pedidos/route.ts`:**
- El archivo tenía comentarios SQL (`--`) en TypeScript, referencia a tabla inexistente `pedido_items`, y `item.id` sin parsear.
- Fix: usa transacción MySQL correcta, valida cada producto contra la DB, extrae id con `parseInt(String(item.id), 10)`.

**2. Nuevas columnas en `productos` (21 columnas):**
- 2 públicas: `marca`, `unidad`
- 19 admin-only: todos los precios desglosados, `codigo_interno`, `ean`, `margen`, `caja`, `master`, `alta_rotacion`, `codigo_sat`, `descripcion_sat`, `peso_kg`, `volumen_cm3`
- Tabla `usuarios` ahora tiene `rol ENUM('usuario','admin')`
- Tabla `pedidos` ahora tiene `opciones` y `precio_unitario`

**3. Importador CSV (`/admin/importar`):**
- Nuevo endpoint `POST /api/admin/importar` con `maxDuration = 60`
- Parser CSV propio (sin librería) maneja comillas y comas internas
- Inserta en lotes de 500 con `ON DUPLICATE KEY UPDATE`
- Nueva página `/admin/importar` con UI de progreso y tabla de visibilidad de campos

**4. `ProductoForm.tsx` extendido:**
- `seccion` ahora incluye `'ferreteria'`
- Nuevos campos de `marca` y `unidad` en la sección básica
- Sección colapsable `<details>` con los 19 campos comerciales admin-only

**5. Separación público / admin:**
- `lib/productos.ts` usa `PUBLIC_COLS` (SELECT explícito) — nunca `SELECT *`
- `api/admin/productos` usa `SELECT *` — el admin ve todo

---

### Sesión anterior — Tres características nuevas

**1. Historial de pedidos en `/perfil`:**
- Tabla `pedidos` actualizada: añadidas columnas `opciones VARCHAR(255)` y `precio_unitario DECIMAL(10,2)`.
- `perfil/page.tsx` ya tenía la UI completa: tabla con columnas Producto, Opciones, Cantidad, Total, Estado, Fecha.

**2. Panel de administración `/admin`:**
- Tabla `usuarios` actualizada: añadida columna `rol ENUM('usuario','admin') DEFAULT 'usuario'`.
- Implementados: `admin/layout.tsx` (guard), `admin/page.tsx` (dashboard), listado, crear, editar.
- APIs: `GET|POST /api/admin/productos`, `GET|PUT|DELETE /api/admin/productos/[id]`, `GET /api/admin/imagenes`.
- Librerías: `lib/admin.ts`, `lib/imagen.ts`.
- **Para activar:** `UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';` → re-login.

**3. Imágenes conectadas a la BD:**
- `lib/imagen.ts` centraliza la convención de rutas de imágenes.
- `ProductCard.tsx` y `ProductoDetalle.tsx` usan `resolverImagenProducto()` — imagen opcional con fallback visual.

---

### Migración a catálogo dinámico (sesión más antigua)

- Eliminados `src/data/concretos.ts`, `src/data/textucos.ts`, `src/data/materiales.ts`
- Creado `src/lib/productos.ts` con todas las funciones de consulta a MySQL
- Reescritas las 13 páginas del catálogo para leer de DB directamente
- Reescrito `src/lib/seed.ts` con datos embebidos inline

---

## Tareas pendientes conocidas

1. **Ejecutar ALTER TABLE en phpMyAdmin** — si la BD fue creada antes de la sesión reciente, necesita los nuevos campos (ver §6).
2. **Frontend público para `/ferreteria`** — los 15k productos están en la DB pero no hay página de catálogo público para esa sección todavía (solo el admin los ve desde `/admin/productos`).
