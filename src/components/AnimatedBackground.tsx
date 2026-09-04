import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let raf = 0
    const particles = Array.from({ length: reduceMotion ? 18 : 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: .6 + Math.random() * 1.8,
      speed: .00012 + Math.random() * .00035,
      phase: Math.random() * Math.PI * 2,
    }))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const p of particles) {
        const y = (p.y + frame * p.speed) % 1
        const x = p.x + Math.sin(frame * .004 + p.phase) * .012
        const px = x * window.innerWidth
        const py = y * window.innerHeight
        const alpha = .2 + .55 * (Math.sin(frame * .015 + p.phase) * .5 + .5)
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 105, 168, ${alpha})`
        ctx.shadowColor = 'rgba(255, 47, 134, .65)'
        ctx.shadowBlur = 10
        ctx.fill()
      }
      ctx.shadowBlur = 0
      frame += 1
      if (!reduceMotion) raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-20 opacity-70" />
      <div className="pointer-events-none fixed -left-36 top-56 -z-30 h-[30rem] w-[30rem] rounded-full bg-pink-500/10 blur-[120px]" style={{ animation: 'drift 9s ease-in-out infinite' }} />
      <div className="pointer-events-none fixed -right-40 top-20 -z-30 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/10 blur-[130px]" style={{ animation: 'drift 11s ease-in-out infinite reverse' }} />
    </>
  )
}
