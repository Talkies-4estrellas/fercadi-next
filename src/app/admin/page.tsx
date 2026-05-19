'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Producto {
  id: number;
  nombre: string;
  seccion: string;
  categoria_slug: string;
  activo: number;
}

interface Stats {
  total: number;
  porSeccion: Record<string, number>;
  inactivos: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/productos', {
      headers: { 'x-usuario-id': String(user.id) },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          setStats({ total: 0, porSeccion: {}, inactivos: 0 });
          return;
        }
        const productos: Producto[] = data.productos ?? [];
        const porSeccion: Record<string, number> = {};
        let inactivos = 0;
        for (const p of productos) {
          porSeccion[p.seccion] = (porSeccion[p.seccion] ?? 0) + 1;
          if (!p.activo) inactivos++;
        }
        setStats({ total: productos.length, porSeccion, inactivos });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>
        Bienvenido, <strong>{user?.nombre}</strong>. Aquí tienes el resumen del catálogo.
      </p>

      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando estadísticas…
        </p>
      ) : stats ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{stats.total}</span>
              <span className={styles.statLabel}>Productos totales</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{stats.porSeccion.concretos ?? 0}</span>
              <span className={styles.statLabel}>Concretos</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{stats.porSeccion.textucos ?? 0}</span>
              <span className={styles.statLabel}>Acabados</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{stats.inactivos}</span>
              <span className={styles.statLabel}>Inactivos</span>
            </div>
          </div>

          <div className={styles.quickActions}>
            <Link href="/admin/productos/nuevo" className={styles.btnPrimary}>
              <i className="fa-solid fa-plus" /> Agregar producto
            </Link>
            <Link href="/admin/productos" className={styles.btnSecondary}>
              <i className="fa-solid fa-list" /> Ver listado completo
            </Link>
          </div>
        </>
      ) : (
        <p>No se pudieron cargar las estadísticas.</p>
      )}
    </>
  );
}
