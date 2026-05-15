'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/home.module.css';

export default function RegistroPage() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setLoading(false);

    if (res.ok) {
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
    } else {
      const data = await res.json();
      alert(data.message || 'Error al registrar');
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div className={styles.card} style={{ width: '100%', maxWidth: '420px' }}>
        <h2 style={{ color: 'var(--dorado)', marginBottom: '24px', fontSize: '1.4rem', fontWeight: 900 }}>
          Crear cuenta
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="text"
            placeholder="Nombre completo"
            required
            style={inputStyle}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            style={inputStyle}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            style={inputStyle}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--dorado)', color: 'var(--azul-profundo)', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.85rem', textAlign: 'center', color: 'var(--fondo-claro)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--dorado)', fontWeight: 700 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: 'var(--fondo-claro)',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
};
