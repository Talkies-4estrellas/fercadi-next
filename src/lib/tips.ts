import { db } from './db';

export interface TipDB {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string | null;
  imagen: string | null;
  contenido: string | null;
  activo: number;
  created_at: string;
  updated_at: string;
}

/** Lista todos los tips activos ordenados por id (más recientes primero). */
export async function getTips(): Promise<TipDB[]> {
  const [rows]: any = await db.query(
    `SELECT id, slug, titulo, descripcion, imagen, activo, created_at
       FROM tips WHERE activo = 1 ORDER BY id DESC`
  );
  return rows as TipDB[];
}

/** Un tip por slug (solo activos — para páginas públicas). */
export async function getTipBySlug(slug: string): Promise<TipDB | null> {
  const [rows]: any = await db.query(
    `SELECT * FROM tips WHERE slug = ? AND activo = 1 LIMIT 1`,
    [slug]
  );
  return (rows as TipDB[])[0] ?? null;
}

/** Todos los slugs activos (para generateStaticParams si se quiere SSG). */
export async function getTipSlugs(): Promise<string[]> {
  const [rows]: any = await db.query(
    `SELECT slug FROM tips WHERE activo = 1`
  );
  return (rows as { slug: string }[]).map((r) => r.slug);
}
