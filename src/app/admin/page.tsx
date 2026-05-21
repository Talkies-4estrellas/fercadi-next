'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

interface Stats {
  total:     number;
  inactivos: number;
  secciones: Record<string, number>;
}

/** Metadatos visuales por sección */
const SECCION_META: Record<string, { label: string; icon: string }> = {
  concretos:  { label: 'Concretos',   icon: 'fa-solid fa-cubes' },
  textucos:   { label: 'Acabados',    icon: 'fa-solid fa-brush' },
  materiales: { label: 'Materiales',  icon: 'fa-solid fa-helmet-safety' },
  ferreteria: { label: 'Ferretería',  icon: 'fa-solid fa-wrench' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/stats', {
      headers: { 'x-usuario-id': String(user.id) },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStats({
            total:     data.total,
            inactivos: data.inactivos,
            secciones: data.secciones ?? {},
          });
        } else {
          setStats({ total: 0, inactivos: 0, secciones: {} });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  // Secciones presentes en DB, más las conocidas que puedan estar vacías
  const seccionesAMostrar = stats
    ? Array.from(
        new Set([
          ...Object.keys(SECCION_META),
          ...Object.keys(stats.secciones),
        ])
      ).filter(
        (s) => (stats.secciones[s] ?? 0) > 0 || s in SECCION_META
      )
    : [];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Bienvenido, <strong>{user?.nombre}</strong>. Aquí tienes el resumen del catálogo.
          </p>
        </div>
      </div>

      {loading ? (
        <p className={styles.loadingText}>
          <i className="fa-solid fa-spinner fa-spin" /> Cargando estadísticas…
        </p>
      ) : stats ? (
        <>
          <div className={styles.statsGrid}>
            {/* Total global */}
            <div className={`${styles.statCard} ${styles.statCardDestacado}`}>
              <span className={styles.statNum}>
                {stats.total.toLocaleString('es-MX')}
              </span>
              <span className={styles.statLabel}>
                <i className="fa-solid fa-box-open" /> Productos totales
              </span>
            </div>

            {/* Una tarjeta por sección */}
            {seccionesAMostrar.map((sec) => {
              const meta  = SECCION_META[sec];
              const label = meta?.label ?? sec.charAt(0).toUpperCase() + sec.slice(1);
              const icon  = meta?.icon  ?? 'fa-solid fa-tag';
              const count = stats.secciones[sec] ?? 0;
              return (
                <div key={sec} className={styles.statCard}>
                  <span className={styles.statNum}>
                    {count.toLocaleString('es-MX')}
                  </span>
                  <span className={styles.statLabel}>
                    <i className={icon} /> {label}
                  </span>
                </div>
              );
            })}

            {/* Inactivos */}
            <div className={`${styles.statCard} ${stats.inactivos > 0 ? styles.statCardWarn : ''}`}>
              <span className={styles.statNum}>
                {stats.inactivos.toLocaleString('es-MX')}
              </span>
              <span className={styles.statLabel}>
                <i className="fa-solid fa-eye-slash" /> Inactivos
              </span>
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
