export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductosPorCategoria } from '@/lib/productos'
import SectionHero from '@/components/SectionHero'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Morteros y Afinadores - FERCADI' }

export default async function Page() {
  const productos = await getProductosPorCategoria('textucos', 'morteros')
  if (productos.length === 0) notFound()

  const categoriaNombre = productos[0]?.categoria_nombre ?? 'Morteros y Afinadores'

  return (
    <>
      <SectionHero
        icono="fa-solid fa-paint-roller"
        etiqueta="Acabados"
        titulo={categoriaNombre}
        subtitulo="Morteros y afinadores para acabados de construcción de la más alta calidad."
      />
      <div className={styles.general}>
        {productos.map((producto, idx) => (
          <div key={producto.slug} className={styles.cuadroBlanco}>
            <Link href={`/textucos/morteros/${producto.slug}`} style={{ display: 'block' }}>
              {producto.imagen_url && (
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  width={280}
                  height={220}
                  style={{ objectFit: 'contain', width: '100%', height: '220px' }}
                  priority={idx < 4}
                />
              )}
              <p className={styles.nombreProducto}>{producto.nombre}</p>
            </Link>
            <Link href={`/textucos/morteros/${producto.slug}`} className={styles.verMasBtn}>
              Ver más
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}