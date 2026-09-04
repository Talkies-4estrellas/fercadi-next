'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

function urlProducto(c: { seccion: string | null; categoria_slug: string | null; producto_slug: string | null }) {
  if (!c.seccion || !c.categoria_slug || !c.producto_slug) return null;
  return `/${c.seccion}/${c.categoria_slug}/${c.producto_slug}`;
}

interface Comentario {
  id: number;
  producto_id: number;
  nombre: string;
  comentario: string;
  calificacion: number;
  aprobado: boolean;
  creado_en: string;
  producto_nombre: string | null;
  producto_slug: string | null;
  categoria_slug: string | null;
  seccion: string | null;
}

function Estrellas({ valor }: { valor: number }) {
  return (
    <span style={{ color: '#f5a623', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
      {[1,2,3,4,5].map((n) => (
        <i key={n} className={n <= valor ? 'fa-solid fa-star' : 'fa-regular fa-star'} />
      ))}
    </span>
  );
}

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

const LIMIT = 30;
type Filtro = 'todos' | 'aprobados' | 'pendientes';

export default function AdminComentariosPage() {
  const { user } = useAuth();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [page,        setPage]        = useState(1);
  const [filtro,      setFiltro]      = useState<Filtro>('todos');
  const [q,           setQ]           = useState('');
  const [qActivo,     setQActivo]     = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const cargar = useCallback((p: number, f: Filtro, busq: string) => {
    if (!user) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (f === 'aprobados')  params.set('aprobado', 'true');
    if (f === 'pendientes') params.set('aprobado', 'false');
    if (busq) params.set('q', busq);

    fetch(`/api/admin/comentarios?${params}`, {
      headers: { 'x-usuario-id': String(user.id) },
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setComentarios(d.comentarios ?? []);
          setTotal(d.total ?? 0);
          setPages(d.pages ?? 1);
        }
      })
      .catch((e) => { if (e?.name !== 'AbortError') setComentarios([]); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
  }, [user]);

  useEffect(() => { cargar(page, filtro, qActivo); }, [user, page, filtro]); // eslint-disable-line

  const handleBuscar = () => { setQActivo(q); setPage(1); cargar(1, filtro, q); };

  const toggleAprobado = async (c: Comentario) => {
    if (!user) return;
    const res = await fetch(`/api/admin/comentarios/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
      body: JSON.stringify({ aprobado: !c.aprobado }),
    });
    if (res.ok) cargar(page, filtro, qActivo);
    else alert('Error al cambiar estado del comentario.');
  };

  const eliminar = async (c: Comentario) => {
    if (!user) return;
    if (!confirm(`¿Eliminar el comentario de "${c.nombre}"?\nEsta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/comentarios/${c.id}`, {
      method: 'DELETE',
      headers: { 'x-usuario-id': String(user.id) },
    });
    if (res.ok) cargar(page, filtro, qActivo);
    else alert('Error al eliminar el comentario.');
  };

  const inicio = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const fin    = Math.min(page * LIMIT, total);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <i className="fa-solid fa-comments" /> Comentarios
        </h1>
        <span className={styles.totalChip}>{total} comentarios</span>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {(['todos', 'aprobados', 'pendientes'] as Filtro[]).map((f) => (
          <button
            key={f}
            className={filtro === f ? styles.btnPrimary : styles.btnSecondary}
            style={{ padding: '7px 16px', fontSize: '0.87rem' }}
            onClick={() => { setFiltro(f); setPage(1); cargar(1, f, qActivo); }}
          >
            {f === 'todos' ? 'Todos' : f === 'aprobados' ? 'Visibles' : 'Ocultos'}
          </button>
        ))}

        <div className={styles.filtroBuscar} style={{ marginLeft: 'auto' }}>
          <input
            className={styles.filtroInput}
            placeholder="Buscar por nombre o texto…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          />
          <button className={styles.btnSecondary} onClick={handleBuscar}>
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className={styles.emptyText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando…
        </div>
      ) : comentarios.length === 0 ? (
        <div className={styles.emptyText}>
          <i className="fa-solid fa-comment-slash" aria-hidden="true" style={{ fontSize: '2rem', opacity: 0.3, display: 'block', marginBottom: 8 }} />
          No hay comentarios con estos filtros.
        </div>
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Usuario</th>
                <th style={{ textAlign: 'center' }}>Cal.</th>
                <th>Comentario</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th>Fecha</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.map((c) => (
                <tr key={c.id} style={{ opacity: c.aprobado ? 1 : 0.6 }}>
                  <td style={{ maxWidth: 160 }}>
                    <span className={styles.productoNombre}>{c.producto_nombre ?? `#${c.producto_id}`}</span>
                    {c.seccion && (
                      <span className={styles.productoSlug}>{c.seccion}</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.nombre}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Estrellas valor={c.calificacion} />
                  </td>
                  <td style={{ maxWidth: 340 }}>
                    <p style={{
                      margin: 0, fontSize: '0.87rem', lineHeight: 1.45,
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {c.comentario}
                    </p>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.estadoBadge} ${c.aprobado ? styles.estadoActivo : styles.estadoInactivo}`}>
                      {c.aprobado ? 'Visible' : 'Oculto'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: '#6b7280' }}>
                    {formatFecha(c.creado_en)}
                  </td>
                  <td className={styles.accionesCol}>
                    {urlProducto(c) && (
                      <Link
                        href={urlProducto(c)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnIcono}
                        title="Ver producto"
                        style={{ color: '#6366f1' }}
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      </Link>
                    )}
                    <button
                      className={styles.btnIcono}
                      title={c.aprobado ? 'Ocultar comentario' : 'Hacer visible'}
                      onClick={() => toggleAprobado(c)}
                      style={{ color: c.aprobado ? '#d97706' : '#059669' }}
                    >
                      <i className={c.aprobado ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} aria-hidden="true" />
                    </button>
                    <button
                      className={styles.btnIconoDanger}
                      title="Eliminar comentario"
                      onClick={() => eliminar(c)}
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {pages > 1 && (
        <div className={styles.paginador}>
          <span className={styles.paginadorInfo}>{inicio}–{fin} de {total}</span>
          <div className={styles.paginadorBtns}>
            <button className={styles.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹ Anterior
            </button>
            <span className={styles.paginadorPagina}>Pág. {page} / {pages}</span>
            <button className={styles.btnSecondary} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
