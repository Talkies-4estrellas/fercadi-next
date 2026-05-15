import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import styles from '@/styles/product.module.css'

// Definimos la interfaz para los productos que vienen de la DB
interface ProductoDB {
  id: number;
  nombre: string;
  slug: string;
  imagen_url: string;
  categoria_slug: string;
}

/**
 * Función para obtener productos desde la API (MySQL)
 */
async function getProductosPorCategoria(categoriaSlug: string): Promise<ProductoDB[]> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/productos?seccion=acabados&categoria=${categoriaSlug}`, {
      // Revalidar cada hora para mantener eficiencia sin perder dinamismo
      next: { revalidate: 3600 } 
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Generación de Metadatos Dinámicos
 */
export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  // Capitalizamos el slug para el título
  const titulo = categoria.charAt(0).toUpperCase() + categoria.slice(1);
  return { title: `${titulo} - FERCADI` };
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const productos = await getProductosPorCategoria(categoria);

  // Si no hay productos en esa categoría en la base de datos
  if (productos.length === 0) {
    notFound();
  }

  // Nombre de la categoría formateado (puedes mejorar esto trayendo el nombre real de la DB)
  const nombreCategoria = categoria.replace(/-/g, ' ').toUpperCase();

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> / {nombreCategoria}
      </div>

      <div className={styles.general}>
        {productos.map((producto) => (
          <Link 
            key={producto.id} 
            href={`/textucos/${categoria}/${producto.slug}`} 
            className={styles.cuadro}
          >
            <div className={styles.azul}>
              {/* Usamos el nombre que viene de la base de datos */}
              <h3>{producto.nombre.toUpperCase()}</h3>
            </div>
            
            <div style={{ position: 'relative', width: '280px', height: '180px', margin: '0 auto' }}>
              <Image
                src={producto.imagen_url || '/productos/placeholder.jpg'}
                alt={producto.nombre}
                fill
                sizes="280px"
                style={{ objectFit: 'contain' }} // 'contain' es mejor para bultos/sacos
              />
            </div>

            <div className={styles.verBtn}>Ver más</div>
          </Link>
        ))}
      </div>
    </>
  )
}