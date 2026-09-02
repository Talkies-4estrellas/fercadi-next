export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductosPorCategoria } from '@/lib/productos'
import SectionHero from '@/components/SectionHero'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Especializados - FERCADI' }

export default async function Page() {
  const productos = await getProductosPorCategoria('textucos', 'especializados')
  if (productos.length === 0) notFound()

  const categoriaNombre = productos[0]?.categoria_nombre ?? 'Especializados'

  return (
    <>
      <SectionHero
        icono="fa-solid fa-paint-roller"
        etiqueta="Acabados"
        titulo={categoriaNombre}
        subtitulo="Productos especializados para proyectos de acabado de alto rendimiento."
      />
      <div className={styles.general}>
        {productos.map((producto) => (
          <div key={producto.slug} className={styles.cuadroBlanco}>
            <Link href={`/textucos/especializados/${producto.slug}`} style={{ display: 'block' }}>
              {producto.imagen_url && (
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  width={280}
                  height={220}
                  style={{ objectFit: 'contain', width: '100%', height: '220px' }}
                />
              )}
              <p className={styles.nombreProducto}>{producto.nombre}</p>
            </Link>
            <Link href={`/textucos/especializados/${producto.slug}`} className={styles.verMasBtn}>
              Ver más
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}