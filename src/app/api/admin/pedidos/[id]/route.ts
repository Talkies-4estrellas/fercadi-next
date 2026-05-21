import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

const ESTADOS = ['pendiente','confirmado','en_preparacion','enviado','entregado','cancelado'] as const;

/**
 * GET /api/admin/pedidos/[id]
 * Detalle de una orden: cabecera + ítems.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const ordenId = parseInt(id, 10);
  if (isNaN(ordenId)) {
    return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });
  }

  try {
    const [[ordenRows], [itemRows]]: any = await Promise.all([
      db.query(
        `SELECT o.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
           FROM ordenes o
           LEFT JOIN usuarios u ON u.id = o.usuario_id
          WHERE o.id = ? LIMIT 1`,
        [ordenId]
      ),
      db.query(
        `SELECT id, producto, opciones, cantidad, precio_unitario, total, estado
           FROM pedidos
          WHERE orden_id = ?
          ORDER BY id ASC`,
        [ordenId]
      ),
    ]);

    if (!(ordenRows as any[]).length) {
      return NextResponse.json({ ok: false, error: 'Orden no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, orden: (ordenRows as any[])[0], items: itemRows });
  } catch (e: any) {
    console.error('[GET /api/admin/pedidos/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/pedidos/[id]
 * Body: { estado: string }
 * Actualiza el estado de la orden y de todos sus ítems.
 */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const ordenId = parseInt(id, 10);
  if (isNaN(ordenId)) {
    return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { estado } = body;

    if (!ESTADOS.includes(estado)) {
      return NextResponse.json(
        { ok: false, error: `Estado inválido. Usa: ${ESTADOS.join(', ')}.` },
        { status: 400 }
      );
    }

    await db.query('UPDATE ordenes SET estado = ? WHERE id = ?', [estado, ordenId]);
    await db.query('UPDATE pedidos SET estado = ? WHERE orden_id = ?', [estado, ordenId]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[PUT /api/admin/pedidos/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
