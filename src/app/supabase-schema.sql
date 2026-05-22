-- ============================================================
--  FERCADI / Josman Texturizados — Supabase (PostgreSQL)
--  Ejecutar en: Supabase → SQL Editor → New Query → Run
--  Seguro ejecutar varias veces (IF NOT EXISTS / IF NOT EXISTS)
-- ============================================================

-- ── Función reutilizable para updated_at automático ──────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. Usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id         SERIAL       PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    correo     VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(10)  NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario','admin')),
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 2. Productos (catálogo completo: concretos, textucos, ferretería)
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id                           SERIAL         PRIMARY KEY,
    nombre                       VARCHAR(255)   NOT NULL,
    slug                         VARCHAR(255)   NOT NULL,
    descripcion                  TEXT,
    descripcion2                 TEXT,
    precio                       NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
    imagen_url                   VARCHAR(500),
    seccion                      VARCHAR(20)    NOT NULL CHECK (seccion IN ('concretos','textucos','materiales','ferreteria')),
    categoria_slug               VARCHAR(100)   NOT NULL DEFAULT '',
    categoria_nombre             VARCHAR(255)   NOT NULL DEFAULT '',
    stock                        INT            NOT NULL DEFAULT 0,
    activo                       SMALLINT       NOT NULL DEFAULT 1,
    marca                        VARCHAR(100),
    unidad                       VARCHAR(50),
    -- Campos comerciales (solo admin)
    codigo_interno               VARCHAR(100),
    ean                          VARCHAR(100),
    margen                       VARCHAR(50),
    caja                         INT,
    master                       INT,
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

CREATE INDEX IF NOT EXISTS idx_productos_seccion  ON productos (seccion);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (seccion, categoria_slug);
CREATE INDEX IF NOT EXISTS idx_productos_activo    ON productos (activo);
CREATE INDEX IF NOT EXISTS idx_productos_codigo    ON productos (codigo_interno);
CREATE INDEX IF NOT EXISTS idx_productos_marca     ON productos (marca);

-- ============================================================
-- 3. Materiales (categorías con marcas en JSON)
-- ============================================================
CREATE TABLE IF NOT EXISTS materiales_categorias (
    slug        VARCHAR(100)  PRIMARY KEY,
    nombre      VARCHAR(255)  NOT NULL,
    descripcion TEXT,
    marcas      JSONB         DEFAULT '[]'::jsonb,
    activo      SMALLINT      NOT NULL DEFAULT 1
);

-- ============================================================
-- 4. Pedidos (ítems individuales — vinculados a una orden)
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id              SERIAL        PRIMARY KEY,
    orden_id        INT,
    usuario_id      INT,
    producto        VARCHAR(255)  NOT NULL,
    opciones        VARCHAR(255),
    cantidad        INT           NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10,2),
    total           NUMERIC(10,2),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado')),
    fecha           TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_orden   ON pedidos (orden_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos (usuario_id);

-- ============================================================
-- 5. Órdenes (agrupa ítems del mismo carrito)
-- ============================================================
CREATE TABLE IF NOT EXISTS ordenes (
    id                SERIAL        PRIMARY KEY,
    usuario_id        INT           NOT NULL,
    total             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado            VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado')),
    notas             TEXT,
    direccion_entrega TEXT,
    metodo_pago       VARCHAR(50),
    created_at        TIMESTAMPTZ   DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_usuario ON ordenes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado  ON ordenes (estado);

-- Trigger updated_at para ordenes
DROP TRIGGER IF EXISTS set_ordenes_updated_at ON ordenes;
CREATE TRIGGER set_ordenes_updated_at
  BEFORE UPDATE ON ordenes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- 6. Servicios contratados
-- ============================================================
CREATE TABLE IF NOT EXISTS servicios_contratados (
    id          SERIAL        PRIMARY KEY,
    usuario_id  INT,
    tipo        VARCHAR(100),
    descripcion TEXT,
    estado      VARCHAR(20)   DEFAULT 'activo' CHECK (estado IN ('activo','completado','cancelado')),
    fecha       TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- 7. Suscripciones
-- ============================================================
CREATE TABLE IF NOT EXISTS suscripciones (
    id           SERIAL       PRIMARY KEY,
    usuario_id   INT,
    plan         VARCHAR(100),
    estado       VARCHAR(20)  DEFAULT 'activa' CHECK (estado IN ('activa','vencida','cancelada')),
    fecha_inicio DATE,
    fecha_fin    DATE
);

-- ============================================================
-- 8. Tips y Tutoriales
-- ============================================================
CREATE TABLE IF NOT EXISTS tips (
    id          SERIAL        PRIMARY KEY,
    slug        VARCHAR(255)  NOT NULL UNIQUE,
    titulo      VARCHAR(255)  NOT NULL,
    descripcion TEXT,
    imagen      VARCHAR(500),
    contenido   TEXT,
    activo      SMALLINT      NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ   DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tips_activo ON tips (activo);

-- Trigger updated_at para tips
DROP TRIGGER IF EXISTS set_tips_updated_at ON tips;
CREATE TRIGGER set_tips_updated_at
  BEFORE UPDATE ON tips
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- 9. Seed inicial — Tip de Salitre
-- ============================================================
INSERT INTO tips (slug, titulo, descripcion, imagen, contenido, activo)
VALUES (
  'salitre',
  'Salitre en Paredes',
  'El salitre es un depósito de sales minerales que aparece en muros y paredes, causando deterioro estético y estructural. Aprende a identificarlo y eliminarlo.',
  '/productos/tips/salitre.jpg',
  E'El salitre, también conocido como eflorescencia, es causado por la migración de sales solubles a través del concreto o mampostería.\n\n**¿Por qué aparece?**\n- Humedad excesiva en los muros\n- Materiales de construcción con alto contenido de sales\n- Falta de impermeabilización adecuada\n\n**¿Cómo eliminarlo?**\n1. Cepilla la superficie afectada con un cepillo de cerdas duras\n2. Aplica una solución de agua con vinagre o ácido muriático diluido\n3. Enjuaga con abundante agua limpia\n4. Deja secar completamente\n5. Aplica un sellador o impermeabilizante para prevenir recurrencia\n\n**Recomendación FERCADI:** Usa nuestro sellador Ipermax para una protección duradera contra la humedad y el salitre.',
  1
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Notas de uso:
--   · Para hacer admin: UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
--   · El seed de productos/materiales se hace desde /api/admin/seed
--   · La importación masiva del CSV se hace desde /admin/importar
-- ============================================================
