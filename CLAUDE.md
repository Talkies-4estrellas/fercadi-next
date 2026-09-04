# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Instrucciones de flujo de trabajo

- **NO realizar commits** a menos que el usuario lo pida explícitamente.
- El servidor de desarrollo **siempre corre en `http://localhost:3000`** salvo que el usuario indique lo contrario. Usar esa URL para verificar cambios en el navegador.

---

## ⚠️ Advertencia de versión

Este proyecto usa **Next.js 16.2.4** con **React 19**. Las APIs, convenciones y estructura de archivos pueden diferir del conocimiento de entrenamiento.

---

## Descripción del proyecto

**FERCADI / Josman Texturizados** — Sitio web de catálogo y ventas de materiales de construcción (concretos, acabados texturizados, materiales generales, ferretería con 15k+ productos). Los usuarios pueden explorar el catálogo, buscar, agregar al carrito, confirmar pedidos con forma de pago, ver su historial, cotizar y contactar. Los admins gestionan productos, importan CSV, administran pedidos y crean tips con asistente de IA.

**Stack:** Next.js 16 · React 19 · TypeScript · CSS Modules · **PostgreSQL (Supabase)** · bcrypt · **pg** · Resend (email) · **Groq API / Llama 3.3 70B** (IA para tips)

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
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz: Header + Footer + ClientProviders
│   │   ├── page.tsx                # Home — Server Component, force-dynamic
│   │   │                           # Carga home_cards y carousel_slides desde Supabase
│   │   ├── globals.css             # Variables CSS globales y reset
│   │   │                           # ⚠️ globals.css tiene `input { color: white !important }`
│   │   │                           #    Siempre sobrescribir con !important en módulos de forms
│   │   ├── login/page.tsx          # Login + Registro combinados (tabs)
│   │   │                           # Campos registro: nombre, correo, password, edad, profesión,
│   │   │                           # domicilio, colonia, ciudad, estado, fecha_nacimiento
│   │   ├── registro/page.tsx       # Redirige a /login (no tiene UI propia)
│   │   │
│   │   ├── concretos/
│   │   │   ├── page.tsx
│   │   │   ├── [categoria]/page.tsx
│   │   │   └── [categoria]/[producto]/page.tsx  # ✅ BtnAgregarCarrito incluido
│   │   │
│   │   ├── textucos/               # "Acabados" en el menú de navegación
│   │   │   ├── page.tsx
│   │   │   ├── [categoria]/page.tsx
│   │   │   └── [categoria]/[producto]/page.tsx  # ✅ BtnAgregarCarrito incluido
│   │   │
│   │   ├── materiales/
│   │   │   ├── page.tsx
│   │   │   └── [categoria]/page.tsx
│   │   │
│   │   ├── ferreteria/
│   │   │   ├── page.tsx
│   │   │   └── [categoria]/
│   │   │       ├── page.tsx
│   │   │       └── [producto]/page.tsx  # ✅ BtnAgregarCarrito incluido
│   │   │
│   │   ├── tips/
│   │   │   ├── page.tsx            # force-dynamic, grid desde Supabase
│   │   │   └── [slug]/page.tsx     # force-dynamic, renderiza markdown
│   │   │
│   │   ├── supabase-schema.sql     # Schema PostgreSQL completo para Supabase SQL Editor
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Guard + sidebar
│   │   │   ├── page.tsx            # Dashboard con stats
│   │   │   ├── home/page.tsx       # Gestión de tarjetas del inicio y carrusel
│   │   │   ├── importar/page.tsx
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── tips/
│   │   │       ├── page.tsx
│   │   │       ├── nuevo/page.tsx  # ✅ Asistente IA (Groq) + preview Markdown
│   │   │       └── [id]/page.tsx   # ✅ Preview Markdown
│   │   ├── usuarios/page.tsx       # Gestión de roles admin↔usuario
│   │   ├── galeria/page.tsx        # Galería de imágenes Supabase + locales
│   │   │
│   │   └── api/
│   │       ├── login/route.ts
│   │       ├── registro/route.ts
│   │       ├── contacto/route.ts
│   │       ├── cotizacion/route.ts
│   │       ├── pedidos/route.ts
│   │       ├── perfil/route.ts
│   │       ├── productos/route.ts
│   │       ├── search/route.ts
│   │       └── admin/
│   │           ├── stats/route.ts
│   │           ├── seed/route.ts
│   │           ├── importar/route.ts
│   │           ├── imagenes/route.ts
│   │           ├── home/
│   │           │   ├── cards/route.ts          # GET + PUT — 4 tarjetas del inicio
│   │           │   └── carousel/
│   │           │       ├── route.ts            # GET + POST — slides del carrusel
│   │           │       └── [id]/route.ts       # PUT + DELETE — editar/eliminar slide
│   │           ├── productos/route.ts
│   │           ├── productos/[id]/route.ts
│   │           ├── tips/route.ts
│   │           ├── tips/[id]/route.ts
│   │           ├── tips/ia/route.ts            # ✅ POST — genera contenido con Gemini 1.5 Flash
│   │           ├── pedidos/route.ts
│   │           └── pedidos/[id]/route.ts
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ClientProviders.tsx
│   │   ├── Buscador.tsx
│   │   ├── Cart.tsx
│   │   ├── BtnAgregarCarrito.tsx   # Props: { id, nombre, precio, imagen?, opciones? }
│   │   ├── Paginador.tsx
│   │   ├── ProductoDetalle.tsx
│   │   ├── ProductCard.tsx
│   │   ├── Carousel.tsx            # Acepta slides: CarouselSlide[] como prop (dinámico)
│   │   ├── CalculadoraVolumen.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── ContactForm.tsx
│   │   ├── admin/ProductoForm.tsx
│   │   ├── admin/ImageUploader.tsx  # Zona drag & drop + click. onFile(file) → sube a /api/admin/upload → convierte a WebP
│   │   └── admin/MarkdownPreview.tsx # Parser Markdown → mismo render que tips/[slug]
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # user, isAdmin, login(), logout() — localStorage
│   │   └── CartContext.tsx         # cart[], addToCart(item, cantidad?), etc.
│   │
│   ├── lib/
│   │   ├── db.ts                   # Pool PostgreSQL (pg) → Supabase · shim mysql2
│   │   ├── productos.ts            # Consultas al catálogo de productos
│   │   ├── homeContent.ts          # getHomeCards(), getCarouselSlides(), getAllCarouselSlides()
│   │   ├── tips.ts                 # getTips(), getTipBySlug(), getTipSlugs()
│   │   ├── admin.ts                # requerirAdmin(req) — valida rol='admin'
│   │   ├── imagen.ts               # resolverImagenProducto(), construirRutaImagen()
│   │   ├── searchIndex.ts          # Solo exporta interfaz SearchItem
│   │   └── seed.ts                 # seedDatabase()
│   │
│   └── styles/
│       ├── globals.css
│       ├── admin.module.css
│       ├── adminHome.module.css    # Estilos del panel de inicio (tarjetas + carrusel admin)
│       ├── adminTips.module.css    # Estilos del formulario de tips + bloque .neurona* (IA)
│       ├── product.module.css      # ✅ Clases compartidas entre concretos, textucos y ferretería
│       │                           #    (.detalle, .detalleCarrito, .detalleExtra, etc.)
│       ├── ferreteria.module.css
│       └── ...resto de módulos
│
├── public/
│   ├── images/
│   └── productos/
│
├── catalogo_prueba.csv             # CSV fuente del catálogo de ferretería (15,756 productos)
├── CLAUDE.md
├── .env.local                      # Variables de entorno (NO subir al repo)
├── next.config.ts
└── tsconfig.json
```

---

## Arquitectura y metodología

### 1. App Router (Next.js 16)

**Patrón async params (Next.js 15+):**
```typescript
type Params = Promise<{ slug: string }>;
export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;  // SIEMPRE await params
}
```

### 2. Catálogo de productos — 100% dinámico desde PostgreSQL

> Los archivos `src/data/concretos.ts`, `src/data/textucos.ts` y `src/data/materiales.ts` fueron **eliminados**.

#### Funciones en `src/lib/productos.ts`
| Función | Descripción |
|---|---|
| `getCategorias(seccion)` | Categorías de una sección |
| `getProductosPorCategoria(seccion, categoriaSlug)` | Productos de una categoría (solo PUBLIC_COLS) |
| `getProducto(seccion, categoriaSlug, slug)` | Un producto por sus 3 identificadores |
| `getMaterialesCategorias()` | Categorías de materiales con marcas JSONB |
| `getFerreteriaCategorias()` | Categorías con conteo de productos |
| `getFerreteriaMarcas(categoriaSlug?)` | Marcas únicas en ferretería |
| `getProductosFerreteria({categoriaSlug?, marca?, q?, page?, limit?})` | Paginación server-side con relevancia cuando hay `q` |

### 3. Base de datos (PostgreSQL — Supabase)

**Driver:** `pg` (node-postgres) — **NO mysql2**
**Conexión:** Session Pooler, puerto 5432

#### Variables de entorno (`.env.local`)
```env
# Base de datos Supabase (Session Pooler — puerto 5432)
# ⚠️ Host correcto: aws-1-us-west-1.pooler.supabase.com (NO aws-0)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres

