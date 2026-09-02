'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from '@/styles/admin.module.css';
import galeriaStyles from '@/styles/adminGaleria.module.css';

interface ImagenItem {
  carpeta: string;
  ruta: string;
  nombre: string;
  fuente: 'local' | 'supabase';
}

export default function GaleriaPage() {
  const { user } = useAuth();

  const [imagenes,   setImagenes]   = useState<ImagenItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [carpeta,    setCarpeta]    = useState('');
  const [busqueda,   setBusqueda]   = useState('');
  const [copiado,    setCopiado]    = useState<string | null>(null);
  const [mensaje,    setMensaje]    = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [subiendo,   setSubiendo]   = useState(false);
  const [rutaSubida, setRutaSubida] = useState('');
  const [preview,    setPreview]    = useState<ImagenItem | null>(null);
  const inputRutaRef = useRef<HTMLInputElement>(null);

  const mostrarMensaje = (tipo: 'ok' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  };

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin/imagenes', {
        headers: { 'x-usuario-id': String(user.id) },
      });
      const d = await r.json();
      setImagenes(d.ok ? d.imagenes : []);
    } catch {
      setImagenes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { cargar(); }, [cargar]);

  const carpetas = Array.from(new Set(imagenes.map((i) => i.carpeta))).sort();

  const imagenesFiltradas = imagenes.filter((img) => {
    const matchCarpeta = !carpeta || img.carpeta === carpeta;
    const matchBusq    = !busqueda || img.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCarpeta && matchBusq;
  });

  const copiar = async (ruta: string) => {
    try {
      await navigator.clipboard.writeText(ruta);
      setCopiado(ruta);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      mostrarMensaje('error', 'No se pudo copiar al portapapeles');
    }
  };

  const subirImagen = async (file: File) => {
    if (!user) return;
    if (!rutaSubida.trim()) {
      mostrarMensaje('error', 'Escribe la ruta de destino antes de subir');
      inputRutaRef.current?.focus();
      return;
    }
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('path', rutaSubida.trim());
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-usuario-id': String(user.id) },
        body: fd,
      });
      const d = await r.json();
      if (d.ok) {
        mostrarMensaje('ok', `Imagen subida: ${d.url}`);
        setRutaSubida('');
        await cargar();
      } else {
        mostrarMensaje('error', d.error ?? 'Error al subir imagen');
      }
    } catch {
      mostrarMensaje('error', 'Error de red al subir');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-images" style={{ marginRight: 10 }} aria-hidden="true" />
            Galería de imágenes
          </h1>
          <p className={styles.pageSubtitle}>
            Explora, copia y sube imágenes de productos. Total: {imagenes.length} archivos.
          </p>
        </div>
        <button className={styles.btnSecondary} onClick={cargar} disabled={loading}>
          <i className="fa-solid fa-arrows-rotate" aria-hidden="true" /> Recargar
        </button>
      </div>

      {mensaje && (
        <div
          className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}
          style={{ marginBottom: 20 }}
        >
          <i className={`fa-solid ${mensaje.tipo === 'ok' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} aria-hidden="true" />
          {' '}{mensaje.texto}
        </div>
      )}

      {/* Panel de subida */}
      <div className={galeriaStyles.uploadPanel}>
        <h3 className={galeriaStyles.uploadTitle}>
          <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Subir imagen
        </h3>
        <div className={galeriaStyles.uploadRow}>
          <div className={galeriaStyles.uploadRutaWrap}>
            <label className={styles.formLabel}>Ruta de destino</label>
            <input
              ref={inputRutaRef}
              className={styles.formInput}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              value={rutaSubida}
              onChange={(e) => setRutaSubida(e.target.value)}
              placeholder="ej. productos/textucos/servicios/nombre-imagen.webp"
            />
            <span className={galeriaStyles.rutaHint}>
              La imagen se convierte a WebP automáticamente.
            </span>
          </div>
          <div className={galeriaStyles.uploadBtnWrap}>
            {subiendo ? (
              <span className={styles.loadingText}>
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Subiendo…
              </span>
            ) : (
              <ImageUploader onFile={subirImagen} />
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros} style={{ marginTop: 24 }}>
        <select
          value={carpeta}
          onChange={(e) => setCarpeta(e.target.value)}
          className={styles.filtroSelect}
        >
          <option value="">Todas las carpetas ({imagenes.length})</option>
          {carpetas.map((c) => (
            <option key={c} value={c}>
              {c} ({imagenes.filter((i) => i.carpeta === c).length})
            </option>
          ))}
        </select>

        <div className={styles.filtroBuscar}>
          <input
            type="text"
            placeholder="Buscar por nombre de archivo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.filtroInput}
          />
          {busqueda && (
            <button className={styles.btnSecondary} onClick={() => setBusqueda('')}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>

        {!loading && (
          <span className={styles.totalChip}>
            {imagenesFiltradas.length.toLocaleString('es-MX')} imagen{imagenesFiltradas.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Grid de imágenes */}
      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Cargando imágenes…
        </p>
      ) : imagenesFiltradas.length === 0 ? (
        <p className={styles.emptyText}>
          <i className="fa-solid fa-inbox" aria-hidden="true" /> Sin imágenes con los filtros actuales.
        </p>
      ) : (
        <div className={galeriaStyles.grid}>
          {imagenesFiltradas.map((img) => {
            const yaCopiada = copiado === img.ruta;
            return (
              <div key={img.ruta} className={galeriaStyles.card}>
                <button
                  className={galeriaStyles.cardImg}
                  onClick={() => setPreview(img)}
                  title="Ver en grande"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.ruta}
                    alt={img.nombre}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </button>
                <div className={galeriaStyles.cardBody}>
                  <span className={galeriaStyles.cardNombre} title={img.nombre}>
                    {img.nombre}
                  </span>
                  <span className={`${galeriaStyles.fuenteBadge} ${img.fuente === 'supabase' ? galeriaStyles.fuenteSupabase : galeriaStyles.fuenteLocal}`}>
                    {img.fuente}
                  </span>
                </div>
                <div className={galeriaStyles.cardRuta} title={img.ruta}>
                  {img.ruta}
                </div>
                <button
                  className={`${galeriaStyles.copiarBtn} ${yaCopiada ? galeriaStyles.copiarBtnOk : ''}`}
                  onClick={() => copiar(img.ruta)}
                >
                  <i className={`fa-solid ${yaCopiada ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />
                  {yaCopiada ? ' Copiado' : ' Copiar URL'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal preview */}
      {preview && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreview(null)}
          style={{ zIndex: 1000 }}
        >
          <div
            className={galeriaStyles.previewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{preview.nombre}</h3>
              <button className={styles.modalClose} onClick={() => setPreview(null)} aria-label="Cerrar">
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div className={galeriaStyles.previewImgWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.ruta} alt={preview.nombre} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ flex: 1, fontSize: '0.78rem', color: '#445', wordBreak: 'break-all' }}>{preview.ruta}</code>
              <button
                className={`${galeriaStyles.copiarBtn} ${copiado === preview.ruta ? galeriaStyles.copiarBtnOk : ''}`}
                onClick={() => copiar(preview.ruta)}
              >
                <i className={`fa-solid ${copiado === preview.ruta ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />
                {copiado === preview.ruta ? ' Copiado' : ' Copiar URL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
