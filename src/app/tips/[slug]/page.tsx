import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { tips, getTipBySlug } from '@/data/tips'
import styles from '@/styles/product.module.css'

export function generateStaticParams() {
  return tips.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tip = getTipBySlug(slug)
  return { title: `${tip?.titulo ?? 'Tip'} - FERCADI` }
}

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tip = getTipBySlug(slug)
  if (!tip) notFound()

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / <Link href="/tips">Tips</Link> / {tip.titulo}
      </div>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <Image
          src={tip.imagen}
          alt={tip.titulo}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '30px' }}
          priority
        />
        <h1 style={{ color: 'var(--azul-oscuro)', fontSize: '2rem', fontWeight: 900, marginBottom: '20px' }}>
          {tip.titulo}
        </h1>
        <div
          style={{ color: 'var(--azul-secundario)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}
        >
          {tip.contenido}
        </div>
      </div>
    </>
  )
}
