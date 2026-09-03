import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

export const maxDuration = 60;

// ── Helpers ─────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNum(val: string): number | null {
  const t = val?.trim();
  if (!t || t === '*') return null;
  const n = parseFloat(t);
  return isNaN(n) ? null : n;
}

function toStr(val: string): string | null {
  const t = val?.trim();
  return (!t || t === '*') ? null : t;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Formatos de importación ──────────────────────────────────────

const SECCIONES_VALIDAS = ['ferreteria', 'concretos', 'textucos', 'materiales'] as const;
type Seccion = typeof SECCIONES_VALIDAS[number];

/**
 * Ferretería: 26 columnas del catálogo de proveedor.
 * Devuelve array de 32 valores para INSERT.
 */
function parsearFilaFerreteria(c: string[]): any[] | null {
  if (c.length < 24) return null;
  const nombre        = c[2].replace(/^"|"$/g, '').trim();
  const claveRaw      = c[1].trim();
  const slug          = toSlug(claveRaw) || `prod-${c[0].trim()}`;
  const categoriaSlug = toSlug(c[22].trim()) || 'general';
  const catNombre     = toStr(c[23]) ?? 'General';
  const ppIva         = toNum(c[13]);
  const precio        = ppIva ?? 0;

  return [
    nombre, slug, nombre, null, precio, null,
    'ferreteria', categoriaSlug, catNombre, 0, 1,
    toStr(c[17]), toStr(c[7]),
    toStr(c[0]), toStr(c[8]), toStr(c[3]),
    toNum(c[4]) !== null ? Math.round(toNum(c[4])!) : null,
    toNum(c[5]) !== null ? Math.round(toNum(c[5])!) : null,
    toNum(c[10]) === 1 ? 1 : 0,
    toNum(c[9]), toNum(c[11]), toNum(c[12]), ppIva,
    toNum(c[14]), toNum(c[15]), toNum(c[16]),
    toNum(c[18]), toNum(c[19]),
    toStr(c[20]), toStr(c[21]),
    toNum(c[24]), toNum(c[25]),
  ];
}

/**
 * Formato simple (concretos / textucos / materiales):
 * nombre, descripcion, precio, categoria_slug, categoria_nombre, marca, unidad, imagen_url
 * Devuelve array de 32 valores (campos comerciales en NULL).
 */
function parsearFilaSimple(c: string[], seccion: Seccion): any[] | null {
  const nombre = toStr(c[0]);
  if (!nombre) return null;
  const descripcion   = toStr(c[1]) ?? nombre;
  const precio        = toNum(c[2]) ?? 0;
  const categoriaSlug = toSlug(c[3]?.trim() ?? '') || 'general';
  const catNombre     = toStr(c[4]) ?? 'General';
  const marca         = toStr(c[5]);
  const unidad        = toStr(c[6]);
  const imagenUrl     = toStr(c[7]);
  const slug          = toSlug(nombre) || `prod-${Date.now()}`;

  return [
    nombre, slug, descripcion, null, precio, imagenUrl,
    seccion, categoriaSlug, catNombre, 0, 1,
    marca, unidad,
    null, null, null, null, null, 0,
    null, null, null, null,
    null, null, null, null, null,
    null, null, null, null,
  ];
}

// ── INSERT con upsert ────────────────────────────────────────────

async function insertarLote(filas: any[][]): Promise<void> {
  const COLS = 32;
  const marcadores = filas.map((_, rowIdx) => {
    const start = rowIdx * COLS + 1;
    return `(${Array.from({ length: COLS }, (_, c) => `$${start + c}`).join(',')})`;
  }).join(',');

  await db.query(
    `INSERT INTO productos
       (nombre, slug, descripcion, descripcion2, precio, imagen_url,
        seccion, categoria_slug, categoria_nombre, stock, activo,
        marca, unidad,
        codigo_interno, ean, margen, caja, master,
        alta_rotacion, precio_minimo,
        precio_mayoreo_con_iva, precio_distribuidor_con_iva, precio_publico_con_iva,
        precio_mayoreo_sin_iva, precio_distribuidor_sin_iva, precio_publico_sin_iva,
        precio_medio_mayoreo_sin_iva, precio_medio_mayoreo_con_iva,
        codigo_sat, descripcion_sat,
        peso_kg, volumen_cm3)
     VALUES ${marcadores}
     ON CONFLICT (slug, seccion) DO UPDATE SET
       nombre                       = EXCLUDED.nombre,
       descripcion                  = EXCLUDED.descripcion,
       precio                       = EXCLUDED.precio,
       imagen_url                   = COALESCE(EXCLUDED.imagen_url, productos.imagen_url),
       categoria_nombre             = EXCLUDED.categoria_nombre,
       marca                        = EXCLUDED.marca,
       unidad                       = EXCLUDED.unidad,
       codigo_interno               = EXCLUDED.codigo_interno,
       ean                          = EXCLUDED.ean,
       margen                       = EXCLUDED.margen,
       caja                         = EXCLUDED.caja,
       master                       = EXCLUDED.master,
       alta_rotacion                = EXCLUDED.alta_rotacion,
       precio_minimo                = EXCLUDED.precio_minimo,
       precio_mayoreo_con_iva       = EXCLUDED.precio_mayoreo_con_iva,
       precio_distribuidor_con_iva  = EXCLUDED.precio_distribuidor_con_iva,
       precio_publico_con_iva       = EXCLUDED.precio_publico_con_iva,
       precio_mayoreo_sin_iva       = EXCLUDED.precio_mayoreo_sin_iva,
       precio_distribuidor_sin_iva  = EXCLUDED.precio_distribuidor_sin_iva,
       precio_publico_sin_iva       = EXCLUDED.precio_publico_sin_iva,
       precio_medio_mayoreo_sin_iva = EXCLUDED.precio_medio_mayoreo_sin_iva,
       precio_medio_mayoreo_con_iva = EXCLUDED.precio_medio_mayoreo_con_iva,
       codigo_sat                   = EXCLUDED.codigo_sat,
       descripcion_sat              = EXCLUDED.descripcion_sat,
       peso_kg                      = EXCLUDED.peso_kg,
       volumen_cm3                  = EXCLUDED.volumen_cm3`,
    filas.flat()
  );
}

// ── Handler ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, message: 'Se esperaba multipart/form-data.' }, { status: 400 });
  }

  const file    = formData.get('file') as File | null;
  const seccion = (formData.get('seccion') as string | null)?.trim() as Seccion | undefined;

  if (!file) {
    return NextResponse.json({ ok: false, message: 'Falta el archivo CSV.' }, { status: 400 });
  }
  if (!seccion || !SECCIONES_VALIDAS.includes(seccion)) {
    return NextResponse.json(
      { ok: false, message: `Sección inválida. Usa: ${SECCIONES_VALIDAS.join(', ')}` },
      { status: 400 }
    );
  }

  const texto   = await file.text();
  const lineas  = texto.split(/\r?\n/);
  const datos   = lineas.slice(1).filter(l => l.trim()); // saltar encabezado

  const inicio    = Date.now();
  let insertados  = 0;
  let errores     = 0;
  const detalles: string[] = [];
  const BATCH = 500;

  for (let i = 0; i < datos.length; i += BATCH) {
    const lote  = datos.slice(i, i + BATCH);
    const filas: any[][] = [];

    for (const [j, linea] of lote.entries()) {
      try {
        const c    = parseLine(linea);
        const fila = seccion === 'ferreteria'
          ? parsearFilaFerreteria(c)
          : parsearFilaSimple(c, seccion);

        if (fila) filas.push(fila);
      } catch (e: any) {
        detalles.push(`Línea ${i + j + 2}: ${e.message}`);
        errores++;
      }
    }

    if (filas.length === 0) continue;

    try {
      await insertarLote(filas);
      insertados += filas.length;
    } catch (e: any) {
      errores += filas.length;
      detalles.push(`Lote ${Math.floor(i / BATCH) + 1}: ${e.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    seccion,
    insertados,
    errores,
    duracion_ms: Date.now() - inicio,
    detalles: detalles.slice(0, 20),
  });
}
