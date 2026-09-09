'use client'

import { useEffect, useRef } from 'react'
import pStyles from '@/styles/product.module.css'

const VIDEO_ID = 'DQPxXjXvCDo'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export default function VideoTexturizado() {
  const containerRef   = useRef<HTMLDivElement>(null)
  const playerRef      = useRef<any>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval>
    let observer: IntersectionObserver | undefined

    function setupObserver() {
      if (!containerRef.current) return
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!playerRef.current) return
          try {
            if (entry.isIntersecting) {
              playerRef.current.playVideo()
            } else {
              playerRef.current.pauseVideo()
            }
          } catch {
            // player aún no listo
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(containerRef.current)
    }

    function initPlayer() {
      if (initializedRef.current) return
      initializedRef.current = true
      clearInterval(pollTimer)

      playerRef.current = new window.YT.Player('yt-texturizado', {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay:       1,
          loop:           1,
          playlist:       VIDEO_ID,
          controls:       0,
          disablekb:      1,
          fs:             0,
          rel:            0,
          modestbranding: 1,
          iv_load_policy: 3,
          mute:           1,
          showinfo:       0,
          cc_load_policy: 0,
        },
        events: {
          onReady(e: any) {
            e.target.mute()
            e.target.playVideo()
          },
        },
      })
    }

    // Asegurar que el script esté en el DOM
    if (!document.getElementById('yt-api-script')) {
      const s = document.createElement('script')
      s.id  = 'yt-api-script'
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }

    // Encadenar callback global
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev()
      initPlayer()
    }

    // Polling fallback: si la API ya estaba cargada
    pollTimer = setInterval(() => {
      if (window.YT?.Player) initPlayer()
    }, 150)

    setupObserver()

    return () => {
      clearInterval(pollTimer)
      observer?.disconnect()
      if (playerRef.current?.destroy) playerRef.current.destroy()
      initializedRef.current = false
    }
  }, [])

  return (
    <section className={pStyles.videoSection}>
      <div ref={containerRef} className={pStyles.videoWrapper}>
        <div id="yt-texturizado" />
        {/* Overlay que bloquea hover/click → oculta controles de YouTube */}
        <div className={pStyles.videoOverlay} aria-hidden="true" />
      </div>
    </section>
  )
}
