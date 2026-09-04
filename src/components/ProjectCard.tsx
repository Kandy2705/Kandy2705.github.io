import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, Eye, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/types/content'

const formatMonth = (value?: string | null, lang: 'en' | 'vi' = 'en') => {
  if (!value) return ''
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { i18n, t } = useTranslation()
  const lang: 'en' | 'vi' = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const timeline = [formatMonth(project.startDate, lang), formatMonth(project.endDate, lang)].filter(Boolean).join(' — ')
  const hasPlayable = Boolean(project.demoUrl || project.appStoreUrl || project.playStoreUrl)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: .5, delay: Math.min(index * .05, .2) }}
      whileHover={{ y: -6 }}
      className="glass-panel neon-border group overflow-hidden rounded-3xl"
    >
      <Link to={`/projects/${project.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#100a10]">
          {project.coverImageUrl ? (
            <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,79,149,.18),transparent_35%),linear-gradient(135deg,#24111f,#0d090d_65%)]" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {project.categories.slice(0, 2).map((category) => <span key={category} className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-pink-100 backdrop-blur">{category}</span>)}
          </div>
          {project.featured && <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-pink-300/20 bg-pink-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-pink-100 backdrop-blur"><Sparkles size={11} /> Featured</span>}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {hasPlayable && <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/65 text-pink-200 backdrop-blur"><Play size={15} fill="currentColor" /></span>}
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/65 text-white/75 backdrop-blur transition group-hover:bg-pink-500/20 group-hover:text-pink-100"><ArrowUpRight size={16} /></span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-2xl font-semibold text-white transition group-hover:text-pink-200">{project.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/56">{project.excerpt[lang]}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech) => <span key={tech} className="rounded-lg border border-white/7 bg-white/[.025] px-2.5 py-1.5 text-[11px] text-white/52">{tech}</span>)}
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/7 pt-4 text-xs text-white/38">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-pink-300/70" /> {timeline || (lang === 'vi' ? 'Đang cập nhật' : 'Ongoing')}</span>
            <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {project.views} {t('common.views')}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
