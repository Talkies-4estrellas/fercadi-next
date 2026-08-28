import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * DELETE /api/admin/comentarios/[id]
 * Elimina permanentemente un comentario.
 *
 * PATCH /api/admin/comentarios/[id]
 * Body: { aprobado: boolean }
 * Aprueba u oculta un comentario.
 */

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const comentarioId = Number(id);
  if (!comentarioId) return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });

  try {
    await db.query('DELETE FROM comentarios_productos WHERE id = ?', [comentarioId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[DELETE /api/admin/comentarios]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const comentarioId = Number(id);
  if (!comentarioId) return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 });
  }

  if (typeof body?.aprobado !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'Se requiere { aprobado: boolean }' }, { status: 400 });
  }

  try {
    await db.query(
      'UPDATE comentarios_productos SET aprobado = ? WHERE id = ?',
      [body.aprobado, comentarioId]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[PATCH /api/admin/comentarios]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
