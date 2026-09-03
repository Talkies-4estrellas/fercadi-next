'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

type Seccion = 'ferreteria' | 'concretos' | 'textucos' | 'materiales';

interface Resultado {
  seccion: string;
  insertados: number;
  errores: number;
  duracion_ms: number;
  detalles: string[];
}

const INFO_SECCIONES: Record<Seccion, { label: string; icon: string; columnas: { campo: string; ejemplo: string; requerido: boolean }[] }> = {
  ferreteria: {
    label: 'Ferretería',
    icon: 'fa-wrench',
    columnas: [
      { campo: 'código (col 0)', ejemplo: 'P-001', requerido: true },
      { campo: 'clave (col 1)', ejemplo: 'TOR-4X1', requerido: true },
      { campo: 'descripción (col 2)', ejemplo: 'TORNILLO 4X1 PUNTA FINA', requerido: true },
      { campo: '… 23 columnas comerciales …', ejemplo: '(formato proveedor)', requerido: false },
      { campo: 'Familia (col 22)', ejemplo: 'P085', requerido: true },
      { campo: 'Desc.Familia (col 23)', ejemplo: 'Tornillería', requerido: false },
    ],
  },
  concretos: {
    label: 'Concretos',
    icon: 'fa-industry',
    columnas: [
      { campo: 'nombre', ejemplo: 'Concreto FC-150', requerido: true },
      { campo: 'descripcion', ejemplo: 'Resistencia nominal 150 kg/cm²', requerido: false },
      { campo: 'precio', ejemplo: '1250.00', requerido: true },
      { campo: 'categoria_slug', ejemplo: 'fc-150', requerido: true },
      { campo: 'categoria_nombre', ejemplo: 'FC-150', requerido: false },
      { campo: 'marca', ejemplo: 'Concreto CEMEX', requerido: false },
      { campo: 'unidad', ejemplo: 'm³', requerido: false },
      { campo: 'imagen_url', ejemplo: 'https://…/imagen.webp', requerido: false },
    ],
  },
  textucos: {
    label: 'Textucos / Acabados',
    icon: 'fa-paint-roller',
    columnas: [
      { campo: 'nombre', ejemplo: 'Estuco Veneciano Blanco', requerido: true },
      { campo: 'descripcion', ejemplo: 'Acabado liso de alta resistencia', requerido: false },
      { campo: 'precio', ejemplo: '340.00', requerido: true },
      { campo: 'categoria_slug', ejemplo: 'morteros', requerido: true },
      { campo: 'categoria_nombre', ejemplo: 'Morteros', requerido: false },
      { campo: 'marca', ejemplo: 'Josman', requerido: false },
      { campo: 'unidad', ejemplo: 'bolsa 20 kg', requerido: false },
      { campo: 'imagen_url', ejemplo: 'https://…/imagen.webp', requerido: false },
    ],
  },
  materiales: {
    label: 'Materiales',
    icon: 'fa-cubes',
    columnas: [
      { campo: 'nombre', ejemplo: 'Block 15x20x40', requerido: true },
      { campo: 'descripcion', ejemplo: 'Block de concreto hueco', requerido: false },
      { campo: 'precio', ejemplo: '18.50', requerido: true },
      { campo: 'categoria_slug', ejemplo: 'construccion', requerido: true },
      { campo: 'categoria_nombre', ejemplo: 'Construcción', requerido: false },
      { campo: 'marca', ejemplo: '', requerido: false },
      { campo: 'unidad', ejemplo: 'pza', requerido: false },
      { campo: 'imagen_url', ejemplo: '', requerido: false },
    ],
  },
};

