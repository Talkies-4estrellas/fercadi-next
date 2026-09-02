import { unstable_cache } from 'next/cache';
import { db } from './db';

/* ══════════════════════════════════════════════════════════════
   Tipos públicos — todo lo que un visitante puede ver.
   Las columnas comerciales (precio mayoreo, clave SAT, peso, etc.)
   NUNCA se exponen aquí; solo las devuelve /api/admin/productos
   para evitar filtrar márgenes o datos internos.
   ══════════════════════════════════════════════════════════════ */

export interface CategoriaDB {
  slug: string;
  nombre: string;
}

export interface ProductoDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  /** Segunda descripción opcional (se muestra en banda oscura bajo el detalle). */
  descripcion2?: string | null;
  precio: number;
  imagen_url?: string | null;
  seccion: string;
  categoria_slug: string;
  categoria_nombre: string;
  activo: number;
  marca?: string | null;
  unidad?: string | null;
}

export interface MarcaDB {
  nombre: string;
  logo: string;
}

export interface CategoriaMaterialDB {
  slug: string;
  nombre: string;
  descripcion: string;
  /** Array deserializado desde columna JSON de la BD. */
  marcas: MarcaDB[];
}

/**
 * Columnas incluidas en los SELECTs públicos.
 * Listar explícitamente en lugar de SELECT * protege contra
 * que una futura columna sensible quede expuesta por accidente.
 */
const PUBLIC_COLS = `
  id, nombre, slug, descripcion, descripcion2,
  precio, imagen_url, seccion,
  categoria_slug, categoria_nombre, activo,
  marca, unidad
`.trim();

/* ══════════════════════════════════════════════════════════════
   Concretos · Acabados (Textucos) · Ferretería
   Todas comparten la tabla `productos` y se distinguen por
   la columna `seccion`.
   ══════════════════════════════════════════════════════════════ */

/**
 * Devuelve las categorías activas de una sección ordenadas
 * por el primer producto insertado (MIN(id)), conservando
 * el orden manual del catálogo original.
 */
export const getCategorias = unstable_cache(
  async (seccion: string): Promise<CategoriaDB[]> => {
    const [rows]: any = await db.query(
      `SELECT categoria_slug AS slug, MAX(categoria_nombre) AS nombre
       FROM productos
       WHERE seccion = ? AND activo = 1
       GROUP BY categoria_slug
       ORDER BY MIN(id) ASC`,
      [seccion]
    );
    return (rows as any[]).map((row) => ({
      slug: row.slug,
      nombre: row.nombre ?? row.slug.replace(/-/g, ' '),
    }));
  },
  ['getCategorias'],
  { revalidate: 300 }
);

/**
 * Todos los productos activos de una sección + categoría,
 * ordenados por id para mantener el orden de carga del CSV.
 */
export async function getProductosPorCategoria(
  seccion: string,
  categoriaSlug: string
): Promise<ProductoDB[]> {
  const [rows]: any = await db.query(
    `SELECT ${PUBLIC_COLS}
     FROM productos
     WHERE seccion = ? AND categoria_slug = ? AND activo = 1
     ORDER BY id ASC`,
    [seccion, categoriaSlug]
  );
  return rows;
}

/**
 * Un único producto por su trío de identificadores.
 * Devuelve null si no existe o está inactivo (activo = 0),
 * lo que provoca un notFound() en la página que lo consume.
 */
export async function getProducto(
  seccion: string,
  categoriaSlug: string,
  slug: string
): Promise<ProductoDB | null> {
  const [rows]: any = await db.query(
    `SELECT ${PUBLIC_COLS}
     FROM productos
     WHERE seccion = ? AND categoria_slug = ? AND slug = ? AND activo = 1
     LIMIT 1`,
    [seccion, categoriaSlug, slug]
  );
  return (rows as any[])[0] ?? null;
}

/* ══════════════════════════════════════════════════════════════
   Materiales
   Tabla separada: `materiales_categorias`.
   Su PK es `slug` (texto), NO tiene columna `id`.
   ══════════════════════════════════════════════════════════════ */

/**
 * Todas las categorías de materiales activas.
 * La columna `marcas` se almacena como JSON en la BD y se
 * deserializa aquí para que los consumidores reciban un array.
 */
export const getMaterialesCategorias = unstable_cache(
  async (): Promise<CategoriaMaterialDB[]> => {
    const [rows]: any = await db.query(
      `SELECT slug, nombre, descripcion, marcas
       FROM materiales_categorias
       WHERE activo = 1
       ORDER BY nombre ASC`
    );
    return (rows as any[]).map((row) => ({
      ...row,
      marcas: typeof row.marcas === 'string'
        ? JSON.parse(row.marcas)
        : (row.marcas ?? []),
    }));
  },
  ['getMaterialesCategorias'],
  { revalidate: 300 }
);

/* ══════════════════════════════════════════════════════════════
   Ferretería — funciones adicionales exclusivas de esta sección
   (paginación, filtros por marca)
   ══════════════════════════════════════════════════════════════ */

export interface FerreteriaSubcat {
  slug: string;
  nombre: string;
  total: number;
}

export interface FerreteriaGrupo {
  slug: string;
  nombre: string;
  totalProductos: number;
  subcategorias: FerreteriaSubcat[];
}

/**
 * Árbol de Ferretería: 18 grupos padre con sus subcategorías y conteo de productos.
 * Usa la tabla `categorias` (parent_id) cruzada con `productos` para los totales.
 */
