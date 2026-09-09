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
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef    = useRef<any>(null)
  const readyRef     = useRef(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval>

    function setupObserver() {
      if (!containerRef.current) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!readyRef.current || !playerRef.current) return
          if (entry.isIntersecting) {
            playerRef.current.playVideo()
          } else {
            playerRef.current.pauseVideo()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(containerRef.current)
      return observer
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
        },
        events: {
          onReady(e: any) {
            readyRef.current = true
            e.target.mute()
            e.target.playVideo()
          },
        },
      })
    }

    let observer: IntersectionObserver | undefined

    // Ensure script is in DOM
    if (!document.getElementById('yt-api-script')) {
      const s = document.createElement('script')
      s.id  = 'yt-api-script'
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }

    // Chain onto existing global callback
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev()
      initPlayer()
    }

    // Polling fallback: handles case where YT API was already loaded
    pollTimer = setInterval(() => {
      if (window.YT?.Player) initPlayer()
    }, 150)

    observer = setupObserver()

    return () => {
      clearInterval(pollTimer)
      observer?.disconnect()
      if (playerRef.current?.destroy) playerRef.current.destroy()
    }
  }, [])

  return (
    <section className={pStyles.videoSection}>
      <div ref={containerRef} className={pStyles.videoWrapper}>
        <div id="yt-texturizado" />
      </div>
    </section>
  )
}
