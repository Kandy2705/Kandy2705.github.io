import { CalendarDays, GraduationCap, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionTitle } from '@/components/SectionTitle'
import { useEducation } from '@/hooks/useContent'
import type { Education } from '@/types/content'

function scoreBadges(item: Education) {
  const mode = item.scoreDisplay || 'both'
  const badges: { label: string; value: string }[] = []

  if ((mode === 'both' || mode === 'gpa4') && item.gpa4 != null) {
    badges.push({ label: 'GPA', value: `${item.gpa4.toFixed(2).replace(/\.00$/, '')} / 4.0` })
  }
  if ((mode === 'both' || mode === 'score10') && item.score10 != null) {
    badges.push({ label: '10-point', value: `${item.score10.toFixed(2).replace(/\.00$/, '')} / 10` })
  }

  // Backward compatibility for older education entries that only have the old text field.
  if (!badges.length && item.gpa) badges.push({ label: 'Score', value: item.gpa })
  return badges
}

export function EducationPage() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: education = [] } = useEducation()

  const format = (value?: string | null) => value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' })
    : t('common.current')

  return (
    <section className="site-container pb-24 pt-36">
      <SectionTitle eyebrow={lang === 'vi' ? 'Hành trình học tập' : 'Academic journey'} title={t('sections.education')} />

      <div className="mx-auto max-w-5xl space-y-5">
        {education.map((item, index) => {
          const scores = scoreBadges(item)
          return (
            <article key={item.id} className="glass-panel neon-border relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-pink-500/10 blur-3xl" />
              <div className="relative grid gap-6 md:grid-cols-[auto_1fr]">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-pink-300/20 bg-pink-500/[.07] text-pink-300 shadow-neon">
                  <GraduationCap size={25} />
                </div>

                <div>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[.2em] text-pink-300/80">{String(index + 1).padStart(2, '0')}</div>
                      <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{item.institution}</h2>
                      <p className="mt-2 text-base text-white/72">{item.degree[lang]}</p>
                      <p className="mt-1 text-sm text-pink-200/70">{item.field[lang]}</p>
                    </div>

                    <div className="shrink-0 space-y-2 sm:min-w-[210px]">
                      <div className="rounded-2xl border border-white/7 bg-black/20 px-4 py-3 text-xs text-white/45">
                        <div className="flex items-center gap-2"><CalendarDays size={14} className="text-pink-300" /> {format(item.startDate)} — {item.current ? t('common.current') : format(item.endDate)}</div>
                      </div>
                      {scores.length > 0 && (
                        <div className={`grid gap-2 ${scores.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {scores.map((score) => (
                            <div key={score.label} className="rounded-2xl border border-pink-300/15 bg-pink-500/[.035] px-4 py-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-pink-300/75"><Sparkles size={12} /> {score.label}</div>
                              <div className="mt-1.5 text-sm font-semibold text-white/88">{score.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.description?.[lang] && <p className="mt-5 max-w-3xl text-sm leading-7 text-white/54">{item.description[lang]}</p>}
                  {item.thesis?.[lang] && (
                    <div className="mt-5 rounded-2xl border border-pink-300/10 bg-pink-500/[.025] p-4">
                      <div className="text-xs uppercase tracking-[.18em] text-pink-300">{lang === 'vi' ? 'Đề tài / nghiên cứu' : 'Thesis / research'}</div>
                      <p className="mt-2 text-sm leading-6 text-white/60">{item.thesis[lang]}</p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}

        {!education.length && <div className="glass-panel rounded-3xl py-20 text-center text-white/45">{lang === 'vi' ? 'Chưa có dữ liệu học vấn.' : 'No education entries yet.'}</div>}
      </div>
    </section>
  )
}
