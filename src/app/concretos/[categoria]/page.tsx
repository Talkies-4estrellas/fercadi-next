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
  const productos = await getProductosPorCategoria('concretos', categoria)
  if (productos.length === 0) notFound()

  const categoriaNombre = productos[0]?.categoria_nombre ?? categoria

  return (
    <>
      <SectionHero
        icono="fa-solid fa-calculator"
        etiqueta="Concretos"
        titulo={categoriaNombre}
        subtitulo="Productos y soluciones de concreto para tu obra."
      />
      <div className={styles.general}>
        {productos.map((producto, idx) => (
          <Link key={producto.slug} href={`/concretos/${categoria}/${producto.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              <h3>{producto.nombre.toUpperCase()}</h3>
            </div>
            {producto.imagen_url && (
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                width={280}
                height={180}
                style={{ objectFit: 'cover' }}
                priority={idx < 4}
              />
            )}
            <div className={styles.verBtn}>Ver</div>
          </Link>
        ))}
      </div>
    </>
  )
}
