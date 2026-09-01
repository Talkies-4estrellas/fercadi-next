'use client'

import { useRef, useEffect, useState } from 'react'
import styles from '@/styles/product.module.css'

// ~4 líneas a line-height 1.85 × font-size 0.96rem ≈ 28px/línea
const MAX_H = 112

export default function DescripcionExpandible({ texto }: { texto: string }) {
  const pRef = useRef<HTMLParagraphElement>(null)
  const [showBtn, setShowBtn] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (pRef.current) {
      // scrollHeight reporta el alto real aunque overflow esté oculto
      setShowBtn(pRef.current.scrollHeight > MAX_H + 4)
    }
  }, [texto])

  return (
    <>
      <p
        ref={pRef}
        className={styles.detalleSecInner}
        style={!expanded ? { overflow: 'hidden', maxHeight: MAX_H } : undefined}
      >
        {texto}
      </p>

      {showBtn && (
        <div className={styles.secVerMasWrap}>
          <button
            onClick={() => setExpanded(v => !v)}
            className={styles.secVerMasBtn}
          >
            <i className={`fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      )}
    </>
  )
}
