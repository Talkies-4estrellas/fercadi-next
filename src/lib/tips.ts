/**
 * lib/tips.ts — acceso a la tabla `tips`.
 *
 * Solo expone lecturas públicas (solo activos).
 * Las operaciones de escritura (INSERT/UPDATE/DELETE) viven en
 * /api/admin/tips para que pasen por el guard de autenticación.
 */

import { db } from './db';

export interface TipDB {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string | null;
  imagen: string | null;
  /** Contenido completo en Markdown. Renderizado por renderContenido() en /tips/[slug]. */
  contenido: string | null;
  /** 1 = visible al público, 0 = borrador oculto. */
  activo: number;
  created_at: string;
  updated_at: string;
}

/**
 * Lista de tips activos para la página /tips.
 * No incluye `contenido` para reducir el payload — ese campo
 * solo se carga al abrir el detalle individual.
 */
export async function getTips(): Promise<TipDB[]> {
  const [rows]: any = await db.query(
    `SELECT id, slug, titulo, descripcion, imagen, activo, created_at
       FROM tips WHERE activo = 1 ORDER BY id DESC`
  );
  return rows as TipDB[];
}

/**
 * Un tip completo (incluyendo contenido) por su slug.
 * Devuelve null si el slug no existe o el tip está inactivo,
 * lo que provoca un notFound() en la página.
 */
export async function getTipBySlug(slug: string): Promise<TipDB | null> {
  const [rows]: any = await db.query(
    `SELECT * FROM tips WHERE slug = ? AND activo = 1 LIMIT 1`,
    [slug]
  );
  return (rows as TipDB[])[0] ?? null;
}

/**
 * Todos los slugs activos.
 * Disponible para generateStaticParams si en el futuro se quiere
 * pre-renderizar los tips como páginas estáticas (SSG).
 * Actualmente no se usa porque la página usa force-dynamic.
 */
export async function getTipSlugs(): Promise<string[]> {
  const [rows]: any = await db.query(
    `SELECT slug FROM tips WHERE activo = 1`
  );
  return (rows as { slug: string }[]).map((r) => r.slug);
}
