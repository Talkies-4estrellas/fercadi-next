import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { textucos, getCategoriaBySlug } from '@/data/textucos'
import styles from '@/styles/product.module.css'

export function generateStaticParams() {
  return textucos.map((cat) => ({ categoria: cat.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const cat = getCategoriaBySlug(categoria)
  return { title: `${cat?.nombre ?? 'Acabados'} - FERCADI` }
}

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const cat = getCategoriaBySlug(categoria)
  if (!cat) notFound()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> / {cat.nombre}
      </div>
      <div className={styles.general}>
        {cat.productos.map((producto) => (
          <Link key={producto.slug} href={`/textucos/${categoria}/${producto.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              <h3>{producto.nombre.toUpperCase()}</h3>
            </div>
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              width={280}
              height={180}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.verBtn}>Ver</div>
          </Link>
        ))}
      </div>
    </>
  )
}
