import { useEffect, useState } from 'react'

export function SpotlightCursor() {
  const [pos, setPos] = useState({ x: -500, y: -500 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const move = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <div
      className="pointer-events-none fixed z-[5] hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl md:block"
      style={{ left: pos.x, top: pos.y, background: 'radial-gradient(circle, rgba(255,70,147,.28), transparent 68%)' }}
    />
  )
}
