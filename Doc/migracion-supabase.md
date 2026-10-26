# Migrar de una cuenta de Supabase a otra — FERCADI

Tiempo estimado: 30-45 minutos.

> El proyecto viejo **no se toca en ningún paso**. Si algo falla, basta con
> apuntar las variables de entorno al viejo y todo sigue funcionando.

---

## PARTE 1 — Sacar los datos del proyecto viejo

### Paso 1. Conseguir la contraseña de la base

1. Entra al proyecto **viejo** en el dashboard de Supabase
2. **Settings** → **Database** → busca **Database password**
3. Si no la recuerdas: **Reset database password** (no afecta la app — ella usa `DATABASE_URL`, no la anon key)

### Paso 2. Copiar la cadena de conexión

1. Botón verde **Connect** (barra superior) → **Connection string** → **URI**
2. Cópiala. Tiene esta forma:
   ```
   postgresql://postgres:[PASSWORD]@db.XXXXXX.supabase.co:5432/postgres
   ```
3. Reemplaza `[PASSWORD]` por la contraseña del paso anterior

### Paso 3. Instalar pg_dump (una sola vez)

```powershell
winget install -e --id PostgreSQL.PostgreSQL.17
```

Elige **solo "Command Line Tools"** (desmarca Server, pgAdmin y Stack Builder).
Cierra y vuelve a abrir la terminal después.

### Paso 4. Ejecutar el script de exportación

```powershell
cd "C:\fercadi-next"
.\scripts\exportar-datos.ps1
```

Pide la cadena de conexión. Al terminar verás:

```
LISTO
  Esquema: ...\respaldo\esquema-YYYY-MM-DD.sql
  Datos:   ...\respaldo\datos-YYYY-MM-DD.sql
```

### Paso 5. Verificar que salió bien

```powershell
Get-ChildItem respaldo\
```

Ambos archivos deben pesar más de 0 KB.

---

## PARTE 2 — Crear la estructura en el proyecto nuevo

### Paso 6. Ejecutar el schema

1. Entra al proyecto **nuevo** → **SQL Editor** → **New query**
2. Abre `database/schema.sql`, copia todo el contenido
3. Pégalo y presiona **Run**

Resultado esperado: `Success. No rows returned`

### Paso 7. Verificar las tablas

Ve a **Table Editor**. Las tablas que deben aparecer:

`usuarios`, `productos`, `categorias`, `materiales_categorias`,
`pedidos`, `ordenes`, `comentarios_productos`, `tips`,
`home_cards`, `carousel_slides`, `servicios_contratados`, `suscripciones`

---

## PARTE 3 — Cargar los datos

### Paso 8. Limpiar filas del seed que genera el schema

El `schema.sql` inserta filas en `home_cards`, `carousel_slides`, `tips` y `categorias`.
Si al cargar los datos aparece error de `duplicate key`, ejecuta primero:

```sql
TRUNCATE TABLE home_cards RESTART IDENTITY CASCADE;
TRUNCATE TABLE carousel_slides RESTART IDENTITY CASCADE;
TRUNCATE TABLE tips RESTART IDENTITY CASCADE;
TRUNCATE TABLE categorias RESTART IDENTITY CASCADE;
```

### Paso 9. Cargar los datos

1. **SQL Editor** → **New query**
2. Abre `respaldo/datos-YYYY-MM-DD.sql` en un editor de texto, copia todo
3. Pégalo en el SQL Editor y presiona **Run**

> El archivo empieza con `SET session_replication_role = replica;`.
> Esa línea desactiva los triggers durante la carga. No la elimines.

> Si el Run falla, Postgres revierte todo — nada queda a medio cargar.
> Corrige el error y repite.

**Si el archivo es muy grande y el editor se traba:** pégalo por partes
respetando el orden de dependencias: `usuarios` → `categorias` → `materiales_categorias`
→ `productos` → `ordenes` → `pedidos` → `comentarios_productos` → resto.

### Paso 10. Verificar los datos

```sql
SELECT 'usuarios'   t, count(*) FROM usuarios
UNION ALL SELECT 'productos',  count(*) FROM productos  WHERE activo = 1
UNION ALL SELECT 'categorias', count(*) FROM categorias
UNION ALL SELECT 'ordenes',    count(*) FROM ordenes
UNION ALL SELECT 'tips',       count(*) FROM tips;
```

Los números deben coincidir con los del proyecto viejo.

---

## PARTE 4 — Usuarios de prueba

