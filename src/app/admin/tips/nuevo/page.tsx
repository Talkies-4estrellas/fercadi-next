'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';
import tipStyles from '@/styles/adminTips.module.css';

function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function NuevoTipPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [slug,        setSlug]        = useState('');
  const [titulo,      setTitulo]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen,      setImagen]      = useState('');
  const [contenido,   setContenido]   = useState('');
  const [activo,      setActivo]      = useState(true);
  const [slugManual,  setSlugManual]  = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [error,       setError]       = useState('');

  // ── Neurona IA ────────────────────────────────────────────────
  const [temaIa,     setTemaIa]     = useState('');
  const [cargandoIa, setCargandoIa] = useState(false);

  const handleTitulo = (v: string) => {
    setTitulo(v);
    if (!slugManual) setSlug(slugificar(v));
  };

  const rellenarConIA = async () => {
    if (!temaIa.trim()) return;
    if (!user) return;
    setCargandoIa(true);
    setError('');
    try {
      const res = await fetch('/api/admin/tips/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-usuario-id': String(user.id),
        },
        body: JSON.stringify({ tema: temaIa }),
      });
      const data = await res.json();
      if (data.ok) {
        setTitulo(data.titulo);
        setSlug(slugificar(data.titulo));
        setSlugManual(false);
        setDescripcion(data.descripcion ?? '');
        setContenido(data.contenido ?? '');
      } else {
        setError(`IA: ${data.error ?? 'Error desconocido'}`);
      }
    } catch {
      setError('No se pudo conectar con el asistente de IA.');
    } finally {
      setCargandoIa(false);
    }
  };

  const handleGuardar = async () => {
    if (!user) return;
    if (!titulo.trim()) { setError('El título es requerido.'); return; }
    if (!slug.trim())   { setError('El slug es requerido.');   return; }
    setError('');
    setGuardando(true);
    try {
      const res = await fetch('/api/admin/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
        body: JSON.stringify({ slug, titulo, descripcion, imagen, contenido, activo }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push('/admin/tips');
      } else {
        setError(data.error || 'No se pudo guardar el tip.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Nuevo tip</h1>
        <Link href="/admin/tips" className={styles.btnSecondary}>
          <i className="fa-solid fa-arrow-left" /> Volver
        </Link>
      </div>

      {/* ── Asistente IA ─────────────────────────────────────── */}
      <div className={tipStyles.neurona}>
        <p className={tipStyles.neuronaTitulo}>
          <i className="fa-solid fa-brain" /> Asistente de Contenido IA
        </p>
        <p className={tipStyles.neuronaDesc}>
          Escribe una idea general y el asistente investigará, redactará y estructurará el Markdown por ti.
          Podrás revisar y editar el resultado antes de publicar.
        </p>
        <div className={tipStyles.neuronaRow}>
          <input
            type="text"
            className={tipStyles.neuronaInput}
            placeholder="Ej: Cómo aplicar estuco veneciano en muros exteriores con humedad"
            value={temaIa}
            onChange={(e) => setTemaIa(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && rellenarConIA()}
            disabled={cargandoIa}
          />
          <button
            type="button"
            className={tipStyles.neuronaBtn}
            onClick={rellenarConIA}
            disabled={cargandoIa || !temaIa.trim()}
          >
            {cargandoIa
              ? <><i className="fa-solid fa-spinner fa-spin" /> Generando…</>
              : <><i className="fa-solid fa-bolt" /> Rellenar formulario</>
            }
          </button>
        </div>
      </div>

      <div className={tipStyles.formWrap}>
        {/* Columna principal */}
        <div className={tipStyles.formMain}>

          {/* Título */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Título *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Ej: Cómo impermeabilizar una terraza"
              value={titulo}
              onChange={(e) => handleTitulo(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Slug *{' '}
              <span className={tipStyles.slugHint}>
                (URL: /tips/<strong>{slug || '…'}</strong>)
              </span>
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={slug}
              onChange={(e) => { setSlug(slugificar(e.target.value)); setSlugManual(true); }}
              placeholder="se-genera-automatico"
            />
          </div>

          {/* Descripción corta */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción corta</label>
            <textarea
              className={styles.formTextarea}
              rows={2}
              placeholder="Resumen que aparece en la tarjeta del listado (1–2 oraciones)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Contenido */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Contenido completo</label>
            <p className={tipStyles.ayuda}>
              Usa <code>**texto**</code> para negrita, <code>- elemento</code> para listas y líneas en blanco para separar párrafos.
            </p>
            <textarea
              className={tipStyles.contenidoTextarea}
              rows={16}
              placeholder={'Escribe el contenido del tutorial aquí…\n\n**Sección 1**\nTexto del párrafo.\n\n- Punto 1\n- Punto 2'}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />
          </div>
        </div>

        {/* Columna lateral */}
        <div className={tipStyles.formSide}>

          {/* Estado */}
          <div className={tipStyles.sideCard}>
            <p className={tipStyles.sideCardTitulo}>Publicación</p>
            <label className={tipStyles.toggleRow}>
              <span>Visible en el sitio</span>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className={tipStyles.toggleCheck}
              />
            </label>
            <p className={tipStyles.sideCardHint}>
              {activo ? '✅ Se mostrará en /tips' : '🚫 Oculto al público'}
            </p>
          </div>

          {/* Imagen */}
          <div className={tipStyles.sideCard}>
            <p className={tipStyles.sideCardTitulo}>Imagen de portada</p>
            <input
              type="text"
              className={styles.formInput}
              placeholder="/productos/tips/nombre.jpg"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
            />
            {imagen && (
              <div className={tipStyles.imgPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagen} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <p className={tipStyles.sideCardHint}>
              Ruta relativa desde /public o URL externa.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.formError}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          {/* Guardar */}
          <button
            className={styles.btnPrimary}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando
              ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
              : <><i className="fa-solid fa-floppy-disk" /> Publicar tip</>
            }
          </button>
        </div>
      </div>
    </>
  );
}
