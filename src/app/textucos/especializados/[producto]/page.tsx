import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoriaBySlug, getProductoBySlug } from '@/data/textucos'
import ProductoDetalle from '@/components/ProductoDetalle'

export function generateStaticParams() {
  const cat = getCategoriaBySlug('especializados')
  return cat?.productos.map((p) => ({ producto: p.slug })) ?? []
}

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params
  const p = getProductoBySlug('especializados', producto)
  return { title: `${p?.nombre ?? 'Producto'} - FERCADI` }
}

export default async function EspecializadoProductoPage({
  params,
}: {
  params: Promise<{ producto: string }>
}) {
  const { producto } = await params
  const cat = getCategoriaBySlug('especializados')
  const p = getProductoBySlug('especializados', producto)
  if (!p) notFound()

  return (
    <ProductoDetalle
      nombre={p.nombre}
      descripcion={p.descripcion}
      imagen={p.imagen}
      categoria={cat?.nombre ?? 'Especializados'}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
          <Link href="/textucos/especializados">{cat?.nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}
