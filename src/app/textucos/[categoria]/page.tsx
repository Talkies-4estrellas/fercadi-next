export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductosPorCategoria } from '@/lib/productos'
import SectionHero from '@/components/SectionHero'
import styles from '@/styles/product.module.css'

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  return { title: `${categoria.replace(/-/g, ' ')} - FERCADI` }
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const productos = await getProductosPorCategoria('textucos', categoria)
  if (productos.length === 0) notFound()

  const categoriaNombre = productos[0]?.categoria_nombre ?? categoria

  return (
    <>
      <SectionHero
        icono="fa-solid fa-paint-roller"
        etiqueta="Acabados"
        titulo={categoriaNombre}
        subtitulo="Descubre nuestra línea de productos para acabados y terminados de construcción."
      />

      <div className={styles.general}>
        {productos.map((producto) => (
          <Link key={producto.slug} href={`/textucos/${categoria}/${producto.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              {/* Usamos el nombre que viene de la base de datos */}
              <h3>{producto.nombre.toUpperCase()}</h3>
            </div>
            {producto.imagen_url && (
              <div style={{ position: 'relative', width: '280px', height: '180px', margin: '0 auto' }}>
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  sizes="280px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <div className={styles.verBtn}>Ver más</div>
          </Link>
        ))}
      </div>
    </>
  )
}