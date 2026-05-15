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
│   │   │   ├── page.tsx            # Listado de categorías de concreto
│   │   │   ├── [categoria]/page.tsx        # Listado de productos por categoría
│   │   │   └── [categoria]/[producto]/page.tsx  # Detalle de producto
│   │   │
│   │   ├── textucos/               # "Acabados" en el menú de navegación
│   │   │   ├── page.tsx
│   │   │   ├── [categoria]/page.tsx
│   │   │   ├── [categoria]/[producto]/page.tsx  # Ruta genérica (fallback)
│   │   │   ├── morteros/[producto]/page.tsx     # Rutas específicas por categoría
│   │   │   ├── adhesivos/[producto]/page.tsx
│   │   │   ├── selladores/[producto]/page.tsx
│   │   │   ├── pinturas/[producto]/page.tsx
│   │   │   └── especializados/[producto]/page.tsx
│   │   │
│   │   ├── materiales/
│   │   │   ├── page.tsx
│   │   │   └── [categoria]/page.tsx
│   │   │
│   │   ├── tips/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   │
│   │   ├── pie-de-pagina/[slug]/page.tsx
│   │   │
│   │   └── api/                    # API Routes (solo POST/GET, no hay middleware)
│   │       ├── login/route.ts      # POST — valida credenciales con bcrypt
│   │       ├── registro/route.ts   # POST — crea usuario, hashea password
│   │       ├── contacto/route.ts   # POST — envía email vía Resend
│   │       ├── cotizacion/route.ts # POST — envía cotización vía Resend
│   │       ├── pedidos/route.ts    # POST — guarda items del carrito en DB
│   │       └── perfil/route.ts     # GET  — devuelve pedidos/servicios/suscripciones del usuario
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── Header.tsx              # Header sticky con nav, buscador, carrito y usuario
│   │   ├── Footer.tsx              # Footer del sitio
│   │   ├── ClientProviders.tsx     # Wrapper 'use client' que monta AuthProvider + CartProvider + CartDrawer
│   │   ├── Buscador.tsx            # Buscador tipo spotlight (overlay, búsqueda en tiempo real)
│   │   ├── Cart.tsx                # Drawer lateral del carrito de compras
│   │   ├── ProductoDetalle.tsx     # Layout de detalle de producto (dos columnas: info + imagen)
│   │   ├── ProductCard.tsx         # Tarjeta de producto con selector de opción y botón agregar al carrito
│   │   ├── Carousel.tsx            # Carrusel de imágenes del home
│   │   ├── CalculadoraVolumen.tsx  # Calculadora de volumen de concreto
│   │   ├── ColorPicker.tsx         # Selector de color decorativo
│   │   └── ContactForm.tsx         # Formulario de contacto
│   │
│   ├── context/                    # Estado global (React Context)
│   │   ├── AuthContext.tsx         # user, login(), logout() — persiste en localStorage
│   │   └── CartContext.tsx         # cart, addToCart(), removeFromCart(), updateQuantity(), clearCart(), isOpen — persiste en localStorage
│   │
│   ├── data/                       # Datos estáticos del catálogo (fuente de verdad)
│   │   ├── concretos.ts            # ~16 productos en 7 categorías
│   │   ├── textucos.ts             # ~38 productos en 5 categorías
│   │   ├── materiales.ts           # 6 categorías con marcas (DeWalt, Truper, etc.)
│   │   ├── navigation.ts           # Estructura del menú de navegación del header
│   │   └── tips.ts                 # Artículos de tutoriales y consejos
│   │
│   ├── lib/                        # Utilidades del servidor
│   │   ├── db.ts                   # Pool de conexión MySQL (mysql2/promise) → josman_db en XAMPP
│   │   └── searchIndex.ts          # Índice plano de todos los productos para el buscador (~60 ítems)
│   │
│   └── styles/                     # CSS Modules (uno por componente/sección)
│       ├── header.module.css
│       ├── footer.module.css
│       ├── home.module.css
│       ├── product.module.css      # Catálogo + detalle de producto (.detalle, .detalleTitulo, etc.)
│       ├── perfil.module.css       # Dashboard de usuario
│       ├── cart.module.css         # Drawer del carrito
│       ├── buscador.module.css     # Overlay del buscador
│       ├── contact.module.css
│       ├── cotizacion.module.css
│       ├── carousel.module.css
│       ├── calculadora.module.css
│       └── colorpicker.module.css
│
├── public/
│   ├── images/                     # Logo, imágenes generales
│   ├── icons/                      # Íconos SVG de navegación
│   └── productos/                  # Imágenes de productos organizadas por categoría
│       ├── concretos/
│       ├── adhesivos/
│       ├── mortero_y_afinadores/
│       ├── selladores/
│       ├── pinturas/
│       ├── especialisados/         # (typo intencional en el proyecto)
│       └── materiales/
│
├── CLAUDE.md                       # Este archivo
├── next.config.ts                  # allowedDevOrigins: ['192.168.1.23']
├── package.json
└── tsconfig.json
```

---

## Arquitectura y metodología

### 1. App Router (Next.js 16)
Todo el enrutamiento vive en `src/app/`. No existe directorio `pages/`. Las páginas son **Server Components** por defecto; se usa `'use client'` solo cuando se necesitan hooks o interactividad.

### 2. Datos del catálogo — estáticos en TypeScript
Los productos **no** vienen de una base de datos. Están hardcodeados en `src/data/*.ts`. Agregar un producto = editar el archivo `.ts` correspondiente. El índice de búsqueda (`searchIndex.ts`) se construye en tiempo de compilación a partir de estos mismos archivos.

**Patrón de ruta dinámica:**
```
/concretos/agregados/arena
    │          │       └─ producto.slug
    │          └─ categoria.slug
    └─ sección
```
Los slugs del archivo de datos deben coincidir exactamente con los segmentos de URL.

### 3. Layout global
`layout.tsx` es Server Component. Envuelve todo con `<ClientProviders>`, que es un Client Component que monta:
- `AuthProvider` — estado de sesión
- `CartProvider` — estado del carrito
- `CartDrawer` — siempre en el DOM, se muestra/oculta con `isOpen`

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

### 4. Estado global — React Context + localStorage
| Contexto | Persiste | Contiene |
|---|---|---|
| `AuthContext` | `localStorage` → `fercadi_user` | `user {id, nombre, correo}`, `login()`, `logout()` |
| `CartContext` | `localStorage` → `fercadi_cart` | `cart[]`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `isOpen`, `openCart()`, `closeCart()` |

**No hay sesiones reales (JWT/cookies httpOnly).** La autenticación es solo `localStorage`. Al hacer login el API devuelve el objeto usuario y el frontend lo guarda.

### 5. API Routes
Todas las rutas API viven en `src/app/api/*/route.ts`. Patrón consistente:
- Reciben JSON en el body
- Usan el pool `db` de `src/lib/db.ts` para MySQL
- Devuelven `NextResponse.json()`
- Las rutas de email (`contacto`, `cotizacion`) requieren `RESEND_API_KEY` en variables de entorno; si no existe, simulan éxito en desarrollo

### 6. Base de datos (MySQL — XAMPP)
**Host:** localhost · **Usuario:** root · **Password:** (vacío) · **DB:** `josman_db`

| Tabla | Propósito |
|---|---|
| `usuarios` | Registro con bcrypt. Campos extendidos: edad, domicilio, colonia, ciudad, estado, profesion, fecha_nacimiento |
| `pedidos` | Ítems del carrito confirmados. Estado: pendiente/procesando/completado/cancelado |
| `servicios_contratados` | Servicios contratados por usuario |
| `suscripciones` | Planes de suscripción con fecha inicio/fin |

El SQL de creación está en `src/app/Base de datos.txt`.

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

**Regla importante:** Cualquier botón (`<button>`) hereda estilos globales de `globals.css`. Al crear botones dentro de componentes se debe sobrescribir `background`, `color`, `margin` y `border-radius` explícitamente para evitar que el estilo global interfiera.

### 8. Buscador
`Buscador.tsx` es un Client Component con arquitectura de dos capas:

1. **Primera apertura** → hace `fetch('/api/search')` y guarda el índice en estado local (`indexLoaded` ref evita re-fetches).
2. **`/api/search` (GET)** → Server Route que llama a `getDynamicSearchIndex()` (MySQL). Si la BD está vacía o falla, cae al fallback `getStaticSearchIndex()` (datos estáticos de `src/data/*.ts`).
3. Filtra en memoria (mínimo 2 caracteres), agrupa por sección, resalta coincidencias con `<mark>`.

**Para poblar la BD por primera vez:** visitar `http://localhost:3000/api/admin/seed` con el servidor corriendo. Esto ejecuta `src/lib/seed.ts` que itera `concretos`, `textucos` y `materiales` e inserta con `ON DUPLICATE KEY UPDATE`.

**Archivos relacionados:**
- `src/lib/searchIndex.ts` — `getStaticSearchIndex()` + `getDynamicSearchIndex()`
- `src/lib/seed.ts` — función de seed para la BD
- `src/app/api/search/route.ts` — endpoint GET con fallback automático
- `src/app/api/admin/seed/route.ts` — endpoint GET para disparar el seed

### 9. Componente de detalle de producto
`ProductoDetalle.tsx` es un Server Component reutilizado por las **7 páginas** de detalle:
- `concretos/[categoria]/[producto]/page.tsx`
- `textucos/[categoria]/[producto]/page.tsx`
- `textucos/morteros|adhesivos|selladores|pinturas|especializados/[producto]/page.tsx`

Acepta `{ nombre, descripcion, descripcion2?, imagen, categoria, breadcrumb }`.

---

## Flujos principales

### Flujo de autenticación
```
/login → POST /api/login → bcrypt.compare → devuelve user{}
→ AuthContext.login(user) → localStorage → Header muestra nombre del usuario
→ redirect /
```

### Flujo de registro
```
/login (tab registro) → POST /api/registro → bcrypt.hash → INSERT usuarios
→ Cambia a tab login
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
→ (primera vez) fetch('/api/search') → intenta MySQL → fallback a datos estáticos
→ input onChange → filtra índice en memoria (mín. 2 chars)
→ clic resultado → router.push(href) → overlay cierra
```

---

## Variables de entorno necesarias

```env
RESEND_API_KEY=re_xxxxx        # Para envío de emails (contacto y cotización)
CONTACTO_EMAIL=email@empresa.com  # Destinatario de formularios (opcional, tiene fallback)
```

Sin `RESEND_API_KEY` los formularios de contacto y cotización responden `ok: true` y loguean en consola (comportamiento de desarrollo).

---

## Errores de hidratación conocidos — SOLUCIÓN APLICADA

React lanza un hydration warning cuando una extensión del navegador modifica el HTML **antes** de que React hidrate. Se solucionan con `suppressHydrationWarning` en el elemento afectado (no en sus hijos).

| Extensión culpable | Atributo inyectado | Elemento afectado | Solución aplicada |
|---|---|---|---|
| Katalon Recorder | `katalonextensionid` | `<html>` | `suppressHydrationWarning` en `<html>` en `layout.tsx` |
| ColorZilla | `cz-shortcut-listen="true"` | `<body>` | `suppressHydrationWarning` en `<body>` en `layout.tsx` |

**Regla:** si aparece un nuevo hydration warning por atributo desconocido en `<html>` o `<body>`, agregar `suppressHydrationWarning` al elemento señalado en el stack trace dentro de `src/app/layout.tsx`. Esta prop solo suprime warnings en el elemento donde se aplica, no en todo el árbol.
