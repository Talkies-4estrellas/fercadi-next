'use client'

/**
 * Header — barra de navegación principal.
 *
 * Estado local:
 *  - `menuOpen`: controla el menú hamburguesa en móvil.
 *  - `openSubmenu`: slug del ítem con submenú actualmente expandido
 *    (solo uno a la vez). Se colapsa al navegar.
 *
 * Muestra el botón Admin solo si el usuario tiene rol 'admin'.
 * Muestra el badge del carrito con el conteo total de unidades.
 * Los items de navegación vienen de `src/data/navigation.ts`
 * para poder editarlos sin tocar este componente.
 */

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { navItems } from '@/data/navigation'
import styles from '@/styles/header.module.css'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import Buscador from '@/components/Buscador'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [navConfig, setNavConfig] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const { itemCount, openCart } = useCart()

  useEffect(() => {
    fetch('/api/nav-config')
      .then((r) => r.json())
      .then((data) => { if (data.config) setNavConfig(data.config) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1160)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /** Cierra menú hamburguesa y cualquier submenú abierto al navegar. */
  const close = () => {
    setMenuOpen(false)
    setOpenSubmenu(null)
  }

  /** Alterna el submenú del ítem clicado; cierra el anterior si era distinto. */
  const toggleSubmenu = (href: string) =>
    setOpenSubmenu((prev) => (prev === href ? null : href))

  // En móvil el nav se expande con max-height para habilitar el scroll
  // cuando hay muchos ítems sin desbordarse fuera del viewport.
  const navStyle = menuOpen
    ? { maxHeight: '80vh', overflowY: 'auto' as const, pointerEvents: 'auto' as const }
    : {}

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.logo} onClick={close}>
          <Image src="/images/Logo.png" alt="FERCADI" width={70} height={40} priority />
        </Link>

        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
          </button>
          <nav
            className={styles.nav}
            style={navStyle}
            aria-label="Navegación principal"
          >
            <ul className={styles.menu}>
              <li className={styles.homeIcon}>
                <Link href="/" onClick={close}>
                  <Image src="/icons/activoiconoconcretos.svg" alt="Inicio" width={36} height={36} />
                </Link>
              </li>

              {navItems.filter((item) => navConfig[item.href] !== false).map((item) => (
                <li
                  key={item.href}
                  className={`${styles.menuItem} ${openSubmenu === item.href ? styles.submenuActive : ''}`}
                >
                  <div className={styles.itemRow}>
                    <Link
                      href={item.href}
                      className={styles.menuLink}
                      onClick={(e) => {
                        if (isMobile && item.submenu) {
                          e.preventDefault()
                          toggleSubmenu(item.href)
                        } else {
                          close()
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                    {item.submenu && (
                      <button
                        type="button"
                        className={styles.chevronBtn}
                        onClick={() => toggleSubmenu(item.href)}
                        aria-label={`Expandir ${item.label}`}
                      >
                        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {item.submenu && (
                    <ul
                      className={styles.submenu}
                      style={openSubmenu === item.href
                        ? { display: 'block', visibility: 'visible', opacity: 1 }
                        : {}}
                    >
                      {item.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link href={sub.href} onClick={close}>
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <Buscador />

          <button
            type="button"
            className={styles.cartBtn}
            onClick={openCart}
            aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} productos` : ''}`}
          >
            <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              className={styles.adminBtn}
              onClick={close}
              title="Panel de administración"
            >
              <i className="fa-solid fa-screwdriver-wrench" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          )}

          {user ? (
            <div className={styles.userWrapper}>
              <Link href="/perfil" className={styles.userBtn} onClick={close}>
                <i className="fa-solid fa-circle-user" aria-hidden="true" />
                <span>{user.nombre.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => { logout(); close() }}
                aria-label="Cerrar sesión"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn} onClick={close}>
              <i className="fa-solid fa-user" aria-hidden="true" />
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
