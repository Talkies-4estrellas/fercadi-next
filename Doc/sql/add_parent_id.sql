-- ════════════════════════════════════════════════════════════════
--  Agregar parent_id a la tabla categorias
--  Ejecutar en el SQL Editor de Supabase
-- ════════════════════════════════════════════════════════════════

ALTER TABLE categorias
  ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;

-- ── Insertar los 18 grupos padre de Ferretería ────────────────
INSERT INTO categorias (seccion, slug, nombre, orden, parent_id) VALUES
  ('ferreteria', 'herramientas-manuales',     'Herramientas manuales',          0,  NULL),
  ('ferreteria', 'herramientas-de-corte',     'Herramientas de corte',          1,  NULL),
  ('ferreteria', 'medicion-y-trazo',          'Medición y trazo',               2,  NULL),
  ('ferreteria', 'maquinas-portatiles',       'Máquinas portátiles',            3,  NULL),
  ('ferreteria', 'jardin-y-agricultura',      'Jardín y agricultura',           4,  NULL),
  ('ferreteria', 'accesorios-para-maquinas',  'Accesorios para máquinas',       5,  NULL),
  ('ferreteria', 'electricidad',              'Electricidad',                   6,  NULL),
  ('ferreteria', 'plomeria',                  'Plomería',                       7,  NULL),
  ('ferreteria', 'gas-y-calefaccion',         'Gas y calefacción',              8,  NULL),
  ('ferreteria', 'cerrajeria',                'Cerrajería',                     9,  NULL),
  ('ferreteria', 'seguridad-personal',        'Seguridad personal (EPP)',       10, NULL),
  ('ferreteria', 'fijaciones-y-amarre',       'Fijaciones y amarre',            11, NULL),
  ('ferreteria', 'pintura-y-acabados',        'Pintura y acabados',             12, NULL),
  ('ferreteria', 'almacenaje-y-transporte',   'Almacenaje y transporte',        13, NULL),
  ('ferreteria', 'hogar-y-bano',              'Hogar y baño',                   14, NULL),
  ('ferreteria', 'mallas-y-lonas',            'Mallas y lonas',                 15, NULL),
  ('ferreteria', 'exhibidores',               'Exhibidores',                    16, NULL),
  ('ferreteria', 'miscelaneos',               'Misceláneos',                    17, NULL)
ON CONFLICT (seccion, slug) DO NOTHING;
