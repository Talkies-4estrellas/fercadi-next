import Link from 'next/link'
import { notFound } from 'next/navigation'
import { concretos, getCategoriaBySlug, getProductoBySlug } from '@/data/concretos'
import ProductoDetalle from '@/components/ProductoDetalle'

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
    <ProductoDetalle
      nombre={p.nombre}
      descripcion={p.descripcion}
      descripcion2={p.descripcion2}
      imagen={p.imagen}
      categoria={cat?.nombre ?? categoria}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/concretos">Concretos</Link> /{' '}
          <Link href={`/concretos/${categoria}`}>{cat?.nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}
