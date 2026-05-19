import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';
import { esRutaImagenValida, resolverImagenProducto } from '@/lib/imagen';

/**
 * GET /api/admin/productos
 *   Query: ?seccion=concretos&categoria=clase-a&q=ligero
 *   Devuelve listado con filtros opcionales. Soporta producto activo e inactivo.
 *
 * POST /api/admin/productos
 *   Body: { nombre, slug, descripcion, descripcion2?, imagen_url, seccion,
 *           categoria_slug, categoria_nombre, precio?, activo? }
 *   Crea un producto nuevo.
 *
 * Ambos endpoints requieren x-usuario-id de un usuario con rol='admin'.
 */

export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const seccion = searchParams.get('seccion');
  const categoria = searchParams.get('categoria');
  const q = searchParams.get('q');

  const where: string[] = [];
  const params: any[] = [];

  if (seccion) {
    where.push('seccion = ?');
    params.push(seccion);
  }
  if (categoria) {
    where.push('categoria_slug = ?');
    params.push(categoria);
  }
  if (q) {
    where.push('(nombre LIKE ? OR slug LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  // SELECT * para admin — devuelve todos los campos incluyendo los comerciales
  const sql = `
    SELECT *
      FROM productos
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY seccion ASC, categoria_slug ASC, id ASC
  `;

  try {
    const [rows]: any = await db.query(sql, params);
    return NextResponse.json({ ok: true, productos: rows });
  } catch (error: any) {
    console.error('[GET /api/admin/productos]', error);
    return NextResponse.json(
      { ok: false, message: 'Error al consultar productos', detalle: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const {
    nombre, slug, descripcion, descripcion2, imagen_url, seccion,
    categoria_slug, categoria_nombre, precio, activo,
    // Campos públicos nuevos
    marca, unidad,
  } = body;

  // Validaciones mínimas
  if (!nombre || !slug || !descripcion || !seccion || !categoria_slug || !categoria_nombre) {
    return NextResponse.json(
      { ok: false, message: 'Faltan campos requeridos (nombre, slug, descripcion, seccion, categoria_slug, categoria_nombre)' },
      { status: 400 }
    );
  }

  if (!['concretos', 'textucos', 'materiales', 'ferreteria'].includes(seccion)) {
    return NextResponse.json(
      { ok: false, message: `seccion inválida: ${seccion}` },
      { status: 400 }
    );
  }

  if (!esRutaImagenValida(imagen_url)) {
    return NextResponse.json(
      { ok: false, message: `imagen_url inválida: debe empezar con /productos/ o ser URL http(s)` },
      { status: 400 }
    );
  }

  try {
    const [result]: any = await db.query(
      `INSERT INTO productos
         (nombre, slug, descripcion, descripcion2, imagen_url, seccion,
          categoria_slug, categoria_nombre, precio, activo, marca, unidad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, slug, descripcion, descripcion2 ?? null,
        resolverImagenProducto(imagen_url) ?? null, seccion,
        categoria_slug, categoria_nombre, precio ?? 0,
        activo === false ? 0 : 1,
        marca ?? null, unidad ?? null,
      ]
    );

    return NextResponse.json(
      { ok: true, message: 'Producto creado', id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/admin/productos]', error);
    // Manejo del UNIQUE de (slug, seccion)
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { ok: false, message: `Ya existe un producto con slug "${slug}" en la sección ${seccion}` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, message: 'Error al crear producto', detalle: error?.message },
      { status: 500 }
    );
  }
}
