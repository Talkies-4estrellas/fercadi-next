import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/tips/[id] — detalle completo */
export async function GET(req: Request, ctx: Ctx) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const tipId = parseInt(id, 10);
  if (isNaN(tipId)) return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });

  try {
    const [rows]: any = await db.query('SELECT * FROM tips WHERE id = ? LIMIT 1', [tipId]);
    if (!(rows as any[]).length) {
      return NextResponse.json({ ok: false, error: 'Tip no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, tip: (rows as any[])[0] });
  } catch (e: any) {
    console.error('[GET /api/admin/tips/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

/** PUT /api/admin/tips/[id] — actualizar */
export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const tipId = parseInt(id, 10);
  if (isNaN(tipId)) return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });

  try {
    const { slug, titulo, descripcion, imagen, contenido, activo } = await req.json();

    if (!slug?.trim())   return NextResponse.json({ ok: false, error: 'El slug es requerido.'   }, { status: 400 });
    if (!titulo?.trim()) return NextResponse.json({ ok: false, error: 'El título es requerido.' }, { status: 400 });

    // Verificar que el slug no lo use otro tip
    const [conflict]: any = await db.query(
      'SELECT id FROM tips WHERE slug = ? AND id != ? LIMIT 1',
      [slug.trim(), tipId]
    );
    if ((conflict as any[]).length > 0) {
      return NextResponse.json({ ok: false, error: `El slug "${slug}" ya está en uso por otro tip.` }, { status: 409 });
    }

    await db.query(
      `UPDATE tips SET slug=?, titulo=?, descripcion=?, imagen=?, contenido=?, activo=? WHERE id=?`,
      [
        slug.trim(),
        titulo.trim(),
        descripcion?.trim() || null,
        imagen?.trim()      || null,
        contenido?.trim()   || null,
        activo ? 1 : 0,
        tipId,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[PUT /api/admin/tips/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

/** DELETE /api/admin/tips/[id] — soft delete (activo = 0) */
export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const tipId = parseInt(id, 10);
  if (isNaN(tipId)) return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });

  try {
    await db.query('UPDATE tips SET activo = 0 WHERE id = ?', [tipId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[DELETE /api/admin/tips/[id]]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
