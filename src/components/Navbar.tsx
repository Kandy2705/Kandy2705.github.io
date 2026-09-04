import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe2, Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'

const links = [
  ['/', 'nav.home'],
  ['/about', 'nav.about'],
  ['/projects', 'nav.projects'],
  ['/experience', 'nav.experience'],
  ['/education', 'nav.education'],
  ['/blog', 'nav.blog'],
  ['/#contact', 'nav.contact'],
] as const

export function Navbar() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'

  const toggleLanguage = async () => {
    const next = lang === 'en' ? 'vi' : 'en'
    localStorage.setItem('portfolio-lang', next)
    await i18n.changeLanguage(next)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-4">
      <div className="site-container">
        <div className="glass-panel flex h-[68px] items-center justify-between rounded-2xl px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-5 lg:flex">
            {links.map(([to, key]) => {
              const isHash = to.includes('#')
              if (isHash) {
                return <a key={to} href={to} className="text-sm text-white/70 transition hover:text-pink-300">{t(key)}</a>
              }
              return (
                <NavLink key={to} to={to} className={({ isActive }) => `relative text-sm transition ${isActive ? 'text-pink-300' : 'text-white/70 hover:text-white'}`}>
                  {({ isActive }) => <>{t(key)}{isActive && <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-pink-400 shadow-[0_0_10px_#ff4f95]" />}</>}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="outline-button inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold uppercase tracking-wider text-pink-200" aria-label="Switch language">
              <Globe2 size={16} /> {lang === 'en' ? 'VI' : 'EN'}
            </button>
            <button onClick={() => setOpen((v) => !v)} className="outline-button grid h-10 w-10 place-items-center rounded-xl lg:hidden" aria-label="Open menu">
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="site-container mt-2 lg:hidden">
            <div className="glass-panel rounded-2xl p-3">
              {links.map(([to, key]) => (
                <a key={to} href={to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-pink-500/10 hover:text-pink-200">
                  {t(key)}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
