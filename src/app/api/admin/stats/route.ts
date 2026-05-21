import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

/**
 * GET /api/admin/stats
 *
 * Devuelve estadísticas agregadas del catálogo usando COUNT en SQL
 * — sin descargar ningún producto completo.
 */
export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const [[porSeccion], [totales]] = await Promise.all([
      // Conteo por sección (solo activos)
      db.query(
        `SELECT seccion, COUNT(*) AS total
           FROM productos
          WHERE activo = 1
          GROUP BY seccion
          ORDER BY total DESC`
      ),
      // Total global + inactivos
      db.query(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) AS inactivos
         FROM productos`
      ),
    ]) as any;

    const secciones: Record<string, number> = {};
    for (const row of porSeccion as any[]) {
      secciones[row.seccion] = Number(row.total);
    }

    return NextResponse.json({
      ok:       true,
      total:    Number((totales as any[])[0]?.total    ?? 0),
      inactivos: Number((totales as any[])[0]?.inactivos ?? 0),
      secciones,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/stats]', error);
    return NextResponse.json(
      { ok: false, message: 'Error al obtener estadísticas', detalle: error?.message },
      { status: 500 }
    );
  }
}
