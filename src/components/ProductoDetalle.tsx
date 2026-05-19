import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/product.module.css'
import { resolverImagenProducto } from '@/lib/imagen'

interface Props {
  nombre: string
  descripcion: string
  descripcion2?: string
  imagen?: string | null
  categoria: string
  breadcrumb: React.ReactNode
}

export default function ProductoDetalle({
  nombre,
  descripcion,
  descripcion2,
  imagen,
  categoria,
  breadcrumb,
}: Props) {
  return (
    <>
      <div className={styles.breadcrumb}>{breadcrumb}</div>

      <div className={styles.detalle}>
        {/* ── Info ── */}
        <div className={styles.detalleInfo}>
          <span className={styles.detalleCat}>{categoria}</span>

          <h1 className={styles.detalleTitulo}>{nombre.toUpperCase()}</h1>

          <p className={styles.detalleDesc}>{descripcion}</p>

          <div className={styles.detalleAcciones}>
            <Link href="/cotizacion" className={styles.btnCotizar}>
              <i className="fa-solid fa-file-invoice" aria-hidden="true" />
              Cotizar
            </Link>
            <Link href="/contacto" className={styles.btnContactar}>
              <i className="fa-solid fa-phone" aria-hidden="true" />
              Contactar
            </Link>
          </div>
        </div>

        {/* ── Imagen ── */}
        <div className={styles.detalleImagen}>
          {(() => {
            const src = resolverImagenProducto(imagen);
            return src ? (
              <Image
                src={src}
                alt={nombre}
                width={520}
                height={520}
                style={{ width: 'auto', height: 'auto', maxHeight: '440px' }}
                priority
              />
            ) : (
              <div style={{ width: 520, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                <i className="fa-regular fa-image" style={{ fontSize: '3rem', opacity: 0.25 }} />
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Segunda descripción ── */}
      {descripcion2 && (
        <div className={styles.detalleSec}>
          <p className={styles.detalleSecInner}>{descripcion2}</p>
        </div>
      )}
    </>
  )
}
