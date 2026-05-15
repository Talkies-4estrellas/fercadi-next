import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { concretos, getCategoriaBySlug, getProductoBySlug } from '@/data/concretos'
import styles from '@/styles/product.module.css'

export function generateStaticParams() {
  return concretos.flatMap((cat) =>
    cat.productos.map((p) => ({ categoria: cat.slug, producto: p.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; producto: string }>
}) {
  const { categoria, producto } = await params
  const p = getProductoBySlug(categoria, producto)
  return { title: `${p?.nombre ?? 'Producto'} - FERCADI` }
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ categoria: string; producto: string }>
}) {
  const { categoria, producto } = await params
  const cat = getCategoriaBySlug(categoria)
  const p = getProductoBySlug(categoria, producto)
  if (!p) notFound()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/concretos">Concretos</Link> /{' '}
        <Link href={`/concretos/${categoria}`}>{cat?.nombre}</Link> / {p.nombre}
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
      {p.descripcion2 && <p className={styles.texto2}>{p.descripcion2}</p>}
    </>
  )
}
