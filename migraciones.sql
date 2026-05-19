-- =================================================================
-- migraciones.sql — FERCADI / Josman Texturizados
-- =================================================================
-- Aplicar en phpMyAdmin (base de datos: josman_db) en este orden.
-- Todas las sentencias son idempotentes: pueden ejecutarse varias veces sin
-- romper nada (excepto los UPDATE de promoción, que sí son ejecutables N veces
-- pero conviene revisar el correo antes).
--
-- Cambios introducidos:
--   1. Columna `rol` en usuarios            → habilita el admin backoffice
--   2. Columnas `opciones` y `precio_unitario` en pedidos
--                                            → guarda la opción elegida (presentación,
--                                              tamaño, color, etc.) por separado del nombre
--   3. Índices auxiliares para acelerar las consultas del perfil y del admin
-- =================================================================


-- ── 1. ROL DE USUARIO ────────────────────────────────────────────
-- Agrega la columna `rol` con dos valores posibles: 'admin' y 'usuario'.
-- Default 'usuario' para no romper registros existentes.
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS rol ENUM('admin','usuario') NOT NULL DEFAULT 'usuario'
    AFTER profesion;

-- Promueve a Miguel a admin. Cambia el correo si tu cuenta tiene otro.
UPDATE usuarios SET rol = 'admin' WHERE correo = 'miguel@fercadi.com';

-- Opcional: verifica que la promoción se aplicó.
-- SELECT id, nombre, correo, rol FROM usuarios WHERE rol = 'admin';


-- ── 2. PEDIDOS CON OPCIONES Y PRECIO UNITARIO ────────────────────
-- `opciones` guarda la presentación elegida (ej. "50 kg", "Azul Rey", "Saco x 25 kg").
-- `precio_unitario` permite reconstruir el cálculo si el precio cambia con el tiempo.
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS opciones VARCHAR(255) DEFAULT NULL
    AFTER producto;

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) DEFAULT NULL
    AFTER cantidad;

-- Índice para acelerar el historial: cuando entres a /perfil se filtra por usuario_id
-- y se ordena por fecha DESC.
ALTER TABLE pedidos
    ADD INDEX IF NOT EXISTS idx_pedidos_usuario_fecha (usuario_id, fecha);


-- ── 3. ÍNDICES PARA EL ADMIN ─────────────────────────────────────
-- Acelera filtros del backoffice: "todos los activos de la sección concretos".
ALTER TABLE productos
    ADD INDEX IF NOT EXISTS idx_productos_seccion_activo (seccion, activo);

ALTER TABLE productos
    ADD INDEX IF NOT EXISTS idx_productos_categoria (categoria_slug);


-- ── 4. (OPCIONAL) BACKFILL DE PEDIDOS VIEJOS ─────────────────────
-- Si ya existían pedidos con la opción concatenada al nombre, ej:
--     "Concreto FC150 (50 kg)"
-- estas líneas extraen la opción al campo nuevo y limpian el nombre.
-- Coméntalas si no quieres tocar registros viejos.
--
-- UPDATE pedidos
--    SET opciones = TRIM(BOTH ')' FROM SUBSTRING_INDEX(producto, '(', -1)),
--        producto = TRIM(SUBSTRING_INDEX(producto, '(', 1))
--  WHERE opciones IS NULL
--    AND producto LIKE '% (%)';


-- ── 5. VERIFICACIÓN ──────────────────────────────────────────────
-- Después de aplicar todo, estas consultas confirman que el schema quedó bien:
--
-- SHOW COLUMNS FROM usuarios LIKE 'rol';
-- SHOW COLUMNS FROM pedidos LIKE 'opciones';
-- SHOW COLUMNS FROM pedidos LIKE 'precio_unitario';
-- SHOW INDEX FROM pedidos WHERE Key_name = 'idx_pedidos_usuario_fecha';
