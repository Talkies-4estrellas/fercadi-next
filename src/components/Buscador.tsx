'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { SearchItem } from '@/lib/searchIndex'
import styles from '@/styles/buscador.module.css'

/* ── Resalta el texto coincidente ──────────────────────────── */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

/* ── Agrupa resultados por sección ─────────────────────────── */
function agrupar(items: SearchItem[]) {
  return items.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.seccion]) acc[item.seccion] = []
    acc[item.seccion].push(item)
    return acc
  }, {})
}

export default function Buscador() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const indexLoaded = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const q = query.trim().toLowerCase()

  /* ── Carga el índice la primera vez que se abre el buscador ── */
  useEffect(() => {
    if (!open || indexLoaded.current) return
    setLoading(true)
    fetch('/api/search')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        setIndex(data)
        indexLoaded.current = true
      })
      .catch(() => {
        // Si falla la carga, el buscador simplemente no tendrá resultados
        indexLoaded.current = true
      })
      .finally(() => setLoading(false))
  }, [open])

  const resultados =
    q.length >= 2
      ? index.filter(
          (item) =>
            item.nombre.toLowerCase().includes(q) ||
            item.categoria.toLowerCase().includes(q) ||
            item.descripcion.toLowerCase().includes(q)
        )
      : []

  const grouped = agrupar(resultados)

  const cerrar = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  /* Auto-foco al abrir */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
  }, [open])

  /* Cerrar con Escape */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [cerrar])

  const irA = (href: string) => {
    cerrar()
    router.push(href)
  }

  return (
    <>
      {/* ── Botón trigger ── */}
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Buscar productos"
      >
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
      </button>

      {/* ── Overlay + panel ── */}
      {open && (
        <>
          <div className={styles.overlay} onClick={cerrar} />

          <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Buscador">
            {/* Input row */}
            <div className={styles.inputWrap}>
              <i
                className={`fa-solid fa-magnifying-glass ${styles.inputIcon}`}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                placeholder="Buscar producto o categoría..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                style={{
                  color: '#011b4f',
                  caretColor: '#011b4f',
                  background: '#ffffff',
                  fontWeight: 500,
                }}
              />
              {query && (
                <button
                  className={styles.clearBtn}
                  onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  aria-label="Limpiar búsqueda"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              )}
              <button className={styles.closeBtn} onClick={cerrar}>
                <span>Esc</span>
              </button>
            </div>

            {/* Resultados */}
            <div className={styles.results}>
              {loading ? (
                <p className={styles.hint}>
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Cargando...
                </p>
              ) : q.length < 2 ? (
                <p className={styles.hint}>Escribe al menos 2 caracteres para buscar</p>
              ) : resultados.length === 0 ? (
                <div className={styles.empty}>
                  <i className="fa-solid fa-box-open" aria-hidden="true" />
                  <p>Sin resultados para <strong>"{query}"</strong></p>
                </div>
              ) : (
                Object.entries(grouped).map(([seccion, items]) => (
                  <div key={seccion}>
                    <p className={styles.seccion}>
                      {seccion} — {items.length} resultado{items.length !== 1 ? 's' : ''}
                    </p>
                    <ul className={styles.list}>
                      {items.map((item) => (
                        <li key={item.href}>
                          <button
                            type="button"
                            className={styles.resultado}
                            onClick={() => irA(item.href)}
                          >
                            <div className={styles.thumb}>
                              {item.imagen ? (
                                <Image
                                  src={item.imagen}
                                  alt={item.nombre}
                                  width={48}
                                  height={48}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <i
                                  className="fa-solid fa-box"
                                  style={{ color: 'var(--azul-medio)', fontSize: '1.2rem' }}
                                />
                              )}
                            </div>
                            <div className={styles.info}>
                              <span className={styles.nombre}>
                                <Highlight text={item.nombre} query={query} />
                              </span>
                              <span className={styles.cat}>
                                {item.seccion} · {item.categoria}
                              </span>
                            </div>
                            <i
                              className={`fa-solid fa-arrow-right ${styles.arrow}`}
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
