import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * GET /api/admin/mensajes
 * Lista todas las conversaciones con último mensaje y contador de no leídos.
 */
export async function GET(req: Request) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const [rows]: any = await db.query(
      `SELECT
         c.id,
         c.usuario_id,
         c.usuario_nombre,
         c.producto_id,
         c.producto_nombre,
         c.actualizado_en,
         (SELECT texto FROM mensajes_chat WHERE conversacion_id = c.id ORDER BY creado_en DESC LIMIT 1) AS ultimo_mensaje,
         (SELECT remitente FROM mensajes_chat WHERE conversacion_id = c.id ORDER BY creado_en DESC LIMIT 1) AS ultimo_remitente,
         (SELECT COUNT(*) FROM mensajes_chat WHERE conversacion_id = c.id AND remitente = 'usuario' AND leido = false) AS no_leidos
       FROM conversaciones c
       ORDER BY c.actualizado_en DESC`
    );
    return NextResponse.json({ ok: true, conversaciones: rows ?? [] });
  } catch (e: any) {
    console.error('[GET /api/admin/mensajes]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
