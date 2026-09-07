# Base de Datos — FERCADI / Josman Texturizados

Referencia portátil de la estructura completa de la base de datos PostgreSQL (Supabase).
Sirve como guía de migración a cualquier otro servicio (Firebase, MongoDB, PocketBase, etc.)
o como documentación de la lógica de negocio.

**Motor actual:** PostgreSQL 15 en Supabase  
**Conexión:** `DATABASE_URL` en `.env.local` (pooler puerto 6543)  
**Adaptador propio:** `src/lib/db.ts` — convierte `?` → `$1 $2…` de izquierda a derecha  

---

## Índice de tablas

| # | Tabla | Registros aprox. | Notas clave |
|---|-------|-----------------|-------------|
| 1 | `usuarios` | ~10 | Auth propia; rol admin/usuario |
| 2 | `productos` | ~15 000 | Catálogo unificado (4 secciones) |
| 3 | `categorias` | ~400 | Árbol 2 niveles (grupos + subcats ferretería) |
| 4 | `materiales_categorias` | ~10 | PK texto (slug), sin id numérico |
| 5 | `pedidos` | variable | Ítems de carrito; referencia orden_id |
| 6 | `ordenes` | variable | Agrupa pedidos del mismo carrito |
| 7 | `comentarios_productos` | variable | Reviews con moderación |
| 8 | `tips` | ~5 | Artículos tipo blog |
| 9 | `home_cards` | 4 (fijo) | Tarjetas del inicio |
| 10 | `carousel_slides` | ~3 | Slides del carrusel |
| 11 | `servicios_contratados` | variable | Servicios de clientes |
| 12 | `suscripciones` | variable | Suscripciones de clientes |

---

## Tabla 1 — `usuarios`

Autenticación propia. Las contraseñas se guardan como hash bcrypt.

```sql
CREATE TABLE usuarios (
    id               SERIAL        PRIMARY KEY,
    nombre           VARCHAR(100)  NOT NULL,
    correo           VARCHAR(100)  NOT NULL UNIQUE,
    password         VARCHAR(255)  NOT NULL,          -- bcrypt hash
    rol              VARCHAR(10)   NOT NULL DEFAULT 'usuario'
                       CHECK (rol IN ('usuario','admin')),
    edad             SMALLINT,
    domicilio        VARCHAR(255),
    colonia          VARCHAR(100),
    ciudad           VARCHAR(100),
    estado           VARCHAR(100),
    fecha_nacimiento DATE,
    profesion        VARCHAR(100),
    created_at       TIMESTAMPTZ   DEFAULT NOW()
);
```

**Reglas de negocio:**
- `rol = 'admin'` → acceso al backoffice `/admin/*`
- El frontend guarda `{ id, nombre, correo, rol }` en `localStorage` (clave `fercadi_user`)
- Las APIs admin validan el header `x-usuario-id` con `requerirAdmin()` en `lib/admin.ts`
- Hacer admin: `UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com'`

