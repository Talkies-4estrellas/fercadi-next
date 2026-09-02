'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';
import catStyles from '@/styles/categorias.module.css';

type Seccion = 'textucos' | 'concretos' | 'ferreteria' | 'materiales';

interface Categoria {
  id: number;
  slug: string;
  nombre: string;
  descripcion?: string;
  orden?: number;
  parent_id: number | null;
}

interface Grupo extends Categoria {
  hijos: Categoria[];
}

const SECCIONES: { key: Seccion; label: string }[] = [
  { key: 'textucos',   label: 'Acabados'   },
  { key: 'concretos',  label: 'Concretos'  },
  { key: 'ferreteria', label: 'Ferretería' },
  { key: 'materiales', label: 'Materiales' },
];

const autoSlug = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

function buildTree(cats: Categoria[]): { grupos: Grupo[]; huerfanos: Categoria[] } {
  const padres = cats.filter((c) => c.parent_id === null);
  const hijos  = cats.filter((c) => c.parent_id !== null);

  const grupos: Grupo[] = padres.map((p) => ({
    ...p,
    hijos: hijos.filter((h) => h.parent_id === p.id),
  }));

  // Categorías huérfanas: tienen parent_id pero el padre no está en la lista
  const padreIds = new Set(padres.map((p) => p.id));
  const huerfanos = hijos.filter((h) => !padreIds.has(h.parent_id!));

  return { grupos, huerfanos };
}

