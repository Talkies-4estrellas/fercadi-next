export const revalidate = 300

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducto } from '@/lib/productos'
import ProductoDetalle from '@/components/ProductoDetalle'
import BtnAgregarCarrito from '@/components/BtnAgregarCarrito'
import ComentariosProducto from '@/components/ComentariosProducto'
import ChatProducto from '@/components/ChatProducto'
import pStyles from '@/styles/product.module.css'

const CATEGORIA = 'selladores'

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
    <>
      <ProductoDetalle
        nombre={p.nombre}
        descripcion={p.descripcion}
        descripcion2={p.descripcion2 ?? undefined}
        imagen={p.imagen_url ?? undefined}
        categoria={p.categoria_nombre}
        breadcrumb={
          <>
            <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> /{' '}
            <Link href={`/textucos/${CATEGORIA}`}>{p.categoria_nombre}</Link> / {p.nombre}
          </>
        }
      />

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

      <ComentariosProducto productoId={p.id} />
      <ChatProducto productoId={p.id} productoNombre={p.nombre} />
    </>
  )
}
