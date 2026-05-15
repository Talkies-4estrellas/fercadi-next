'use client'

import { useState } from 'react'
import styles from '@/styles/contact.module.css'
import cot from '@/styles/cotizacion.module.css'

type Estado = 'idle' | 'enviando' | 'exito' | 'error'

export default function CotizacionPage() {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    producto: '',
    cantidad: '',
    descripcion: '',
  })
  const [estado, setEstado] = useState<Estado>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    try {
      const res = await fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEstado('exito')
        setForm({ nombre: '', telefono: '', email: '', producto: '', cantidad: '', descripcion: '' })
      } else {
        setEstado('error')
      }
    } catch {
      setEstado('error')
    }
  }

  return (
    <div className={styles.contacto}>
      <h2>Solicitar Cotización</h2>
      <p className={cot.subtitulo}>
        Completa el formulario y nos comunicamos contigo a la brevedad con un presupuesto personalizado.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.campo}>
          <label htmlFor="nombre">Nombre completo *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="telefono">Teléfono / WhatsApp *</label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ej. 800 337 2234"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="producto">Producto de interés *</label>
          <select
            id="producto"
            name="producto"
            value={form.producto}
            onChange={handleChange}
            required
            className={cot.select}
          >
            <option value="">Selecciona una categoría</option>
            <option value="Concreto">Concreto</option>
            <option value="Renta de equipo">Renta de equipo</option>
            <option value="Texturizados y adhesivos">Texturizados y adhesivos</option>
            <option value="Materiales de construcción">Materiales de construcción</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="cantidad">Cantidad / Volumen</label>
          <input
            id="cantidad"
            name="cantidad"
            type="text"
            value={form.cantidad}
            onChange={handleChange}
            placeholder="Ej. 10 m³, 50 sacos, 3 días de renta..."
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="descripcion">Descripción del proyecto</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Cuéntanos sobre tu proyecto, ubicación, fechas estimadas, etc."
          />
        </div>

        <button type="submit" className={styles.btnEnviar} disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>

      {estado === 'exito' && (
        <p className={`${styles.mensaje} ${styles.exito}`}>
          ¡Solicitud enviada! Te contactaremos pronto con tu cotización.
        </p>
      )}
      {estado === 'error' && (
        <p className={`${styles.mensaje} ${styles.error}`}>
          Hubo un error al enviar. Intenta de nuevo o contáctanos por WhatsApp.
        </p>
      )}

      <a
        href="https://api.whatsapp.com/send?phone=528003372234&text=Hola,%20quisiera%20solicitar%20una%20cotizaci%C3%B3n"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsapp}
      >
        <i className="fa fa-whatsapp" /> Cotizar por WhatsApp
      </a>
    </div>
  )
}