FERCADI usa **autenticación propia** (tabla `usuarios` con bcrypt),
**no** Supabase Auth. Los usuarios de prueba van directamente en `usuarios`.

### Paso 11. Re-ejecutar el seed de usuarios de prueba

1. **SQL Editor** → **New query**
2. Abre `database/seeds_test.sql`, copia todo y pega
3. **Run**

Esto recrea:
- `admin@test.com` / `Test1234` → rol `admin`
- `usuario@test.com` / `Test1234` → rol `usuario`

> El seed usa `ON CONFLICT DO NOTHING` — es seguro re-ejecutarlo varias veces.

### Paso 12. Verificar el login de admin

- Navega a `/login` → entra con `admin@test.com` / `Test1234`
- Debe redirigir correctamente y el panel `/admin` debe funcionar

### Paso 13. Hacer admin a un usuario real

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```

---

## PARTE 5 — Imágenes del bucket

⚠️ Las imágenes **no van en ningún dump SQL**. Sin este paso los productos
aparecerán sin foto.

### Paso 14. Crear el bucket en el proyecto nuevo

El bucket se crea manualmente en **Storage** → **New bucket**:

- `productos` — **público** (marcar "Public bucket")

### Paso 15. Copiar los archivos

```powershell
cd "C:\fercadi-next"
node scripts/copiar-imagenes.mjs
```

Pide 4 datos:
1. URL del proyecto **viejo** (ej. `https://hykrbwzmavpenprwqsqi.supabase.co`)
2. `service_role` key del proyecto **viejo** — Settings → API → service_role
3. URL del proyecto **nuevo**
4. `service_role` key del proyecto **nuevo**

El script copia el bucket `productos` manteniendo todas las rutas.
Al final imprime cuántos se copiaron y cuáles fallaron.

---

## PARTE 6 — Apuntar la app al proyecto nuevo

### Paso 16. Sacar las llaves del proyecto nuevo

**Settings** → **API**:
- **Project URL** — `https://XXXXXX.supabase.co`
- **anon public** — llave pública
- **service_role** — llave secreta

**Settings** → **Database** → **Connection string** → **URI** (puerto 6543 pooler):
- `postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### Paso 17. Actualizar `.env.local`

```bash
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Prueba en local:

```powershell
npm run dev
```

Verifica: home carga carousel y tarjetas, `/ferreteria` muestra productos, `/login` funciona.

### Paso 18. Actualizar Vercel

1. Vercel → proyecto → **Settings** → **Environment Variables**
2. Editar las variables (marcar *Production* y *Preview*):
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (mantener `GROQ_API_KEY` sin cambios — no es de Supabase)
3. El valor va **sin comillas y sin el `NOMBRE=`**
4. **Deployments** → último deploy → **⋯** → **Redeploy**

> Las variables `NEXT_PUBLIC_*` se incrustan al hacer el build.
> Guardarlas sin redesplegar no cambia nada.

---

## Checklist final

- [ ] Tablas creadas en proyecto nuevo (schema.sql ejecutado)
- [ ] Conteos de datos coinciden con el viejo
- [ ] Seeds ejecutados (`admin@test.com` / `Test1234` funciona)
- [ ] Panel `/admin` accesible con cuenta admin
- [ ] Bucket `productos` existe y es público
- [ ] Imágenes copiadas (`copiar-imagenes.mjs`)
- [ ] `.env.local` actualizado y probado en local
- [ ] Vercel: variables actualizadas **y redesplegado**
- [ ] Home carga carousel y tarjetas
- [ ] `/ferreteria` muestra productos con imágenes
- [ ] `/textucos/morteros/texturizado` muestra colores y video

---

## Si algo sale mal

| Síntoma | Causa probable |
|---|---|
| "duplicate key" al cargar datos | El schema sembró filas; truncar esa tabla primero (ver Paso 8) |
| Productos sin imagen | Falta copiar bucket (Parte 5) |
| Login falla | Usuario no existe; re-ejecutar `seeds_test.sql` |
| Imágenes de colores no cargan | Las URLs de colores son hardcodeadas en el código; verificar que el bucket se llame exactamente `productos` |
| `Error: Invalid DATABASE_URL` | El valor incluye comillas o el `NOMBRE=` |
| La app sigue apuntando al viejo | Falta redesplegar en Vercel |
| `/admin/importar` falla en CSV | `SUPABASE_SERVICE_ROLE_KEY` no actualizada |

---

*Generado: 26-10-2026 — basado en el proceso de ERUDITO Galery (`C:\ERUDITO Galery\Doc\migracion-supabase.md`)*
