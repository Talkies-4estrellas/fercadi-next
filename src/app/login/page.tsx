'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/home.module.css';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    edad: '',
    domicilio: '',
    colonia: '',
    estado: '',
    ciudad: '',
    fecha_nacimiento: '',
    profesion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Determinamos el endpoint según el modo actual
    const endpoint = isLogin ? '/api/login' : '/api/registro';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { correo: formData.correo, password: formData.password } : formData),
      });
      
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        if (isLogin) {
          login(data.user);
          router.push('/');
        } else {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          setIsLogin(true);
        }
      } else {
        alert(data.message || 'Error en la operación');
      }
    } catch (error) {
      setLoading(false);
      alert('Error de conexión con el servidor');
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px', color: '#ffffff' }}>
      <style>{`#loginWrap input::placeholder { color: rgba(255,255,255,0.45) !important; }`}</style>
      <div id="loginWrap" className={styles.card} style={{
        width: '100%',
        maxWidth: isLogin ? '450px' : '650px',
        padding: '35px', 
        backgroundColor: '#001a3d', 
        borderRadius: '15px',
        transition: 'max-width 0.3s ease' 
      }}>
        <h2 style={{ color: '#ffc107', marginBottom: '24px', fontSize: '1.6rem', fontWeight: 900 }}>
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ 
          display: 'grid', 
          gridTemplateColumns: isLogin ? '1fr' : '1fr 1fr', 
          gap: '16px' 
        }}>
          
          {/* Campos exclusivos de Registro */}
          {!isLogin && (
            <div style={{ gridColumn: 'span 2' }}>
              <input
                name="nombre"
                type="text"
                placeholder="Nombre completo"
                required
                style={inputStyle}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Campos comunes (Login y Registro) */}
          <input
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            required
            style={inputStyle}
            onChange={handleChange}
          />
          
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            style={inputStyle}
            onChange={handleChange}
          />

          {/* Más campos exclusivos de Registro */}
          {!isLogin && (
            <>
              <input
                name="edad"
                type="number"
                placeholder="Edad"
                style={inputStyle}
                onChange={handleChange}
              />
              <input
                name="profesion"
                type="text"
                placeholder="Profesión"
                style={inputStyle}
                onChange={handleChange}
              />
              <input
                name="domicilio"
                type="text"
                placeholder="Domicilio"
                style={inputStyle}
                onChange={handleChange}
              />
              <input
                name="colonia"
                type="text"
                placeholder="Colonia"
                style={inputStyle}
                onChange={handleChange}
              />
              <input
                name="ciudad"
                type="text"
                placeholder="Ciudad"
                style={inputStyle}
                onChange={handleChange}
              />
              <input
                name="estado"
                type="text"
                placeholder="Estado"
                style={inputStyle}
                onChange={handleChange}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', color: '#ffc107', fontWeight: 'bold' }}>Fecha de Nacimiento</label>
                <input
                  name="fecha_nacimiento"
                  type="date"
                  style={{...inputStyle, colorScheme: 'dark'}}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{...buttonStyle, gridColumn: isLogin ? 'span 1' : 'span 2'}}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrar Cuenta')}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '0.9rem', textAlign: 'center', color: '#ffffff' }}>
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: '#ffc107', fontWeight: 700, cursor: 'pointer' }}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </span>
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.3)',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#ffffff', 
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#ffc107',
  color: '#001a3d',
  padding: '14px',
  borderRadius: '30px',
  fontWeight: 700,
  fontSize: '1rem',
  border: 'none',
  marginTop: '10px',
  cursor: 'pointer',
};