export default function AdminImportarPage() {
  const { user }    = useAuth();
  const inputRef    = useRef<HTMLInputElement>(null);
  const [seccion, setSeccion]           = useState<Seccion>('ferreteria');
  const [archivo, setArchivo]           = useState<File | null>(null);
  const [arrastrando, setArrastrando]   = useState(false);
  const [estado, setEstado]             = useState<'idle' | 'importando' | 'ok' | 'error'>('idle');
  const [resultado, setResultado]       = useState<Resultado | null>(null);
  const [mensajeError, setMensajeError] = useState('');

  const elegirArchivo = (f: File | undefined) => {
    if (!f) return;
    if (!f.name.endsWith('.csv') && f.type !== 'text/csv') {
      setMensajeError('Solo se aceptan archivos .csv');
      return;
    }
    setMensajeError('');
    setEstado('idle');
    setArchivo(f);
  };

  const importar = async () => {
    if (!user || !archivo) return;
    setEstado('importando');
    setResultado(null);
    setMensajeError('');

    const fd = new FormData();
    fd.append('file', archivo);
    fd.append('seccion', seccion);

    try {
      const res  = await fetch('/api/admin/importar', {
        method: 'POST',
        headers: { 'x-usuario-id': String(user.id) },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResultado(data);
        setEstado('ok');
      } else {
        setMensajeError(data.message ?? 'Error desconocido del servidor.');
        setEstado('error');
      }
    } catch (e: any) {
      setMensajeError(e?.message ?? 'Error de red.');
      setEstado('error');
    }
  };

  const info = INFO_SECCIONES[seccion];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-file-csv" style={{ marginRight: 10 }} aria-hidden="true" />
            Importar CSV
          </h1>
          <p className={styles.pageSubtitle}>
            Carga masiva de productos desde un archivo CSV. El proceso es seguro para ejecutar
            varias veces (upsert por slug + sección).
          </p>
        </div>
      </div>

      {/* ── Selector de sección ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {(Object.entries(INFO_SECCIONES) as [Seccion, typeof info][]).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setSeccion(key); setEstado('idle'); setResultado(null); }}
            className={seccion === key ? styles.btnPrimary : styles.btnSecondary}
            style={{ gap: 7 }}
          >
            <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Formato de columnas ── */}
      <div className={styles.tablaWrap} style={{ marginBottom: 24 }}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>#</th>
              <th>Columna CSV</th>
              <th>Ejemplo</th>
              <th>Requerido</th>
            </tr>
          </thead>
          <tbody>
            {info.columnas.map((col, i) => (
              <tr key={i}>
                <td style={{ opacity: 0.45, fontSize: '0.8rem' }}>{i}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{col.campo}</td>
                <td style={{ fontSize: '0.82rem', opacity: 0.7 }}>{col.ejemplo || '—'}</td>
                <td>
                  {col.requerido
                    ? <span className={`${styles.estadoBadge} ${styles.estadoActivo}`}>Sí</span>
                    : <span className={styles.estadoBadge}>Opcional</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {seccion !== 'ferreteria' && (
          <p style={{ fontSize: '0.78rem', color: '#888', padding: '8px 12px 0' }}>
            <i className="fa-solid fa-circle-info" aria-hidden="true" style={{ marginRight: 5 }} />
            Primera fila = encabezado (se ignora). Separador: coma. Codificación: UTF-8.
          </p>
        )}
      </div>

      {/* ── Zona de carga del CSV ── */}
      <label
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '28px 20px', marginBottom: 20,
          border: `2px dashed ${arrastrando ? 'var(--azul-boton)' : 'rgba(53,101,197,0.3)'}`,
          borderRadius: 12,
          background: arrastrando ? 'rgba(53,101,197,0.06)' : '#f5f7fb',
          cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.18s, background 0.18s',
        }}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setArrastrando(false); }}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegirArchivo(e.dataTransfer.files?.[0]); }}
      >
        <i
          className={`fa-solid ${arrastrando ? 'fa-circle-arrow-down' : archivo ? 'fa-file-csv' : 'fa-cloud-arrow-up'}`}
          aria-hidden="true"
          style={{ fontSize: '2rem', color: archivo ? '#16a34a' : 'var(--azul-boton)', opacity: 0.8 }}
        />
        {archivo ? (
          <p style={{ margin: 0, fontWeight: 700, color: '#16a34a' }}>
            {archivo.name}{' '}
            <span style={{ fontWeight: 400, color: '#555' }}>
              ({(archivo.size / 1024).toFixed(0)} KB)
            </span>
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--azul-profundo)', opacity: 0.6 }}>
            <strong style={{ opacity: 1 }}>Arrastra el archivo CSV aquí</strong><br />
            o haz clic para seleccionar · solo .csv
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={(e) => elegirArchivo(e.target.files?.[0])}
        />
      </label>

      {/* ── Botón ── */}
      <button
        className={styles.btnPrimary}
        onClick={importar}
        disabled={!archivo || estado === 'importando'}
        style={{ fontSize: '1rem', padding: '14px 32px' }}
      >
        {estado === 'importando' ? (
          <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Importando… puede tardar hasta 60 s</>
        ) : (
          <><i className="fa-solid fa-file-arrow-up" aria-hidden="true" /> Importar a {info.label}</>
        )}
      </button>

      {/* ── Resultado ── */}
      {estado === 'ok' && resultado && (
        <div className={styles.mensajeOk} style={{ marginTop: 24 }}>
          <strong>
            <i className="fa-solid fa-circle-check" aria-hidden="true" /> Importación completada — {resultado.seccion}
          </strong>
          <div className={styles.statsGrid} style={{ marginTop: 16 }}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{resultado.insertados.toLocaleString('es-MX')}</span>
              <span className={styles.statLabel}>Filas procesadas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{resultado.errores}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{(resultado.duracion_ms / 1000).toFixed(1)} s</span>
              <span className={styles.statLabel}>Duración</span>
            </div>
          </div>
          {resultado.detalles.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                Ver detalles de errores ({resultado.detalles.length})
              </summary>
              <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: '0.85rem' }}>
                {resultado.detalles.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      {(estado === 'error' || mensajeError) && (
        <div className={styles.mensajeError} style={{ marginTop: 24 }}>
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {mensajeError}
        </div>
      )}
    </>
  );
}
