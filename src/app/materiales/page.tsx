export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getMaterialesCategorias } from '@/lib/productos'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Materiales - FERCADI' }

const CAT_IMG: Record<string, string> = {
  construccion: '/categorias/construccion.png',
  decoracion:   '/categorias/decoracion.png',
  electrico:    '/categorias/electrico.png',
  herramienta:  '/categorias/herramienta.png',
  herreria:     '/categorias/herreria.png',
  plomeria:     '/categorias/plomeria.png',
}

export default async function MaterialesPage() {
  const categorias = await getMaterialesCategorias()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Materiales
      </div>
      <div className={styles.general}>
        {categorias.map((cat) => (
          <Link key={cat.slug} href={`/materiales/${cat.slug}`} className={styles.cuadro}>
            <div className={styles.azul}>
              <h3>{cat.nombre.toUpperCase()}</h3>
            </div>
            {CAT_IMG[cat.slug] && (
              <img src={CAT_IMG[cat.slug]} alt={cat.nombre} />
            )}
            <div className={styles.verBtn}>Ver</div>
          </Link>
        ))}
      </div>
    </>
  )
}