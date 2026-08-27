export const revalidate = 300

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductosPorCategoria } from '@/lib/productos'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Morteros y Afinadores - FERCADI' }

export default async function Page() {
  const productos = await getProductosPorCategoria('textucos', 'morteros')
  if (productos.length === 0) notFound()

  const categoriaNombre = productos[0]?.categoria_nombre ?? 'Morteros y Afinadores'

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> / {categoriaNombre}
      </div>
      <div className={styles.general}>
        {productos.map((producto, idx) => (
          <div key={producto.slug} className={styles.cuadroBlanco}>
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
            <Link href={`/textucos/morteros/${producto.slug}`} className={styles.verMasBtn}>
              Ver más
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}