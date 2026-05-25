import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

// GET — todos los slides (activos e inactivos)
export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const [rows] = await db.query(
    'SELECT * FROM carousel_slides ORDER BY orden ASC'
  );
  return NextResponse.json({ ok: true, slides: rows });
}

// POST — crear slide nuevo
export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { imagen_url, alt, titulo, descripcion, slogan, orden, activo } = await request.json();

  if (!imagen_url?.trim()) {
    return NextResponse.json({ ok: false, message: 'La imagen es obligatoria' }, { status: 400 });
  }

  const [meta]: any = await db.query(
    `INSERT INTO carousel_slides (imagen_url, alt, titulo, descripcion, slogan, orden, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      imagen_url.trim(),
      alt?.trim() || null,
      titulo?.trim() || null,
      descripcion?.trim() || null,
      slogan?.trim() || null,
      orden ?? 0,
      activo ?? 1,
    ]
  );

  return NextResponse.json({ ok: true, id: meta.insertId }, { status: 201 });
}
