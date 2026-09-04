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
        const speed = burst ? .7 + Math.random() * 1.7 : .12 + Math.random() * .45
        sparks.push({
          x: x + (Math.random() - .5) * (burst ? 10 : 5),
          y: y + (Math.random() - .5) * (burst ? 10 : 5),
          vx: Math.cos(angle) * speed - .12,
          vy: Math.sin(angle) * speed + (burst ? -.4 : .22),
          size: burst ? 1.2 + Math.random() * 2.5 : .7 + Math.random() * 1.8,
          life: burst ? 58 + Math.random() * 24 : 42 + Math.random() * 24,
          maxLife: burst ? 82 : 66,
          twinkle: Math.random() * Math.PI * 2,
        })
      }
      if (sparks.length > 150) sparks.splice(0, sparks.length - 150)
    }

    const move = (event: PointerEvent) => {
      const next = { x: event.clientX, y: event.clientY }
      setPos(next)
      const target = event.target as HTMLElement | null
      setHovering(Boolean(target?.closest('a,button,[role="button"],input,textarea,select,label')))

      const now = performance.now()
      const distance = Math.hypot(next.x - last.x, next.y - last.y)
      if (distance > 4 && now - lastSpawn > 18) {
        spawn(next.x - 7, next.y + 7, distance > 24 ? 3 : 2)
        lastSpawn = now
      }
      last = next
    }

    const down = (event: PointerEvent) => {
      setPressed(true)
      spawn(event.clientX, event.clientY, 14, true)
    }
    const up = () => setPressed(false)

    const drawSpark = (spark: Spark, alpha: number) => {
      const pulse = .65 + Math.sin(spark.twinkle + spark.life * .24) * .35
      const radius = spark.size * pulse
      ctx.save()
      ctx.translate(spark.x, spark.y)
      ctx.rotate(Math.PI / 4)
      ctx.globalAlpha = alpha
      ctx.shadowColor = 'rgba(255,72,154,.95)'
      ctx.shadowBlur = 9 + spark.size * 3
      ctx.fillStyle = spark.size > 1.55 ? '#ffd2e5' : '#ff72b1'
      ctx.fillRect(-radius / 2, -radius * 1.35, radius, radius * 2.7)
      ctx.fillRect(-radius * 1.35, -radius / 2, radius * 2.7, radius)
      ctx.restore()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]
        spark.x += spark.vx
        spark.y += spark.vy
        spark.vx *= .985
        spark.vy += .012
        spark.life -= 1
        const alpha = Math.max(0, spark.life / spark.maxLife)
        if (spark.life <= 0) sparks.splice(i, 1)
        else drawSpark(spark, alpha * .82)
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
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[78] hidden md:block" aria-hidden="true" />

      <div
        className="pointer-events-none fixed z-[3] hidden h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{
          left: pos.x,
          top: pos.y,
          background: 'radial-gradient(circle, rgba(255,89,164,.16) 0%, rgba(255,47,134,.075) 34%, rgba(151,35,99,.025) 56%, transparent 73%)',
          filter: 'blur(15px)',
          mixBlendMode: 'screen',
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed z-[82] hidden md:block"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-4px,-3px) scale(${pressed ? .88 : hovering ? 1.08 : 1})`,
          transformOrigin: '4px 3px',
          transition: 'transform .12s ease',
          filter: 'drop-shadow(0 0 5px rgba(255,255,255,.7)) drop-shadow(0 0 12px rgba(255,58,143,.9)) drop-shadow(0 0 24px rgba(255,47,134,.45))',
        }}
        aria-hidden="true"
      >
        <svg width="31" height="39" viewBox="0 0 31 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 2.5L27.4 22.2L16.3 23.5L21.8 34.8L15.4 37.2L10.1 25.8L3 33V2.5Z" fill="#220b17" stroke="#ffd3e6" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M5.5 7.3L22.1 20.7L13.5 21.8L17.8 30.8" stroke="#ff4f9a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      {hovering && (
        <div
          className="pointer-events-none fixed z-[80] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-200/40 md:block"
          style={{ left: pos.x, top: pos.y, boxShadow: '0 0 18px rgba(255,65,150,.22), inset 0 0 14px rgba(255,92,159,.07)' }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
