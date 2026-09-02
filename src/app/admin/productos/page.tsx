'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { resolverImagenProducto } from '@/lib/imagen';
import styles from '@/styles/admin.module.css';

interface Producto {
  id: number;
  nombre: string;
  slug: string;
  imagen_url?: string | null;
  seccion: string;
  categoria_nombre: string;
  precio: number;
  activo: number;
  codigo_interno?: string | null;
}

const SECCIONES = [
  { value: '',            label: 'Todas'       },
  { value: 'concretos',   label: 'Concretos'   },
  { value: 'textucos',    label: 'Acabados'    },
  { value: 'materiales',  label: 'Materiales'  },
  { value: 'ferreteria',  label: 'Ferretería'  },
];

const LIMIT = 50;

interface CategoriaOpc { slug: string; nombre: string; }

export default function AdminProductosPage() {
  const { user } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [seccion,   setSeccion]   = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<CategoriaOpc[]>([]);
  const [qInput,    setQInput]    = useState('');   // valor del input (sin confirmar)
  const [qActivo,   setQActivo]   = useState('');   // término aplicado al último fetch
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const abortRef    = useRef<AbortController | null>(null);
  const sugAbortRef = useRef<AbortController | null>(null);
  const sugWrapRef  = useRef<HTMLDivElement>(null);

  const [sugerencias,  setSugerencias]  = useState<Producto[]>([]);
  const [showSug,      setShowSug]      = useState(false);
  const [loadingSug,   setLoadingSug]   = useState(false);

  // ── Modal de confirmación de desactivar ─────────────────────────
  const [modal, setModal] = useState<{ abierto: boolean; id: number; nombre: string }>({
    abierto: false, id: 0, nombre: '',
  });

  // Carga categorías cuando cambia la sección
  useEffect(() => {
    if (!user || !seccion) { setCategorias([]); return; }
    fetch(`/api/admin/categorias?seccion=${seccion}`, { headers: { 'x-usuario-id': String(user.id) } })
      .then((r) => r.json())
      .then((d) => setCategorias(d.ok ? d.categorias : []))
      .catch(() => setCategorias([]));
  }, [user, seccion]);

  // ── Función central de carga ─────────────────────────────────
  const cargar = useCallback((p: number, sec: string, busq: string, cat: string) => {
    if (!user) return;

    // Cancelar fetch previo si todavía estaba en vuelo
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const params = new URLSearchParams();
    if (sec)  params.set('seccion', sec);
    if (cat)  params.set('categoria', cat);
    if (busq) params.set('q', busq);
    params.set('page',  String(p));
    params.set('limit', String(LIMIT));

    fetch(`/api/admin/productos?${params}`, {
      headers: { 'x-usuario-id': String(user.id) },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setProductos(data.productos ?? []);
          setTotal(data.total  ?? 0);
          setPages(data.pages  ?? 1);
        } else {
          setProductos([]); setTotal(0); setPages(1);
        }
      })
      .catch((e) => { if (e?.name !== 'AbortError') { setProductos([]); setTotal(0); setPages(1); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [user]);

  // Carga inicial y cuando cambia sección, categoría o página
  useEffect(() => {
    cargar(page, seccion, qActivo, categoria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, seccion, categoria]);

  // ── Sugerencias flotantes (debounce 300ms) ───────────────────
  useEffect(() => {
    if (qInput.trim().length < 2) { setSugerencias([]); setShowSug(false); return; }

    const timer = setTimeout(() => {
      if (!user) return;
      sugAbortRef.current?.abort();
      const ctrl = new AbortController();
      sugAbortRef.current = ctrl;
      setLoadingSug(true);

      const p = new URLSearchParams({ q: qInput.trim(), limit: '6' });
      if (seccion) p.set('seccion', seccion);

      fetch(`/api/admin/productos?${p}`, {
        headers: { 'x-usuario-id': String(user.id) },
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((data) => { if (data.ok) { setSugerencias(data.productos ?? []); setShowSug(true); } })
        .catch((e) => { if (e?.name !== 'AbortError') setSugerencias([]); })
        .finally(() => { if (!ctrl.signal.aborted) setLoadingSug(false); });
    }, 300);

    return () => clearTimeout(timer);
  }, [qInput, seccion, user]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sugWrapRef.current && !sugWrapRef.current.contains(e.target as Node)) {
        setShowSug(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cambiar sección → reiniciar a página 1 y limpiar búsqueda y categoría
  const handleSeccion = (val: string) => {
    setSeccion(val);
    setCategoria('');
    setPage(1);
    setQInput('');
    setQActivo('');
    setShowSug(false);
  };

  // Buscar (Enter o botón) → reinicia a página 1
  const handleBuscar = () => {
    setQActivo(qInput);
    setPage(1);
    setShowSug(false);
    cargar(1, seccion, qInput, categoria);
  };

  // Desactivar producto (soft delete)
  const confirmarEliminar = (id: number, nombre: string) => {
    setModal({ abierto: true, id, nombre });
  };

  const ejecutarEliminar = async () => {
    if (!user) return;
    const { id } = modal;
    setModal((m) => ({ ...m, abierto: false }));
    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'DELETE',
      headers: { 'x-usuario-id': String(user.id) },
    });
    if (res.ok) {
      // Quitar de la lista local inmediatamente
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Error: ' + (err.message ?? 'no se pudo eliminar'));
    }
  };

  const inicio = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const fin    = Math.min(page * LIMIT, total);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Productos</h1>
        <Link href="/admin/productos/nuevo" className={styles.btnPrimary}>
          <i className="fa-solid fa-plus" /> Nuevo
        </Link>
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filtros}>
        <select
          value={seccion}
          onChange={(e) => handleSeccion(e.target.value)}
          className={styles.filtroSelect}
        >
          {SECCIONES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {seccion && categorias.length > 0 && (
          <select
            value={categoria}
            onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
            className={styles.filtroSelect}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nombre}</option>
            ))}
          </select>
        )}

        <div className={styles.filtroBuscar} ref={sugWrapRef}>
          <input
            type="text"
            placeholder="Nombre, slug o código interno…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); if (e.key === 'Escape') setShowSug(false); }}
            onFocus={() => { if (sugerencias.length > 0) setShowSug(true); }}
            className={styles.filtroInput}
            autoComplete="off"
          />
          <button onClick={handleBuscar} className={styles.btnSecondary}>
            {loadingSug
              ? <i className="fa-solid fa-spinner fa-spin" />
              : <i className="fa-solid fa-magnifying-glass" />}
          </button>

          {/* Dropdown sugerencias — solo desktop vía CSS */}
          {showSug && sugerencias.length > 0 && (
            <div className={styles.sugDropdown}>
              {sugerencias.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/productos/${p.id}`}
                  className={styles.sugItem}
                  onClick={() => setShowSug(false)}
                >
                  <span className={styles.sugNombre}>{p.nombre}</span>
                  <span className={styles.sugMeta}>{p.categoria_nombre} · {p.seccion}</span>
                </Link>
              ))}
              <button
                className={styles.sugVerTodos}
                onClick={handleBuscar}
              >
                Ver todos los resultados para &ldquo;{qInput}&rdquo;
              </button>
            </div>
          )}
        </div>

        {!loading && total > 0 && (
          <span className={styles.totalChip}>
            {total.toLocaleString('es-MX')} productos
          </span>
        )}
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando…
        </p>
      ) : productos.length === 0 ? (
        <p className={styles.emptyText}>
          <i className="fa-solid fa-inbox" /> Sin productos con los filtros actuales.
        </p>
      ) : (
        <>
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th></th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Sección</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const img = resolverImagenProducto(p.imagen_url ?? undefined);
                  return (
                    <tr key={p.id}>
                      <td>
                        {img ? (
                          <div className={styles.thumb}>
                            <img src={img} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div className={styles.thumbPlaceholder}>
                            <i className="fa-regular fa-image" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.productoNombre}>{p.nombre}</div>
                        <div className={styles.productoSlug}>{p.slug}</div>
                        {p.codigo_interno && (
                          <div className={styles.productoSlug} style={{ opacity: 0.55, fontSize: '0.72rem' }}>
                            #{p.codigo_interno}
                          </div>
                        )}
                      </td>
                      <td>{p.categoria_nombre}</td>
                      <td><span className={styles.seccionChip}>{p.seccion}</span></td>
                      <td>${Number(p.precio ?? 0).toFixed(2)}</td>
                      <td>
                        {p.activo
                          ? <span className={`${styles.estadoBadge} ${styles.estadoActivo}`}>Activo</span>
                          : <span className={`${styles.estadoBadge} ${styles.estadoInactivo}`}>Inactivo</span>
                        }
                      </td>
                      <td className={styles.accionesCol}>
                        <Link href={`/admin/productos/${p.id}`} className={styles.btnIcono} title="Editar">
                          <i className="fa-solid fa-pen" />
                        </Link>
                        <button
                          onClick={() => confirmarEliminar(p.id, p.nombre)}
                          className={`${styles.btnIcono} ${styles.btnIconoDanger}`}
                          title="Desactivar"
                        >
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Paginador ── */}
          {pages > 1 && (
            <div className={styles.paginador}>
              <span className={styles.paginadorInfo}>
                {inicio.toLocaleString('es-MX')}–{fin.toLocaleString('es-MX')} de {total.toLocaleString('es-MX')}
              </span>

              <div className={styles.paginadorBtns}>
                <button className={styles.btnSecondary} disabled={page === 1}     onClick={() => setPage(1)}           title="Primera">
                  <i className="fa-solid fa-angles-left" />
                </button>
                <button className={styles.btnSecondary} disabled={page === 1}     onClick={() => setPage(p => p - 1)} title="Anterior">
                  <i className="fa-solid fa-angle-left" />
                </button>

                <span className={styles.paginadorPagina}>Pág. {page} / {pages}</span>

                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(p => p + 1)} title="Siguiente">
                  <i className="fa-solid fa-angle-right" />
                </button>
                <button className={styles.btnSecondary} disabled={page === pages} onClick={() => setPage(pages)}      title="Última">
                  <i className="fa-solid fa-angles-right" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal de confirmación ── */}
      {modal.abierto && (
        <div className={styles.modalOverlay} onClick={() => setModal((m) => ({ ...m, abierto: false }))}>
          <div className={styles.modal} style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><i className="fa-solid fa-triangle-exclamation" style={{ color: '#e74c3c', marginRight: 8 }} />Desactivar producto</h3>
              <button className={styles.modalClose} onClick={() => setModal((m) => ({ ...m, abierto: false }))}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ marginBottom: 8 }}>
                ¿Desactivar <strong>&ldquo;{modal.nombre}&rdquo;</strong>?
              </p>
              <p style={{ fontSize: '0.85rem', opacity: 0.65 }}>
                El producto se marcará como inactivo. No se borra del histórico de pedidos.
              </p>
            </div>
            <div style={{ padding: '0 24px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className={styles.btnSecondary}
                onClick={() => setModal((m) => ({ ...m, abierto: false }))}
              >
                Cancelar
              </button>
              <button
                className={styles.btnPrimary}
                style={{ background: '#e74c3c', borderColor: '#e74c3c' }}
                onClick={ejecutarEliminar}
              >
                <i className="fa-solid fa-trash-can" /> Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
