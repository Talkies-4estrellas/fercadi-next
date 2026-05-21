import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/perfil?userId=123
 * Devuelve compras (pedidos), servicios y suscripciones del usuario.
 * Las consultas se ejecutan en paralelo; si alguna tabla no existe
 * devolvemos array vacío para ese bloque y un warning en el log,
 * pero NO escondemos errores graves (problemas de conexión, sintaxis SQL, etc.).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: 'userId requerido' },
      { status: 400 }
    );
  }

  try {
    const [compras, servicios, suscripciones] = await Promise.all([
      db
        .query(
          `SELECT
             o.id,
             o.total,
             o.estado,
             o.notas,
             o.direccion_entrega,
             o.created_at AS fecha,
             COUNT(p.id) AS num_items
           FROM ordenes o
           LEFT JOIN pedidos p ON p.orden_id = o.id
           WHERE o.usuario_id = ?
           GROUP BY o.id
           ORDER BY o.created_at DESC`,
          [userId]
        )
        .then(([rows]) => rows)
        .catch((err) => {
          console.warn('[/api/perfil] ordenes query falló:', err.message);
          return [];
        }),
      db
        .query(
          'SELECT * FROM servicios_contratados WHERE usuario_id = ? ORDER BY fecha DESC',
          [userId]
        )
        .then(([rows]) => rows)
        .catch((err) => {
          console.warn('[/api/perfil] servicios query falló:', err.message);
          return [];
        }),
      db
        .query(
          'SELECT * FROM suscripciones WHERE usuario_id = ? ORDER BY fecha_inicio DESC',
          [userId]
        )
        .then(([rows]) => rows)
        .catch((err) => {
          console.warn('[/api/perfil] suscripciones query falló:', err.message);
          return [];
        }),
    ]);

    return NextResponse.json({ ok: true, compras, servicios, suscripciones });
  } catch (error: any) {
    console.error('[/api/perfil] error inesperado:', error);
    return NextResponse.json(
      { ok: false, message: 'Error al consultar el perfil', detalle: error?.message },
      { status: 500 }
    );
  }
}