# Email (Resend)
RESEND_API_KEY=re_xxxxx
CONTACTO_EMAIL=contacto@josmantexturizados.com

# IA — Groq (Llama 3.3 70B) — https://console.groq.com/keys

```

#### Shim de compatibilidad (`src/lib/db.ts`)
- `?` → `$1, $2, $3…`
- `INSERT …` → añade `RETURNING *` (no `RETURNING id`) → extrae `rows?.[0]?.id ?? null`
- `db.getConnection()` → cliente para transacciones (`BEGIN/COMMIT/ROLLBACK`)

#### Tablas en Supabase
| Tabla | Propósito |
|---|---|
| `usuarios` | Registro con bcrypt. Rol: `usuario` \| `admin`. Incluye edad, domicilio, colonia, ciudad, estado, fecha_nacimiento, profesion |
| `productos` | Catálogo completo: concretos, acabados, ferretería. 32+ columnas |
| `materiales_categorias` | Categorías de materiales con marcas en `JSONB`. PK = `slug` (sin columna `id`) |
| `ordenes` | Una fila por carrito confirmado. Contiene total, estado, metodo_pago, dirección, notas |
| `pedidos` | Ítems individuales vinculados a una orden vía `orden_id` |
| `tips` | Tutoriales gestionados desde el admin. Soft delete (activo=0) |
| `home_cards` | 4 tarjetas fijas del inicio (posicion 1–4). Gestión desde `/admin/home` |
| `carousel_slides` | Slides del carrusel del home. Gestión desde `/admin/home` |
| `servicios_contratados` | Servicios por usuario |
| `suscripciones` | Planes con fecha inicio/fin |

**Schema completo:** `src/app/supabase-schema.sql` — ejecutar en Supabase → SQL Editor → New Query → Run.

#### Para activar el primer admin
```sql
-- En Supabase → SQL Editor
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```
Luego cerrar sesión y volver a iniciar para que localStorage se actualice.

---

### 4. Estado global — React Context + localStorage

| Contexto | Persiste en | Contiene |
|---|---|---|
| `AuthContext` | `fercadi_user` | `user {id, nombre, correo, rol}`, `isAdmin`, `login()`, `logout()` |
| `CartContext` | `fercadi_cart` | `cart[]`, `addToCart(item, cantidad?)`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `isOpen`, `openCart()`, `closeCart()` |

**Sin sesiones reales (JWT/cookies).** La autenticación es solo `localStorage`.

---

### 5. API Routes

| Ruta | Método | Propósito |
|---|---|---|
| `/api/login` | POST | Valida credenciales con bcrypt |
| `/api/registro` | POST | Crea usuario con bcrypt |
| `/api/contacto` | POST | Email vía Resend |
| `/api/cotizacion` | POST | Cotización vía Resend |
| `/api/pedidos` | POST | Crea orden + ítems en transacción PostgreSQL |
| `/api/perfil` | GET | Órdenes agrupadas + servicios del usuario |
| `/api/productos` | GET | Catálogo público (solo PUBLIC_COLS) |
| `/api/search` | GET | `?q=` → relevancia multi-nivel (exacto/starts/contains/cat/marca) + multi-palabra AND→OR, máx 20 |
| `/api/comentarios` | GET | Comentarios aprobados de un producto (`?producto_id=X`) |
| `/api/comentarios` | POST | Nuevo comentario (requiere `x-usuario-id`). `aprobado=false` por defecto |
| `/api/admin/stats` | GET 🔒 | COUNT por sección |
| `/api/admin/seed` | GET | Puebla BD con catálogo inicial |
| `/api/admin/importar` | POST 🔒 | Importa CSV (multipart: `file` + `seccion`). Ferretería: 26 cols proveedor. Otros: 8 cols simples |
| `/api/admin/home/cards` | GET / PUT 🔒 | Lee y actualiza las 4 tarjetas del inicio |
| `/api/admin/home/carousel` | GET / POST 🔒 | Lista slides / crea nuevo slide |
| `/api/admin/home/carousel/[id]` | PUT / DELETE 🔒 | Edita / elimina slide |
| `/api/admin/tips` | GET / POST 🔒 | Lista paginada / crea tip |
| `/api/admin/tips/[id]` | GET / PUT / DELETE 🔒 | CRUD (DELETE = soft activo=0) |
| `/api/admin/tips/ia` | POST 🔒 | Genera contenido con Groq Llama 3.3 70B |
| `/api/admin/productos` | GET / POST 🔒 | Lista paginada / crea producto |
| `/api/admin/productos/[id]` | GET / PUT / DELETE 🔒 | CRUD (DELETE = soft activo=0) |
| `/api/admin/pedidos` | GET 🔒 | Lista órdenes con filtros |
| `/api/admin/pedidos/[id]` | GET / PUT 🔒 | Detalle + cambiar estado (cascada a pedidos) |
| `/api/admin/imagenes` | GET 🔒 | Lista imágenes locales + Supabase Storage |
| `/api/admin/imagenes` | DELETE 🔒 | Elimina imagen de Supabase dado `{ ruta }` (URL pública) |
| `/api/admin/usuarios` | GET 🔒 | Lista paginada de usuarios con filtro por rol/búsqueda |
| `/api/admin/comentarios` | GET 🔒 | Lista paginada con filtros `aprobado` + búsqueda `q` |
| `/api/admin/comentarios/[id]` | PATCH 🔒 | Togglea `aprobado`. Body: `{ aprobado: boolean }` |
| `/api/admin/comentarios/[id]` | DELETE 🔒 | Elimina permanentemente un comentario |
| `/api/admin/upload` | POST 🔒 | Sube imagen → convierte a WebP → Supabase Storage |

🔒 = requieren header `x-usuario-id` de admin. Validado por `lib/admin.ts > requerirAdmin(req)`.

---

### 6. Secciones con BtnAgregarCarrito

El componente `BtnAgregarCarrito` está habilitado en las **3 secciones** de producto:
- `ferreteria/[categoria]/[producto]/page.tsx` ✅
- `concretos/[categoria]/[producto]/page.tsx` ✅
- `textucos/[categoria]/[producto]/page.tsx` ✅

**Patrón usado** (importar `pStyles` de `product.module.css`):
```typescript
import BtnAgregarCarrito from '@/components/BtnAgregarCarrito';
import pStyles from '@/styles/product.module.css';

