import { useEffect, useRef, useState } from 'react'

export function SpotlightCursor() {
  const [pos, setPos] = useState({ x: -500, y: -500 })
  const [hovering, setHovering] = useState(false)
  const trail = useRef<Array<{ x: number; y: number }>>([])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const move = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      trail.current = [{ x: e.clientX, y: e.clientY }, ...trail.current].slice(0, 6)
    }
    const over = (e: Event) => {
      const target = e.target as HTMLElement | null
      setHovering(Boolean(target?.closest('a,button,input,textarea,select,[role="button"]')))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [])

  return (
    <>
      <div
        className="pointer-events-none fixed z-[4] hidden h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{
          left: pos.x,
          top: pos.y,
          background: 'radial-gradient(circle, rgba(255,88,165,.34) 0%, rgba(255,47,134,.16) 28%, rgba(164,40,110,.07) 50%, transparent 72%)',
          filter: 'blur(18px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="pointer-events-none fixed z-[80] hidden -translate-x-1/2 -translate-y-1/2 rounded-full border md:block"
        style={{
          left: pos.x,
          top: pos.y,
          width: hovering ? 34 : 22,
          height: hovering ? 34 : 22,
          borderColor: 'rgba(255,170,210,.9)',
          boxShadow: '0 0 12px rgba(255,83,158,.9), 0 0 28px rgba(255,47,134,.55)',
          background: hovering ? 'rgba(255,70,147,.12)' : 'rgba(255,255,255,.02)',
          transition: 'width .16s ease,height .16s ease,background .16s ease',
        }}
      />
      <div
        className="pointer-events-none fixed z-[81] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white md:block"
        style={{ left: pos.x, top: pos.y, boxShadow: '0 0 8px 3px rgba(255,86,160,.9)' }}
      />
      {trail.current.slice(1).map((p, index) => (
        <span
          key={`${index}-${p.x}-${p.y}`}
          className="pointer-events-none fixed z-[79] hidden rounded-full bg-pink-300 md:block"
          style={{
            left: p.x,
            top: p.y,
            width: Math.max(2, 5 - index * .6),
            height: Math.max(2, 5 - index * .6),
            opacity: Math.max(.08, .34 - index * .05),
            transform: 'translate(-50%,-50%)',
            boxShadow: '0 0 8px rgba(255,86,160,.7)',
          }}
        />
      ))}
    </>
  )
}
