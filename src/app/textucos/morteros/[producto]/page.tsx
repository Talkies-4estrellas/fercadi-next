export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducto } from '@/lib/productos'
import ProductoDetalle from '@/components/ProductoDetalle'
import BtnAgregarCarrito from '@/components/BtnAgregarCarrito'
import ComentariosProducto from '@/components/ComentariosProducto'
import ChatProducto from '@/components/ChatProducto'
import ColoresGrid from '@/components/ColoresGrid'
import VideoTexturizado from '@/components/VideoTexturizado'
import pStyles from '@/styles/product.module.css'

const CATEGORIA = 'morteros'

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/colores/texturizado`

const COLORES_TEXTURIZADO: { nombre: string; src: string }[] = [
  { nombre: 'almendra',  src: `${BASE}/almendra.webp`  },
  { nombre: 'blanco',    src: `${BASE}/blanco.webp`    },
  { nombre: 'cocoa',     src: `${BASE}/cocoa.webp`     },
  { nombre: 'chabacano', src: `${BASE}/chabacano.webp` },
  { nombre: 'crema',     src: `${BASE}/crema.webp`     },
  { nombre: 'fresa',     src: `${BASE}/fresa.webp`     },
  { nombre: 'girasol',   src: `${BASE}/girasol.webp`   },
  { nombre: 'gris',      src: `${BASE}/gris.webp`      },
  { nombre: 'plata',     src: `${BASE}/plata.webp`     },
  { nombre: 'jamaica',   src: `${BASE}/jamaica.webp`   },
  { nombre: 'mandarina', src: `${BASE}/mandarina.webp` },
  { nombre: 'marron',    src: `${BASE}/marron.webp`    },
  { nombre: 'cielo',     src: `${BASE}/cielo.webp`     },
  { nombre: 'negro',     src: `${BASE}/negro.webp`     },
  { nombre: 'nuez',      src: `${BASE}/nuez.webp`      },
  { nombre: 'rosa',      src: `${BASE}/rosa.webp`      },
  { nombre: 'verde',     src: `${BASE}/verde.webp`     },
  { nombre: 'olivo',     src: `${BASE}/olivo.webp`     },
  { nombre: 'trevol',    src: `${BASE}/trevol.webp`    },
  { nombre: 'violeta',   src: `${BASE}/violeta.webp`   },
  { nombre: 'zafiro',    src: `${BASE}/zafiro.webp`    },
  { nombre: 'jazmin',    src: `${BASE}/jazmin.webp`    },
]

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

      {producto === 'texturizado' && (
        <>
          <section className={pStyles.coloresSection}>
            <h2 className={pStyles.coloresTitulo}>Colores disponibles</h2>
            <ColoresGrid colores={COLORES_TEXTURIZADO} />
          </section>
          <VideoTexturizado />
        </>
      )}

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
