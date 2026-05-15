'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from '@/styles/carousel.module.css'

const slides = [
  {
    src: '/images/1.png',
    alt: 'Solidez en su Obra',
    content: (
      <div className={styles.switch}>
        <Image src="/icons/activoiconoconcretos.svg" alt="" width={100} height={100} />
        <h3>Solidez en su Obra</h3>
        <p>
          La calidad es nuestra máxima prioridad. Nuestro cemento es la elección perfecta para
          satisfacer sus necesidades de construcción, brindando solidez, durabilidad y rendimiento
          excepcional en cada proyecto.
        </p>
        <h1>&quot;PRESENCIA SEGURA<br />EN TU OBRA&quot;</h1>
      </div>
    ),
  },
  {
    src: '/images/2.png',
    alt: 'Pega Más Fuerte',
    content: (
      <div className={styles.switch}>
        <Image src="/icons/logojtm.svg" alt="" width={100} height={60} />
        <h3>Solidez en su Obra</h3>
        <p>
          En Josman Texturizados nos hemos comprometido con aplicaciones de productos de alta
          calidad que se presenten en productos para la decoración duradera y eficiente en las obras.
        </p>
        <h1>&quot;PEGA MAS FUERTE&quot;</h1>
      </div>
    ),
  },
  {
    src: '/images/3.png',
    alt: 'Josman Texturizados',
    content: null,
  },
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.slider}>
      <div
        className={styles.slides}
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${current * (100 / slides.length)}%)`
        }}
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={styles.slide}
            style={{ width: `${100 / slides.length}%` }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              width={500}
              height={700}
              style={{ width: '100%', height: 'auto' }}
              priority={idx === 0}
            />
            {slide.content}
          </div>
        ))}
      </div>

      <div className={styles.navigationAuto}>
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={idx === current ? styles.active : ''}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>

      <div className={styles.navigationManual}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`${styles.manualBtn} ${idx === current ? styles.active : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
