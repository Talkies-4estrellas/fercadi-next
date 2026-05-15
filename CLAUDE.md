# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ Advertencia de versión

Este proyecto usa **Next.js 16.2.4** con **React 19**. Las APIs, convenciones y estructura de archivos pueden diferir del conocimiento de entrenamiento. Consultar `node_modules/next/dist/docs/` antes de escribir código nuevo.

---

## Descripción del proyecto

**FERCADI / Josman Texturizados** — Sitio web de catálogo y ventas de materiales de construcción (concretos, acabados texturizados, materiales generales). Permite a usuarios explorar productos, cotizar, contactar, registrarse, iniciar sesión, agregar productos al carrito y ver su historial en un perfil personal.

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
│   │   └── api/
│   │       ├── login/route.ts      # POST — valida credenciales con bcrypt
│   │       ├── registro/route.ts   # POST — crea usuario, hashea password
│   │       ├── contacto/route.ts   # POST — envía email vía Resend
│   │       ├── cotizacion/route.ts # POST — envía cotización vía Resend
│   │       ├── pedidos/route.ts    # POST — guarda items del carrito en DB
│   │       ├── perfil/route.ts     # GET  — devuelve pedidos/servicios/suscripciones
│   │       ├── search/route.ts     # GET  — índice de búsqueda desde MySQL
│   │       └── admin/seed/route.ts # GET  — puebla la BD con el catálogo completo
│   │
│   ├── components/
│   │   ├── Header.tsx              # Header sticky con nav, buscador, carrito y usuario
│   │   ├── Footer.tsx
│   │   ├── ClientProviders.tsx     # Wrapper 'use client': AuthProvider + CartProvider + CartDrawer
│   │   ├── Buscador.tsx            # Buscador spotlight — fetcha /api/search al primer uso
│   │   ├── Cart.tsx                # Drawer lateral del carrito de compras
│   │   ├── ProductoDetalle.tsx     # Layout detalle de producto (2 columnas)
│   │   ├── ProductCard.tsx         # Tarjeta con selector de opción y botón agregar al carrito
│   │   ├── Carousel.tsx            # Carrusel del home
│   │   ├── CalculadoraVolumen.tsx  # Calculadora de volumen de concreto
│   │   ├── ColorPicker.tsx         # Selector de color decorativo
│   │   └── ContactForm.tsx         # Formulario de contacto
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
│   │   └── seed.ts                 # seedDatabase() — datos inline, sin dependencias .ts
│   │
│   └── styles/
│       ├── header.module.css
│       ├── footer.module.css
│       ├── home.module.css
│       ├── product.module.css      # Catálogo + detalle (.detalle, .detalleTitulo, etc.)
│       ├── perfil.module.css
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
  ├── tabla: productos           → concretos y acabados (textucos)
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
| `getProductosPorCategoria(seccion, categoriaSlug)` | Todos los productos de una categoría |
| `getProducto(seccion, categoriaSlug, slug)` | Un producto por sus tres identificadores |
| `getMaterialesCategorias()` | Todas las categorías de materiales con sus marcas |
| `getCategoriaMaterial(slug)` | Una categoría de materiales por slug |

**Importante:** estas funciones usan `db` directamente → solo llamarlas desde **Server Components** o **API Routes**. Nunca desde Client Components.

#### Esquema de la tabla `productos`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | INT AUTO_INCREMENT | PK |
| `nombre` | VARCHAR(255) | Nombre visible |
| `slug` | VARCHAR(255) | Segmento de URL. UNIQUE por `(slug, seccion)` |
| `descripcion` | TEXT | Descripción principal |
| `descripcion2` | TEXT | Segunda descripción (algunos concretos) |
| `precio` | DECIMAL(10,2) | Default 0.00 |
| `imagen_url` | VARCHAR(500) | Ruta local `/productos/...` o URL externa |
| `seccion` | ENUM | `'concretos'` \| `'textucos'` \| `'materiales'` |
| `categoria_slug` | VARCHAR(100) | Ej: `'adhesivos'`, `'clase-a'` |
| `categoria_nombre` | VARCHAR(255) | Ej: `'Morteros y Afinadores'` — para mostrar en UI |
| `activo` | BOOLEAN | Solo se muestran los activos (`activo = 1`) |

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
| `AuthContext` | `fercadi_user` | `user {id, nombre, correo}`, `login()`, `logout()` |
| `CartContext` | `fercadi_cart` | `cart[]`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `isOpen`, `openCart()`, `closeCart()` |

**No hay sesiones reales (JWT/cookies httpOnly).** La autenticación es solo `localStorage`. Al hacer login el API devuelve el objeto usuario y el frontend lo guarda.

---

### 5. API Routes
Todas en `src/app/api/*/route.ts`. Patrón consistente: reciben JSON, usan `db`, devuelven `NextResponse.json()`.

| Ruta | Método | Propósito |
|---|---|---|
| `/api/login` | POST | Valida credenciales con bcrypt |
| `/api/registro` | POST | Crea usuario, hashea password |
| `/api/contacto` | POST | Envía email vía Resend |
| `/api/cotizacion` | POST | Envía cotización vía Resend |
| `/api/pedidos` | POST | Guarda ítems del carrito en DB |
| `/api/perfil` | GET | Devuelve pedidos/servicios/suscripciones del usuario |
| `/api/search` | GET | Índice de búsqueda desde MySQL (`getDynamicSearchIndex`) |
| `/api/admin/seed` | GET | Puebla la BD con el catálogo completo |

