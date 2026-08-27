import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { requerirAdmin } from '@/lib/admin';
import { uploadFile } from '@/lib/supabaseStorage';

/**
 * POST /api/admin/upload
 * Sube un archivo de imagen al bucket "productos" de Supabase Storage.
 *
 * Body: multipart/form-data con los campos:
 *   file     — el archivo de imagen
 *   path     — ruta dentro del bucket, ej. "concretos/clase-a/fc150.webp"
 *              Si se omite, se usa: "{seccion}/{categoria}/{nombre-original}"
 *   seccion  — (opcional) para construir la ruta automáticamente
 *   categoria — (opcional) para construir la ruta automáticamente
 *
 * Respuesta: { ok: true, url: "https://...supabase.co/storage/..." }
 */
export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No se recibió ningún archivo.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'webp';
    const PERMITIDOS = new Set(['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg']);
    if (!PERMITIDOS.has(ext)) {
      return NextResponse.json({ ok: false, error: 'Tipo de archivo no permitido.' }, { status: 400 });
    }

    // Construir la ruta dentro del bucket
    let storagePath = (formData.get('path') as string | null)?.trim();
    if (!storagePath) {
      const seccion  = (formData.get('seccion')  as string | null)?.trim() ?? 'general';
      const categoria = (formData.get('categoria') as string | null)?.trim() ?? 'sin-categoria';
      // Normalizar nombre: minúsculas, sin espacios
      const nombre = file.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.\-_]/g, '');
      storagePath = `${seccion}/${categoria}/${nombre}`;
    }

    const raw = await file.arrayBuffer();
    // Convertir siempre a WebP para consistencia y menor tamaño
    const webp = new Uint8Array(await sharp(Buffer.from(raw)).webp({ quality: 85 }).toBuffer());
    // Forzar extensión .webp en la ruta
    storagePath = storagePath.replace(/\.[^/.]+$/, '.webp');

    const url = await uploadFile(storagePath, webp, 'image/webp');

    return NextResponse.json({ ok: true, url, path: storagePath });
  } catch (err: any) {
    console.error('[POST /api/admin/upload]', err);
    return NextResponse.json({ ok: false, error: err?.message ?? 'Error al subir archivo.' }, { status: 500 });
  }
}
