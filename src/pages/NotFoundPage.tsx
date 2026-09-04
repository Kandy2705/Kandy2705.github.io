import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="site-container grid min-h-screen place-items-center py-32 text-center">
      <div>
        <Sparkles className="mx-auto text-pink-300" size={36} />
        <div className="mt-5 font-display text-[8rem] font-semibold leading-none pink-gradient-text">404</div>
        <h1 className="mt-3 font-display text-4xl font-semibold">This route wandered off the map.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/48">The page does not exist, but the portfolio is still right where it should be.</p>
        <Link to="/" className="neon-button mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"><ArrowLeft size={16} /> Back home</Link>
      </div>
    </section>
  )
}
