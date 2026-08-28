import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * GET /api/admin/mensajes/[id]
 * Mensajes de una conversación. Marca los del usuario como leídos.
 *
 * POST /api/admin/mensajes/[id]
 * Body: { texto: string } — el admin responde.
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const convId = Number(id);

  try {
    const [rows]: any = await db.query(
      'SELECT id, remitente, texto, leido, creado_en FROM mensajes_chat WHERE conversacion_id = ? ORDER BY creado_en ASC',
      [convId]
    );

    // Marcar mensajes del usuario como leídos
    await db.query(
      "UPDATE mensajes_chat SET leido = true WHERE conversacion_id = ? AND remitente = 'usuario' AND leido = false",
      [convId]
    );

    return NextResponse.json({ ok: true, mensajes: rows ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const convId = Number(id);

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido.' }, { status: 400 });
  }

  const texto = body?.texto?.trim();
  if (!texto) return NextResponse.json({ ok: false, error: 'El mensaje no puede estar vacío.' }, { status: 400 });
  if (texto.length > 1000) return NextResponse.json({ ok: false, error: 'Mensaje demasiado largo.' }, { status: 400 });

  try {
    await db.query(
      "INSERT INTO mensajes_chat (conversacion_id, remitente, texto) VALUES (?, 'admin', ?)",
      [convId, texto]
    );
    await db.query('UPDATE conversaciones SET actualizado_en = NOW() WHERE id = ?', [convId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
