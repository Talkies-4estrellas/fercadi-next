import { NextRequest, NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import { getCategorias } from '@/lib/productos';

/**
 * GET /api/admin/categorias?seccion=textucos
 * Devuelve las categorías activas de una sección para poblar el selector del formulario.
 */
export async function GET(req: NextRequest) {
  const auth = await requerirAdmin(req);
  if (!auth.ok) return auth.response;

  const seccion = req.nextUrl.searchParams.get('seccion') ?? '';
  if (!seccion) return NextResponse.json({ ok: false, error: 'Falta el parámetro seccion' }, { status: 400 });

  const categorias = await getCategorias(seccion);
  return NextResponse.json({ ok: true, categorias });
}
