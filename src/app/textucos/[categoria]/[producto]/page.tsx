import Link from 'next/link'
import { notFound } from 'next/navigation'
import { textucos, getCategoriaBySlug, getProductoBySlug } from '@/data/textucos'
import ProductoDetalle from '@/components/ProductoDetalle'

export function generateStaticParams() {
  return textucos.flatMap((cat) =>
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
      imagen={p.imagen}
      categoria={cat?.nombre ?? categoria}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
          <Link href={`/textucos/${categoria}`}>{cat?.nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}