// En el JSX — solo muestra si precio > 0:
{Number(p.precio) > 0 && (
  <section className={pStyles.detalleCarrito}>
    <BtnAgregarCarrito
      id={String(p.id)}
      nombre={p.nombre}
      precio={Number(p.precio)}
      imagen={p.imagen_url ?? undefined}
    />
  </section>
)}
```

Las clases CSS compartidas (`.detalleCarrito`, `.detalleExtra`, `.detalleExtraTitulo`, etc.) viven en `product.module.css`.

---

### 7. Gestión del Inicio desde Admin (`/admin/home`)

El Home (`page.tsx`) es un Server Component con `force-dynamic` que carga dos recursos de Supabase:

```typescript
// src/lib/homeContent.ts
getHomeCards()          // 4 tarjetas siempre activas (posicion 1–4)
getCarouselSlides()     // Solo slides con activo=1
getAllCarouselSlides()   // Todos (para el admin)
```

**Tarjetas:** 4 fijas (no se pueden crear ni eliminar). El admin edita título, descripción, texto del botón y href.

**Carrusel:** CRUD completo. Cada slide tiene `imagen_url`, `alt`, `titulo`, `descripcion`, `slogan`, `orden`, `activo`. El toggle oculta/muestra sin eliminar.

El `Carousel.tsx` acepta `slides: CarouselSlide[]` como prop y renderiza el overlay de texto solo si el slide tiene `titulo`, `descripcion` o `slogan`.

---

### 8. Asistente de IA para Tips (`/api/admin/tips/ia`)

**Endpoint:** `POST /api/admin/tips/ia`
**Body:** `{ tema: string }`
**Respuesta:** `{ ok, titulo, descripcion, contenido }` (contenido en Markdown)

**Flujo:**
1. Admin escribe un tema (ej: "Cómo aplicar estuco veneciano") en la barra de la neurona
2. El cliente llama a `POST /api/admin/tips/ia` con header `x-usuario-id`
3. El servidor valida admin con `requerirAdmin(req)` y llama a Gemini 1.5 Flash
4. Gemini responde con JSON `{ titulo, descripcion, contenido }` orientado a FERCADI
5. El formulario se rellena automáticamente (titulo, slug auto-generado, descripcion, contenido Markdown)
6. El admin puede revisar y corregir antes de publicar con "Publicar tip"

**Modelo:** `llama-3.3-70b-versatile` vía **Groq** (free tier real: 14,400 req/día, sin tarjeta)
**Nota:** Gemini fue descartado — eliminó el free tier para todas sus APIs en 2026 (limit: 0)
**Configuración:** `temperature: 0.7`, `maxOutputTokens: 2048`
**Limpieza:** el endpoint elimina bloques ` ```json ``` ` que Gemini a veces inyecta por error

**Estilos del bloque IA** en `adminTips.module.css`: clases `.neurona`, `.neuronaTitulo`, `.neuronaDesc`, `.neuronaRow`, `.neuronaInput`, `.neuronaBtn`.

---

### 9. Estilos — CSS Modules

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
- `input { color: white !important; }` — En formularios sobre fondo claro: `color: #1a1a1a !important` + `background: white`.
- `input::placeholder { color: rgba(255,255,255,0.7) !important; }` — Sobrescribir con `color: #aaa !important`.

