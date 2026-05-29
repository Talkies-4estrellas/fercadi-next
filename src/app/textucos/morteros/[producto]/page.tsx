export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducto } from '@/lib/productos'
import ProductoDetalle from '@/components/ProductoDetalle'

const CATEGORIA = 'morteros'

export async function generateMetadata({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params
  const p = await getProducto('textucos', CATEGORIA, producto)
  return { title: `${p?.nombre ?? 'Producto'} - FERCADI` }
}

export default async function ProductoPage({ params }: { params: Promise<{ producto: string }> }) {
  const { producto } = await params
  const p = await getProducto('textucos', CATEGORIA, producto)
  if (!p) notFound()

  return (
    <ProductoDetalle
      nombre={p.nombre}
      descripcion={p.descripcion}
      imagen={p.imagen_url ?? undefined}
      categoria={p.categoria_nombre}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
          <Link href={`/textucos/${CATEGORIA}`}>{p.categoria_nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}