'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Resultado {
  insertados: number;
  errores: number;
  duracion_ms: number;
  detalles: string[];
}

export default function AdminImportarPage() {
  const { user } = useAuth();
  const [estado, setEstado] = useState<'idle' | 'importando' | 'ok' | 'error'>('idle');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [mensajeError, setMensajeError] = useState('');

  const iniciar = async () => {
    if (!user) return;
    setEstado('importando');
    setResultado(null);
    setMensajeError('');

    try {
      const res = await fetch('/api/admin/importar', {
        method: 'POST',
        headers: { 'x-usuario-id': String(user.id) },
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

  return (
    <>
      <h1 className={styles.pageTitle}>Importar catálogo CSV</h1>
      <p className={styles.pageSubtitle}>
        Lee el archivo <code>catalogo_prueba.csv</code> de la raíz del proyecto
        e inserta los productos en la tabla <code>productos</code> con{' '}
        <code>seccion = &quot;ferreteria&quot;</code>.
        El proceso es seguro para ejecutar varias veces (upsert por clave única).
      </p>

      {/* ── Info del archivo ── */}
      <div className={styles.statsGrid} style={{ marginBottom: 24 }}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>~15.756</span>
          <span className={styles.statLabel}>Filas en el CSV</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>26</span>
          <span className={styles.statLabel}>Columnas por producto</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>32</span>
          <span className={styles.statLabel}>Columnas en la BD</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>2</span>
          <span className={styles.statLabel}>Visibles para usuarios</span>
        </div>
      </div>

      {/* ── Tabla de visibilidad ── */}
      <div className={styles.tablaWrap} style={{ marginBottom: 28 }}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Campo CSV</th>
              <th>Columna BD</th>
              <th>¿Usuario ve?</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['descripción', 'nombre', true],
              ['Marca', 'marca', true],
              ['unidad', 'unidad', true],
              ['precio público con IVA', 'precio + precio_publico_con_iva', true],
              ['Descripción Familia', 'categoria_nombre', true],
              ['precio mayoreo con IVA', 'precio_mayoreo_con_iva', false],
              ['precio distribuidor con IVA', 'precio_distribuidor_con_iva', false],
              ['precio mínimo de venta', 'precio_minimo', false],
              ['código', 'codigo_interno', false],
              ['ean', 'ean', false],
              ['margen de mercado', 'margen', false],
              ['caja / master', 'caja / master', false],
              ['Codigo SAT', 'codigo_sat + descripcion_sat', false],
              ['Peso[Kg] / Volumen[cm3]', 'peso_kg / volumen_cm3', false],
            ].map(([csv, col, publico]) => (
              <tr key={String(col)}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{String(csv)}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{String(col)}</td>
                <td>
                  {publico ? (
                    <span className={`${styles.estadoBadge} ${styles.estadoActivo}`}>Sí</span>
                  ) : (
                    <span className={`${styles.estadoBadge} ${styles.estadoInactivo}`}>Solo admin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Botón de importación ── */}
      <button
        className={styles.btnPrimary}
        onClick={iniciar}
        disabled={estado === 'importando'}
        style={{ fontSize: '1rem', padding: '14px 32px' }}
      >
        {estado === 'importando' ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" /> Importando… esto puede tardar hasta 60 s
          </>
        ) : (
          <>
            <i className="fa-solid fa-file-arrow-up" /> Importar catálogo completo
          </>
        )}
      </button>

      {/* ── Resultado ── */}
      {estado === 'ok' && resultado && (
        <div className={styles.mensajeOk} style={{ marginTop: 24 }}>
          <strong>
            <i className="fa-solid fa-circle-check" /> Importación completada
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

      {estado === 'error' && (
        <div className={styles.mensajeError} style={{ marginTop: 24 }}>
          <i className="fa-solid fa-triangle-exclamation" /> {mensajeError}
        </div>
      )}
    </>
  );
}