---

### 10. Galería de imágenes admin (`/admin/galeria`)

Administrador de imágenes almacenadas en Supabase Storage y locales en `public/productos/`.

**API:** `GET /api/admin/imagenes` — lista todo; `DELETE /api/admin/imagenes` — elimina de Supabase dado `{ ruta }` (URL pública). Solo acepta URLs del bucket propio.

**UI:** grid con paginación (24/pág), filtro por carpeta, búsqueda por nombre, badge `local`/`supabase`, botón "Copiar URL" con feedback visual, modal de preview en grande, botón papelera (solo Supabase) con modal de confirmación.

**Componentes:** `src/app/admin/galeria/page.tsx`, `src/styles/adminGaleria.module.css`

**Helper:** `deleteFile(path)` añadido a `src/lib/supabaseStorage.ts`.

---

### 11. Sistema de Tips (`/tips`)

- `/tips` — Grid dinámico desde BD, `force-dynamic`.
- `/tips/[slug]` — Detalle con renderizado básico de Markdown.
- `/admin/tips` — Listado con búsqueda + acciones editar/ver/desactivar.
- `/admin/tips/nuevo` — Formulario con **asistente IA** + auto-slug + preview imagen + **toggle Editar/Vista previa Markdown**.
- `/admin/tips/[id]` — Igual que nuevo, pre-cargado, con toggle Editar/Vista previa.

