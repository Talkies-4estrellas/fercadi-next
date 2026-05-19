import { db } from './db';

/* ── Tipos públicos (lo que ve el usuario) ─────────────────── */

export interface CategoriaDB {
  slug: string;
  nombre: string;
}

/**
 * Campos que cualquier visitante puede ver.
 * Las columnas comerciales (precios mayoreo, SAT, peso, etc.)
 * NUNCA se incluyen aquí — solo las devuelve /api/admin/productos.
 */
export interface ProductoDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  descripcion2?: string | null;
  precio: number;
  imagen_url?: string | null;
  seccion: string;
  categoria_slug: string;
  categoria_nombre: string;
  activo: number;
  // Públicos nuevos (del catálogo CSV)
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
  marcas: MarcaDB[];
}

/** Columnas que el SELECT público incluye — nunca `*` */
const PUBLIC_COLS = `
  id, nombre, slug, descripcion, descripcion2,
  precio, imagen_url, seccion,
  categoria_slug, categoria_nombre, activo,
  marca, unidad
`.trim();

/* ── Concretos / Acabados / Ferretería ───────────────────────── */

/** Lista de categorías de una sección, en el orden de inserción original */
export async function getCategorias(seccion: string): Promise<CategoriaDB[]> {
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
}

/** Todos los productos de una categoría (solo campos públicos) */
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

/** Un producto por sección + categoría + slug (solo campos públicos) */
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

/* ── Materiales ───────────────────────────────────────────────── */

/** Todas las categorías de materiales (con marcas JSON) */
export async function getMaterialesCategorias(): Promise<CategoriaMaterialDB[]> {
  const [rows]: any = await db.query(
    `SELECT slug, nombre, descripcion, marcas
     FROM materiales_categorias
     WHERE activo = 1
     ORDER BY id ASC`
  );
  return (rows as any[]).map((row) => ({
    ...row,
    marcas: typeof row.marcas === 'string'
      ? JSON.parse(row.marcas)
      : (row.marcas ?? []),
  }));
}

/* ── Ferretería ───────────────────────────────────────────────── */

/** Categorías de ferretería con conteo de productos activos */
export async function getFerreteriaCategorias(): Promise<(CategoriaDB & { total: number })[]> {
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
}

/** Marcas únicas disponibles en ferretería, opcionalmente filtradas por categoría */
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
 * Productos de ferretería paginados.
 * Filtra opcionalmente por categoría y/o marca.
 * Ejecuta la query de datos y el COUNT en paralelo.
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

/** Una categoría de materiales por slug */
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
