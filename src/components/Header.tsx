'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { navItems } from '@/data/navigation'
import styles from '@/styles/header.module.css'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import Buscador from '@/components/Buscador'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const { itemCount, openCart } = useCart()

  const close = () => {
    setMenuOpen(false)
    setOpenSubmenu(null)
  }

  const toggleSubmenu = (href: string) =>
    setOpenSubmenu((prev) => (prev === href ? null : href))

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

              {navItems.map((item) => (
                <li
                  key={item.href}
                  className={`${styles.menuItem} ${openSubmenu === item.href ? styles.submenuActive : ''}`}
                >
                  <div className={styles.itemRow}>
                    <Link href={item.href} className={styles.menuLink} onClick={close}>
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
                    <ul className={styles.submenu}>
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
