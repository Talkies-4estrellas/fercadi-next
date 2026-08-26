export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #dde4f0',
        borderTopColor: 'var(--azul-boton)',
        borderRadius: '50%',
        animation: 'fercadi-spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes fercadi-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
