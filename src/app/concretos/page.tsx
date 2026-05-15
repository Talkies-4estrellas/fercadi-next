import Link from 'next/link'
import { concretos } from '@/data/concretos'
import styles from '@/styles/product.module.css'
import CalculadoraVolumen from '@/components/CalculadoraVolumen'

export const metadata = { title: 'Concretos - FERCADI' }

export default function ConcretosPage() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Concretos
      </div>
      <CalculadoraVolumen />
      <div className={styles.general}>
        {concretos.map((cat) => (
          <Link key={cat.slug} href={`/concretos/${cat.slug}`} className={styles.cuadro}>
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
