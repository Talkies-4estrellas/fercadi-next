import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/chat?producto_id=X
 * Devuelve o crea la conversación del usuario autenticado para ese producto.
 * Header requerido: x-usuario-id
 */
export async function GET(req: Request) {
  const usuarioId = Number(req.headers.get('x-usuario-id'));
  if (!usuarioId) return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productoId = Number(searchParams.get('producto_id'));
  if (!productoId) return NextResponse.json({ ok: false, error: 'producto_id requerido.' }, { status: 400 });

  try {
    // Verificar usuario
    const [userRows]: any = await db.query(
      'SELECT nombre FROM usuarios WHERE id = ? LIMIT 1',
      [usuarioId]
    );
    if (!(userRows as any[]).length) return NextResponse.json({ ok: false, error: 'Usuario no encontrado.' }, { status: 401 });
    const nombreUsuario = userRows[0].nombre;

    // Buscar conversación existente
    const [convRows]: any = await db.query(
      'SELECT id FROM conversaciones WHERE usuario_id = ? AND producto_id = ? LIMIT 1',
      [usuarioId, productoId]
    );

    if ((convRows as any[]).length) {
      return NextResponse.json({ ok: true, conversacion_id: convRows[0].id });
    }

    // Obtener nombre del producto
    const [prodRows]: any = await db.query(
      'SELECT nombre FROM productos WHERE id = ? LIMIT 1',
      [productoId]
    );
    const productoNombre = prodRows[0]?.nombre ?? 'Producto';

    // Crear conversación
    const [result]: any = await db.query(
      'INSERT INTO conversaciones (usuario_id, usuario_nombre, producto_id, producto_nombre) VALUES (?, ?, ?, ?)',
      [usuarioId, nombreUsuario, productoId, productoNombre]
    );
    return NextResponse.json({ ok: true, conversacion_id: result.insertId });
  } catch (e: any) {
    console.error('[GET /api/chat]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
