import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/search?q=tornillo+acero
 *
 * Búsqueda con relevancia en múltiples niveles:
 *   10 — nombre exacto (case-insensitive)
 *    8 — nombre empieza con el término
 *    6 — nombre contiene el término
 *    4 — categoría empieza con el término
 *    2 — marca empieza con el término
 *    0 — solo coincide en contenido de categoría/marca
 *
 * Multi-palabra: si el query tiene espacios, busca productos que contengan
 * TODOS los términos (AND); si hay < 3 resultados, cae en OR.
 */

export const dynamic = 'force-dynamic';

const SECCION_LABEL: Record<string, string> = {
  concretos:  'Concretos',
  textucos:   'Acabados',
  ferreteria: 'Ferretería',
  materiales: 'Materiales',
};

function seccionLabel(s: string) {
  return SECCION_LABEL[s] ?? (s.charAt(0).toUpperCase() + s.slice(1));
}

function buildHref(p: any): string {
  return p.seccion === 'materiales'
    ? `/materiales/${p.categoria_slug}`
    : `/${p.seccion}/${p.categoria_slug}/${p.slug}`;
}

function toItem(p: any) {
  return {
    nombre:      p.nombre      as string,
    descripcion: (p.descripcion as string | null) ?? '',
    marca:       (p.marca      as string | null) ?? '',
    categoria:   p.categoria_slug as string,
    seccion:     seccionLabel(p.seccion),
    href:        buildHref(p),
    imagen:      (p.imagen as string | null) ?? undefined,
  };
}

const SELECT = `
  SELECT nombre, slug, seccion, categoria_slug, categoria_nombre,
         descripcion, marca, imagen_url AS imagen`;

const FROM_WHERE_ACTIVE = `
   FROM productos
  WHERE activo = 1`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) return NextResponse.json([]);

  try {
    const words = q.split(/\s+/).filter(w => w.length >= 2);

    /* ── Término único ────────────────────────────────────────── */
    if (words.length <= 1) {
      const exact    = q;
      const starts   = `${q}%`;
      const contains = `%${q}%`;

      const [rows]: any = await db.query(
        `${SELECT},
                CASE
                  WHEN nombre           ILIKE ? THEN 10
                  WHEN nombre           ILIKE ? THEN  8
                  WHEN nombre           ILIKE ? THEN  6
                  WHEN categoria_nombre ILIKE ? THEN  4
                  WHEN marca            ILIKE ? THEN  2
                  ELSE 0
                END AS score
         ${FROM_WHERE_ACTIVE}
           AND (nombre ILIKE ? OR categoria_nombre ILIKE ? OR marca ILIKE ?)
         ORDER BY score DESC, LENGTH(nombre) ASC, nombre ASC
         LIMIT 20`,
        [exact, starts, contains, starts, starts, contains, contains, contains]
      );

      return jsonOk((rows as any[]).map(toItem));
    }

    /* ── Multi-palabra ─────────────────────────────────────────
       Intenta AND primero (todos los términos deben estar en
       al menos uno de: nombre, categoria_nombre, marca).
       Si hay < 3 resultados, cae a OR.
    ────────────────────────────────────────────────────────── */
    const andClauses = words
      .map(() => `(nombre ILIKE ? OR categoria_nombre ILIKE ? OR marca ILIKE ?)`)
      .join(' AND ');

    const nameScoreExpr = words
      .map(() => `(CASE WHEN nombre ILIKE ? THEN 2 ELSE 0 END)`)
      .join(' + ');

    const andParams = [
      ...words.map(w => `%${w}%`),
      ...words.flatMap(w => [`%${w}%`, `%${w}%`, `%${w}%`]),
    ];

    const [andRows]: any = await db.query(
      `${SELECT},
              (${nameScoreExpr}) AS score
       ${FROM_WHERE_ACTIVE}
         AND (${andClauses})
       ORDER BY score DESC, LENGTH(nombre) ASC, nombre ASC
       LIMIT 20`,
      andParams
    );

    if ((andRows as any[]).length >= 3) {
      return jsonOk((andRows as any[]).map(toItem));
    }

    /* Fallback OR */
    const orClauses = words
      .map(() => `(nombre ILIKE ? OR categoria_nombre ILIKE ? OR marca ILIKE ?)`)
      .join(' OR ');

    const orScoreExpr = words
      .map(() => `(CASE WHEN nombre ILIKE ? THEN 1 ELSE 0 END)`)
      .join(' + ');

    const orParams = [
      ...words.map(w => `%${w}%`),
      ...words.flatMap(w => [`%${w}%`, `%${w}%`, `%${w}%`]),
    ];

    const [orRows]: any = await db.query(
      `${SELECT},
              (${orScoreExpr}) AS score
       ${FROM_WHERE_ACTIVE}
         AND (${orClauses})
       ORDER BY score DESC, LENGTH(nombre) ASC, nombre ASC
       LIMIT 20`,
      orParams
    );

    return jsonOk((orRows as any[]).map(toItem));
  } catch (err) {
    console.error('[GET /api/search]', err);
    return NextResponse.json([], { status: 503 });
  }
}

function jsonOk(items: object[]) {
  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' },
  });
}
