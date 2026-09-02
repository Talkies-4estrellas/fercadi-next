import { NextRequest, NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

/**
 * GET /api/admin/usuarios?q=&rol=&page=&limit=
 * Lista paginada de usuarios. Nunca devuelve el campo password.
 */
export async function GET(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = req.nextUrl;
  const q     = searchParams.get('q')?.trim() ?? '';
  const rol   = searchParams.get('rol')?.trim() ?? '';
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25', 10)));
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const params: any[] = [];

  if (q) {
    where.push('(nombre ILIKE ? OR correo ILIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (rol) {
    where.push('rol = ?');
    params.push(rol);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [countRows]: any = await db.query(
    `SELECT COUNT(*) AS total FROM usuarios ${whereClause}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const [rows]: any = await db.query(
    `SELECT id, nombre, correo, rol, created_at, ciudad, profesion
     FROM usuarios ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return NextResponse.json({
    ok: true,
    usuarios: rows,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
