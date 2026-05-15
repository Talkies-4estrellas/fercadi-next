import Link from 'next/link'
import { materiales } from '@/data/materiales'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Materiales - FERCADI' }

export default function MaterialesPage() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Materiales
      </div>
      <div className={styles.general}>
        {materiales.map((cat) => (
          <Link key={cat.slug} href={`/materiales/${cat.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              <h3>{cat.nombre.toUpperCase()}</h3>
            </div>
            <div className={styles.verBtn}>Ver</div>
          </Link>
        ))}
      </div>
    </>
  )
}