**En NoSQL (documento por usuario):**
```json
{
  "id": 1,
  "nombre": "Miguel",
  "correo": "miguel@fercadi.com",
  "password": "$2b$10$...",
  "rol": "admin",
  "perfil": {
    "edad": 30,
    "domicilio": "Av. 5 de Mayo 123",
    "colonia": "Centro",
    "ciudad": "Guadalajara",
    "estado": "Jalisco",
    "fecha_nacimiento": "1994-06-15",
    "profesion": "Constructor"
  },
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## Tabla 2 — `productos`

Catálogo unificado de las 4 secciones del sitio. Una sola tabla con discriminador `seccion`.

```sql
CREATE TABLE productos (
    -- Identidad
    id                           SERIAL         PRIMARY KEY,
    nombre                       VARCHAR(255)   NOT NULL,
    slug                         VARCHAR(255)   NOT NULL,
    seccion                      VARCHAR(20)    NOT NULL
                                   CHECK (seccion IN ('concretos','textucos','materiales','ferreteria')),
    categoria_slug               VARCHAR(100)   NOT NULL DEFAULT '',
    categoria_nombre             VARCHAR(255)   NOT NULL DEFAULT '',
    activo                       SMALLINT       NOT NULL DEFAULT 1,  -- 1=visible, 0=eliminado (soft delete)

    -- Contenido público
    descripcion                  TEXT,
    descripcion2                 TEXT,           -- banda oscura bajo el detalle del producto
    precio                       NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
    imagen_url                   VARCHAR(500),   -- URL Supabase Storage (bucket: productos) o ruta local
    marca                        VARCHAR(100),
    unidad                       VARCHAR(50),    -- ej: "kg", "lt", "pza", "rollo"

    -- Campos comerciales (solo admin, nunca se exponen al público)
    codigo_interno               VARCHAR(100),
    ean                          VARCHAR(100),   -- código de barras
    margen                       VARCHAR(50),
    caja                         INT,            -- unidades por caja
    master                       INT,            -- cajas por master
    alta_rotacion                SMALLINT       DEFAULT 0,
    precio_minimo                NUMERIC(10,2),
    precio_mayoreo_con_iva       NUMERIC(10,2),
    precio_distribuidor_con_iva  NUMERIC(10,2),
    precio_publico_con_iva       NUMERIC(10,2),
    precio_mayoreo_sin_iva       NUMERIC(10,2),
    precio_distribuidor_sin_iva  NUMERIC(10,2),
    precio_publico_sin_iva       NUMERIC(10,2),
    precio_medio_mayoreo_sin_iva NUMERIC(10,2),
    precio_medio_mayoreo_con_iva NUMERIC(10,2),
    codigo_sat                   VARCHAR(50),
    descripcion_sat              VARCHAR(255),
    peso_kg                      NUMERIC(10,3),
    volumen_cm3                  NUMERIC(12,3),

    UNIQUE (slug, seccion)
);
```

**Índices activos:**
```sql
CREATE INDEX idx_productos_seccion   ON productos (seccion);
CREATE INDEX idx_productos_categoria ON productos (seccion, categoria_slug);
CREATE INDEX idx_productos_activo    ON productos (activo);
CREATE INDEX idx_productos_codigo    ON productos (codigo_interno);
CREATE INDEX idx_productos_marca     ON productos (marca);
```

**Secciones y sus rutas públicas:**
| `seccion` | Ruta en el sitio | Categorías |
|-----------|-----------------|------------|
| `concretos` | `/concretos` | Calculadora de volumen, servicios |
| `textucos` | `/textucos/{cat}/{slug}` | morteros, adhesivos, pinturas, selladores, especializados, servicios |
| `materiales` | `/materiales` | construccion, etc. |
| `ferreteria` | `/ferreteria/{cat}/{slug}` | ~400 subcategorías bajo 18 grupos |

**Columnas públicas expuestas (`PUBLIC_COLS`):**
```
id, nombre, slug, descripcion, descripcion2,
precio, imagen_url, seccion, categoria_slug, categoria_nombre, activo, marca, unidad
```

**Importación masiva:** vía `/admin/importar` — CSV de proveedor (ferretería: 26 columnas) o formato simple 8 columnas.

**Imágenes:** Supabase Storage bucket `productos`. Se suben convertidas a WebP (quality 85) vía Sharp.

**En NoSQL:** Se recomienda una colección `productos` con sub-colecciones por sección, o un campo de discriminación. Los campos comerciales podrían ir en un documento `productos_admin/{id}` separado.

---

## Tabla 3 — `categorias`

Árbol de 2 niveles. Grupos padre (`parent_id IS NULL`) + subcategorías hijas.

```sql
CREATE TABLE categorias (
    id          SERIAL        PRIMARY KEY,
    seccion     VARCHAR(30)   NOT NULL,
    slug        VARCHAR(80)   NOT NULL,
    nombre      VARCHAR(120)  NOT NULL,
    descripcion TEXT,
    orden       INTEGER       NOT NULL DEFAULT 0,
    activo      SMALLINT      NOT NULL DEFAULT 1,
    parent_id   INTEGER       REFERENCES categorias(id) ON DELETE SET NULL,
    created_at  TIMESTAMP     DEFAULT NOW(),

    UNIQUE (seccion, slug)
);
```

**Estructura de ferretería (los 18 grupos padre):**
| slug | nombre |
|------|--------|
| `herramientas-manuales` | Herramientas manuales |
| `herramientas-de-corte` | Herramientas de corte |
| `medicion-y-trazo` | Medición y trazo |
| `maquinas-portatiles` | Máquinas portátiles |
| `jardin-y-agricultura` | Jardín y agricultura |
| `accesorios-para-maquinas` | Accesorios para máquinas |
| `electricidad` | Electricidad |
| `plomeria` | Plomería |
| `gas-y-calefaccion` | Gas y calefacción |
| `cerrajeria` | Cerrajería |
| `seguridad-personal` | Seguridad personal (EPP) |
| `fijaciones-y-amarre` | Fijaciones y amarre |
| `pintura-y-acabados` | Pintura y acabados |
| `almacenaje-y-transporte` | Almacenaje y transporte |
| `hogar-y-bano` | Hogar y baño |
| `mallas-y-lonas` | Mallas y lonas |
| `exhibidores` | Exhibidores |
| `miscelaneos` | Misceláneos |

**Uso en el código:** `getFerreteriaGrupos()` en `src/lib/productos.ts` hace JOIN con `productos` para calcular totales.

---

## Tabla 4 — `materiales_categorias`

Categorías de la sección Materiales. **Sin columna `id` numérico** — la PK es el `slug` (texto).

```sql
CREATE TABLE materiales_categorias (
    slug        VARCHAR(100)  PRIMARY KEY,
    nombre      VARCHAR(255)  NOT NULL,
    descripcion TEXT,
    marcas      JSONB         DEFAULT '[]'::jsonb,  -- array de { nombre, logo }
    activo      SMALLINT      NOT NULL DEFAULT 1
);
```

**Estructura de `marcas` (JSONB):**
```json
[
  { "nombre": "Holcim", "logo": "/logos/holcim.png" },
  { "nombre": "Cruz Azul", "logo": "/logos/cruzazul.png" }
]
```

**Importante:** `ORDER BY nombre ASC` — no hay `ORDER BY id` porque no hay id numérico.

---

## Tabla 5 — `pedidos`

Ítems individuales de un carrito. Varios pedidos pertenecen a una misma orden.

```sql
CREATE TABLE pedidos (
    id              SERIAL        PRIMARY KEY,
    orden_id        INT,                           -- FK lógica a ordenes.id (sin REFERENCES)
    usuario_id      INT,                           -- FK lógica a usuarios.id
    producto        VARCHAR(255)  NOT NULL,        -- nombre snapshot al momento de la compra
    opciones        VARCHAR(255),                  -- presentación elegida: "50 kg", "Azul Rey"
    cantidad        INT           NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10,2),                -- snapshot del precio
    total           NUMERIC(10,2),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado')),
    fecha           TIMESTAMPTZ   DEFAULT NOW()
);
```

**Nota:** `producto` guarda el nombre como texto (snapshot) para que el historial no se rompa si el producto se elimina o renombra.

---

## Tabla 6 — `ordenes`

Agrupa los ítems de un mismo carrito. Una orden → N pedidos.

```sql
CREATE TABLE ordenes (
    id                SERIAL        PRIMARY KEY,
    usuario_id        INT           NOT NULL,
    total             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado            VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado')),
    notas             TEXT,
    direccion_entrega TEXT,
    metodo_pago       VARCHAR(50),
    created_at        TIMESTAMPTZ   DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   DEFAULT NOW()   -- actualizado por trigger
);
-- Trigger: set_ordenes_updated_at → trigger_set_updated_at()
```

**Estados del flujo:** `pendiente → confirmado → en_preparacion → enviado → entregado`  
(o `cancelado` desde cualquier estado)

---

## Tabla 7 — `comentarios_productos`

Reviews de productos con sistema de moderación admin.

```sql
CREATE TABLE comentarios_productos (
    id           SERIAL      PRIMARY KEY,
    producto_id  INTEGER     NOT NULL,            -- FK lógica a productos.id
    usuario_id   INTEGER     NOT NULL,            -- FK lógica a usuarios.id
    nombre       VARCHAR(100) NOT NULL,           -- nombre snapshot del usuario
    comentario   TEXT        NOT NULL,
    calificacion SMALLINT    NOT NULL DEFAULT 5
                   CHECK (calificacion BETWEEN 1 AND 5),
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    aprobado     BOOLEAN     NOT NULL DEFAULT false  -- false = pendiente moderación
);
CREATE INDEX idx_comentarios_producto ON comentarios_productos (producto_id);
```

**Flujo de moderación:**
1. Usuario envía comentario → `aprobado = false`
2. Admin lo revisa en `/admin/comentarios`
3. Admin lo aprueba → `aprobado = true` → aparece en la ficha del producto
4. Admin puede ocultarlo de nuevo (toggle) o eliminarlo

**APIs:**
- `GET /api/comentarios?producto_id=X` → solo devuelve `aprobado = true`
- `GET /api/admin/comentarios` → todos, con filtros
- `PATCH /api/admin/comentarios/[id]` → `{ aprobado: boolean }`
- `DELETE /api/admin/comentarios/[id]`

---

## Tabla 8 — `tips`

Artículos tipo blog (consejos de construcción, tutoriales).

```sql
CREATE TABLE tips (
    id          SERIAL        PRIMARY KEY,
    slug        VARCHAR(255)  NOT NULL UNIQUE,
    titulo      VARCHAR(255)  NOT NULL,
    descripcion TEXT,                             -- resumen para cards y SEO
    imagen      VARCHAR(500),                     -- ruta o URL de imagen de portada
    contenido   TEXT,                             -- Markdown (parser en /tips/[slug])
    activo      SMALLINT      NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ   DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   DEFAULT NOW()
);
-- Trigger: set_tips_updated_at → trigger_set_updated_at()
```

**El contenido es Markdown.** Se parsea en el cliente con un parser propio (no hay librería externa).  
**Generación con IA:** `/admin/tips/nuevo` usa Groq (Llama 3.3 70B) para generar `{titulo, descripcion, contenido}`.

---

## Tabla 9 — `home_cards`

Exactamente 4 tarjetas en el inicio. Filas fijas, nunca se insertan ni eliminan.

```sql
CREATE TABLE home_cards (
    id          SERIAL       PRIMARY KEY,
    posicion    SMALLINT     NOT NULL UNIQUE CHECK (posicion BETWEEN 1 AND 4),
    titulo      VARCHAR(100) NOT NULL,
    descripcion TEXT         NOT NULL,
    btn_texto   VARCHAR(50)  NOT NULL DEFAULT 'Ver',
    btn_href    VARCHAR(255) NOT NULL DEFAULT '/'
);
```

**Seed:**
| pos | título | enlace |
|-----|--------|--------|
| 1 | CONCRETO | `/concretos` |
| 2 | RENTA DE EQUIPO | `/concretos/servicios` |
| 3 | COTIZACIÓN | `/cotizacion` |
| 4 | TEXTURIZADOS Y ADHESIVOS | `/textucos` |

---

## Tabla 10 — `carousel_slides`

Slides del carrusel de la página de inicio.

```sql
CREATE TABLE carousel_slides (
    id          SERIAL        PRIMARY KEY,
    orden       SMALLINT      NOT NULL DEFAULT 0,
    imagen_url  VARCHAR(500)  NOT NULL,
    alt         VARCHAR(255),
    titulo      VARCHAR(255),
    descripcion TEXT,
    slogan      VARCHAR(255),
    activo      SMALLINT      NOT NULL DEFAULT 1
);
```

---

## Tabla 11 — `servicios_contratados`

Registro de servicios vendidos a clientes.

```sql
CREATE TABLE servicios_contratados (
    id          SERIAL        PRIMARY KEY,
    usuario_id  INT,
    tipo        VARCHAR(100),
    descripcion TEXT,
    estado      VARCHAR(20)   DEFAULT 'activo'
                  CHECK (estado IN ('activo','completado','cancelado')),
    fecha       TIMESTAMPTZ   DEFAULT NOW()
);
```

---

## Tabla 12 — `suscripciones`

Planes de suscripción de clientes.

```sql
CREATE TABLE suscripciones (
    id           SERIAL       PRIMARY KEY,
    usuario_id   INT,
    plan         VARCHAR(100),
    estado       VARCHAR(20)  DEFAULT 'activa'
                   CHECK (estado IN ('activa','vencida','cancelada')),
    fecha_inicio DATE,
    fecha_fin    DATE
);
```

---

## Función y triggers auxiliares

```sql
-- Actualiza updated_at automáticamente en cada UPDATE
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicado a: ordenes, tips
```

---

## Relaciones entre tablas

```
usuarios
  ├── ordenes.usuario_id
  ├── pedidos.usuario_id
  ├── comentarios_productos.usuario_id
  ├── servicios_contratados.usuario_id
  └── suscripciones.usuario_id

