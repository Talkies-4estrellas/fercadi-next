'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { resolverImagenProducto } from '@/lib/imagen';
import styles from '@/styles/admin.module.css';

interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_url?: string | null;
  seccion: string;
  categoria_slug: string;
  categoria_nombre: string;
  precio: number;
  activo: number;
}

const SECCIONES = [
  { value: '', label: 'Todas' },
  { value: 'concretos', label: 'Concretos' },
  { value: 'textucos', label: 'Acabados' },
  { value: 'materiales', label: 'Materiales' },
];

export default function AdminProductosPage() {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState('');
  const [q, setQ] = useState('');

  const cargar = () => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (seccion) params.set('seccion', seccion);
    if (q) params.set('q', q);

    fetch(`/api/admin/productos?${params}`, {
      headers: { 'x-usuario-id': String(user.id) },
    })
      .then((r) => r.json())
      .then((data) => setProductos(data.ok ? data.productos : []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, seccion]);

  const eliminar = async (id: number, nombre: string) => {
    if (!user) return;
    if (!confirm(`¿Desactivar "${nombre}"?\nEl producto se marcará como inactivo (no se borra del histórico).`)) return;

    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'DELETE',
      headers: { 'x-usuario-id': String(user.id) },
    });
    if (res.ok) {
      cargar();
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Error: ' + (err.message ?? 'no se pudo eliminar'));
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Productos</h1>
        <Link href="/admin/productos/nuevo" className={styles.btnPrimary}>
          <i className="fa-solid fa-plus" /> Nuevo
        </Link>
      </div>

      <div className={styles.filtros}>
        <select
          value={seccion}
          onChange={(e) => setSeccion(e.target.value)}
          className={styles.filtroSelect}
        >
          {SECCIONES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div className={styles.filtroBuscar}>
          <input
            type="text"
            placeholder="Buscar por nombre o slug…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') cargar(); }}
            className={styles.filtroInput}
          />
          <button onClick={cargar} className={styles.btnSecondary}>
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando…
        </p>
      ) : productos.length === 0 ? (
        <p className={styles.emptyText}>
          <i className="fa-solid fa-inbox" /> Sin productos con los filtros actuales.
        </p>
      ) : (
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
                          <Image
                            src={img}
                            alt={p.nombre}
                            fill
                            sizes="48px"
                            style={{ objectFit: 'cover' }}
                          />
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
                    </td>
                    <td>{p.categoria_nombre}</td>
                    <td><span className={styles.seccionChip}>{p.seccion}</span></td>
                    <td>${Number(p.precio ?? 0).toFixed(2)}</td>
                    <td>
                      {p.activo ? (
                        <span className={`${styles.estadoBadge} ${styles.estadoActivo}`}>Activo</span>
                      ) : (
                        <span className={`${styles.estadoBadge} ${styles.estadoInactivo}`}>Inactivo</span>
                      )}
                    </td>
                    <td className={styles.accionesCol}>
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className={styles.btnIcono}
                        title="Editar"
                      >
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
      )}
    </>
  );
}
