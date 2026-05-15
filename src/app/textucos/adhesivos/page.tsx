import Link from 'next/link'
import Image from 'next/image'
import { getCategoriaBySlug } from '@/data/textucos'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Adhesivos - FERCADI' }

export default function AdhesivosPage() {
  const cat = getCategoriaBySlug('adhesivos')!

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/textucos">Acabados</Link> / {cat.nombre}
      </div>
      <div className={styles.general}>
        {cat.productos.map((producto) => (
          <div key={producto.slug} className={styles.cuadroBlanco}>
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              width={280}
              height={220}
              style={{ objectFit: 'contain', width: '100%', height: '220px' }}
            />
            <p className={styles.nombreProducto}>{producto.nombre}</p>
            <Link href={`/textucos/adhesivos/${producto.slug}`} className={styles.verMasBtn}>
              Ver más
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
