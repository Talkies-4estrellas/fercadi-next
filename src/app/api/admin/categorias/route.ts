import { NextRequest, NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

/**
 * GET /api/admin/categorias?seccion=ferreteria
 * Devuelve todas las categorías activas, incluyendo parent_id.
 * El cliente agrupa en árbol.
 */
export async function GET(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const seccion = req.nextUrl.searchParams.get('seccion') ?? '';
  if (!seccion) {
    return NextResponse.json({ ok: false, error: 'Falta el parámetro seccion' }, { status: 400 });
  }

  const [rows]: any = await db.query(
    `SELECT id, slug, nombre, descripcion, orden, parent_id
     FROM categorias
     WHERE seccion = ? AND activo = 1
     ORDER BY parent_id NULLS FIRST, orden ASC, id ASC`,
    [seccion]
  );
  return NextResponse.json({ ok: true, categorias: rows });
}

const SECCIONES_VALIDAS = ['textucos', 'concretos', 'ferreteria', 'materiales'];

/**
 * POST /api/admin/categorias
 * Body: { seccion, nombre, slug, descripcion?, parent_id? }
 */
export async function POST(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const { seccion, nombre, slug, descripcion, parent_id } = body;

  if (!seccion || !nombre || !slug) {
    return NextResponse.json(
      { ok: false, message: 'Faltan campos requeridos: seccion, nombre, slug' },
      { status: 400 }
    );
  }

  if (!SECCIONES_VALIDAS.includes(seccion)) {
    return NextResponse.json({ ok: false, message: `Sección inválida: ${seccion}` }, { status: 400 });
  }

  try {
    const [result]: any = await db.query(
      `INSERT INTO categorias (seccion, slug, nombre, descripcion, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
      [seccion, slug, nombre, descripcion ?? null, parent_id ?? null]
    );
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json(
        { ok: false, message: `Ya existe una categoría con slug "${slug}" en ${seccion}` },
        { status: 409 }
      );
    }
    console.error('[POST /api/admin/categorias]', error);
    return NextResponse.json(
      { ok: false, message: 'Error al crear categoría', detalle: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categorias
 * Body: { seccion, slug_original, nombre, slug, descripcion?, parent_id? }
 */
export async function PUT(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const { seccion, slug_original, nombre, slug, descripcion, parent_id } = body;

  if (!seccion || !slug_original || !nombre || !slug) {
    return NextResponse.json(
      { ok: false, message: 'Faltan campos: seccion, slug_original, nombre, slug' },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await db.query(
      `UPDATE categorias SET nombre = ?, slug = ?, descripcion = ?, parent_id = ?
       WHERE seccion = ? AND slug = ?
       RETURNING id`,
      [nombre, slug, descripcion ?? null, parent_id ?? null, seccion, slug_original]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: false, message: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json(
        { ok: false, message: `Ya existe una categoría con slug "${slug}" en ${seccion}` },
        { status: 409 }
      );
    }
    console.error('[PUT /api/admin/categorias]', error);
    return NextResponse.json(
      { ok: false, message: 'Error al actualizar categoría', detalle: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categorias
 * Body: { seccion, slug }
 * Rechaza si tiene productos o hijos.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const { seccion, slug } = body;
  if (!seccion || !slug) {
    return NextResponse.json({ ok: false, message: 'Faltan campos: seccion, slug' }, { status: 400 });
  }

  try {
    // Verificar productos asociados
    const [countRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM productos WHERE seccion = ? AND categoria_slug = ?`,
      [seccion, slug]
    );
    const totalProductos = Number(countRows[0]?.total ?? 0);
    if (totalProductos > 0) {
      return NextResponse.json(
        { ok: false, message: `No se puede eliminar: tiene ${totalProductos} producto(s) asociado(s).` },
        { status: 409 }
      );
    }

    // Verificar subcategorías hijas
    const [hijosRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM categorias c
       JOIN categorias p ON c.parent_id = p.id
       WHERE p.seccion = ? AND p.slug = ? AND c.activo = 1`,
      [seccion, slug]
    );
    const totalHijos = Number(hijosRows[0]?.total ?? 0);
    if (totalHijos > 0) {
      return NextResponse.json(
        { ok: false, message: `No se puede eliminar: tiene ${totalHijos} subcategoría(s). Elimínalas primero.` },
        { status: 409 }
      );
    }

    const [rows]: any = await db.query(
      `DELETE FROM categorias WHERE seccion = ? AND slug = ? RETURNING id`,
      [seccion, slug]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: false, message: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/admin/categorias]', error);
    return NextResponse.json(
      { ok: false, message: 'Error al eliminar categoría', detalle: error?.message },
      { status: 500 }
    );
  }
}
