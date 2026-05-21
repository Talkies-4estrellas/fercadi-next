'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function AdminProductosPage() {
  const { user } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [seccion,   setSeccion]   = useState('');
  const [qInput,    setQInput]    = useState('');   // valor del input (sin confirmar)
  const [qActivo,   setQActivo]   = useState('');   // término aplicado al último fetch
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  // ── Función central de carga ─────────────────────────────────
  const cargar = useCallback((p: number, sec: string, busq: string) => {
    if (!user) return;

    // Cancelar fetch previo si todavía estaba en vuelo
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const params = new URLSearchParams();
    if (sec)  params.set('seccion', sec);
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

  // Carga inicial y cuando cambia sección o página
  useEffect(() => {
    cargar(page, seccion, qActivo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, seccion]);

  // Cambiar sección → reiniciar a página 1 y limpiar búsqueda
  const handleSeccion = (val: string) => {
    setSeccion(val);
    setPage(1);
    setQInput('');
    setQActivo('');
  };

  // Buscar (Enter o botón) → reinicia a página 1
  const handleBuscar = () => {
    setQActivo(qInput);
    setPage(1);
    cargar(1, seccion, qInput);
  };

  // Desactivar producto (soft delete)
  const eliminar = async (id: number, nombre: string) => {
    if (!user) return;
    if (!confirm(`¿Desactivar "${nombre}"?\nEl producto se marcará como inactivo (no se borra del histórico).`)) return;
    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'DELETE',
      headers: { 'x-usuario-id': String(user.id) },
    });
    if (res.ok) {
      cargar(page, seccion, qActivo);
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

        <div className={styles.filtroBuscar}>
          <input
            type="text"
            placeholder="Nombre, slug o código interno…"
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
                            <Image src={img} alt={p.nombre} fill sizes="48px" style={{ objectFit: 'cover' }} />
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
                          onClick={() => eliminar(p.id, p.nombre)}
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
    </>
  );
}
