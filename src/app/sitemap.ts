import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fercadi.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const secciones = ['concretos', 'textucos', 'materiales', 'ferreteria']

  // Rutas estáticas
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/tips`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/contacto`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/cotizacion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...secciones.map(s => ({
      url: `${BASE}/${s}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  try {
    // Categorías y productos dinámicos
    const [rows]: any = await db.query(
      `SELECT seccion, categoria_slug, slug
       FROM productos
       WHERE activo = 1
       ORDER BY id ASC`
    )

    const cats = new Set<string>()
    const productos: MetadataRoute.Sitemap = []

    for (const row of rows as any[]) {
      const catKey = `${row.seccion}/${row.categoria_slug}`
      if (!cats.has(catKey)) {
        cats.add(catKey)
        estaticas.push({
          url: `${BASE}/${row.seccion}/${row.categoria_slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
      productos.push({
        url: `${BASE}/${row.seccion}/${row.categoria_slug}/${row.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }

    return [...estaticas, ...productos]
  } catch {
    return estaticas
  }
}
