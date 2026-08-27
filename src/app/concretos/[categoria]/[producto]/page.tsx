export const revalidate = 300

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducto } from '@/lib/productos'
import ProductoDetalle from '@/components/ProductoDetalle'
import BtnAgregarCarrito from '@/components/BtnAgregarCarrito'
import ComentariosProducto from '@/components/ComentariosProducto'
import pStyles from '@/styles/product.module.css'

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
    <>
      <ProductoDetalle
        nombre={p.nombre}
        descripcion={p.descripcion}
        descripcion2={p.descripcion2 ?? undefined}
        imagen={p.imagen_url ?? undefined}
        categoria={p.categoria_nombre}
        breadcrumb={
          <>
            <Link href="/">Inicio</Link> / <Link href="/concretos">Concretos</Link> /{' '}
            <Link href={`/concretos/${categoria}`}>{p.categoria_nombre}</Link> / {p.nombre}
          </>
        }
      />

      {/* Botón agregar al carrito */}
      {Number(p.precio) > 0 && (
        <section className={pStyles.detalleCarrito}>
          <BtnAgregarCarrito
            id={String(p.id)}
            nombre={p.nombre}
            precio={Number(p.precio)}
            imagen={p.imagen_url ?? undefined}
          />
        </section>
      )}

      {/* Sección de comentarios */}
      <ComentariosProducto productoId={p.id} />
    </>
  )
}
