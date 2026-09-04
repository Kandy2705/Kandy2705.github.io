import { Outlet } from 'react-router-dom'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { Analytics } from '@/components/Analytics'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { SpotlightCursor } from '@/components/SpotlightCursor'

export function PublicLayout() {
  return (
    <div id="top" className="site-shell">
      <AnimatedBackground />
      <SpotlightCursor />
      <Analytics />
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </div>
  )
}
