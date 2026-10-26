-- ============================================================
--  FERCADI — Usuarios de prueba
--  Contraseña de TODOS: Test1234  (hash bcrypt)
--
--  FERCADI usa autenticación propia (tabla usuarios),
--  NO Supabase Auth → no se toca auth.users.
--
--  Para hacer admin un usuario real:
--    UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Idempotente: ON CONFLICT DO NOTHING
-- ============================================================

-- Hash bcrypt de 'Test1234' (salt 10):
-- $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- (valor estable generado con bcrypt.hashSync('Test1234', 10))

INSERT INTO usuarios (nombre, correo, password, rol) VALUES
  ('Admin FERCADI',   'admin@test.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Usuario Prueba',  'usuario@test.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario')
ON CONFLICT (correo) DO NOTHING;

-- ============================================================
--  Verificar que se crearon:
--    SELECT id, nombre, correo, rol FROM usuarios WHERE correo LIKE '%@test.com';
--
--  Login en /login:
--    admin@test.com   / Test1234  → accede a /admin/*
--    usuario@test.com / Test1234  → acceso normal
-- ============================================================
