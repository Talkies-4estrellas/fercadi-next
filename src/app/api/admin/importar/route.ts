import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/admin/importar
 *
 * Lee `catalogo_prueba.csv` de la raíz del proyecto y lo importa a la
 * tabla `productos` con seccion = 'ferreteria'.
 *
 * Regla de visibilidad:
 *  - Usuario normal: solo recibe los campos públicos (nombre, precio, marca, unidad…)
 *    a través de lib/productos.ts con SELECT explícito.
 *  - Admin: /api/admin/productos devuelve SELECT * con todos los campos comerciales.
 *
 * Manejo de datos del CSV:
 *  - Valores `*` → NULL
 *  - EAN en notación científica (`7.50624E+12`) → guardado tal cual como VARCHAR
 *  - `precio` = precio_publico_con_iva (campo 13 del CSV)
 *  - `slug` = clave del CSV en minúsculas, caracteres especiales → guión
 *  - `categoria_slug` = código Familia (ej. P085) en minúsculas
 *
 * Requiere header x-usuario-id de un usuario con rol='admin'.
 */

// Next.js App Router: aumentar timeout para importaciones largas
export const maxDuration = 60;

// ── Helpers ─────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // quitar acentos
    .replace(/[^a-z0-9-]+/g, '-')      // no-alfanumérico → guión
    .replace(/-{2,}/g, '-')            // colapsar guiones múltiples
    .replace(/^-+|-+$/g, '');          // trim guiones extremos
}

/** `*` o vacío → null, número válido → number */
function toNum(val: string): number | null {
  const t = val?.trim();
  if (!t || t === '*') return null;
  const n = parseFloat(t);
  return isNaN(n) ? null : n;
}

/** `*` o vacío → null, resto → string limpio */
function toStr(val: string): string | null {
  const t = val?.trim();
  return (!t || t === '*') ? null : t;
}

/**
 * Parser CSV robusto: maneja campos entre comillas con comas internas.
 * Retorna array de strings (sin quitar las comillas contenido).
 */
function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; // comilla escapada dentro de campo
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

