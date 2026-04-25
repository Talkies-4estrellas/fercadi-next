import Link from 'next/link'
import Image from 'next/image'
import { tips } from '@/data/tips'
import styles from '@/styles/product.module.css'

export const metadata = { title: 'Tips de Construcción - FERCADI' }

export default function TipsPage() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link> / Tips
      </div>
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {tips.map((tip) => (
          <div
            key={tip.slug}
            style={{
              display: 'flex',
              gap: '30px',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            }}
          >
            <Image
              src={tip.imagen}
              alt={tip.titulo}
              width={300}
              height={200}
              style={{ objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ color: 'var(--azul-oscuro)', fontSize: '1.5rem', fontWeight: 900 }}>
                {tip.titulo}
              </h2>
              <p style={{ color: 'var(--azul-secundario)', lineHeight: 1.6 }}>{tip.descripcion}</p>
              <Link
                href={`/tips/${tip.slug}`}
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  backgroundColor: 'var(--azul-boton)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 700,
                  width: 'fit-content',
                }}
              >
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
