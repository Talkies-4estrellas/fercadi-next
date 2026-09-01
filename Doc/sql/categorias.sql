-- ════════════════════════════════════════════════════════════════
--  Tabla `categorias`  —  PostgreSQL / Supabase
--  Pegar completo en el SQL Editor de Supabase y ejecutar.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL       PRIMARY KEY,
  seccion     VARCHAR(30)  NOT NULL,
  slug        VARCHAR(80)  NOT NULL,
  nombre      VARCHAR(120) NOT NULL,
  descripcion TEXT,
  orden       INTEGER      NOT NULL DEFAULT 0,
  activo      SMALLINT     NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    DEFAULT NOW(),

  UNIQUE (seccion, slug)
);

-- ── Migración inicial: copia las categorías existentes de productos ─
INSERT INTO categorias (seccion, slug, nombre, orden)
SELECT
  seccion,
  categoria_slug                                                          AS slug,
  MAX(categoria_nombre)                                                   AS nombre,
  (ROW_NUMBER() OVER (PARTITION BY seccion ORDER BY MIN(id)) - 1)::INT   AS orden
FROM productos
WHERE activo = 1
GROUP BY seccion, categoria_slug
ON CONFLICT (seccion, slug) DO NOTHING;
