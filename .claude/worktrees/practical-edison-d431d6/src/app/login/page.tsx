'use client';
import { useState } from 'react';
import styles from '@/styles/home.module.css'; // Usando tus estilos existentes

export default function RegisterPage() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) alert('¡Registro exitoso!');
    else alert('Error al registrar');
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
      <div className={styles.card} style={{ width: '400px' }}>
        <h2 style={{ color: '#ffc107', marginBottom: '20px' }}>Crear Cuenta</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" placeholder="Nombre completo" required
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
          <input 
            type="email" placeholder="Correo electrónico" required
            onChange={(e) => setFormData({...formData, correo: e.target.value})}
          />
          <input 
            type="password" placeholder="Contraseña" required
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" style={{ backgroundColor: '#ffc107', color: '#001a3d', fontWeight: 'bold' }}>
            Registrarse
          </button>
        </form>
      </div>
    </main>
  );
}