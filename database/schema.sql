-- ============================================================
--  FERCADI / Josman Texturizados — Schema completo PostgreSQL
--  Ejecutar en: Supabase → SQL Editor → New Query → Run All
--
--  Orden de ejecución (este archivo lo hace todo en secuencia):
--    1. Función auxiliar updated_at
--    2. Tablas base (usuarios, productos, materiales, pedidos,
--       ordenes, servicios, suscripciones, tips, home_cards,
--       carousel_slides, comentarios_productos)
--    3. Tabla categorias + parent_id
--    4. Seed: 18 grupos padre de Ferretería
--    5. Seed: asignación de ~494 subcategorías a sus grupos
--    6. Seeds estáticos (home_cards, carousel_slides, tips)
--
--  Todas las sentencias son idempotentes (IF NOT EXISTS / ON CONFLICT DO NOTHING).
--  Puede ejecutarse varias veces sin romper datos existentes.
-- ============================================================


-- ════════════════════════════════════════════════════════════════
-- 0. FUNCIÓN AUXILIAR
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════════
-- 1. USUARIOS
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS usuarios (
    id               SERIAL        PRIMARY KEY,
    nombre           VARCHAR(100)  NOT NULL,
    correo           VARCHAR(100)  NOT NULL UNIQUE,
    password         VARCHAR(255)  NOT NULL,
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

-- Columnas extra (seguro si ya existía la tabla):
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS edad             SMALLINT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS domicilio        VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS colonia          VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ciudad           VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado           VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS profesion        VARCHAR(100);


-- ════════════════════════════════════════════════════════════════
-- 2. PRODUCTOS
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS productos (
    id                           SERIAL         PRIMARY KEY,
    nombre                       VARCHAR(255)   NOT NULL,
    slug                         VARCHAR(255)   NOT NULL,
    descripcion                  TEXT,
    descripcion2                 TEXT,
    precio                       NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
    imagen_url                   VARCHAR(500),
    seccion                      VARCHAR(20)    NOT NULL
                                   CHECK (seccion IN ('concretos','textucos','materiales','ferreteria')),
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

CREATE INDEX IF NOT EXISTS idx_productos_seccion          ON productos (seccion);
CREATE INDEX IF NOT EXISTS idx_productos_categoria        ON productos (seccion, categoria_slug);
CREATE INDEX IF NOT EXISTS idx_productos_activo           ON productos (activo);
CREATE INDEX IF NOT EXISTS idx_productos_codigo           ON productos (codigo_interno);
CREATE INDEX IF NOT EXISTS idx_productos_marca            ON productos (marca);
CREATE INDEX IF NOT EXISTS idx_productos_seccion_activo   ON productos (seccion, activo);


-- ════════════════════════════════════════════════════════════════
-- 3. MATERIALES (categorías con marcas en JSON)
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS materiales_categorias (
    slug        VARCHAR(100)  PRIMARY KEY,
    nombre      VARCHAR(255)  NOT NULL,
    descripcion TEXT,
    marcas      JSONB         DEFAULT '[]'::jsonb,
    activo      SMALLINT      NOT NULL DEFAULT 1
);


-- ════════════════════════════════════════════════════════════════
-- 4. PEDIDOS (ítems individuales del carrito)
-- ════════════════════════════════════════════════════════════════

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

CREATE INDEX IF NOT EXISTS idx_pedidos_orden        ON pedidos (orden_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario      ON pedidos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_fecha ON pedidos (usuario_id, fecha);


-- ════════════════════════════════════════════════════════════════
-- 5. ÓRDENES (agrupa ítems del mismo carrito)
-- ════════════════════════════════════════════════════════════════

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

DROP TRIGGER IF EXISTS set_ordenes_updated_at ON ordenes;
CREATE TRIGGER set_ordenes_updated_at
  BEFORE UPDATE ON ordenes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 6. SERVICIOS CONTRATADOS
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS servicios_contratados (
    id          SERIAL        PRIMARY KEY,
    usuario_id  INT,
    tipo        VARCHAR(100),
    descripcion TEXT,
    estado      VARCHAR(20)   DEFAULT 'activo'
                  CHECK (estado IN ('activo','completado','cancelado')),
    fecha       TIMESTAMPTZ   DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════════
-- 7. SUSCRIPCIONES
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS suscripciones (
    id           SERIAL       PRIMARY KEY,
    usuario_id   INT,
    plan         VARCHAR(100),
    estado       VARCHAR(20)  DEFAULT 'activa'
                   CHECK (estado IN ('activa','vencida','cancelada')),
    fecha_inicio DATE,
    fecha_fin    DATE
);


-- ════════════════════════════════════════════════════════════════
-- 8. TIPS Y TUTORIALES
-- ════════════════════════════════════════════════════════════════

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

DROP TRIGGER IF EXISTS set_tips_updated_at ON tips;
CREATE TRIGGER set_tips_updated_at
  BEFORE UPDATE ON tips
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 9. TARJETAS DEL INICIO (siempre 4 filas fijas)
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS home_cards (
    id          SERIAL        PRIMARY KEY,
    posicion    SMALLINT      NOT NULL UNIQUE CHECK (posicion BETWEEN 1 AND 4),
    titulo      VARCHAR(100)  NOT NULL,
    descripcion TEXT          NOT NULL,
    btn_texto   VARCHAR(50)   NOT NULL DEFAULT 'Ver',
    btn_href    VARCHAR(255)  NOT NULL DEFAULT '/'
);


-- ════════════════════════════════════════════════════════════════
-- 10. SLIDES DEL CARRUSEL
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS carousel_slides (
    id          SERIAL        PRIMARY KEY,
    orden       SMALLINT      NOT NULL DEFAULT 0,
    imagen_url  VARCHAR(500)  NOT NULL,
    alt         VARCHAR(255),
    titulo      VARCHAR(255),
    descripcion TEXT,
    slogan      VARCHAR(255),
    activo      SMALLINT      NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_carousel_activo ON carousel_slides (activo);


-- ════════════════════════════════════════════════════════════════
-- 11. COMENTARIOS DE PRODUCTOS (con moderación admin)
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS comentarios_productos (
    id           SERIAL       PRIMARY KEY,
    producto_id  INTEGER      NOT NULL,
    usuario_id   INTEGER      NOT NULL,
    nombre       VARCHAR(100) NOT NULL,
    comentario   TEXT         NOT NULL,
    calificacion SMALLINT     NOT NULL DEFAULT 5
                   CHECK (calificacion BETWEEN 1 AND 5),
    creado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    aprobado     BOOLEAN      NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_comentarios_producto ON comentarios_productos (producto_id);

-- Columna aprobado (seguro si la tabla ya existía sin ella):
ALTER TABLE comentarios_productos
  ADD COLUMN IF NOT EXISTS aprobado BOOLEAN NOT NULL DEFAULT false;


-- ════════════════════════════════════════════════════════════════
-- 12. CATEGORÍAS (árbol 2 niveles: grupos padre + subcategorías)
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

-- Columna parent_id (seguro si ya existía sin ella):
ALTER TABLE categorias
  ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;

-- Seed: copia categorías existentes de productos (solo si la tabla está vacía o hay nuevas):
INSERT INTO categorias (seccion, slug, nombre, orden)
SELECT
  seccion,
  categoria_slug AS slug,
  MAX(categoria_nombre) AS nombre,
  (ROW_NUMBER() OVER (PARTITION BY seccion ORDER BY MIN(id)) - 1)::INT AS orden
FROM productos
WHERE activo = 1
GROUP BY seccion, categoria_slug
ON CONFLICT (seccion, slug) DO NOTHING;


-- ════════════════════════════════════════════════════════════════
-- 13. SEED — 18 GRUPOS PADRE DE FERRETERÍA
-- ════════════════════════════════════════════════════════════════

INSERT INTO categorias (seccion, slug, nombre, orden, parent_id) VALUES
  ('ferreteria', 'herramientas-manuales',    'Herramientas manuales',         0,  NULL),
  ('ferreteria', 'herramientas-de-corte',    'Herramientas de corte',         1,  NULL),
  ('ferreteria', 'medicion-y-trazo',         'Medición y trazo',              2,  NULL),
  ('ferreteria', 'maquinas-portatiles',      'Máquinas portátiles',           3,  NULL),
  ('ferreteria', 'jardin-y-agricultura',     'Jardín y agricultura',          4,  NULL),
  ('ferreteria', 'accesorios-para-maquinas', 'Accesorios para máquinas',      5,  NULL),
  ('ferreteria', 'electricidad',             'Electricidad',                  6,  NULL),
  ('ferreteria', 'plomeria',                 'Plomería',                      7,  NULL),
  ('ferreteria', 'gas-y-calefaccion',        'Gas y calefacción',             8,  NULL),
  ('ferreteria', 'cerrajeria',               'Cerrajería',                    9,  NULL),
  ('ferreteria', 'seguridad-personal',       'Seguridad personal (EPP)',      10, NULL),
  ('ferreteria', 'fijaciones-y-amarre',      'Fijaciones y amarre',           11, NULL),
  ('ferreteria', 'pintura-y-acabados',       'Pintura y acabados',            12, NULL),
  ('ferreteria', 'almacenaje-y-transporte',  'Almacenaje y transporte',       13, NULL),
  ('ferreteria', 'hogar-y-bano',             'Hogar y baño',                  14, NULL),
  ('ferreteria', 'mallas-y-lonas',           'Mallas y lonas',                15, NULL),
  ('ferreteria', 'exhibidores',              'Exhibidores',                   16, NULL),
  ('ferreteria', 'miscelaneos',              'Misceláneos',                   17, NULL)
ON CONFLICT (seccion, slug) DO NOTHING;


-- ════════════════════════════════════════════════════════════════
-- 14. SEED — ASIGNACIÓN DE SUBCATEGORÍAS A GRUPOS (FERRETERÍA)
-- ════════════════════════════════════════════════════════════════

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='herramientas-manuales' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p085','p108','p253','p091','p086','p100','p191','p406','p214','p197',
  'p059','p047','p768','p029','p179','p066','p011','p731','p767','p773',
  'p264','p267','p169','p087','p671','p177','p203','p494','p790','p078',
  'p791','p205','p769','p808','p805','p804','p807','p806','p812','p405',
  'p063','p226','p288','p728','p194','p217','p729','p181');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='herramientas-de-corte' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p049','p128','p216','p004','p193','p127','p617','p798','p439','p131',
  'p782','p843','p045','p046','p215','p043','p200','p735','p464','p734',
  'p092','p093','p080','p863','p025','p201','p676','p192','p733','p775',
  'p774','p173','p683');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='medicion-y-trazo' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p064','p104','p770','p058','p737','p680','p113','p771','p600','p038',
  'p134','p190','p603','p166','p227','p666');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='maquinas-portatiles' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p097','p096','p188','p298','p041','p241','p547','p726','p595','p102',
  'p570','p718','p828','p832','p853','p860','p859','p212','p098','p289',
  'p411','p427','p240','p699','p538','p468','p629','p888','p852','p842',
  'p793','p750','p286','p679','p056','p292','p228','p586','p185','p852');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='jardin-y-agricultura' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p299','p402','p401','p408','p409','p407','p404','p070','p077','p114',
  'p174','p187','p455','p155','p186','p218','p825','p826','p827','p007',
  'p112','p095','p817','p776','p294','p712','p146','p481','p784','p789',
  'p075','p693','p732','p431','p403','p739','p738','p802','p752');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='accesorios-para-maquinas' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p001','p054','p459','p515','p129','p017','p015','p016','p800','p145',
  'p799','p797','p763','p018','p819','p118','p449','p540','p506','p126',
  'p787','p507','p457','p678','p616','p639','p649','p761','p295','p831',
  'p149','p889','p229','p290','p786','p151');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='electricidad' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p727','p740','p882','p821','p542','p061','p284','p466','p785','p520',
  'p413','p423','p475','p505','p725','p065','p204','p864','p574','p723',
  'p420','p235','p079','p702','p592','p039','p417','p162','p419','p498',
  'p612','p714','p611','p458','p849','p421','p847','p633','p010','p196',
  'p115','p567','p483','p594','p499','p442','p198','p272','p809','p568',
  'p783','p614','p158','p296','p027','p081','p230');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='plomeria' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p467','p685','p781','p697','p851','p681','p621','p604','p597','p668',
  'p613','p518','p703','p822','p476','p814','p815','p813','p818','p628',
  'p638','p530','p854','p531','p543','p532','p053','p297','p537','p839',
  'p560','p573','p160','p551','p713','p486','p523','p650','p233');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='gas-y-calefaccion' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p545','p816','p460','p885','p883','p724','p424','p422','p736','p746',
  'p606','p548','p441','p609','p559');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='cerrajeria' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p164','p031','p030','p032','p167','p168','p024','p013','p572','p794',
  'p589','p635','p033','p148','p211','p206','p695','p778','p207','p824',
  'p846','p287');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='seguridad-personal' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p224','p071','p222','p562','p221','p223','p722','p446','p555','p687',
  'p487','p488','p213','p448','p220','p716','p593','p747','p711','p293');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='fijaciones-y-amarre' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p549','p865','p513','p858','p829','p519','p040','p558','p605','p866',
  'p867','p124','p777','p002','p020','p484','p440','p552','p625','p602',
  'p575','p036','p745','p576','p238','p554','p835','p021','p231','p234',
  'p720','p646');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='pintura-y-acabados' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p106','p841','p019','p125','p111','p184','p880','p438','p443','p879',
  'p655','p189','p232');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='almacenaje-y-transporte' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p553','p432','p433','p084','p511','p877','p022','p698','p861','p855',
  'p135','p242','p152','p730','p539','p285');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='hogar-y-bano' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p721','p514','p694','p521','p517','p795','p640','p844','p569','p546',
  'p845','p874','p801','p838','p637','p648','p641','p875');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='mallas-y-lonas' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p244','p871','p873','p872','p618','p686','p082','p758');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='exhibidores' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p581','p474','p583','p060','p585','p580','p582','p579','p578','p577','p154');

UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='miscelaneos' LIMIT 1)
WHERE seccion='ferreteria' AND slug IN (
  'p076','p757','p667','p642','p491','p599','p447','p856','p005','p140',
  'p502','p719','p482','p069','p607','p705','p636','p875');


-- ════════════════════════════════════════════════════════════════
-- 15. SEED — HOME CARDS (4 tarjetas fijas del inicio)
-- ════════════════════════════════════════════════════════════════

INSERT INTO home_cards (posicion, titulo, descripcion, btn_texto, btn_href) VALUES
(1, 'CONCRETO',
 'Empieza tu construcción con el pie derecho. Pregunta por nuestras promociones que tenemos al estar con nosotros desde el inicio de tu obra.',
 'Ver', '/concretos'),
(2, 'RENTA DE EQUIPO',
 'Ahorra costos de mano de obra utilizando los equipos adecuados y garantiza la calidad de tu proyecto. Te facilitamos al especialista si lo requieres.',
 'Ver', '/concretos/servicios'),
(3, 'COTIZACIÓN',
 'Solicita tu presupuesto personalizado sin costo. Cuéntanos qué necesitas y te respondemos a la brevedad con la mejor opción para tu proyecto.',
 'Solicitar', '/cotizacion'),
(4, 'TEXTURIZADOS Y ADHESIVOS',
 'Nuestro compromiso es generar productos de alta calidad y eficiencia en la decoración, protección y eficiencia en el desarrollo de obra.',
 'Ver', '/textucos')
