import { db } from './db';

export interface SearchItem {
  nombre: string;
  descripcion: string;
  categoria: string;
  seccion: string;
  href: string;
  imagen?: string;
}

/**
 * Obtiene el indice de busqueda desde MySQL.
 * Devuelve null si la tabla esta vacia o hay error.
 */
export async function getDynamicSearchIndex(): Promise<SearchItem[] | null> {
  try {
    const [rows]: any = await db.query(

"SELECT nombre, descripcion, categoria_slug AS categoria, categoria_nombre, seccion, slug, imagen_url AS imagen FROM productos WHERE activo = 1"
    );

    if (!rows || rows.length === 0) return null;

    return (rows as any[]).map((item) => {
      const seccionLabel =
        item.seccion === 'concretos' ? 'Concretos' :
        item.seccion === 'textucos'  ? 'Acabados'  :
        item.seccion.charAt(0).toUpperCase() + item.seccion.slice(1);

      const href =
        item.seccion === 'materiales'
          ? `/materiales/${item.categoria}`
          : `/${item.seccion}/${item.categoria}/${item.slug}`;

      return {
        nombre:      item.nombre,
        descripcion: item.descripcion || '',
        categoria:   item.categoria,
        seccion:     seccionLabel,
        href,
        imagen:      item.imagen || undefined,
      };
    });
  } catch (error) {
    console.error('Error al construir el indice de busqueda:', error);
    return null;
  }
}
