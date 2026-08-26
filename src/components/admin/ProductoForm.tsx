'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { resolverImagenProducto, construirRutaImagen } from '@/lib/imagen';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from '@/styles/admin.module.css';

export interface ProductoFormData {
  id?: number;
  nombre: string;
  slug: string;
  descripcion: string;
  descripcion2?: string | null;
  imagen_url?: string | null;
  seccion: 'concretos' | 'textucos' | 'materiales' | 'ferreteria';
  categoria_slug: string;
  categoria_nombre: string;
  precio: number;
  activo: boolean;
  // Campos públicos nuevos
  marca?: string | null;
  unidad?: string | null;
  // Campos comerciales (admin-only, importados del CSV)
  codigo_interno?: string | null;
  ean?: string | null;
  margen?: string | null;
  caja?: number | null;
  master?: number | null;
  alta_rotacion?: boolean;
  precio_minimo?: number | null;
  precio_mayoreo_con_iva?: number | null;
  precio_distribuidor_con_iva?: number | null;
  precio_publico_con_iva?: number | null;
  precio_mayoreo_sin_iva?: number | null;
  precio_distribuidor_sin_iva?: number | null;
  precio_publico_sin_iva?: number | null;
  precio_medio_mayoreo_sin_iva?: number | null;
  precio_medio_mayoreo_con_iva?: number | null;
  codigo_sat?: string | null;
  descripcion_sat?: string | null;
  peso_kg?: number | null;
  volumen_cm3?: number | null;
}

interface ImagenItem {
  carpeta: string;
  ruta: string;
  nombre: string;
  fuente?: 'local' | 'supabase';
}

const SECCIONES: ProductoFormData['seccion'][] = ['concretos', 'textucos', 'materiales', 'ferreteria'];

const VACIO: ProductoFormData = {
  nombre: '', slug: '', descripcion: '', descripcion2: '',
  imagen_url: '', seccion: 'concretos',
  categoria_slug: '', categoria_nombre: '',
  precio: 0, activo: true,
  marca: '', unidad: '',
  codigo_interno: '', ean: '', margen: '',
  caja: null, master: null, alta_rotacion: false,
  precio_minimo: null,
  precio_mayoreo_con_iva: null, precio_distribuidor_con_iva: null, precio_publico_con_iva: null,
  precio_mayoreo_sin_iva: null, precio_distribuidor_sin_iva: null, precio_publico_sin_iva: null,
  precio_medio_mayoreo_sin_iva: null, precio_medio_mayoreo_con_iva: null,
  codigo_sat: '', descripcion_sat: '',
  peso_kg: null, volumen_cm3: null,
};

interface Props {
  inicial?: ProductoFormData;
  modo: 'crear' | 'editar';
}

