'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Tip {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string | null;
  activo: number;
  created_at: string;
}

export default function AdminTipsPage() {
  const { user } = useAuth();

  const [tips,    setTips]    = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [qInput,  setQInput]  = useState('');
  const [qActivo, setQActivo] = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const abortRef = useRef<AbortController | null>(null);
  const LIMIT = 20;

  const cargar = useCallback((p: number, busq: string) => {
    if (!user) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (busq) params.set('q', busq);

    fetch(`/api/admin/tips?${params}`, {
      headers: { 'x-usuario-id': String(user.id) },
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) { setTips(d.tips ?? []); setTotal(d.total ?? 0); setPages(d.pages ?? 1); }
        else { setTips([]); setTotal(0); setPages(1); }
      })
      .catch((e) => { if (e?.name !== 'AbortError') { setTips([]); setTotal(0); setPages(1); } })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
  }, [user]);

  useEffect(() => { cargar(page, qActivo); }, [user, page]); // eslint-disable-line

  const handleBuscar = () => { setQActivo(qInput); setPage(1); cargar(1, qInput); };

  const eliminar = async (id: number, titulo: string) => {
    if (!user) return;
    if (!confirm(`¿Desactivar "${titulo}"?\nEl tip se ocultará del sitio público.`)) return;
    const res = await fetch(`/api/admin/tips/${id}`, {
      method: 'DELETE',
      headers: { 'x-usuario-id': String(user.id) },
    });
    if (res.ok) cargar(page, qActivo);
    else alert('Error al desactivar el tip.');
  };

  const inicio = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const fin    = Math.min(page * LIMIT, total);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tips y Tutoriales</h1>
        <Link href="/admin/tips/nuevo" className={styles.btnPrimary}>
          <i className="fa-solid fa-plus" /> Nuevo tip
        </Link>
      </div>

      {/* Buscador */}
      <div className={styles.filtros}>
        <div className={styles.filtroBuscar}>
          <input
            type="text"
            placeholder="Buscar por título o descripción…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            className={styles.filtroInput}
          />
          <button onClick={handleBuscar} className={styles.btnSecondary}>
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        </div>
        {!loading && total > 0 && (
          <span className={styles.totalChip}>{total} tips</span>
        )}
      </div>

      {loading ? (
        <p className={styles.loadingText}><i className="fa-solid fa-spinner fa-spin" /> Cargando…</p>
      ) : tips.length === 0 ? (
        <p className={styles.emptyText}><i className="fa-solid fa-inbox" /> Sin tips registrados.</p>
      ) : (
        <>
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Slug</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tips.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.productoNombre}>{t.titulo}</div>
                      {t.descripcion && (
                        <div className={styles.productoSlug} style={{ maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.descripcion}
                        </div>
                      )}
                    </td>
                    <td><span className={styles.productoSlug}>{t.slug}</span></td>
                    <td>
                      {t.activo
                        ? <span className={`${styles.estadoBadge} ${styles.estadoActivo}`}>Activo</span>
                        : <span className={`${styles.estadoBadge} ${styles.estadoInactivo}`}>Inactivo</span>
                      }
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#777' }}>
                      {new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={styles.accionesCol}>
                      <Link href={`/tips/${t.slug}`} className={styles.btnIcono} title="Ver en sitio" target="_blank">
                        <i className="fa-solid fa-eye" />
                      </Link>
                      <Link href={`/admin/tips/${t.id}`} className={styles.btnIcono} title="Editar">
                        <i className="fa-solid fa-pen" />
                      </Link>
                      <button
                        onClick={() => eliminar(t.id, t.titulo)}
                        className={`${styles.btnIcono} ${styles.btnIconoDanger}`}
                        title="Desactivar"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className={styles.paginador}>
              <span className={styles.paginadorInfo}>
                {inicio}–{fin} de {total}
              </span>
              <div className={styles.paginadorBtns}>
                <button className={styles.btnSecondary} disabled={page === 1}     onClick={() => setPage(1)}           title="Primera"><i className="fa-solid fa-angles-left" /></button>
                <button className={styles.btnSecondary} disabled={page === 1}     onClick={() => setPage(p => p - 1)} title="Anterior"><i className="fa-solid fa-angle-left" /></button>
                <span className={styles.paginadorPagina}>Pág. {page} / {pages}</span>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(p => p + 1)} title="Siguiente"><i className="fa-solid fa-angle-right" /></button>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(pages)}      title="Última"><i className="fa-solid fa-angles-right" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
