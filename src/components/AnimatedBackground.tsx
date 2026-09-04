import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let raf = 0
    let frame = 0
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const particles = Array.from({ length: reduceMotion ? 24 : 62 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: .18 + Math.random() * .82,
      size: .7 + Math.random() * 2.1,
      drift: (Math.random() - .5) * .0009,
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

    const pointerMove = (event: PointerEvent) => {
      if (coarse) return
      targetX = (event.clientX / window.innerWidth - .5) * 2
      targetY = (event.clientY / window.innerHeight - .5) * 2
    }

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      mouseX += (targetX - mouseX) * .035
      mouseY += (targetY - mouseY) * .035

      for (const p of particles) {
        p.y += .00028 * (.4 + p.z)
        p.x += p.drift
        if (p.y > 1.15) p.y = -1.15
        if (p.x > 1.15) p.x = -1.15
        if (p.x < -1.15) p.x = 1.15

        const depth = .72 + p.z * .72
        const px = w / 2 + (p.x * w * .58 + mouseX * 34 * p.z) * depth
        const py = h / 2 + (p.y * h * .58 + mouseY * 24 * p.z) * depth
        const pulse = .45 + .55 * (Math.sin(frame * .018 + p.phase) * .5 + .5)
        const radius = p.size * (.55 + p.z * 1.25)
        const alpha = (.15 + p.z * .5) * pulse

        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 112, 176, ${alpha})`
        ctx.shadowColor = `rgba(255, 48, 137, ${.35 + p.z * .55})`
        ctx.shadowBlur = 6 + p.z * 18
        ctx.fill()

        if (p.z > .72) {
          ctx.beginPath()
          ctx.moveTo(px - radius * 4.2, py)
          ctx.lineTo(px + radius * 4.2, py)
          ctx.moveTo(px, py - radius * 4.2)
          ctx.lineTo(px, py + radius * 4.2)
          ctx.strokeStyle = `rgba(255, 155, 204, ${alpha * .22})`
          ctx.lineWidth = .6
          ctx.stroke()
        }
      }

      ctx.shadowBlur = 0
      frame += 1
      if (!reduceMotion) raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', pointerMove, { passive: true })
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', pointerMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-20 opacity-90" />
      <div className="pointer-events-none fixed -left-36 top-56 -z-30 h-[34rem] w-[34rem] rounded-full bg-pink-500/15 blur-[110px]" style={{ animation: 'drift 9s ease-in-out infinite' }} />
      <div className="pointer-events-none fixed -right-40 top-20 -z-30 h-[38rem] w-[38rem] rounded-full bg-fuchsia-600/14 blur-[120px]" style={{ animation: 'drift 11s ease-in-out infinite reverse' }} />
      <div className="pointer-events-none fixed left-1/2 top-1/3 -z-30 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-rose-400/[.055] blur-[115px]" />
    </>
  )
}