export default function ProductoForm({ inicial, modo }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProductoFormData>(inicial ?? VACIO);
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');
  const [mensaje, setMensaje] = useState<string>('');

  // Selector de imagen
  const [imagenes, setImagenes] = useState<ImagenItem[]>([]);
  const [imagenesLoading, setImagenesLoading] = useState(false);
  const [imagenesAbierto, setImagenesAbierto] = useState(false);
  const [filtroCarpeta, setFiltroCarpeta] = useState<string>('');


  // Auto-generar slug desde el nombre (solo en modo crear).
  useEffect(() => {
    if (modo === 'crear' && form.nombre && !form.slug) {
      setForm((f) => ({
        ...f,
        slug: f.nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-'),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.nombre]);

  const cargarImagenes = () => {
    if (!user) return;
    setImagenesLoading(true);
    fetch('/api/admin/imagenes', {
      headers: { 'x-usuario-id': String(user.id) },
    })
      .then((r) => r.json())
      .then((data) => setImagenes(data.ok ? data.imagenes : []))
      .catch(() => setImagenes([]))
      .finally(() => setImagenesLoading(false));
  };

  const abrirSelectorImagenes = () => {
    setImagenesAbierto(true);
    if (imagenes.length === 0) cargarImagenes();
  };

  const elegirImagen = (ruta: string) => {
    setForm((f) => ({ ...f, imagen_url: ruta }));
    setImagenesAbierto(false);
  };

  const sugerirRutaImagen = () => {
    if (!form.seccion || !form.categoria_slug || !form.slug) return;
    const candidata = construirRutaImagen(form.seccion, form.categoria_slug, `${form.slug}.png`);
    setForm((f) => ({ ...f, imagen_url: candidata }));
  };

  const handleChange = <K extends keyof ProductoFormData>(k: K, v: ProductoFormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const carpetas = Array.from(new Set(imagenes.map((i) => i.carpeta))).sort();
  const imagenesFiltradas = filtroCarpeta
    ? imagenes.filter((i) => i.carpeta === filtroCarpeta)
    : imagenes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setEstado('enviando');
    setMensaje('');

    const url =
      modo === 'crear'
        ? '/api/admin/productos'
        : `/api/admin/productos/${form.id}`;
    const method = modo === 'crear' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-usuario-id': String(user.id),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEstado('ok');
        setMensaje(modo === 'crear' ? 'Producto creado correctamente.' : 'Cambios guardados.');
        setTimeout(() => router.push('/admin/productos'), 800);
      } else {
        setEstado('error');
        setMensaje(data.message ?? 'No se pudo guardar.');
      }
    } catch (err: any) {
      setEstado('error');
      setMensaje(err?.message ?? 'Error de red');
    }
  };

  const imagenPrevia = resolverImagenProducto(form.imagen_url ?? undefined);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formCol}>
          {/* Sección y categoría */}
          <div className={styles.formRow}>
            <label className={styles.formLabel}>Sección *</label>
            <select
              required
              value={form.seccion}
              onChange={(e) => handleChange('seccion', e.target.value as ProductoFormData['seccion'])}
              className={styles.formInput}
            >
              {SECCIONES.map((s) => (
                <option key={s} value={s}>
                  {s === 'concretos' ? 'Concretos' : s === 'textucos' ? 'Acabados (textucos)' : s === 'materiales' ? 'Materiales' : 'Ferretería / Herramientas'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Categoría · slug *</label>
            <input
              required
              type="text"
              value={form.categoria_slug}
              onChange={(e) => handleChange('categoria_slug', e.target.value)}
              placeholder="ej. clase-a, adhesivos, especializados"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Categoría · nombre visible *</label>
            <input
              required
              type="text"
              value={form.categoria_nombre}
              onChange={(e) => handleChange('categoria_nombre', e.target.value)}
              placeholder="ej. Concretos Clase A"
              className={styles.formInput}
            />
          </div>

          {/* Identidad del producto */}
          <div className={styles.formRow}>
            <label className={styles.formLabel}>Nombre del producto *</label>
            <input
              required
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              Slug * <span className={styles.formHint}>(auto desde el nombre)</span>
            </label>
            <input
              required
              type="text"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="ej. fc150"
              className={styles.formInput}
            />
          </div>

          {/* Descripciones */}
          <div className={styles.formRow}>
            <label className={styles.formLabel}>Descripción *</label>
            <textarea
              required
              rows={4}
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              Segunda descripción <span className={styles.formHint}>(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={form.descripcion2 ?? ''}
              onChange={(e) => handleChange('descripcion2', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Precio público (MXN)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={(e) => handleChange('precio', Number(e.target.value))}
              className={styles.formInput}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Marca</label>
              <input
                type="text"
                value={form.marca ?? ''}
                onChange={(e) => handleChange('marca', e.target.value)}
                placeholder="ej. Truper, Expert"
                className={styles.formInput}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Unidad</label>
              <input
                type="text"
                value={form.unidad ?? ''}
                onChange={(e) => handleChange('unidad', e.target.value)}
                placeholder="ej. Pieza, Set, Par"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formCheck}>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => handleChange('activo', e.target.checked)}
              />
              <span>Producto activo (visible en el sitio)</span>
            </label>
          </div>
        </div>

        {/* ── Columna derecha: imagen ── */}
        <div className={styles.formCol}>
          <label className={styles.formLabel}>Imagen del producto</label>
          <div className={styles.imagenPanel}>
            {imagenPrevia ? (
              <div className={styles.imagenPreview}>
                <Image
                  src={imagenPrevia}
                  alt={form.nombre || 'Vista previa'}
                  fill
                  sizes="300px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div className={styles.imagenPlaceholder}>
                <i className="fa-regular fa-image" />
                <span>Sin imagen seleccionada</span>
              </div>
            )}

            <input
              type="text"
              value={form.imagen_url ?? ''}
              onChange={(e) => handleChange('imagen_url', e.target.value)}
              placeholder="/productos/{seccion}/{categoria}/archivo.png"
              className={styles.formInput}
            />

            <div className={styles.imagenAcciones}>
              <ImageUploader
                carpeta={`productos/${form.seccion}/${form.categoria_slug || 'general'}`}
                onUrl={(url) => { setForm((f) => ({ ...f, imagen_url: url })); setImagenes([]); }}
              />
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={abrirSelectorImagenes}
              >
                <i className="fa-solid fa-folder-open" aria-hidden="true" /> Galería
              </button>
              <button
                type="button"
                className={styles.btnLink}
                onClick={sugerirRutaImagen}
                title="Construye una ruta candidata a partir de sección/categoría/slug"
              >
                Sugerir ruta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Selector de imágenes modal ── */}
      {imagenesAbierto && (
        <div className={styles.modalOverlay} onClick={() => setImagenesAbierto(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Galería de imágenes</h3>
              <button
                type="button"
                onClick={() => setImagenesAbierto(false)}
                className={styles.modalClose}
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className={styles.modalToolbar}>
              <select
                value={filtroCarpeta}
                onChange={(e) => setFiltroCarpeta(e.target.value)}
                className={styles.formInput}
                style={{ maxWidth: 320 }}
              >
                <option value="">Todas las carpetas ({imagenes.length})</option>
                {carpetas.map((c) => (
                  <option key={c} value={c}>{c || '(raíz)'}</option>
                ))}
              </select>
              <button type="button" onClick={cargarImagenes} className={styles.btnSecondary}>
                <i className="fa-solid fa-arrows-rotate" /> Recargar
              </button>
            </div>

            <div className={styles.galeria}>
              {imagenesLoading ? (
                <p><i className="fa-solid fa-spinner fa-spin" /> Cargando…</p>
              ) : imagenesFiltradas.length === 0 ? (
                <p>No hay imágenes.</p>
              ) : (
                imagenesFiltradas.map((img) => (
                  <button
                    key={img.ruta}
                    type="button"
                    className={styles.galeriaItem}
                    onClick={() => elegirImagen(img.ruta)}
                    title={img.ruta}
                  >
                    <div className={styles.galeriaThumb}>
                      <Image
                        src={img.ruta}
                        alt={img.nombre}
                        fill
                        sizes="120px"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <span className={styles.galeriaNombre}>{img.nombre}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Datos comerciales (admin-only) ── */}
      <details className={styles.seccionExtra}>
        <summary className={styles.seccionExtraTitulo}>
          <i className="fa-solid fa-chart-bar" style={{ marginRight: 8 }} />
          Datos comerciales y logísticos
          <span className={styles.formHint}> (solo visible para admins)</span>
        </summary>

        <div className={styles.seccionExtraBody}>
          {/* Fila: código interno, EAN, margen */}
          <div className={styles.seccionExtraGrid}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Código interno</label>
              <input type="text" value={form.codigo_interno ?? ''} onChange={(e) => handleChange('codigo_interno', e.target.value)} className={styles.formInput} placeholder="ej. 100048" />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>EAN</label>
              <input type="text" value={form.ean ?? ''} onChange={(e) => handleChange('ean', e.target.value)} className={styles.formInput} placeholder="ej. 7506240000000" />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Margen mercado</label>
              <input type="text" value={form.margen ?? ''} onChange={(e) => handleChange('margen', e.target.value)} className={styles.formInput} placeholder="ej. MM00" />
            </div>
          </div>

          {/* Fila: caja, master, alta rotación */}
          <div className={styles.seccionExtraGrid}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Caja (uds)</label>
              <input type="number" min="0" value={form.caja ?? ''} onChange={(e) => handleChange('caja', e.target.value === '' ? null : Number(e.target.value))} className={styles.formInput} />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Master (uds)</label>
              <input type="number" min="0" value={form.master ?? ''} onChange={(e) => handleChange('master', e.target.value === '' ? null : Number(e.target.value))} className={styles.formInput} />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formCheck} style={{ marginTop: 28 }}>
                <input type="checkbox" checked={!!form.alta_rotacion} onChange={(e) => handleChange('alta_rotacion', e.target.checked)} />
                <span>Alta rotación</span>
              </label>
            </div>
          </div>

          {/* Precios */}
          <p className={styles.seccionExtraSubtitulo}>Precios con IVA</p>
          <div className={styles.seccionExtraGrid}>
            {([ ['precio_publico_con_iva','Precio público'], ['precio_mayoreo_con_iva','Mayoreo'], ['precio_distribuidor_con_iva','Distribuidor'], ['precio_medio_mayoreo_con_iva','Medio mayoreo'], ['precio_minimo','Mínimo venta'], ] as [keyof ProductoFormData, string][]).map(([k, lbl]) => (
              <div className={styles.formRow} key={k}>
                <label className={styles.formLabel}>{lbl}</label>
                <input type="number" min="0" step="0.01" value={(form[k] as number | null) ?? ''} onChange={(e) => handleChange(k, e.target.value === '' ? null : Number(e.target.value))} className={styles.formInput} />
              </div>
            ))}
          </div>

          <p className={styles.seccionExtraSubtitulo}>Precios sin IVA</p>
          <div className={styles.seccionExtraGrid}>
            {([ ['precio_publico_sin_iva','Precio público'], ['precio_mayoreo_sin_iva','Mayoreo'], ['precio_distribuidor_sin_iva','Distribuidor'], ['precio_medio_mayoreo_sin_iva','Medio mayoreo'], ] as [keyof ProductoFormData, string][]).map(([k, lbl]) => (
              <div className={styles.formRow} key={k}>
                <label className={styles.formLabel}>{lbl}</label>
                <input type="number" min="0" step="0.01" value={(form[k] as number | null) ?? ''} onChange={(e) => handleChange(k, e.target.value === '' ? null : Number(e.target.value))} className={styles.formInput} />
              </div>
            ))}
          </div>

          {/* SAT + logística */}
          <p className={styles.seccionExtraSubtitulo}>Clasificación SAT y logística</p>
          <div className={styles.seccionExtraGrid}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Código SAT</label>
              <input type="text" value={form.codigo_sat ?? ''} onChange={(e) => handleChange('codigo_sat', e.target.value)} className={styles.formInput} />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Descripción SAT</label>
              <input type="text" value={form.descripcion_sat ?? ''} onChange={(e) => handleChange('descripcion_sat', e.target.value)} className={styles.formInput} />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Peso (kg)</label>
              <input type="number" min="0" step="0.001" value={form.peso_kg ?? ''} onChange={(e) => handleChange('peso_kg', e.target.value === '' ? null : Number(e.target.value))} className={styles.formInput} />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Volumen (cm³)</label>
              <input type="number" min="0" step="0.001" value={form.volumen_cm3 ?? ''} onChange={(e) => handleChange('volumen_cm3', e.target.value === '' ? null : Number(e.target.value))} className={styles.formInput} />
            </div>
          </div>
        </div>
      </details>

      {/* ── Estado y acciones ── */}
      {mensaje && (
        <div
          className={
            estado === 'ok'
              ? styles.mensajeOk
              : estado === 'error'
              ? styles.mensajeError
              : styles.mensajeInfo
          }
        >
          {mensaje}
        </div>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={() => router.push('/admin/productos')}
          className={styles.btnSecondary}
        >
          Cancelar
        </button>
        <button type="submit" disabled={estado === 'enviando'} className={styles.btnPrimary}>
          {estado === 'enviando' ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Guardando…
            </>
          ) : modo === 'crear' ? (
            <>
              <i className="fa-solid fa-plus" /> Crear producto
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk" /> Guardar cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}