ON CONFLICT (posicion) DO NOTHING;


-- ════════════════════════════════════════════════════════════════
-- 16. SEED — CAROUSEL SLIDES
-- ════════════════════════════════════════════════════════════════

INSERT INTO carousel_slides (orden, imagen_url, alt, titulo, descripcion, slogan, activo) VALUES
(1, '/images/1.png', 'Solidez en su Obra', 'Solidez en su Obra',
 'La calidad es nuestra máxima prioridad. Nuestro cemento es la elección perfecta para satisfacer sus necesidades de construcción, brindando solidez, durabilidad y rendimiento excepcional en cada proyecto.',
 'PRESENCIA SEGURA EN TU OBRA', 1),
(2, '/images/2.png', 'Pega Más Fuerte', 'Solidez en su Obra',
 'En Josman Texturizados nos hemos comprometido con aplicaciones de productos de alta calidad que se presenten en productos para la decoración duradera y eficiente en las obras.',
 'PEGA MAS FUERTE', 1),
(3, '/images/3.png', 'Josman Texturizados', NULL, NULL, NULL, 1)
ON CONFLICT DO NOTHING;


-- ════════════════════════════════════════════════════════════════
-- 17. SEED — TIP INICIAL (Salitre)
-- ════════════════════════════════════════════════════════════════

