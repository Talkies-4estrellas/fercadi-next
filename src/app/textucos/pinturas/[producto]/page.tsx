import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoriaBySlug, getProductoBySlug } from '@/data/textucos'
import ProductoDetalle from '@/components/ProductoDetalle'

export function generateStaticParams() {
  const cat = getCategoriaBySlug('pinturas')
  return cat?.productos.map((p) => ({ producto: p.slug })) ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params
  const p = getProductoBySlug('pinturas', producto)
  return { title: `${p?.nombre ?? 'Producto'} - FERCADI` }
}

export default async function PinturaProductoPage({
  params,
}: {
  params: Promise<{ producto: string }>
}) {
  const { producto } = await params
  const cat = getCategoriaBySlug('pinturas')
  const p = getProductoBySlug('pinturas', producto)
  if (!p) notFound()

  return (
    <ProductoDetalle
      nombre={p.nombre}
      descripcion={p.descripcion}
      imagen={p.imagen}
      categoria={cat?.nombre ?? 'Pinturas'}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
          <Link href="/textucos/pinturas">{cat?.nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}
