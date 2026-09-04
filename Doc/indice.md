# Índice del Proyecto — fercadi-next

Proyecto: Tienda en línea + panel admin de FERCADI  
Stack: Next.js 16 (App Router) · PostgreSQL (Supabase) · Vercel · CSS Modules

---

## Estructura raíz

| Ruta | Descripción |
|------|-------------|
| `src/app/` | Páginas y rutas (App Router) |
| `src/components/` | Componentes reutilizables |
| `src/styles/` | CSS Modules globales y por componente |
| `src/lib/` | Utilidades del servidor (DB, imágenes, etc.) |
| `src/context/` | Contextos React (Auth, Cart) |
| `src/data/` | Datos estáticos (navegación) |
| `src/types/` | Tipos TypeScript compartidos |
| `public/` | Activos estáticos (imágenes, íconos) |
| `Doc/` | Documentación del proyecto |

---

## Páginas públicas (`src/app/`)

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `page.tsx` | `/` | Home principal |
| `login/page.tsx` | `/login` | Inicio de sesión |
| `perfil/page.tsx` | `/perfil` | Perfil del usuario |
| `ferreteria/page.tsx` | `/ferreteria` | Catálogo ferretería |
| `ferreteria/[categoria]/page.tsx` | `/ferreteria/:cat` | Categoría de ferretería |
| `ferreteria/[categoria]/[producto]/page.tsx` | `/ferreteria/:cat/:prod` | Detalle producto ferretería |
| `materiales/[categoria]/page.tsx` | `/materiales/:cat` | Categoría de materiales |
| `concretos/[categoria]/page.tsx` | `/concretos/:cat` | Categoría de concretos |
| `concretos/[categoria]/[producto]/page.tsx` | `/concretos/:cat/:prod` | Detalle producto concreto |
| `textucos/page.tsx` | `/textucos` | Catálogo acabados |
| `textucos/[categoria]/page.tsx` | `/textucos/:cat` | Categoría textucos |
| `textucos/[categoria]/[producto]/page.tsx` | `/textucos/:cat/:prod` | Detalle producto textuco |
| `tips/page.tsx` | `/tips` | Blog de tips |
| `tips/[slug]/page.tsx` | `/tips/:slug` | Artículo de tip |

---

## Panel Admin (`src/app/admin/`)

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `page.tsx` | `/admin` | Dashboard |
| `productos/page.tsx` | `/admin/productos` | Lista de productos (con buscador flotante) |
| `productos/[id]/page.tsx` | `/admin/productos/:id` | Editar producto |
| `productos/nuevo/page.tsx` | `/admin/productos/nuevo` | Crear producto |
| `categorias/page.tsx` | `/admin/categorias` | Gestión de categorías |
| `pedidos/page.tsx` | `/admin/pedidos` | Lista de pedidos |
| `pedidos/[id]/page.tsx` | `/admin/pedidos/:id` | Detalle de pedido |
| `usuarios/page.tsx` | `/admin/usuarios` | Gestión de usuarios (listado paginado con filtro por rol) |
| `galeria/page.tsx` | `/admin/galeria` | Galería de imágenes Supabase + locales con paginación |
| `importar/page.tsx` | `/admin/importar` | Importación CSV multi-sección (ferretería / concretos / textucos / materiales) |
| `tips/page.tsx` | `/admin/tips` | Gestión de tips |
| `nav-config/page.tsx` | `/admin/nav-config` | Configuración de navegación |

---

## API Routes (`src/app/api/`)

| Ruta | Descripción |
|------|-------------|
| `/api/admin/productos` | CRUD productos (GET con filtros/paginación/búsqueda, POST) |
| `/api/admin/productos/[id]` | Editar / desactivar producto por ID |
| `/api/admin/categorias` | CRUD categorías |
| `/api/admin/pedidos` | CRUD pedidos |
| `/api/admin/usuarios` | CRUD usuarios |
| `/api/nav-config` | Leer/escribir configuración del navbar |
| `/api/auth/login` | Autenticación |
| `/api/auth/logout` | Cierre de sesión |
| `/api/carrito` | Gestión del carrito |
| `/api/pedido` | Crear pedido |

---

## Componentes (`src/components/`)

| Archivo | Descripción |
|---------|-------------|
| `Header.tsx` | Navbar principal (hamburguesa, submenús, carrito, admin) |
| `Buscador.tsx` | Buscador global de productos |
| `CartDrawer.tsx` | Panel lateral del carrito |
| `Footer.tsx` | Pie de página |

---

## Estilos (`src/styles/`)

| Archivo | Alcance |
|---------|---------|
| `globals.css` | Variables CSS y reset global |
| `header.module.css` | Navbar y submenús |
| `admin.module.css` | Panel de administración completo |

---

## Librerías (`src/lib/`)

| Archivo | Descripción |
|---------|-------------|
| `db.ts` | Pool PostgreSQL con compatibilidad mysql2 (? → $N, RETURNING) |
| `imagen.ts` | Resolución de URLs de imágenes de productos |
| `auth.ts` | Helpers de autenticación |

---

## Contextos (`src/context/`)

| Archivo | Estado gestionado |
|---------|-------------------|
| `AuthContext.tsx` | Usuario autenticado, rol admin, logout |
| `CartContext.tsx` | Ítems del carrito, conteo, apertura del drawer |

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL del Transaction Pooler de Supabase (puerto 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |

---

## Doc/

| Archivo / Carpeta | Descripción |
|-------------------|-------------|
| `Doc/indice.md` | Este archivo — mapa del proyecto |
| `Doc/memoria.md` | Convenciones de las sesiones de trabajo |
| `Doc/documentacion/` | Documentos técnicos específicos |
| `Doc/sesiones/` | Registros diarios de trabajo |
