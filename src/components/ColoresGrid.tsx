'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import pStyles from '@/styles/product.module.css'

interface ColorItem { nombre: string; src: string }

const FILAS_MOVIL = 2
const CASA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/colores/texturizado-casas`
const SIN_CASA = new Set<string>([])

function casaUrl(nombre: string): string | null {
  if (SIN_CASA.has(nombre)) return null
  return `${CASA_BASE}/${nombre}.webp`
}

export default function ColoresGrid({ colores }: { colores: ColorItem[] }) {
  const [expandido, setExpandido] = useState(false)
  const [seleccionado, setSeleccionado] = useState<ColorItem | null>(null)

  const visible = expandido ? colores : colores.slice(0, FILAS_MOVIL * 3)
  const hayMas  = colores.length > FILAS_MOVIL * 3

  const cerrar = useCallback(() => setSeleccionado(null), [])

  useEffect(() => {
    if (!seleccionado) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [seleccionado, cerrar])

  function abrirModal(c: ColorItem) {
    if (!casaUrl(c.nombre)) return
    setSeleccionado(c)
  }

  function renderCard(c: ColorItem) {
    const tieneCasa = !!casaUrl(c.nombre)
    return (
      <div
        key={c.nombre}
        className={`${pStyles.colorCard} ${tieneCasa ? pStyles.colorCardClickable : ''}`}
        onClick={() => abrirModal(c)}
        role={tieneCasa ? 'button' : undefined}
        tabIndex={tieneCasa ? 0 : undefined}
        onKeyDown={tieneCasa ? (e) => { if (e.key === 'Enter' || e.key === ' ') abrirModal(c) } : undefined}
        aria-label={tieneCasa ? `Ver ${c.nombre} en casa` : undefined}
      >
        <Image src={c.src} alt={c.nombre} width={200} height={200}
          style={{ width: '100%', height: 'auto' }} />
      </div>
    )
  }

  return (
    <>
      {/* Grid desktop: siempre completo */}
      <div className={`${pStyles.coloresGrid} ${pStyles.coloresGridDesktop}`}>
        {colores.map(renderCard)}
      </div>

      {/* Grid móvil: parcial o completo según estado */}
      <div className={`${pStyles.coloresGrid} ${pStyles.coloresGridMovil}`}>
        {visible.map(renderCard)}
      </div>

      {/* Botón Ver más — solo móvil */}
      {hayMas && (
        <button className={pStyles.coloresVerMasBtn} onClick={() => setExpandido(!expandido)}>
          {expandido
            ? <><i className="fa-solid fa-chevron-up" aria-hidden="true" /> Ver menos</>
            : <><i className="fa-solid fa-chevron-down" aria-hidden="true" /> Ver más colores</>
          }
        </button>
      )}

      {/* Modal flotante */}
      {seleccionado && casaUrl(seleccionado.nombre) && (
        <div className={pStyles.modalOverlay} onClick={cerrar} role="dialog" aria-modal="true">
          <div className={pStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={pStyles.modalCerrar} onClick={cerrar} aria-label="Cerrar">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <Image
              src={casaUrl(seleccionado.nombre)!}
              alt={`${seleccionado.nombre} en casa`}
              width={800}
              height={600}
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