export default function CategoriasPage() {
  const { user } = useAuth();
  const [seccion, setSeccion] = useState<Seccion>('textucos');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(false);
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set());
  const [pagina, setPagina] = useState(0);
  const [modal, setModal] = useState<{ modo: 'crear' | 'editar'; cat?: Categoria } | null>(null);
  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '', parent_id: '' });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'ok' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  };

  const cargar = useCallback(async (s: Seccion) => {
    if (!user) return;
    setCargando(true);
    try {
      const r = await fetch(`/api/admin/categorias?seccion=${s}`, {
        headers: { 'x-usuario-id': String(user.id) },
      });
      const d = await r.json();
      setCategorias(d.ok ? d.categorias : []);
    } catch {
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) cargar(seccion);
  }, [cargar, seccion, user]);

  const toggleGrupo = (id: number) =>
    setAbiertos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const abrirCrear = (parentId?: number) => {
    setForm({ nombre: '', slug: '', descripcion: '', parent_id: parentId ? String(parentId) : '' });
    setModal({ modo: 'crear' });
  };

  const abrirEditar = (cat: Categoria) => {
    setForm({
      nombre: cat.nombre,
      slug: cat.slug,
      descripcion: cat.descripcion ?? '',
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
    });
    setModal({ modo: 'editar', cat });
  };

  const guardar = async () => {
    if (!user || !form.nombre.trim() || !form.slug.trim()) return;
    setGuardando(true);
    try {
      const isEdit = modal?.modo === 'editar';
      const parentIdVal = form.parent_id ? Number(form.parent_id) : null;
      const body = isEdit
        ? { nombre: form.nombre, slug: form.slug, descripcion: form.descripcion, parent_id: parentIdVal, seccion, slug_original: modal?.cat?.slug }
        : { nombre: form.nombre, slug: form.slug, descripcion: form.descripcion, parent_id: parentIdVal, seccion };

      const r = await fetch('/api/admin/categorias', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        setModal(null);
        mostrarMensaje('ok', isEdit ? 'Categoría actualizada' : 'Categoría creada');
        await cargar(seccion);
      } else {
        mostrarMensaje('error', d.message ?? 'Error al guardar');
      }
    } catch {
      mostrarMensaje('error', 'Error de red');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (cat: Categoria) => {
    if (!user) return;
    if (!confirm(`¿Eliminar "${cat.nombre}"?\nEsta acción no se puede deshacer.`)) return;
    try {
      const r = await fetch('/api/admin/categorias', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-usuario-id': String(user.id) },
        body: JSON.stringify({ slug: cat.slug, seccion }),
      });
      const d = await r.json();
      if (d.ok) {
        mostrarMensaje('ok', 'Categoría eliminada');
        await cargar(seccion);
      } else {
        mostrarMensaje('error', d.message ?? 'Error al eliminar');
      }
    } catch {
      mostrarMensaje('error', 'Error de red');
    }
  };

  const { grupos, huerfanos } = buildTree(categorias);
  const padres = categorias.filter((c) => c.parent_id === null);
  const esArbol = seccion === 'ferreteria';

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-layer-group" style={{ marginRight: 10 }} />
            Categorías
          </h1>
          <p className={styles.pageSubtitle}>
            {esArbol
              ? 'Vista de árbol: grupos padre y sus subcategorías.'
              : 'Gestiona las categorías del catálogo por sección.'}
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => abrirCrear()}>
          <i className="fa-solid fa-plus" />
          {esArbol ? ' Nuevo grupo' : ' Nueva categoría'}
        </button>
      </div>

      {mensaje && (
        <div
          className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}
          style={{ marginBottom: 20 }}
        >
          <i className={`fa-solid ${mensaje.tipo === 'ok' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} />
          {' '}{mensaje.texto}
        </div>
      )}

      <div className={catStyles.tabs}>
        {SECCIONES.map((s) => (
          <button
            key={s.key}
            className={`${catStyles.tab} ${seccion === s.key ? catStyles.tabActive : ''}`}
            onClick={() => { setSeccion(s.key); setPagina(0); setAbiertos(new Set()); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando…
        </p>
      ) : categorias.length === 0 ? (
        <p className={styles.emptyText}>
          <i className="fa-solid fa-inbox" /> Sin categorías en esta sección
        </p>
      ) : esArbol ? (
        /* ── Vista árbol para Ferretería ── */
        <div className={catStyles.arbol}>
          {(() => {
            const POR_PAGINA = 10;
            const totalPaginas = Math.ceil(grupos.length / POR_PAGINA);
            const gruposPagina = grupos.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);
            return (
              <>
                {gruposPagina.map((grupo) => {
            const abierto = abiertos.has(grupo.id);
            return (
              <div key={grupo.slug} className={catStyles.grupoCard}>
                {/* Cabecera del grupo padre */}
                <div className={catStyles.grupoHeader}>
                  <button
                    className={catStyles.grupoToggle}
                    onClick={() => toggleGrupo(grupo.id)}
                    aria-expanded={abierto}
                  >
                    <i className={`fa-solid fa-chevron-right ${catStyles.grupoChevron} ${abierto ? catStyles.grupoChevronOpen : ''}`} />
                  </button>
                  <div className={catStyles.grupoInfo}>
                    <span className={catStyles.grupoNombre}>{grupo.nombre}</span>
                    <span className={catStyles.grupoMeta}>
                      /{grupo.slug} · {grupo.hijos.length} subcategorías
                    </span>
                  </div>
                  <div className={catStyles.grupoAcciones}>
                    <button
                      className={catStyles.btnAgregar}
                      onClick={() => { toggleGrupo(grupo.id); abrirCrear(grupo.id); }}
                      title="Agregar subcategoría"
                    >
                      <i className="fa-solid fa-plus" /> Agregar
                    </button>
                    <button
                      className={styles.btnIcono}
                      onClick={() => abrirEditar(grupo)}
                      aria-label={`Editar ${grupo.nombre}`}
                    >
                      <i className="fa-solid fa-pen-to-square" />
                    </button>
                    <button
                      className={`${styles.btnIcono} ${styles.btnIconoDanger}`}
                      onClick={() => eliminar(grupo)}
                      aria-label={`Eliminar ${grupo.nombre}`}
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>

                {/* Subcategorías hijas */}
                {abierto && (
                  <div className={catStyles.grupoHijos}>
                    {grupo.hijos.length === 0 ? (
                      <div className={catStyles.hijoVacio}>
                        <i className="fa-solid fa-inbox" /> Sin subcategorías —{' '}
                        <button
                          className={catStyles.linkBtn}
                          onClick={() => abrirCrear(grupo.id)}
                        >
                          agregar una
                        </button>
                      </div>
                    ) : (
                      grupo.hijos.map((hijo) => (
                        <div key={hijo.slug} className={catStyles.hijoFila}>
                          <div className={catStyles.hijoInfo}>
                            <span className={catStyles.hijoNombre}>{hijo.nombre}</span>
                            <span className={catStyles.hijoSlug}>/{hijo.slug}</span>
                          </div>
                          <div className={catStyles.filaAcciones}>
                            <button
                              className={styles.btnIcono}
                              onClick={() => abrirEditar(hijo)}
                              aria-label={`Editar ${hijo.nombre}`}
                            >
                              <i className="fa-solid fa-pen-to-square" />
                            </button>
                            <button
                              className={`${styles.btnIcono} ${styles.btnIconoDanger}`}
                              onClick={() => eliminar(hijo)}
                              aria-label={`Eliminar ${hijo.nombre}`}
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
                })}

                {totalPaginas > 1 && (
                  <div className={catStyles.paginacion}>
                    <button
                      className={catStyles.paginacionBtn}
                      disabled={pagina === 0}
                      onClick={() => setPagina((p) => p - 1)}
                    >
                      <i className="fa-solid fa-chevron-left" /> Anterior
                    </button>
                    <span className={catStyles.paginacionInfo}>
                      {pagina * POR_PAGINA + 1}–{Math.min((pagina + 1) * POR_PAGINA, grupos.length)} de {grupos.length} grupos
                    </span>
                    <button
                      className={catStyles.paginacionBtn}
                      disabled={pagina >= totalPaginas - 1}
                      onClick={() => setPagina((p) => p + 1)}
                    >
                      Siguiente <i className="fa-solid fa-chevron-right" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}

          {/* Categorías sin grupo asignado */}
          {huerfanos.length > 0 && (
            <div className={catStyles.grupoCard}>
              <div className={catStyles.grupoHeader} style={{ background: 'rgba(239,68,68,0.06)' }}>
                <div className={catStyles.grupoInfo}>
                  <span className={catStyles.grupoNombre} style={{ color: '#b91c1c' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                    Sin grupo asignado ({huerfanos.length})
                  </span>
                  <span className={catStyles.grupoMeta}>Estas categorías no tienen grupo padre</span>
                </div>
              </div>
              <div className={catStyles.grupoHijos}>
                {huerfanos.map((h) => (
                  <div key={h.slug} className={catStyles.hijoFila}>
                    <div className={catStyles.hijoInfo}>
                      <span className={catStyles.hijoNombre}>{h.nombre}</span>
                      <span className={catStyles.hijoSlug}>/{h.slug}</span>
                    </div>
                    <div className={catStyles.filaAcciones}>
                      <button className={styles.btnIcono} onClick={() => abrirEditar(h)}>
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                      <button
                        className={`${styles.btnIcono} ${styles.btnIconoDanger}`}
                        onClick={() => eliminar(h)}
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Vista plana para Acabados / Concretos ── */
        <div className={catStyles.lista}>
          {categorias.map((cat) => (
            <div key={cat.slug} className={catStyles.fila}>
              <div className={catStyles.filaInfo}>
                <span className={catStyles.nombre}>{cat.nombre}</span>
                <span className={catStyles.slug}>/{cat.slug}</span>
              </div>
              <div className={catStyles.filaAcciones}>
                <button
                  className={styles.btnIcono}
                  onClick={() => abrirEditar(cat)}
                  aria-label={`Editar ${cat.nombre}`}
                >
                  <i className="fa-solid fa-pen-to-square" />
                </button>
                <button
                  className={`${styles.btnIcono} ${styles.btnIconoDanger}`}
                  onClick={() => eliminar(cat)}
                  aria-label={`Eliminar ${cat.nombre}`}
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal crear / editar ── */}
      {modal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !guardando && setModal(null)}
        >
          <div
            className={styles.modal}
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                <i
                  className={`fa-solid ${modal.modo === 'crear' ? 'fa-plus' : 'fa-pen-to-square'}`}
                  style={{ marginRight: 8 }}
                />
                {modal.modo === 'crear' ? 'Nueva categoría' : 'Editar categoría'}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setModal(null)}
                disabled={guardando}
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Nombre visible</label>
                <input
                  className={styles.formInput}
                  value={form.nombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f,
                      nombre: v,
                      slug: modal.modo === 'crear' ? autoSlug(v) : f.slug,
                    }));
                  }}
                  placeholder="ej. Herramientas manuales"
                  autoFocus
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Slug <span className={styles.formHint}>(sin espacios · forma la URL)</span>
                </label>
                <input
                  className={styles.formInput}
                  style={{ fontFamily: 'monospace' }}
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="ej. herramientas-manuales"
                />
              </div>
              {esArbol && (
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>
                    Grupo padre <span className={styles.formHint}>(vacío = es un grupo padre)</span>
                  </label>
                  <select
                    className={styles.formInput}
                    value={form.parent_id}
                    onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                  >
                    <option value="">— Sin grupo (es un grupo padre) —</option>
                    {padres
                      .filter((p) => p.id !== modal.cat?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                  </select>
                </div>
              )}
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Descripción <span className={styles.formHint}>(opcional)</span>
                </label>
                <textarea
                  className={styles.formInput}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Subtítulo en la página de la categoría…"
                  rows={3}
                />
              </div>
            </div>

            <div
              className={styles.formActions}
              style={{ padding: '0 24px 24px', marginTop: 0, borderTop: 'none' }}
            >
              <button
                className={styles.btnSecondary}
                onClick={() => setModal(null)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={guardar}
                disabled={guardando || !form.nombre.trim() || !form.slug.trim()}
              >
                {guardando ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
                ) : (
                  <><i className="fa-solid fa-check" /> Guardar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