// ── Handler ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  // Buscar el CSV en la raíz del proyecto
  const csvPath = path.join(process.cwd(), 'catalogo_prueba.csv');
  if (!fs.existsSync(csvPath)) {
    return NextResponse.json(
      { ok: false, message: 'No se encontró catalogo_prueba.csv en la raíz del proyecto.' },
      { status: 404 }
    );
  }

  const inicio = Date.now();
  const contenido = fs.readFileSync(csvPath, 'utf-8');
  // Soportar \r\n (Windows) y \n (Unix)
  const lineas = contenido.split(/\r?\n/);

  // Saltar la línea de encabezados (línea 0)
  const datos = lineas.slice(1).filter(l => l.trim());

  let insertados = 0;
  let errores = 0;
  const detalles: string[] = [];

  const BATCH = 500;

  for (let i = 0; i < datos.length; i += BATCH) {
    const lote = datos.slice(i, i + BATCH);
    const filas: any[][] = [];

    for (const linea of lote) {
      try {
        const c = parseLine(linea);
        if (c.length < 24) continue; // fila incompleta

        // ── Mapeo de columnas ──────────────────────────────────
        // 0:código  1:clave  2:descripción  3:margen  4:caja  5:master
        // 6:precio(lista)  7:unidad  8:ean  9:precio_min  10:alta_rot
        // 11:pm_iva  12:pd_iva  13:pp_iva  14:pm_sin  15:pd_sin  16:pp_sin
        // 17:Marca  18:pmm_sin  19:pmm_iva  20:cod_sat  21:desc_sat
        // 22:Familia  23:Desc.Familia  24:Peso[Kg]  25:Volumen[cm3]

        const nombre         = c[2].replace(/^"|"$/g, '').trim();
        const claveRaw       = c[1].trim();
        const slug           = toSlug(claveRaw) || `prod-${c[0].trim()}`;
        const categoriaSlug  = toSlug(c[22].trim()) || 'general';
        const categoriaNombre = toStr(c[23]) ?? 'General';
        const ppIva          = toNum(c[13]);     // precio público con IVA → precio público
        const precio         = ppIva ?? 0;       // precio = campo público principal

        filas.push([
          // ── Campos base ──────────────────────────────────────
          nombre,
          slug,
          nombre,              // descripcion = mismo que nombre para CSV
          null,                // descripcion2
          precio,              // precio (campo público)
          null,                // imagen_url
          'ferreteria',        // seccion
          categoriaSlug,
          categoriaNombre,
          0,                   // stock
          1,                   // activo
          // ── Campos públicos nuevos ────────────────────────────
          toStr(c[17]),        // marca
          toStr(c[7]),         // unidad
          // ── Campos comerciales (admin-only) ───────────────────
          toStr(c[0]),         // codigo_interno
          toStr(c[8]),         // ean
          toStr(c[3]),         // margen
          toNum(c[4]) !== null ? Math.round(toNum(c[4])!) : null, // caja
          toNum(c[5]) !== null ? Math.round(toNum(c[5])!) : null, // master
          toNum(c[10]) === 1 ? 1 : 0,   // alta_rotacion
          toNum(c[9]),         // precio_minimo
          toNum(c[11]),        // precio_mayoreo_con_iva
          toNum(c[12]),        // precio_distribuidor_con_iva
          ppIva,               // precio_publico_con_iva
          toNum(c[14]),        // precio_mayoreo_sin_iva
          toNum(c[15]),        // precio_distribuidor_sin_iva
          toNum(c[16]),        // precio_publico_sin_iva
          toNum(c[18]),        // precio_medio_mayoreo_sin_iva
          toNum(c[19]),        // precio_medio_mayoreo_con_iva
          toStr(c[20]),        // codigo_sat
          toStr(c[21]),        // descripcion_sat
          toNum(c[24]),        // peso_kg
          toNum(c[25]),        // volumen_cm3
        ]);
      } catch (e: any) {
        detalles.push(`Línea ${i + 1}: ${e.message}`);
        errores++;
      }
    }

    if (filas.length === 0) continue;

    // 32 columnas: 11 base + 2 públicas nuevas + 19 comerciales
    const marcadores = filas.map(() =>
      '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).join(',');

    try {
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
         ON DUPLICATE KEY UPDATE
           nombre                       = VALUES(nombre),
           descripcion                  = VALUES(descripcion),
           precio                       = VALUES(precio),
           categoria_nombre             = VALUES(categoria_nombre),
           marca                        = VALUES(marca),
           unidad                       = VALUES(unidad),
           codigo_interno               = VALUES(codigo_interno),
           ean                          = VALUES(ean),
           margen                       = VALUES(margen),
           caja                         = VALUES(caja),
           master                       = VALUES(master),
           alta_rotacion                = VALUES(alta_rotacion),
           precio_minimo                = VALUES(precio_minimo),
           precio_mayoreo_con_iva       = VALUES(precio_mayoreo_con_iva),
           precio_distribuidor_con_iva  = VALUES(precio_distribuidor_con_iva),
           precio_publico_con_iva       = VALUES(precio_publico_con_iva),
           precio_mayoreo_sin_iva       = VALUES(precio_mayoreo_sin_iva),
           precio_distribuidor_sin_iva  = VALUES(precio_distribuidor_sin_iva),
           precio_publico_sin_iva       = VALUES(precio_publico_sin_iva),
           precio_medio_mayoreo_sin_iva = VALUES(precio_medio_mayoreo_sin_iva),
           precio_medio_mayoreo_con_iva = VALUES(precio_medio_mayoreo_con_iva),
           codigo_sat                   = VALUES(codigo_sat),
           descripcion_sat              = VALUES(descripcion_sat),
           peso_kg                      = VALUES(peso_kg),
           volumen_cm3                  = VALUES(volumen_cm3)`,
        filas.flat()
      );
      insertados += filas.length;
    } catch (e: any) {
      errores += filas.length;
      detalles.push(`Lote ${Math.floor(i / BATCH) + 1}: ${e.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    insertados,
    errores,
    duracion_ms: Date.now() - inicio,
    detalles: detalles.slice(0, 20), // máximo 20 detalles de error
  });
}
