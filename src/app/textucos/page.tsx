export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getCategorias } from '@/lib/productos'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Acabados - FERCADI' }

export default async function TextucosPage() {
  const categorias = await getCategorias('textucos')

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Acabados
      </div>
      <div className={styles.general}>
        {categorias.map((cat) => (
          <Link key={cat.slug} href={`/textucos/${cat.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              <h3>{(cat.nombre ?? cat.slug).toUpperCase()}</h3>
            </div>
            <div className={styles.verBtn}>Ver productos</div>
          </Link>
        ))}
      </div>
    </>
  )
}
