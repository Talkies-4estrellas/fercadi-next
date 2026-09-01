'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';
import catStyles from '@/styles/categorias.module.css';

type Seccion = 'textucos' | 'concretos' | 'ferreteria';

interface Categoria {
  id?: number;
  slug: string;
  nombre: string;
  descripcion?: string;
  orden?: number;
}

const SECCIONES: { key: Seccion; label: string }[] = [
  { key: 'textucos',   label: 'Acabados'    },
  { key: 'concretos',  label: 'Concretos'   },
  { key: 'ferreteria', label: 'Ferretería'  },
];

const autoSlug = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export default function CategoriasPage() {
  const { user } = useAuth();
  const [seccion, setSeccion] = useState<Seccion>('textucos');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState<{ modo: 'crear' | 'editar'; cat?: Categoria } | null>(null);
  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '' });
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

  const cambiarSeccion = (s: Seccion) => {
    setSeccion(s);
  };

  const abrirCrear = () => {
    setForm({ nombre: '', slug: '', descripcion: '' });
    setModal({ modo: 'crear' });
  };

  const abrirEditar = (cat: Categoria) => {
    setForm({ nombre: cat.nombre, slug: cat.slug, descripcion: cat.descripcion ?? '' });
    setModal({ modo: 'editar', cat });
  };

  const guardar = async () => {
    if (!user || !form.nombre.trim() || !form.slug.trim()) return;
    setGuardando(true);
    try {
      const isEdit = modal?.modo === 'editar';
      const body = isEdit
        ? { ...form, seccion, slug_original: modal?.cat?.slug }
        : { ...form, seccion };

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
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
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

  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= categorias.length) return;
    const nueva = [...categorias];
    [nueva[i], nueva[j]] = [nueva[j], nueva[i]];
    setCategorias(nueva);
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-layer-group" style={{ marginRight: 10 }} />
            Categorías
          </h1>
          <p className={styles.pageSubtitle}>
            Gestiona las categorías del catálogo de productos por sección.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={abrirCrear}>
          <i className="fa-solid fa-plus" /> Nueva categoría
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
            onClick={() => cambiarSeccion(s.key)}
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
      ) : (
        <div className={catStyles.lista}>
          {categorias.map((cat, i) => (
            <div key={cat.slug} className={catStyles.fila}>
              <div className={catStyles.filaOrden}>
                <button
                  className={catStyles.ordenBtn}
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                >
                  <i className="fa-solid fa-chevron-up" />
                </button>
                <button
                  className={catStyles.ordenBtn}
                  onClick={() => mover(i, 1)}
                  disabled={i === categorias.length - 1}
                  aria-label="Bajar"
                >
                  <i className="fa-solid fa-chevron-down" />
                </button>
              </div>
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
                  placeholder="ej. Adhesivos"
                  autoFocus
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Slug{' '}
                  <span className={styles.formHint}>(sin espacios · forma la URL)</span>
                </label>
                <input
                  className={styles.formInput}
                  style={{ fontFamily: 'monospace' }}
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="ej. adhesivos"
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Descripción{' '}
                  <span className={styles.formHint}>(opcional)</span>
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
