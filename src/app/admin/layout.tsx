'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

/**
 * Guard del backoffice. Redirige al login si:
 *   - El usuario no está autenticado
 *   - El usuario está autenticado pero su rol != 'admin'
 *
 * IMPORTANTE: este guard es sólo frontend. La autorización real
 * vive en lib/admin.ts > requerirAdmin() que valida cada API call.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Esperamos a que AuthProvider hidrate desde localStorage (1 tick).
    const t = setTimeout(() => {
      if (!user) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }, 50);
    return () => clearTimeout(t);
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) {
    return (
      <div className={styles.guardMessage}>
        <i className="fa-solid fa-lock" aria-hidden="true" />
        <p>Verificando permisos…</p>
      </div>
    );
  }

  const links = [
    { href: '/admin',             label: 'Dashboard',      icon: 'fa-solid fa-chart-line'       },
    { href: '/admin/home',        label: 'Inicio',         icon: 'fa-solid fa-house'            },
    { href: '/admin/pedidos',     label: 'Pedidos',        icon: 'fa-solid fa-bag-shopping'     },
    { href: '/admin/tips',        label: 'Tips',           icon: 'fa-solid fa-lightbulb'        },
    { href: '/admin/productos',   label: 'Productos',      icon: 'fa-solid fa-boxes-stacked'    },
    { href: '/admin/productos/nuevo', label: 'Nuevo producto', icon: 'fa-solid fa-plus'         },
    { href: '/admin/importar',    label: 'Importar CSV',   icon: 'fa-solid fa-file-arrow-up'    },
    { href: '/admin/ajustes',     label: 'Ajustes',        icon: 'fa-solid fa-gear'             },
  ];

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <i className="fa-solid fa-screwdriver-wrench" />
          <span>Admin · Fercadi</span>
        </div>
        <nav className={styles.sidebarNav}>
          {links.map((l) => {
            const activo =
              l.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.sidebarLink} ${activo ? styles.sidebarLinkActive : ''}`}
              >
                <i className={l.icon} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFoot}>
          <Link href="/" className={styles.sidebarBack}>
            <i className="fa-solid fa-arrow-left" /> Volver al sitio
          </Link>
          <small>{user.nombre} · {user.correo}</small>
        </div>
      </aside>

      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
