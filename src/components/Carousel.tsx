'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from '@/styles/carousel.module.css'
import type { CarouselSlide } from '@/lib/homeContent'

interface Props {
  slides: CarouselSlide[];
}

export default function Carousel({ slides }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) return null;

  return (
    <div className={styles.slider}>
      <div
        className={styles.slides}
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={styles.slide}
            style={{ width: `${100 / slides.length}%` }}
          >
            <Image
              src={slide.imagen_url}
              alt={slide.alt || ''}
              width={500}
              height={700}
              style={{ width: '100%', height: 'auto' }}
              priority={idx === 0}
            />
            {(slide.titulo || slide.descripcion || slide.slogan) && (
              <div className={styles.switch}>
                {slide.titulo      && <h3>{slide.titulo}</h3>}
                {slide.descripcion && <p>{slide.descripcion}</p>}
                {slide.slogan      && <h1>&quot;{slide.slogan}&quot;</h1>}
              </div>
            )}
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
