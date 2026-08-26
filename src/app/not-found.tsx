import Link from 'next/link'

export const metadata = { title: 'Página no encontrada — FERCADI' }

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      <p style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--azul-profundo)', lineHeight: 1 }}>
        404
      </p>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--azul-oscuro)', margin: '16px 0 8px' }}>
        Página no encontrada
      </h1>
      <p style={{ color: '#666', maxWidth: 360, marginBottom: 32 }}>
        El producto o sección que buscas no existe o fue movido.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          backgroundColor: 'var(--azul-boton)',
          color: 'white',
          padding: '10px 28px',
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          Ir al inicio
        </Link>
        <Link href="/ferreteria" style={{
          backgroundColor: 'transparent',
          color: 'var(--azul-boton)',
          padding: '10px 28px',
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.9rem',
          border: '2px solid var(--azul-boton)',
        }}>
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
