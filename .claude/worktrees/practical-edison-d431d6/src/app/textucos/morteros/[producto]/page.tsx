import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCategoriaBySlug, getProductoBySlug } from '@/data/textucos'
import styles from '@/styles/product.module.css'

export function generateStaticParams() {
  const cat = getCategoriaBySlug('morteros')
  return cat?.productos.map((p) => ({ producto: p.slug })) ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params
  const p = getProductoBySlug('morteros', producto)
  return { title: `${p?.nombre ?? 'Producto'} - FERCADI` }
}

export default async function MorteroProductoPage({
  params,
}: {
  params: Promise<{ producto: string }>
}) {
  const { producto } = await params
  const cat = getCategoriaBySlug('morteros')
  const p = getProductoBySlug('morteros', producto)
  if (!p) notFound()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
        <Link href="/textucos/morteros">{cat?.nombre}</Link> / {p.nombre}
      </div>
      <div className={styles.imagen1}>
        <Image
          src={p.imagen}
          alt={p.nombre}
          width={1200}
          height={600}
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </div>
      <div className={styles.etiqueta}>
        <h2 className={styles.titulo}>{p.nombre.toUpperCase()}</h2>
      </div>
      <p className={styles.texto1}>{p.descripcion}</p>
    </>
  )
}
