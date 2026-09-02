import { NextRequest, NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

/**
 * PATCH /api/admin/usuarios/[id]
 * Body: { rol: 'admin' | 'usuario' }
 * Cambia el rol del usuario. No permite modificar el propio usuario.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const targetId = parseInt(id, 10);

  if (isNaN(targetId)) {
    return NextResponse.json({ ok: false, message: 'ID inválido' }, { status: 400 });
  }

  // No puede modificarse a sí mismo
  if (targetId === auth.usuario.id) {
    return NextResponse.json(
      { ok: false, message: 'No puedes modificar tu propio rol.' },
      { status: 403 }
    );
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  const { rol } = body;
  if (rol !== 'admin' && rol !== 'usuario') {
    return NextResponse.json(
      { ok: false, message: 'Rol inválido. Solo se acepta "admin" o "usuario".' },
      { status: 400 }
    );
  }

  const [rows]: any = await db.query(
    `UPDATE usuarios SET rol = ? WHERE id = ? RETURNING id, nombre, correo, rol`,
    [rol, targetId]
  );

  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: false, message: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, usuario: rows[0] });
}
