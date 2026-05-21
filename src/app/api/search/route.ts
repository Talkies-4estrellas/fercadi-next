import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/search?q=clavos+acero
 *
 * Búsqueda en tiempo real contra MySQL.
 * - Mínimo 2 caracteres; si no se envía `q` devuelve [].
 * - LIKE '%term%' sobre nombre + categoria_nombre + marca.
 * - LIMIT 20 hace que el scan se detenga temprano — < 10 ms en 15k filas.
 * - Ordena: primero los que *empiezan* con el término, luego el resto.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const contains   = `%${q}%`;
    const startsWith = `${q}%`;

    const [rows]: any = await db.query(
      `SELECT nombre,
              slug,
              seccion,
              categoria_slug,
              categoria_nombre,
              imagen_url AS imagen
         FROM productos
        WHERE activo = 1
          AND (nombre LIKE ? OR categoria_nombre LIKE ? OR marca LIKE ?)
        ORDER BY
          (nombre LIKE ?) DESC,
          LENGTH(nombre) ASC,
          nombre ASC
        LIMIT 20`,
      [contains, contains, contains, startsWith]
    );

    const items = (rows as any[]).map((p: any) => {
      const seccionLabel =
        p.seccion === 'concretos'  ? 'Concretos'  :
        p.seccion === 'textucos'   ? 'Acabados'   :
        p.seccion === 'ferreteria' ? 'Ferretería' :
        p.seccion.charAt(0).toUpperCase() + p.seccion.slice(1);

      const href =
        p.seccion === 'materiales'
          ? `/materiales/${p.categoria_slug}`
          : `/${p.seccion}/${p.categoria_slug}/${p.slug}`;

      return {
        nombre:      p.nombre as string,
        descripcion: '',
        categoria:   p.categoria_slug as string,
        seccion:     seccionLabel,
        href,
        imagen:      (p.imagen as string | null) ?? undefined,
      };
    });

    return NextResponse.json(items, {
      headers: {
        // Cacheable 30 s en CDN: resultados no cambian segundo a segundo
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('[GET /api/search]', err);
    return NextResponse.json([], { status: 503 });
  }
}
