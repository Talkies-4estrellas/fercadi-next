'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/admin/ImageUploader';
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

export default function EditarTipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router   = useRouter();

  const [slug,        setSlug]        = useState('');
  const [titulo,      setTitulo]      = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen,      setImagen]      = useState('');
  const [contenido,   setContenido]   = useState('');
  const [activo,      setActivo]      = useState(true);
  const [cargando,    setCargando]    = useState(true);
  const [guardando,   setGuardando]   = useState(false);
  const [msgOk,       setMsgOk]       = useState('');
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/admin/tips/${id}`, { headers: { 'x-usuario-id': String(user.id) } })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          const t = d.tip;
          setSlug(t.slug ?? '');
          setTitulo(t.titulo ?? '');
          setDescripcion(t.descripcion ?? '');
          setImagen(t.imagen ?? '');
          setContenido(t.contenido ?? '');
          setActivo(!!t.activo);
        }
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [user, id]);

  const handleGuardar = async () => {
    if (!user) return;
    if (!titulo.trim()) { setError('El título es requerido.'); return; }
    if (!slug.trim())   { setError('El slug es requerido.');   return; }
    setError(''); setMsgOk('');
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/tips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
        body: JSON.stringify({ slug, titulo, descripcion, imagen, contenido, activo }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsgOk('Cambios guardados correctamente.');
      } else {
        setError(data.error || 'No se pudo guardar.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className={styles.loadingText}><i className="fa-solid fa-spinner fa-spin" /> Cargando tip…</p>;
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Editar tip</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/tips/${slug}`} className={styles.btnSecondary} target="_blank" title="Ver en sitio">
            <i className="fa-solid fa-eye" /> Ver
          </Link>
          <Link href="/admin/tips" className={styles.btnSecondary}>
            <i className="fa-solid fa-arrow-left" /> Volver
          </Link>
        </div>
      </div>

      <div className={tipStyles.formWrap}>
        {/* Columna principal */}
        <div className={tipStyles.formMain}>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Título *</label>
            <input
              type="text"
              className={styles.formInput}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

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
              onChange={(e) => setSlug(slugificar(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción corta</label>
            <textarea
              className={styles.formTextarea}
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Contenido completo</label>
            <p className={tipStyles.ayuda}>
              Usa <code>**texto**</code> para negrita, <code>- elemento</code> para listas y líneas en blanco para separar párrafos.
            </p>
            <textarea
              className={tipStyles.contenidoTextarea}
              rows={18}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />
          </div>
        </div>

        {/* Columna lateral */}
        <div className={tipStyles.formSide}>

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

          <div className={tipStyles.sideCard}>
            <p className={tipStyles.sideCardTitulo}>Imagen de portada</p>
            <ImageUploader carpeta="tips" onUrl={(url) => setImagen(url)} />
            <input
              type="text"
              className={styles.formInput}
              style={{ marginTop: 8 }}
              placeholder="URL de imagen o pega una externa"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
            />
            {imagen && (
              <div className={tipStyles.imgPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagen} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {msgOk && (
            <p style={{ color: '#2ecc71', fontSize: '0.85rem', display: 'flex', gap: 6 }}>
              <i className="fa-solid fa-check" /> {msgOk}
            </p>
          )}
          {error && (
            <div className={styles.formError}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <button
            className={styles.btnPrimary}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando
              ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
              : <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>
            }
          </button>
        </div>
      </div>
    </>
  );
}
