'use client'

import { useState } from 'react'
import styles from '@/styles/contact.module.css'

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'exito' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEstado('exito')
        setForm({ nombre: '', email: '', mensaje: '' })
      } else {
        setEstado('error')
      }
    } catch {
      setEstado('error')
    }
  }

  return (
    <div className={styles.contacto}>
      <h2>Contacto</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.campo}>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.campo}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.campo}>
          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={styles.btnEnviar} disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </form>

      {estado === 'exito' && (
        <p className={`${styles.mensaje} ${styles.exito}`}>
          ¡Mensaje enviado! Te contactaremos pronto.
        </p>
      )}
      {estado === 'error' && (
        <p className={`${styles.mensaje} ${styles.error}`}>
          Hubo un error al enviar. Intenta de nuevo.
        </p>
      )}

      <a
        href="https://api.whatsapp.com/send?phone=528003372234&text=Hola,%20me%20interesa%20saber%20más%20sobre%20sus%20productos"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsapp}
      >
        <i className="fa fa-whatsapp"></i> Contactar por WhatsApp
      </a>
    </div>
  )
}
