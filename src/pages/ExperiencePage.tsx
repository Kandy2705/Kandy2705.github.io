import { BriefcaseBusiness, CalendarDays, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionTitle } from '@/components/SectionTitle'
import { useExperiences } from '@/hooks/useContent'

export function ExperiencePage() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: experiences = [] } = useExperiences()

  const format = (value?: string | null) => value ? new Date(value).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' }) : t('common.current')

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow="Professional timeline" title={t('sections.experience')} />
      <div className="mx-auto max-w-4xl">
        {experiences.map((item, index) => (
          <div key={item.id} className="relative grid gap-5 pb-10 sm:grid-cols-[52px_1fr]">
            <div className="relative hidden sm:block"><span className="absolute left-1/2 top-1 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-2xl border border-pink-300/25 bg-[#120b12] text-pink-300 shadow-neon"><BriefcaseBusiness size={19} /></span>{index < experiences.length - 1 && <span className="timeline-line absolute left-1/2 top-12 h-[calc(100%-2.25rem)] w-px -translate-x-1/2" />}</div>
            <div className="glass-panel rounded-3xl p-6 sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="font-display text-3xl font-semibold">{item.position[lang]}</h2><p className="mt-1 text-pink-200/80">{item.company}</p></div><div className="text-xs text-white/42"><div className="flex items-center gap-2"><CalendarDays size={14} /> {format(item.startDate)} — {item.current ? t('common.current') : format(item.endDate)}</div><div className="mt-2 flex items-center gap-2"><MapPin size={14} /> {item.location}</div></div></div>
              <p className="mt-5 text-sm leading-7 text-white/55">{item.description[lang]}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/50">{item.responsibilities.map((responsibility, i) => <li key={i} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />{responsibility[lang]}</li>)}</ul>
              <div className="mt-5 flex flex-wrap gap-2">{item.technologies.map((tech) => <span key={tech} className="rounded-lg bg-white/[.035] px-2.5 py-1.5 text-xs text-white/55">{tech}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
