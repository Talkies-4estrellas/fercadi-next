import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

type Ctx = { params: Promise<{ id: string }> };

// PUT — editar slide
export async function PUT(request: Request, { params }: Ctx) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { imagen_url, alt, titulo, descripcion, slogan, orden, activo } = await request.json();

  if (!imagen_url?.trim()) {
    return NextResponse.json({ ok: false, message: 'La imagen es obligatoria' }, { status: 400 });
  }

  await db.query(
    `UPDATE carousel_slides
        SET imagen_url = ?, alt = ?, titulo = ?, descripcion = ?, slogan = ?, orden = ?, activo = ?
      WHERE id = ?`,
    [
      imagen_url.trim(),
      alt?.trim() || null,
      titulo?.trim() || null,
      descripcion?.trim() || null,
      slogan?.trim() || null,
      orden ?? 0,
      activo ?? 1,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

// DELETE — eliminar slide
export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await db.query('DELETE FROM carousel_slides WHERE id = ?', [id]);

  return NextResponse.json({ ok: true });
}