---

### 6. Base de datos (MySQL — XAMPP)
**Host:** localhost · **Usuario:** root · **Password:** (vacío) · **DB:** `josman_db`

| Tabla | Propósito |
|---|---|
| `usuarios` | Registro con bcrypt. Campos: nombre, correo, password, edad, domicilio, colonia, ciudad, estado, profesion, fecha_nacimiento |
| `productos` | Catálogo completo de concretos y acabados. Ver §2 para columnas |
| `materiales_categorias` | Categorías de materiales con marcas en JSON |
| `pedidos` | Ítems del carrito confirmados. Estado: pendiente/procesando/completado/cancelado |
| `servicios_contratados` | Servicios contratados por usuario |
| `suscripciones` | Planes de suscripción con fecha inicio/fin |

**SQL completo:** `src/app/Base de datos.txt` — incluye `CREATE TABLE` y `INSERT` seed para todas las tablas. Ejecutar desde phpMyAdmin para instalación desde cero.

---

### 7. Estilos — CSS Modules
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

### 8. Buscador
`Buscador.tsx` es un Client Component. Arquitectura lazy:

1. Al **primer abrir** → `fetch('/api/search')` → guarda el índice en `useState` (la ref `indexLoaded` evita re-fetches).
2. **`/api/search`** (Server Route) → llama `getDynamicSearchIndex()` que lee la tabla `productos` de MySQL.
3. Filtra en memoria (mínimo 2 caracteres), agrupa resultados por sección, resalta coincidencias con `<mark>`.

**Archivos:**
- `src/components/Buscador.tsx` — UI del buscador
- `src/lib/searchIndex.ts` — solo `getDynamicSearchIndex()`, sin fallback estático
- `src/app/api/search/route.ts` — endpoint GET

---

### 9. Componente de detalle de producto
`ProductoDetalle.tsx` es un **Server Component** reutilizado por todas las páginas de detalle.

Props: `{ nombre, descripcion, descripcion2?, imagen, categoria, breadcrumb: React.ReactNode }`

Layout: 2 columnas — izquierda (badge de categoría + título con borde dorado + descripción + botones Cotizar/Contactar), derecha (imagen con drop-shadow).

---

## Flujos principales

### Flujo del catálogo
```
Usuario visita /concretos
→ ConcretosPage (Server Component)
→ getCategorias('concretos') → SELECT DISTINCT categoria_slug, categoria_nombre FROM productos
→ renderiza tarjetas de categorías

Usuario abre /concretos/clase-a
→ getProductosPorCategoria('concretos', 'clase-a') → SELECT * FROM productos WHERE ...
→ renderiza tarjetas de productos

Usuario abre /concretos/clase-a/fc150
→ getProducto('concretos', 'clase-a', 'fc150') → SELECT * FROM productos WHERE slug=...
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
→ "Finalizar compra" → POST /api/pedidos → INSERT pedidos[]
→ redirect /perfil
```

### Flujo de buscador
```
Header → <Buscador> trigger → overlay se abre
→ (primera vez) fetch('/api/search') → getDynamicSearchIndex() → MySQL
→ input onChange → filtra índice en memoria (mín. 2 chars)
→ clic resultado → router.push(href) → overlay cierra
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

### Migración a catálogo dinámico (última sesión)

**Qué se hizo:**
- Eliminados `src/data/concretos.ts`, `src/data/textucos.ts`, `src/data/materiales.ts`
- Creado `src/lib/productos.ts` con todas las funciones de consulta a MySQL
- Reescritas las 13 páginas del catálogo para leer de DB directamente (sin API intermediaria, al ser Server Components)
- Reescrito `src/lib/seed.ts` con datos embebidos inline (no depende de los .ts eliminados)
- Reescrito `src/lib/searchIndex.ts` sin fallback estático — solo MySQL
- Creados `src/app/api/search/route.ts` y `src/app/api/admin/seed/route.ts`
- Actualizado `src/app/Base de datos.txt` con esquema limpio final + seed completo

**Tablas nuevas añadidas a la BD:**
- `productos` — con columnas `descripcion2` y `categoria_nombre` (no estaban en el schema original)
- `materiales_categorias` — nueva tabla para la sección de materiales

**Si la BD fue creada con el schema antiguo**, ejecutar en phpMyAdmin:
```sql
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion2 TEXT AFTER descripcion;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_nombre VARCHAR(255) AFTER categoria_slug;
ALTER TABLE productos DROP INDEX slug;
ALTER TABLE productos ADD UNIQUE KEY unique_slug_seccion (slug, seccion);
ALTER TABLE productos MODIFY seccion ENUM('concretos','textucos','materiales') NOT NULL;

CREATE TABLE IF NOT EXISTS materiales_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    marcas JSON,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
Luego visitar `http://localhost:3000/api/admin/seed` para poblar/actualizar los datos.
