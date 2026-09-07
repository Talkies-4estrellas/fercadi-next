'use client'

import Image from 'next/image'
import { useState } from 'react'
import pStyles from '@/styles/product.module.css'

interface ColorItem { nombre: string; src: string }

const FILAS_MOVIL = 2   // 3 columnas × 2 filas = 6 visible en móvil

export default function ColoresGrid({ colores }: { colores: ColorItem[] }) {
  const [expandido, setExpandido] = useState(false)

  // En desktop siempre se muestran todos (control por CSS).
  // En móvil mostramos las primeras 6 o todos si está expandido.
  const visible = expandido ? colores : colores.slice(0, FILAS_MOVIL * 3)
  const hayMas  = colores.length > FILAS_MOVIL * 3

  return (
    <>
      {/* Grid desktop: siempre completo (clase extra lo oculta en móvil) */}
      <div className={`${pStyles.coloresGrid} ${pStyles.coloresGridDesktop}`}>
        {colores.map((c) => (
          <div key={c.nombre} className={pStyles.colorCard}>
            <Image src={c.src} alt={c.nombre} width={200} height={200}
              style={{ width: '100%', height: 'auto' }} />
          </div>
        ))}
      </div>

      {/* Grid móvil: parcial o completo según estado */}
      <div className={`${pStyles.coloresGrid} ${pStyles.coloresGridMovil}`}>
        {visible.map((c) => (
          <div key={c.nombre} className={pStyles.colorCard}>
            <Image src={c.src} alt={c.nombre} width={200} height={200}
              style={{ width: '100%', height: 'auto' }} />
          </div>
        ))}
      </div>

      {/* Botón "Ver más / Ver menos" — solo móvil */}
      {hayMas && (
        <button
          className={pStyles.coloresVerMasBtn}
          onClick={() => setExpandido(!expandido)}
        >
          {expandido
            ? <><i className="fa-solid fa-chevron-up" aria-hidden="true" /> Ver menos</>
            : <><i className="fa-solid fa-chevron-down" aria-hidden="true" /> Ver más colores</>
          }
        </button>
      )}
    </>
  )
}
