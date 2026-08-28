'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, hydrated, router]);

  // Cerrar drawer al navegar
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!hydrated || !user || !isAdmin) {
    return (
      <div className={styles.guardMessage}>
        <i className="fa-solid fa-lock" aria-hidden="true" />
        <p>Verificando permisos…</p>
      </div>
    );
  }

  const links = [
    { href: '/admin',                 label: 'Dashboard',      icon: 'fa-solid fa-chart-line'       },
    { href: '/admin/home',            label: 'Inicio',         icon: 'fa-solid fa-house'            },
    { href: '/admin/pedidos',         label: 'Pedidos',        icon: 'fa-solid fa-bag-shopping'     },
    { href: '/admin/tips',            label: 'Tips',           icon: 'fa-solid fa-lightbulb'        },
    { href: '/admin/productos',       label: 'Productos',      icon: 'fa-solid fa-boxes-stacked'    },
    { href: '/admin/productos/nuevo', label: 'Nuevo producto', icon: 'fa-solid fa-plus'             },
    { href: '/admin/importar',        label: 'Importar CSV',   icon: 'fa-solid fa-file-arrow-up'    },
    { href: '/admin/mensajes',        label: 'Mensajes',       icon: 'fa-solid fa-comment-dots'     },
    { href: '/admin/comentarios',     label: 'Comentarios',    icon: 'fa-solid fa-comments'         },
    { href: '/admin/ajustes',         label: 'Ajustes',        icon: 'fa-solid fa-gear'             },
  ];

  const navLinks = links.map((l) => {
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
  });

  return (
    <div className={styles.adminShell}>
      {/* ── Sidebar (desktop) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <i className="fa-solid fa-screwdriver-wrench" />
          <span>Admin · Fercadi</span>
        </div>
        <nav className={styles.sidebarNav}>{navLinks}</nav>
        <div className={styles.sidebarFoot}>
          <Link href="/" className={styles.sidebarBack}>
            <i className="fa-solid fa-arrow-left" /> Volver al sitio
          </Link>
          <small>{user.nombre} · {user.correo}</small>
        </div>
      </aside>

      {/* ── Drawer overlay (móvil) ── */}
      {menuOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.sidebarBrand} style={{ padding: 0, border: 'none' }}>
            <i className="fa-solid fa-screwdriver-wrench" />
            <span>Admin · Fercadi</span>
          </div>
          <button
            className={styles.drawerClose}
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <nav className={styles.drawerNav}>{navLinks}</nav>
        <div className={styles.sidebarFoot} style={{ padding: '20px 0 0', marginTop: 'auto' }}>
          <Link href="/" className={styles.sidebarBack}>
            <i className="fa-solid fa-arrow-left" /> Volver al sitio
          </Link>
          <small>{user.nombre} · {user.correo}</small>
        </div>
      </aside>

      {/* ── Topbar móvil ── */}
      <div className={styles.adminTopbar}>
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <i className="fa-solid fa-bars" />
        </button>
        <Link href="/" className={styles.topbarBrand}>
          <Image src="/images/Logo.png" alt="FERCADI" width={90} height={52} priority style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/" className={styles.topbarBack} title="Volver al sitio">
          <i className="fa-solid fa-arrow-left" />
        </Link>
      </div>

      {/* ── Contenido principal ── */}
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
