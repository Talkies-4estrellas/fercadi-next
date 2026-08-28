import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/chat/[id]
 * Devuelve los mensajes de una conversación. Marca como leídos los del admin.
 * Header requerido: x-usuario-id
 *
 * POST /api/chat/[id]
 * Envía un mensaje como usuario.
 * Header: x-usuario-id | Body: { texto: string }
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = Number(req.headers.get('x-usuario-id'));
  if (!usuarioId) return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 });

  const { id } = await params;
  const convId = Number(id);

  try {
    // Verificar que la conversación pertenece al usuario
    const [convRows]: any = await db.query(
      'SELECT id FROM conversaciones WHERE id = ? AND usuario_id = ? LIMIT 1',
      [convId, usuarioId]
    );
    if (!(convRows as any[]).length) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 });

    // Obtener mensajes
    const [rows]: any = await db.query(
      'SELECT id, remitente, texto, leido, creado_en FROM mensajes_chat WHERE conversacion_id = ? ORDER BY creado_en ASC',
      [convId]
    );

    // Marcar mensajes del admin como leídos
    await db.query(
      "UPDATE mensajes_chat SET leido = true WHERE conversacion_id = ? AND remitente = 'admin' AND leido = false",
      [convId]
    );

    return NextResponse.json({ ok: true, mensajes: rows ?? [] });
  } catch (e: any) {
    console.error('[GET /api/chat/[id]]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = Number(req.headers.get('x-usuario-id'));
  if (!usuarioId) return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 });

  const { id } = await params;
  const convId = Number(id);

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido.' }, { status: 400 });
  }

  const texto = body?.texto?.trim();
  if (!texto || texto.length < 1) return NextResponse.json({ ok: false, error: 'El mensaje no puede estar vacío.' }, { status: 400 });
  if (texto.length > 1000) return NextResponse.json({ ok: false, error: 'Mensaje demasiado largo (máx. 1000 caracteres).' }, { status: 400 });

  try {
    // Verificar que la conversación pertenece al usuario
    const [convRows]: any = await db.query(
      'SELECT id FROM conversaciones WHERE id = ? AND usuario_id = ? LIMIT 1',
      [convId, usuarioId]
    );
    if (!(convRows as any[]).length) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 });

    await db.query(
      "INSERT INTO mensajes_chat (conversacion_id, remitente, texto) VALUES (?, 'usuario', ?)",
      [convId, texto]
    );
    await db.query('UPDATE conversaciones SET actualizado_en = NOW() WHERE id = ?', [convId]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[POST /api/chat/[id]]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
