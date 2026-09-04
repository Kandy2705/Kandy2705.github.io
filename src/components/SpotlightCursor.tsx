import { useEffect, useRef, useState } from 'react'

type Point = { x: number; y: number }

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  twinkle: number
}

export function SpotlightCursor() {
  const [pos, setPos] = useState<Point>({ x: -200, y: -200 })
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const sparks: Spark[] = []
    let raf = 0
    let last: Point = { x: -200, y: -200 }
    let lastSpawn = 0
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (x: number, y: number, count = 2, burst = false) => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const speed = burst ? 0.7 + Math.random() * 1.45 : 0.08 + Math.random() * 0.34

        sparks.push({
          x: x + (Math.random() - 0.5) * (burst ? 10 : 6),
          y: y + (Math.random() - 0.5) * (burst ? 10 : 6),
          vx: Math.cos(angle) * speed - 0.06,
          vy: Math.sin(angle) * speed + (burst ? -0.28 : 0.13),
          size: burst ? 1.1 + Math.random() * 2.25 : 0.65 + Math.random() * 1.5,
          life: burst ? 52 + Math.random() * 20 : 34 + Math.random() * 18,
          maxLife: burst ? 72 : 52,
          twinkle: Math.random() * Math.PI * 2,
        })
      }

      if (sparks.length > 135) sparks.splice(0, sparks.length - 135)
    }

    const move = (event: PointerEvent) => {
      const next = { x: event.clientX, y: event.clientY }
      setPos(next)

      const target = event.target as HTMLElement | null
      setHovering(Boolean(target?.closest('a,button,[role="button"],input,textarea,select,label')))

      const now = performance.now()
      const distance = Math.hypot(next.x - last.x, next.y - last.y)
      if (distance > 4 && now - lastSpawn > 22) {
        spawn(next.x - 6, next.y + 7, distance > 24 ? 3 : 2)
        lastSpawn = now
      }
      last = next
    }

    const down = (event: PointerEvent) => {
      setPressed(true)
      spawn(event.clientX, event.clientY, 12, true)
    }

    const up = () => setPressed(false)

    const drawSpark = (spark: Spark, alpha: number) => {
      const pulse = 0.7 + Math.sin(spark.twinkle + spark.life * 0.2) * 0.3
      const radius = spark.size * pulse

      ctx.save()
      ctx.translate(spark.x, spark.y)
      ctx.rotate(Math.PI / 4)
      ctx.globalAlpha = alpha
      ctx.shadowColor = 'rgba(255,79,157,.82)'
      ctx.shadowBlur = 7 + spark.size * 2.4
      ctx.fillStyle = spark.size > 1.5 ? '#ffe3ef' : '#ff8fc1'
      ctx.fillRect(-radius / 2, -radius * 1.25, radius, radius * 2.5)
      ctx.fillRect(-radius * 1.25, -radius / 2, radius * 2.5, radius)
      ctx.restore()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]
        spark.x += spark.vx
        spark.y += spark.vy
        spark.vx *= 0.986
        spark.vy += 0.009
        spark.life -= 1

        const alpha = Math.max(0, spark.life / spark.maxLife)
        if (spark.life <= 0) sparks.splice(i, 1)
        else drawSpark(spark, alpha * 0.72)
      }

      raf = requestAnimationFrame(render)
    }

    resize()
    render()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[78] hidden md:block"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed z-[3] hidden h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{
          left: pos.x,
          top: pos.y,
          background: 'radial-gradient(circle, rgba(255,102,174,.07) 0%, rgba(255,55,143,.03) 38%, rgba(145,35,96,.012) 58%, transparent 74%)',
          filter: 'blur(16px)',
          mixBlendMode: 'screen',
        }}
        aria-hidden="true"
      />

      {hovering && (
        <div
          className="pointer-events-none fixed z-[80] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-100/30 md:block"
          style={{
            left: pos.x,
            top: pos.y,
            background: 'radial-gradient(circle at 36% 28%, rgba(255,255,255,.13), rgba(255,115,181,.065) 46%, rgba(255,61,146,.025) 70%)',
            boxShadow: '0 0 14px rgba(255,78,157,.15), inset 0 0 13px rgba(255,255,255,.04)',
            backdropFilter: 'blur(3px)',
          }}
          aria-hidden="true"
        />
      )}

      <div
        className="pointer-events-none fixed z-[82] hidden md:block"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-5px,-4px) scale(${pressed ? 0.9 : hovering ? 1.06 : 1})`,
          transformOrigin: '5px 4px',
          transition: 'transform .12s ease',
          filter: 'drop-shadow(0 0 4px rgba(255,255,255,.55)) drop-shadow(0 0 11px rgba(255,79,157,.75)) drop-shadow(0 0 20px rgba(255,58,145,.28))',
        }}
        aria-hidden="true"
      >
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glassCursorFill" x1="5" y1="4" x2="25" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="0.38" stopColor="#ffc8df" stopOpacity="0.08" />
              <stop offset="1" stopColor="#ff5fa7" stopOpacity="0.025" />
            </linearGradient>
            <linearGradient id="glassCursorStroke" x1="4" y1="3" x2="27" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff7fb" />
              <stop offset="0.48" stopColor="#ffc0db" />
              <stop offset="1" stopColor="#ff72b1" />
            </linearGradient>
          </defs>

          <path
            d="M4 3.5L29 23.5L17.2 24.8L22.8 36.8L16.1 39.3L10.6 27.5L4 34.4V3.5Z"
            fill="rgba(15,6,12,.54)"
            stroke="url(#glassCursorStroke)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 6.2L25.6 22.1L14.8 23.4L20.3 35.1L16.9 36.4L11.5 25L5.5 31.2V6.2Z"
            fill="url(#glassCursorFill)"
          />
          <path
            d="M6.3 6.6L23.3 20.1"
            stroke="rgba(255,255,255,.55)"
            strokeWidth="1.05"
            strokeLinecap="round"
          />
          <path
            d="M11.7 25.4L16.7 36.2"
            stroke="#ff7db8"
            strokeOpacity="0.7"
            strokeWidth="0.95"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  )
}
