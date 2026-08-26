'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

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
      <p style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--azul-profundo)', lineHeight: 1 }}>
        500
      </p>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--azul-oscuro)', margin: '16px 0 8px' }}>
        Algo salió mal
      </h1>
      <p style={{ color: '#666', maxWidth: 360, marginBottom: 32 }}>
        Ocurrió un error inesperado. Puedes intentar de nuevo o regresar al inicio.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            backgroundColor: 'var(--azul-boton)',
            color: 'white',
            padding: '10px 28px',
            borderRadius: 20,
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            margin: 0,
          }}
        >
          Intentar de nuevo
        </button>
        <Link href="/" style={{
          backgroundColor: 'transparent',
          color: 'var(--azul-boton)',
          padding: '10px 28px',
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.9rem',
          border: '2px solid var(--azul-boton)',
        }}>
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