**Componente de preview:** `src/components/admin/MarkdownPreview.tsx` — reutilizable, usa el mismo parser que la página pública (`tips/[slug]/page.tsx`) y los mismos estilos de `tips.module.css`.

**Toggle:** tabs "Editar" / "Vista previa" encima del textarea. En vista previa, el textarea se sustituye por `<MarkdownPreview texto={contenido} />`. Cambiar tab no borra el contenido.

**Soft delete:** `DELETE` pone `activo = 0`, no elimina el registro.

---

### 11. Flujos principales

#### Flujo compra
```
Producto → BtnAgregarCarrito (modal, selector cantidad)
→ addToCart(item, cantidad) → openCart() → CartDrawer
→ /checkout (forma de pago, dirección, notas)
→ POST /api/pedidos → transacción: INSERT ordenes + INSERT pedidos[]
→ clearCart() → /pedido-confirmado?id=X
```

#### Flujo autenticación
```
/login → POST /api/login → bcrypt.compare
→ AuthContext.login({ id, nombre, correo, rol })
→ localStorage fercadi_user → isAdmin = rol === 'admin'
```

#### Flujo generación de tip con IA
```
/admin/tips/nuevo → escribir tema en barra neurona
→ POST /api/admin/tips/ia { tema }
→ Groq Llama 3.3 70B → JSON { titulo, descripcion, contenido }
→ setTitulo / setSlug / setDescripcion / setContenido
→ Revisar y editar → POST /api/admin/tips { slug, titulo, descripcion, contenido, activo }
→ redirect /admin/tips
```

