import { db } from './db';
import { concretos } from '@/data/concretos';
import { textucos } from '@/data/textucos';
import { materiales } from '@/data/materiales';

export interface SearchItem {
  nombre: string;
  descripcion: string;
  categoria: string;
  seccion: string;
  href: string;
  imagen?: string;
}

/**
 * Construye el índice de búsqueda estático desde los archivos .ts de datos.
 * Se usa como fallback si la base de datos no tiene productos cargados.
 */
export function getStaticSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Concretos
  for (const cat of concretos) {
    for (const prod of cat.productos) {
      items.push({
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        categoria: cat.slug,
        seccion: 'Concretos',
        href: `/concretos/${cat.slug}/${prod.slug}`,
        imagen: prod.imagen,
      });
    }
  }

  // Acabados (textucos)
  for (const cat of textucos) {
    for (const prod of cat.productos) {
      items.push({
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        categoria: cat.slug,
        seccion: 'Acabados',
        href: `/textucos/${cat.slug}/${prod.slug}`,
        imagen: prod.imagen,
      });
    }
  }

  // Materiales — solo nivel categoría (no tienen página por producto individual)
  for (const cat of materiales) {
    items.push({
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      categoria: cat.slug,
      seccion: 'Materiales',
      href: `/materiales/${cat.slug}`,
    });
  }

  return items;
}

/**
 * Obtiene todos los productos de la base de datos para construir el índice de búsqueda.
 * Esta función debe ejecutarse en el lado del servidor (Server Actions o API Routes).
 * Devuelve null si la tabla está vacía o hay error — en ese caso usar getStaticSearchIndex().
 */
export async function getDynamicSearchIndex(): Promise<SearchItem[] | null> {
  try {
    const [rows]: any = await db.query(`
      SELECT
        nombre,
        descripcion,
        categoria_slug as categoria,
        seccion,
        slug,
        imagen_url as imagen
      FROM productos
      WHERE activo = 1
    `);

    if (!rows || rows.length === 0) return null;

    return rows.map((item: any) => {
      const seccionFormateada =
        item.seccion.charAt(0).toUpperCase() + item.seccion.slice(1);

      // Materiales no tienen slug de producto individual
      const href =
        item.seccion === 'materiales'
          ? `/materiales/${item.categoria}`
          : `/${item.seccion}/${item.categoria}/${item.slug}`;

      return {
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        categoria: item.categoria,
        seccion: seccionFormateada,
        href,
        imagen: item.imagen || undefined,
      };
    });
  } catch (error) {
    console.error('Error al construir el índice de búsqueda dinámico:', error);
    return null;
  }
}
