import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * GET /api/admin/pedidos
 * Lista de órdenes con info del usuario, estado y cantidad de ítems.
 * Soporta ?estado=pendiente&page=1&limit=50&q=nombre_usuario
 */
export async function GET(req: Request) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado') ?? '';
  const q      = searchParams.get('q')?.trim() ?? '';
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
  const offset = (page - 1) * limit;

  const estados_validos = ['pendiente','confirmado','en_preparacion','enviado','entregado','cancelado'];

  try {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (estado && estados_validos.includes(estado)) {
      conditions.push('o.estado = ?');
      params.push(estado);
    }
    if (q) {
      conditions.push('(u.nombre ILIKE ? OR u.correo ILIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [[rows], [countRows]]: any = await Promise.all([
      db.query(
        `SELECT
           o.id,
           o.usuario_id,
           u.nombre AS usuario_nombre,
           u.correo AS usuario_correo,
           o.total,
           o.estado,
           o.notas,
           o.direccion_entrega,
           o.created_at,
           COUNT(p.id) AS num_items
         FROM ordenes o
         LEFT JOIN usuarios u ON u.id = o.usuario_id
         LEFT JOIN pedidos  p ON p.orden_id = o.id
         ${where}
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      db.query(
        `SELECT COUNT(DISTINCT o.id) AS total
           FROM ordenes o
           LEFT JOIN usuarios u ON u.id = o.usuario_id
           ${where}`,
        params
      ),
    ]);

    const total = Number((countRows as any[])[0]?.total ?? 0);
    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      ok: true,
      ordenes: rows,
      total,
      page,
      pages,
      limit,
    });
  } catch (e: any) {
    console.error('[GET /api/admin/pedidos]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