ordenes
  └── pedidos.orden_id

productos
  ├── comentarios_productos.producto_id
  └── categorias (lógica: productos.categoria_slug = categorias.slug
                           AND productos.seccion = categorias.seccion)

categorias
  └── categorias.parent_id (auto-referencia: grupos padre → subcategorías)
```

**Nota:** Las FKs son lógicas (sin `REFERENCES` declarado) para evitar errores en importaciones masivas con datos de proveedores externos.

---

## Guía de migración a NoSQL (Firebase / MongoDB)

### Colecciones sugeridas

```
/usuarios/{uid}
/productos/{id}
/categorias/{id}
/materiales/{slug}
/ordenes/{id}
  /items/{itemId}          ← pedidos como subcolección
/comentarios/{id}          ← o como /productos/{id}/comentarios/{cid}
/tips/{slug}
/home_cards/{posicion}
/carousel_slides/{id}
/servicios/{id}
/suscripciones/{id}
```

### Mapeo de tipos

| PostgreSQL | Firebase/Firestore | MongoDB |
|------------|-------------------|---------|
| `SERIAL` | Auto-ID o `increment` field | `ObjectId` |
| `TIMESTAMPTZ` | `Timestamp` | `Date` |
| `NUMERIC(10,2)` | `number` (float) | `Decimal128` |
| `SMALLINT` (0/1 para booleano) | `boolean` | `Boolean` |
| `BOOLEAN` | `boolean` | `Boolean` |
| `JSONB` (`marcas`) | array de objetos | array |
| `CHECK (x IN (...))` | validación en reglas de seguridad | validación en schema |
| `UNIQUE` | índice único | índice único |

### Consideraciones especiales

**`productos` (tabla grande ~15k registros):**
- En Firestore: una colección plana con filtros. Los 27 campos comerciales podrían ir en un documento separado `/productos_admin/{id}` para no exponer márgenes.
- Paginación: usar `startAfter()` con cursor, no `offset`.
- Búsqueda de texto: Firestore no soporta ILIKE. Alternativas: Algolia, Typesense, o campo `nombre_lower` para búsquedas case-insensitive.

**`categorias` (árbol):**
- En Firestore: almacenar `parent_id` como string del doc padre. Para el árbol de ferretería (2 niveles), dos consultas son suficientes.
- Alternativa: desnormalizar los 18 grupos con sus subcategorías como un solo documento de configuración.

**`home_cards` (4 docs fijos):**
- Un solo documento `config/home` con un array de 4 objetos.

**`carousel_slides`:**
- Un documento `config/carousel` con array de slides ordenado por `orden`.

**`materiales_categorias` (PK texto):**
- En Firestore: el id del documento ES el slug. No se necesita campo id separado.

**Búsqueda con relevancia:**
- El proyecto usa CASE WHEN scoring (10/8/6/4/2/0) por nivel de coincidencia.
- En NoSQL: replicar con Algolia/Typesense (soportan scoring nativo) o almacenar un campo `search_tokens: string[]` con variantes del nombre para búsquedas `array-contains-any`.

---

## Scripts SQL para recrear todo desde cero

Orden de ejecución:

1. `src/app/supabase-schema.sql` — tablas 1-10 + seeds de home_cards, carousel, tips
2. `Doc/sql/categorias.sql` — tabla `categorias` + seed inicial desde `productos`
3. `Doc/sql/add_parent_id.sql` — columna `parent_id` + 18 grupos de ferretería
4. `Doc/sql/asignar_parent_id.sql` — asigna subcategorías a sus grupos padre

Luego ejecutar en Supabase (SQL Editor):
```sql
-- Tabla comentarios con moderación:
CREATE TABLE IF NOT EXISTS comentarios_productos (
  id           SERIAL PRIMARY KEY,
  producto_id  INTEGER NOT NULL,
  usuario_id   INTEGER NOT NULL,
  nombre       VARCHAR(100) NOT NULL,
  comentario   TEXT NOT NULL,
  calificacion SMALLINT NOT NULL DEFAULT 5 CHECK (calificacion BETWEEN 1 AND 5),
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  aprobado     BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_comentarios_producto ON comentarios_productos (producto_id);

-- Columna aprobado (si la tabla ya existía sin ella):
ALTER TABLE comentarios_productos
  ADD COLUMN IF NOT EXISTS aprobado BOOLEAN NOT NULL DEFAULT false;
```

Los productos e importaciones masivas se hacen desde `/admin/importar` (CSV).

---

## Datos que viven fuera de la DB

| Dato | Ubicación |
|------|-----------|
| Imágenes de productos | Supabase Storage — bucket `productos` |
| Imágenes estáticas (carrusel, tips) | `/public/images/`, `/public/productos/` |
| Catálogos PDF convertidos a WebP | `imagenes/CONCRETOS_CARTA_/pagina_*.webp` (43 imgs) |
| | `imagenes/CATALOGO TEXTUCOS_ACOMODO CARTA_final/pagina_*.webp` (49 imgs) |
| Variables de entorno | `.env.local` (local) + Vercel (producción) |

---

*Última actualización: 07-09-2026*
