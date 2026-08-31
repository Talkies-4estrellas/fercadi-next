'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/login.module.css';

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
    profesion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/registro';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isLogin
            ? { correo: formData.correo, password: formData.password }
            : formData
        ),
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
    } catch {
      setLoading(false);
      alert('Error de conexión con el servidor');
    }
  };

  return (
    <main className={styles.page}>
      <div className={`${styles.card} ${!isLogin ? styles.cardRegister : ''}`}>
        <h2 className={styles.titulo}>
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className={isLogin ? styles.formLogin : styles.formRegister}
        >
          {/* Solo registro: nombre completo */}
          {!isLogin && (
            <div className={styles.fullWidth}>
              <input
                name="nombre"
                type="text"
                placeholder="Nombre completo"
                required
                className={styles.input}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Correo y contraseña (ambos modos) */}
          <input
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            required
            className={styles.input}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className={styles.input}
            onChange={handleChange}
          />

          {/* Solo registro: campos adicionales */}
          {!isLogin && (
            <>
              <input name="edad"      type="number" placeholder="Edad"       className={styles.input} onChange={handleChange} />
              <input name="profesion" type="text"   placeholder="Profesión"  className={styles.input} onChange={handleChange} />
              <input name="domicilio" type="text"   placeholder="Domicilio"  className={styles.input} onChange={handleChange} />
              <input name="colonia"   type="text"   placeholder="Colonia"    className={styles.input} onChange={handleChange} />
              <input name="ciudad"    type="text"   placeholder="Ciudad"     className={styles.input} onChange={handleChange} />
              <input name="estado"    type="text"   placeholder="Estado"     className={styles.input} onChange={handleChange} />

              <div className={`${styles.dateGroup} ${styles.fullWidth}`}>
                <label className={styles.dateLabel}>Fecha de nacimiento</label>
                <input
                  name="fecha_nacimiento"
                  type="date"
                  className={`${styles.input} ${styles.inputDate}`}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${styles.btnSubmit} ${!isLogin ? styles.fullWidth : ''}`}
          >
            {loading ? 'Procesando…' : isLogin ? 'Entrar' : 'Registrar cuenta'}
          </button>
        </form>

        <p className={styles.footer}>
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </main>
  );
}
