import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { materiales, getCategoriaBySlug } from '@/data/materiales'
import styles from '@/styles/product.module.css'

export function generateStaticParams() {
  return materiales.map((cat) => ({ categoria: cat.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const cat = getCategoriaBySlug(categoria)
  return { title: `${cat?.nombre ?? 'Materiales'} - FERCADI` }
}

export default async function MaterialCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const cat = getCategoriaBySlug(categoria)
  if (!cat) notFound()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/materiales">Materiales</Link> / {cat.nombre}
      </div>
      <div style={{ padding: '20px 40px' }}>
        <p style={{ color: 'var(--azul-secundario)', marginBottom: '30px' }}>{cat.descripcion}</p>
      </div>
      <div className={styles.marcasGrid}>
        {cat.marcas.length > 0 ? (
          cat.marcas.map((marca) => (
            <div key={marca.nombre} className={styles.marcaCard}>
              <Image
                src={marca.logo}
                alt={marca.nombre}
                width={160}
                height={80}
                style={{ objectFit: 'contain' }}
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
