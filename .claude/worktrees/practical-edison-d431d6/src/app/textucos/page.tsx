import Link from 'next/link'
import { textucos } from '@/data/textucos'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Acabados - FERCADI' }

export default function TextucosPage() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Acabados
      </div>
      <div className={styles.general}>
        {textucos.map((cat) => (
          <Link key={cat.slug} href={`/textucos/${cat.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              <h3>{cat.nombre.toUpperCase()}</h3>
            </div>
            <div className={styles.verBtn}>Ver productos</div>
          </Link>
        ))}
      </div>
    </>
  )
}
