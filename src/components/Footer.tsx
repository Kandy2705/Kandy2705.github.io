import { Facebook, Github, Linkedin, Mail, MoveUp, Music2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSiteProfile } from '@/hooks/useContent'

export function Footer() {
  const { t } = useTranslation()
  const { data: profile } = useSiteProfile()
  if (!profile) return null

  return (
    <footer className="border-t border-pink-200/10 py-8">
      <div className="site-container flex flex-col items-center justify-between gap-5 text-sm text-white/50 sm:flex-row">
        <div>© {new Date().getFullYear()} {profile.brand}. All rights reserved.</div>
        <div>{t('footer.built')}</div>
        <div className="flex items-center gap-3">
          <a href={`mailto:${profile.email}`} aria-label="Email" className="outline-button grid h-9 w-9 place-items-center rounded-full"><Mail size={16} /></a>
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="outline-button grid h-9 w-9 place-items-center rounded-full"><Github size={16} /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="outline-button grid h-9 w-9 place-items-center rounded-full"><Linkedin size={16} /></a>
          <a href={profile.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="outline-button grid h-9 w-9 place-items-center rounded-full"><Facebook size={16} /></a>
          {profile.tiktokUrl && <a href={profile.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok" title={profile.tiktokFollowers ? `TikTok · ${(profile.tiktokFollowers / 1000).toFixed(1)}K followers` : 'TikTok'} className="outline-button grid h-9 w-9 place-items-center rounded-full"><Music2 size={16} /></a>}
          <a href="#top" aria-label="Back to top" className="outline-button grid h-9 w-9 place-items-center rounded-full"><MoveUp size={16} /></a>
        </div>
      </div>
    </footer>
  )
}
