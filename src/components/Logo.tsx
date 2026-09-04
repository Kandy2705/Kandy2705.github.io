import { Link } from 'react-router-dom'
import { MnMonogram } from '@/components/MnMonogram'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="Portfolio home">
      <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-pink-300/15 bg-black/30 shadow-neon">
        <MnMonogram className="h-10 w-10 transition duration-300 group-hover:scale-110" />
      </span>
      {!compact && (
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-white/90">Portfolio</span>
      )}
    </Link>
  )
}
