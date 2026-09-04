'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { SearchItem } from '@/lib/searchIndex'
import styles from '@/styles/buscador.module.css'

/** Cuánto esperar después de la última tecla antes de disparar la consulta */
const DEBOUNCE_MS = 200
/** Caracteres mínimos para lanzar la búsqueda */
const MIN_CHARS = 2

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
  const [open,       setOpen]       = useState(false)
  const [query,      setQuery]      = useState('')
  const [resultados, setResultados] = useState<SearchItem[]>([])
  const [loading,    setLoading]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  /* ── Búsqueda con debounce 200 ms ──────────────────────────
     Cada vez que `query` cambia:
       1. Cancela el fetch anterior (AbortController).
       2. Espera 200 ms. Si en ese tiempo el usuario sigue tecleando,
          el timeout se cancela y no se lanza ninguna petición.
       3. Al cumplirse el plazo, hace fetch con el término actual.
  ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const q = query.trim()

    if (q.length < MIN_CHARS) {
      setResultados([])
      setLoading(false)
      return
    }

    const controller = new AbortController()

    // Muestra spinner de inmediato para indicar que se está procesando
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error('search failed')
        const data: SearchItem[] = await res.json()
        setResultados(data)
      } catch (e: any) {
        // AbortError = el usuario ya escribió otra letra; ignorar silenciosamente
        if (e?.name !== 'AbortError') setResultados([])
      } finally {
        // Solo apagar el spinner si este fetch no fue abortado
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  /* Limpiar resultados al cerrar */
  const cerrar = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResultados([])
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

  const grouped  = agrupar(resultados)
  const hayQuery = query.trim().length >= MIN_CHARS

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
                placeholder="Buscar producto, marca o categoría..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                style={{
                  color:      '#011b4f',
                  caretColor: '#011b4f',
                  background: '#ffffff',
                  fontWeight:  500,
                }}
              />
              {query && (
                <button
                  className={styles.clearBtn}
                  onClick={() => { setQuery(''); setResultados([]); inputRef.current?.focus() }}
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
              {!hayQuery ? (
                <p className={styles.hint}>Escribe al menos {MIN_CHARS} caracteres para buscar</p>

              ) : loading ? (
                <p className={styles.hint}>
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Buscando...
                </p>

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
                                {item.seccion}
                                {item.marca ? ` · ${item.marca}` : ` · ${item.categoria}`}
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
