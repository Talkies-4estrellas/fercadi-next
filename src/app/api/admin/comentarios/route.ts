import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * GET /api/admin/comentarios
 * Devuelve todos los comentarios con datos del producto.
 * Query: ?page=1&limit=30&aprobado=true|false&q=texto
 */
export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10));
  const limit   = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '30', 10)));
  const offset  = (page - 1) * limit;
  const aprobado = searchParams.get('aprobado');
  const q        = searchParams.get('q')?.trim();

  const where: string[] = [];
  const params: any[]   = [];

  if (aprobado === 'true')  { where.push('c.aprobado = true');  }
  if (aprobado === 'false') { where.push('c.aprobado = false'); }
  if (q) {
    where.push('(c.nombre ILIKE ? OR c.comentario ILIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const [[comentarios], [countRows]]: any = await Promise.all([
      db.query(
        `SELECT c.id, c.producto_id, c.nombre, c.comentario, c.calificacion,
                c.aprobado, c.creado_en,
                p.nombre AS producto_nombre, p.seccion, p.slug AS producto_slug,
                p.categoria_slug
         FROM comentarios_productos c
         LEFT JOIN productos p ON p.id = c.producto_id
         ${whereClause}
         ORDER BY c.creado_en DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*) AS total FROM comentarios_productos c ${whereClause}`,
        params
      ),
    ]);

    const total = Number(countRows[0]?.total ?? 0);
    return NextResponse.json({
      ok: true,
      comentarios,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    console.error('[GET /api/admin/comentarios]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