#### Flujo admin — pedidos
```
/admin/pedidos → filtrar por estado/cliente
→ /admin/pedidos/[id] → ver detalle
→ Cambiar estado → PUT /api/admin/pedidos/[id]
→ UPDATE ordenes + UPDATE pedidos WHERE orden_id
```

---

## Estado actual del proyecto ✅

### Conexión Supabase — ACTIVA
- **Host:** `aws-1-us-west-1.pooler.supabase.com:5432` (Session Pooler)
- **Project ID:** ver Supabase → Settings → General
- **Región:** `us-west-1` (West US, North California) — node index `1`, NO `0`

### Funcionalidades implementadas
| Funcionalidad | Estado |
|---|---|
| Catálogo dinámico desde Supabase | ✅ |
| Sistema de ventas completo (carrito → checkout → pedido) | ✅ |
| Panel de admin con CRUD de productos, pedidos, tips | ✅ |
| BtnAgregarCarrito en ferretería, concretos y textucos | ✅ |
| Gestión del inicio (tarjetas + carrusel) desde `/admin/home` | ✅ |
| Asistente IA para tips (Groq Llama 3.3 70B) | ✅ |
| Buscador global con relevancia multi-nivel + multi-palabra (Header, todas las páginas) | ✅ |
| Búsqueda con relevancia en Ferretería (`getProductosFerreteria`) | ✅ |
| Módulo de moderación de comentarios admin (`/admin/comentarios`) | ✅ |
| Importación masiva CSV (15,756 productos) | ✅ |
| Registro con campos completos (10 campos) | ✅ |
| Hero banner unificado (`SectionHero`) en todas las secciones | ✅ |
| Filtros dropdown horizontales en ferretería | ✅ |
| Sección Servicios en Acabados (`/textucos/servicios`) | ✅ |
| Gestión de categorías admin (concretos, textucos, materiales, ferretería) | ✅ |
| Filtro de categoría dinámico en `/admin/productos` | ✅ |
| Gestión de usuarios admin (`/admin/usuarios`) — listado paginado con filtro | ✅ |
| Galería de imágenes admin (`/admin/galeria`) — browse, copiar URL, eliminar Supabase | ✅ |
| Preview Markdown en editor de tips (tabs Editar/Vista previa) | ✅ |
| ImageUploader con drag & drop (PNG/JPG/WebP/AVIF/GIF → convierte a WebP) | ✅ |
| Importación CSV multi-sección (ferretería 26 cols / concretos·textucos·materiales 8 cols simples) | ✅ |

### Pasos pendientes para dejar 100% operativo
1. **Registrar cuenta** en `/login` tab Registro
2. **Activar admin** en Supabase SQL Editor:
   ```sql
   UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
   ```
3. **Cargar catálogo base**: visitar `GET /api/admin/seed`
4. **Importar catálogo**: `/admin/importar` → elegir sección → subir CSV → "Importar"
5. **Opcional — desinstalar mysql2**: `npm uninstall mysql2`

---

## Errores de TypeScript conocidos (pre-existentes)

| Archivo | Error | Estado |
|---|---|---|
| `src/app/concretos/[categoria]/[producto]/page.tsx` | `descripcion2` era `string \| null` sin `?? undefined` | ✅ Corregido |
| `src/components/CalculadoraVolumen.tsx:114` | `Cannot find namespace 'JSX'` | ⚠️ Pendiente (no bloquea build) |
