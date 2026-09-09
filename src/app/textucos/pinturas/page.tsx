export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductosPorCategoria } from '@/lib/productos'
import SectionHero from '@/components/SectionHero'
import styles from '@/styles/product.module.css'
import ColorPicker from '@/components/ColorPicker'

export const metadata = { title: 'Pinturas - FERCADI' }

const BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlOGU4ZTgiLz48L3N2Zz4='

export default async function Page() {
  const productos = await getProductosPorCategoria('textucos', 'pinturas')
  if (productos.length === 0) notFound()

  const categoriaNombre = productos[0]?.categoria_nombre ?? 'Pinturas'

  return (
    <>
      <SectionHero
        icono="fa-solid fa-paint-roller"
        etiqueta="Acabados"
        titulo={categoriaNombre}
        subtitulo="Pinturas y recubrimientos para interiores y exteriores de la mejor calidad."
      />
      <div className={styles.general}>
        {productos.map((producto, idx) => (
          <div key={producto.slug} className={styles.cuadroBlanco}>
            <Link href={`/textucos/pinturas/${producto.slug}`} style={{ display: 'block' }}>
              {producto.imagen_url && (
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  width={280}
                  height={220}
                  style={{ objectFit: 'contain', width: '100%', height: '220px' }}
                  priority={idx < 4}
                  placeholder="blur"
                  blurDataURL={BLUR}
                />
              )}
              <p className={styles.nombreProducto}>{producto.nombre}</p>
            </Link>
            <Link href={`/textucos/pinturas/${producto.slug}`} className={styles.verMasBtn}>
              Ver más
            </Link>
          </div>
        ))}
      </div>
      <ColorPicker />
    </>
  )
}