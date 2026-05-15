import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoriaBySlug, getProductoBySlug } from '@/data/textucos'
import ProductoDetalle from '@/components/ProductoDetalle'

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
    <ProductoDetalle
      nombre={p.nombre}
      descripcion={p.descripcion}
      imagen={p.imagen}
      categoria={cat?.nombre ?? 'Morteros y Afinadores'}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
          <Link href="/textucos/morteros">{cat?.nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}
