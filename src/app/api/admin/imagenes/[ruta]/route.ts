import { NextRequest, NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import { deleteFile } from '@/lib/supabaseStorage';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BUCKET = 'productos';
const PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

export async function DELETE(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ruta } = body as { ruta?: string };

  if (!ruta) {
    return NextResponse.json({ ok: false, message: 'Falta el campo ruta' }, { status: 400 });
  }

  // Solo se pueden eliminar imágenes de Supabase (no locales)
  if (!ruta.startsWith(PREFIX)) {
    return NextResponse.json({ ok: false, message: 'Solo se pueden eliminar imágenes de Supabase Storage' }, { status: 400 });
  }

  const path = ruta.replace(PREFIX, '');

  try {
    await deleteFile(path);
    return NextResponse.json({ ok: true, path });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
