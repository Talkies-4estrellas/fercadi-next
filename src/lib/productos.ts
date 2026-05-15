import { db } from './db';

/* ── Tipos ────────────────────────────────────────────────── */

export interface CategoriaDB {
  slug: string;
  nombre: string;
}

export interface ProductoDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  descripcion2?: string;
  imagen_url?: string;
  categoria_slug: string;
  categoria_nombre: string;
  seccion: string;
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

/* ── Concretos / Acabados ─────────────────────────────────── */

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
  // Fallback: si categoria_nombre es NULL (filas antiguas sin seed), usar el slug formateado
  return (rows as any[]).map((row) => ({
    slug: row.slug,
    nombre: row.nombre ?? row.slug.replace(/-/g, ' '),
  }));
}

/** Todos los productos de una categoría */
export async function getProductosPorCategoria(
  seccion: string,
  categoriaSlug: string
): Promise<ProductoDB[]> {
  const [rows]: any = await db.query(
    `SELECT * FROM productos
     WHERE seccion = ? AND categoria_slug = ? AND activo = 1
     ORDER BY id ASC`,
    [seccion, categoriaSlug]
  );
  return rows;
}

/** Un producto por sección + categoría + slug */
export async function getProducto(
  seccion: string,
  categoriaSlug: string,
  slug: string
): Promise<ProductoDB | null> {
  const [rows]: any = await db.query(
    `SELECT * FROM productos
     WHERE seccion = ? AND categoria_slug = ? AND slug = ? AND activo = 1
     LIMIT 1`,
    [seccion, categoriaSlug, slug]
  );
  return (rows as any[])[0] ?? null;
}

/* ── Materiales ───────────────────────────────────────────── */

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
