import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';
import { esRutaImagenValida, resolverImagenProducto } from '@/lib/imagen';

/**
 * GET    /api/admin/productos/:id   → devuelve un producto completo
 * PUT    /api/admin/productos/:id   → actualiza campos del producto
 * DELETE /api/admin/productos/:id   → soft delete (activo = 0)
 *
 * Todos requieren x-usuario-id con rol='admin'.
 */

type Params = Promise<{ id: string }>;

export async function GET(request: Request, ctx: { params: Params }) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ ok: false, message: 'ID inválido' }, { status: 400 });
  }

  try {
    const [rows]: any = await db.query('SELECT * FROM productos WHERE id = ? LIMIT 1', [numId]);
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, message: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, producto: rows[0] });
  } catch (error: any) {
    console.error('[GET /api/admin/productos/:id]', error);
    return NextResponse.json(
      { ok: false, message: 'Error', detalle: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, ctx: { params: Params }) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ ok: false, message: 'ID inválido' }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  // Whitelist de campos que el admin puede modificar.
  const camposActualizables = [
    // Campos base
    'nombre', 'slug', 'descripcion', 'descripcion2', 'imagen_url',
    'seccion', 'categoria_slug', 'categoria_nombre', 'precio', 'activo',
    // Campos públicos nuevos
    'marca', 'unidad',
    // Campos comerciales (admin-only)
    'codigo_interno', 'ean', 'margen', 'caja', 'master', 'alta_rotacion',
    'precio_minimo',
    'precio_mayoreo_con_iva', 'precio_distribuidor_con_iva', 'precio_publico_con_iva',
    'precio_mayoreo_sin_iva', 'precio_distribuidor_sin_iva', 'precio_publico_sin_iva',
    'precio_medio_mayoreo_sin_iva', 'precio_medio_mayoreo_con_iva',
    'codigo_sat', 'descripcion_sat',
    'peso_kg', 'volumen_cm3',
  ];

  if (body.imagen_url !== undefined && !esRutaImagenValida(body.imagen_url)) {
    return NextResponse.json(
      { ok: false, message: 'imagen_url inválida' },
      { status: 400 }
    );
  }

  // Normalizar imagen_url si viene
  if (body.imagen_url !== undefined) {
    body.imagen_url = resolverImagenProducto(body.imagen_url) ?? null;
  }

  const sets: string[] = [];
  const params: any[] = [];
  for (const campo of camposActualizables) {
    if (body[campo] !== undefined) {
      sets.push(`${campo} = ?`);
      params.push(campo === 'activo' ? (body[campo] ? 1 : 0) : body[campo]);
    }
  }

  if (sets.length === 0) {
    return NextResponse.json({ ok: false, message: 'Nada que actualizar' }, { status: 400 });
  }

  params.push(numId);

  try {
    await db.query(`UPDATE productos SET ${sets.join(', ')} WHERE id = ?`, params);
    return NextResponse.json({ ok: true, message: 'Producto actualizado' });
  } catch (error: any) {
    console.error('[PUT /api/admin/productos/:id]', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { ok: false, message: 'Ya existe otro producto con ese slug en la misma sección' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, message: 'Error al actualizar', detalle: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, ctx: { params: Params }) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ ok: false, message: 'ID inválido' }, { status: 400 });
  }

  // Soft delete: marcamos activo=0, no borramos histórico de pedidos asociados.
  try {
    await db.query('UPDATE productos SET activo = 0 WHERE id = ?', [numId]);
    return NextResponse.json({ ok: true, message: 'Producto desactivado' });
  } catch (error: any) {
    console.error('[DELETE /api/admin/productos/:id]', error);
    return NextResponse.json(
      { ok: false, message: 'Error al eliminar', detalle: error?.message },
      { status: 500 }
    );
  }
}
