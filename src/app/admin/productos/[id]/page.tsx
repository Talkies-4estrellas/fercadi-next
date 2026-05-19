'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProductoForm, { type ProductoFormData } from '@/components/admin/ProductoForm';
import styles from '@/styles/admin.module.css';

export default function AdminProductoEditarPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [producto, setProducto] = useState<ProductoFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !params?.id) return;

    fetch(`/api/admin/productos/${params.id}`, {
      headers: { 'x-usuario-id': String(user.id) },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.producto) {
          const p = data.producto;
          setProducto({
            id: p.id,
            nombre: p.nombre,
            slug: p.slug,
            descripcion: p.descripcion,
            descripcion2: p.descripcion2,
            imagen_url: p.imagen_url,
            seccion: p.seccion,
            categoria_slug: p.categoria_slug,
            categoria_nombre: p.categoria_nombre,
            precio: Number(p.precio ?? 0),
            activo: Boolean(p.activo),
            // Campos públicos nuevos
            marca: p.marca ?? null,
            unidad: p.unidad ?? null,
            // Campos comerciales
            codigo_interno: p.codigo_interno ?? null,
            ean: p.ean ?? null,
            margen: p.margen ?? null,
            caja: p.caja != null ? Number(p.caja) : null,
            master: p.master != null ? Number(p.master) : null,
            alta_rotacion: Boolean(p.alta_rotacion),
            precio_minimo: p.precio_minimo != null ? Number(p.precio_minimo) : null,
            precio_mayoreo_con_iva: p.precio_mayoreo_con_iva != null ? Number(p.precio_mayoreo_con_iva) : null,
            precio_distribuidor_con_iva: p.precio_distribuidor_con_iva != null ? Number(p.precio_distribuidor_con_iva) : null,
            precio_publico_con_iva: p.precio_publico_con_iva != null ? Number(p.precio_publico_con_iva) : null,
            precio_mayoreo_sin_iva: p.precio_mayoreo_sin_iva != null ? Number(p.precio_mayoreo_sin_iva) : null,
            precio_distribuidor_sin_iva: p.precio_distribuidor_sin_iva != null ? Number(p.precio_distribuidor_sin_iva) : null,
            precio_publico_sin_iva: p.precio_publico_sin_iva != null ? Number(p.precio_publico_sin_iva) : null,
            precio_medio_mayoreo_sin_iva: p.precio_medio_mayoreo_sin_iva != null ? Number(p.precio_medio_mayoreo_sin_iva) : null,
            precio_medio_mayoreo_con_iva: p.precio_medio_mayoreo_con_iva != null ? Number(p.precio_medio_mayoreo_con_iva) : null,
            codigo_sat: p.codigo_sat ?? null,
            descripcion_sat: p.descripcion_sat ?? null,
            peso_kg: p.peso_kg != null ? Number(p.peso_kg) : null,
            volumen_cm3: p.volumen_cm3 != null ? Number(p.volumen_cm3) : null,
          });
        } else {
          setError(data.message ?? 'No se encontró el producto');
        }
      })
      .catch((err) => setError(err.message));
  }, [user, params]);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/admin/productos" className={styles.btnLink}>
            <i className="fa-solid fa-arrow-left" /> Volver al listado
          </Link>
          <h1 className={styles.pageTitle}>Editar producto</h1>
        </div>
      </div>

      {error && <div className={styles.mensajeError}>{error}</div>}

      {!producto && !error ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando…
        </p>
      ) : producto ? (
        <ProductoForm modo="editar" inicial={producto} />
      ) : null}
    </>
  );
}
