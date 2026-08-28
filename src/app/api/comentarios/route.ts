import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/comentarios?producto_id=X
 * Devuelve los comentarios aprobados de un producto (público, sin auth).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productoId = Number(searchParams.get('producto_id'));

  if (!productoId || isNaN(productoId)) {
    return NextResponse.json(
      { ok: false, error: 'El parámetro producto_id es requerido.' },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await db.query(
      `SELECT id, nombre, comentario, calificacion, creado_en
       FROM comentarios_productos
       WHERE producto_id = ? AND aprobado = true
       ORDER BY creado_en DESC`,
      [productoId]
    );
    return NextResponse.json({ ok: true, comentarios: rows ?? [] });
  } catch (e: any) {
    console.error('[GET /api/comentarios]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

/**
 * POST /api/comentarios
 * Header requerido: x-usuario-id
 * Body: { producto_id: number, comentario: string, calificacion: number (1-5) }
 *
 * Cualquier usuario autenticado puede comentar (no solo admin).
 */
export async function POST(req: Request) {
  // ── 1. Verificar usuario autenticado ──────────────────────────
  const usuarioId = Number(req.headers.get('x-usuario-id'));
  if (!usuarioId || isNaN(usuarioId)) {
    return NextResponse.json(
      { ok: false, error: 'Debes iniciar sesión para dejar un comentario.' },
      { status: 401 }
    );
  }

  // ── 2. Confirmar que el usuario existe en la BD ───────────────
  let nombreUsuario = '';
  try {
    const [userRows]: any = await db.query(
      'SELECT id, nombre FROM usuarios WHERE id = ? LIMIT 1',
      [usuarioId]
    );
    if (!(userRows as any[]).length) {
      return NextResponse.json({ ok: false, error: 'Usuario no encontrado.' }, { status: 401 });
    }
    nombreUsuario = (userRows as any[])[0].nombre;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Error al verificar usuario.' }, { status: 500 });
  }

  // ── 3. Leer body ──────────────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body JSON inválido.' }, { status: 400 });
  }

  const { producto_id, comentario, calificacion } = body ?? {};

  if (!producto_id || !comentario?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'producto_id y comentario son requeridos.' },
      { status: 400 }
    );
  }

  const cal = Number(calificacion);
  if (isNaN(cal) || cal < 1 || cal > 5) {
    return NextResponse.json(
      { ok: false, error: 'La calificación debe ser un número entre 1 y 5.' },
      { status: 400 }
    );
  }

  // ── 4. Evitar comentarios duplicados del mismo usuario ────────
  try {
    const [existeRows]: any = await db.query(
      'SELECT id FROM comentarios_productos WHERE producto_id = ? AND usuario_id = ? LIMIT 1',
      [producto_id, usuarioId]
    );
    if ((existeRows as any[]).length > 0) {
      return NextResponse.json(
        { ok: false, error: 'Ya dejaste un comentario para este producto.' },
        { status: 409 }
      );
    }
  } catch { /* continuar */ }

  // ── 5. Insertar comentario ────────────────────────────────────
  try {
    const [result]: any = await db.query(
      `INSERT INTO comentarios_productos (producto_id, usuario_id, nombre, comentario, calificacion)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(producto_id), usuarioId, nombreUsuario, comentario.trim(), cal]
    );

    return NextResponse.json({ ok: true, id: (result as any).insertId });
  } catch (e: any) {
    console.error('[POST /api/comentarios]', e);
    return NextResponse.json({ ok: false, error: 'Error al guardar el comentario.' }, { status: 500 });
  }
}
