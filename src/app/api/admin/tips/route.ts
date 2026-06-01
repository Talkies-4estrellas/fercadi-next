import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * GET /api/admin/tips
 * Lista todos los tips (activos e inactivos) paginados.
 * ?q=búsqueda&page=1&limit=20
 */
export async function GET(req: Request) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q     = searchParams.get('q')?.trim() ?? '';
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (q) {
      conditions.push('(titulo ILIKE ? OR descripcion ILIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [[rows], [countRows]]: any = await Promise.all([
      db.query(
        `SELECT id, slug, titulo, descripcion, imagen, activo, created_at
           FROM tips ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*) AS total FROM tips ${where}`,
        params
      ),
    ]);

    const total = Number((countRows as any[])[0]?.total ?? 0);
    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ ok: true, tips: rows, total, page, pages, limit });
  } catch (e: any) {
    console.error('[GET /api/admin/tips]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/tips
 * Body: { slug, titulo, descripcion?, imagen?, contenido?, activo? }
 */
export async function POST(req: Request) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { slug, titulo, descripcion, imagen, contenido, activo } = await req.json();

    if (!slug?.trim())   return NextResponse.json({ ok: false, error: 'El slug es requerido.'   }, { status: 400 });
    if (!titulo?.trim()) return NextResponse.json({ ok: false, error: 'El título es requerido.' }, { status: 400 });

    // Verificar slug único
    const [exists]: any = await db.query('SELECT id FROM tips WHERE slug = ? LIMIT 1', [slug.trim()]);
    if ((exists as any[]).length > 0) {
      return NextResponse.json({ ok: false, error: `El slug "${slug}" ya está en uso.` }, { status: 409 });
    }

    const [result]: any = await db.query(
      `INSERT INTO tips (slug, titulo, descripcion, imagen, contenido, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        slug.trim(),
        titulo.trim(),
        descripcion?.trim() || null,
        imagen?.trim()      || null,
        contenido?.trim()   || null,
        activo !== false ? 1 : 0,
      ]
    );

    return NextResponse.json({ ok: true, id: (result as any).insertId });
  } catch (e: any) {
    console.error('[POST /api/admin/tips]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
