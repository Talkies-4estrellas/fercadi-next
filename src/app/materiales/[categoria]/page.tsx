export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getCategoriaMaterial } from '@/lib/productos'
import SectionHero from '@/components/SectionHero'
import styles from '@/styles/product.module.css'

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const cat = await getCategoriaMaterial(categoria)
  return { title: `\ - FERCADI` }
}

export default async function MaterialCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const cat = await getCategoriaMaterial(categoria)
  if (!cat) notFound()

  return (
    <>
      <SectionHero
        icono="fa-solid fa-boxes-stacking"
        etiqueta="Materiales"
        titulo={cat.nombre}
        subtitulo={cat.descripcion || 'Encuentra los mejores materiales de construcción de las marcas líderes.'}
      />
      <div className={styles.marcasGrid}>
        {cat.marcas.length > 0 ? (
          cat.marcas.map((marca) => (
            <div key={marca.nombre} className={styles.marcaCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={marca.logo}
                alt={marca.nombre}
                width={160}
                height={80}
                style={{ objectFit: 'contain', maxWidth: '100%' }}
              />
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--azul-medio)', textAlign: 'center', width: '100%' }}>
            Próximamente más información sobre esta categoría.
          </p>
        )}
      </div>
    </>
  )
}