import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducto } from '@/lib/productos'
import ProductoDetalle from '@/components/ProductoDetalle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; producto: string }>
}) {
  const { categoria, producto } = await params
  const p = await getProducto('concretos', categoria, producto)
  return { title: `${p?.nombre ?? 'Producto'} - FERCADI` }
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ categoria: string; producto: string }>
}) {
  const { categoria, producto } = await params
  const p = await getProducto('concretos', categoria, producto)
  if (!p) notFound()

  return (
    <ProductoDetalle
      nombre={p.nombre}
      descripcion={p.descripcion}
      descripcion2={p.descripcion2}
      imagen={p.imagen_url ?? undefined}
      categoria={p.categoria_nombre}
      breadcrumb={
        <>
          <Link href="/">Inicio</Link> / <Link href="/concretos">Concretos</Link> /{' '}
          <Link href={`/concretos/${categoria}`}>{p.categoria_nombre}</Link> / {p.nombre}
        </>
      }
    />
  )
}