INSERT INTO tips (slug, titulo, descripcion, imagen, contenido, activo)
VALUES (
  'salitre',
  'Salitre en Paredes',
  'El salitre es un depósito de sales minerales que aparece en muros y paredes, causando deterioro estético y estructural. Aprende a identificarlo y eliminarlo.',
  '/productos/tips/salitre.jpg',
  E'El salitre, también conocido como eflorescencia, es causado por la migración de sales solubles a través del concreto o mampostería.\n\n**¿Por qué aparece?**\n- Humedad excesiva en los muros\n- Materiales de construcción con alto contenido de sales\n- Falta de impermeabilización adecuada\n\n**¿Cómo eliminarlo?**\n1. Cepilla la superficie afectada con un cepillo de cerdas duras\n2. Aplica una solución de agua con vinagre o ácido muriático diluido\n3. Enjuaga con abundante agua limpia\n4. Deja secar completamente\n5. Aplica un sellador o impermeabilizante para prevenir recurrencia\n\n**Recomendación FERCADI:** Usa nuestro sellador Ipermax para una protección duradera contra la humedad y el salitre.',
  1
) ON CONFLICT (slug) DO NOTHING;


-- ════════════════════════════════════════════════════════════════
-- FIN DEL SCHEMA
--
-- Siguiente paso: importar productos desde /admin/importar (CSV)
-- Para hacer admin un usuario:
--   UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
-- ════════════════════════════════════════════════════════════════