export const getFerreteriaGrupos = unstable_cache(
  async (): Promise<FerreteriaGrupo[]> => {
    const [rows]: any = await db.query(
      `SELECT
         g.id        AS grupo_id,
         g.slug      AS grupo_slug,
         g.nombre    AS grupo_nombre,
         g.orden     AS grupo_orden,
         c.slug      AS cat_slug,
         c.nombre    AS cat_nombre,
         COUNT(p.id) AS total
       FROM categorias g
       LEFT JOIN categorias c
         ON c.parent_id = g.id AND c.activo = 1
       LEFT JOIN productos p
         ON p.categoria_slug = c.slug AND p.seccion = 'ferreteria' AND p.activo = 1
       WHERE g.seccion = 'ferreteria' AND g.parent_id IS NULL AND g.activo = 1
       GROUP BY g.id, g.slug, g.nombre, g.orden, c.slug, c.nombre
       ORDER BY g.orden ASC, COUNT(p.id) DESC`
    );

    const gruposMap = new Map<number, FerreteriaGrupo>();
    for (const row of rows as any[]) {
      if (!gruposMap.has(row.grupo_id)) {
        gruposMap.set(row.grupo_id, {
          slug: row.grupo_slug,
          nombre: row.grupo_nombre,
          totalProductos: 0,
          subcategorias: [],
        });
      }
      const g = gruposMap.get(row.grupo_id)!;
      if (row.cat_slug) {
        const total = Number(row.total);
        g.subcategorias.push({ slug: row.cat_slug, nombre: row.cat_nombre, total });
        g.totalProductos += total;
      }
    }
    return Array.from(gruposMap.values());
  },
  ['getFerreteriaGrupos'],
  { revalidate: 300 }
);

/**
 * Categorías de ferretería ordenadas por volumen de productos
 * (las más pobladas primero) para priorizar el catálogo principal.
 */
export const getFerreteriaCategorias = unstable_cache(
  async (): Promise<(CategoriaDB & { total: number })[]> => {
    const [rows]: any = await db.query(
      `SELECT categoria_slug AS slug,
              MAX(categoria_nombre) AS nombre,
              COUNT(*) AS total
         FROM productos
        WHERE seccion = 'ferreteria' AND activo = 1
        GROUP BY categoria_slug
        ORDER BY COUNT(*) DESC`
    );
    return (rows as any[]).map((row) => ({
      slug:   row.slug,
      nombre: row.nombre ?? row.slug.replace(/-/g, ' '),
      total:  Number(row.total),
    }));
  },
  ['getFerreteriaCategorias'],
  { revalidate: 300 }
);

/**
 * Marcas únicas disponibles, opcionalmente filtradas por categoría.
 * Se usa para poblar el filtro de marcas en el listado de ferretería.
 */
export async function getFerreteriaMarcas(categoriaSlug?: string): Promise<string[]> {
  const cond = categoriaSlug
    ? "seccion = 'ferreteria' AND activo = 1 AND categoria_slug = ? AND marca IS NOT NULL AND marca <> ''"
    : "seccion = 'ferreteria' AND activo = 1 AND marca IS NOT NULL AND marca <> ''";
  const params = categoriaSlug ? [categoriaSlug] : [];
  const [rows]: any = await db.query(
    `SELECT DISTINCT marca FROM productos WHERE ${cond} ORDER BY marca ASC`,
    params
  );
  return (rows as any[]).map((r: any) => r.marca as string);
}

export interface FerreteriaPaginada {
  productos: ProductoDB[];
  total:     number;
  page:      number;
  pages:     number;
  limit:     number;
}

/**
 * Productos de ferretería paginados con filtros opcionales.
 * Ejecuta la query de datos y el COUNT(*) en paralelo con Promise.all
 * para reducir la latencia total a un solo round-trip.
 * Límite máximo fijado a 60 para no saturar la respuesta JSON.
 */
export async function getProductosFerreteria(opts: {
  categoriaSlug?: string;
  marca?:         string;
  page?:          number;
  limit?:         number;
}): Promise<FerreteriaPaginada> {
  const page   = Math.max(1, opts.page  ?? 1);
  const limit  = Math.min(60, Math.max(1, opts.limit ?? 24));
  const offset = (page - 1) * limit;

  const where: string[] = ["seccion = 'ferreteria'", 'activo = 1'];
  const params: any[]   = [];

  if (opts.categoriaSlug) {
    where.push('categoria_slug = ?');
    params.push(opts.categoriaSlug);
  }
  if (opts.marca) {
    where.push('marca = ?');
    params.push(opts.marca);
  }

  const whereClause = 'WHERE ' + where.join(' AND ');

  const [[rows], [countRows]]: any = await Promise.all([
    db.query(
      `SELECT ${PUBLIC_COLS} FROM productos ${whereClause} ORDER BY nombre ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    db.query(`SELECT COUNT(*) AS total FROM productos ${whereClause}`, params),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  return {
    productos: rows as ProductoDB[],
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  };
}

/** Una categoría de materiales por slug. Devuelve null si no existe o está inactiva. */
export async function getCategoriaMaterial(
  slug: string
): Promise<CategoriaMaterialDB | null> {
  const [rows]: any = await db.query(
    `SELECT slug, nombre, descripcion, marcas
     FROM materiales_categorias
     WHERE slug = ?
     LIMIT 1`,
    [slug]
  );
  if (!(rows as any[])[0]) return null;
  const row = (rows as any[])[0];
  return {
    ...row,
    marcas: typeof row.marcas === 'string'
      ? JSON.parse(row.marcas)
      : (row.marcas ?? []),
  };
}
