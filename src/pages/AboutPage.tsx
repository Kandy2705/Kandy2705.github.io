import { useMemo, useState } from 'react'
import { Award, BookOpen, GraduationCap, Languages as LanguagesIcon, Microscope, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CertificateModal } from '@/components/CertificateModal'
import { SectionTitle } from '@/components/SectionTitle'
import { useAwards, useCertificates, useEducation, useLanguages, useResearch, useSiteProfile, useSkills } from '@/hooks/useContent'
import type { Certificate } from '@/types/content'

export function AboutPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: profile } = useSiteProfile()
  const { data: skills = [] } = useSkills()
  const { data: education = [] } = useEducation()
  const { data: certificates = [] } = useCertificates()
  const { data: awards = [] } = useAwards()
  const { data: research = [] } = useResearch()
  const { data: languages = [] } = useLanguages()
  const [selected, setSelected] = useState<Certificate | null>(null)
  const groups = useMemo(() => {
    const map = new Map<string, string[]>()
    skills.forEach((skill) => map.set(skill.category, [...(map.get(skill.category) || []), skill.name]))
    return [...map.entries()]
  }, [skills])

  if (!profile) return null

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow="Profile" title="About" />
      <div className="glass-panel neon-border rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <div className="text-xs uppercase tracking-[.22em] text-pink-300">{profile.role[lang]}</div>
            <h1 className="mt-3 font-display text-5xl font-semibold">{profile.fullName}</h1>
          </div>
          <p className="text-base leading-8 text-white/58">{profile.about[lang]}</p>
        </div>
      </div>

      <div className="section-space pb-2">
        <SectionTitle eyebrow="Technical stack" title="Skills & Expertise" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(([group, names]) => <div key={group} className="glass-panel rounded-2xl p-5"><h3 className="font-semibold text-pink-200">{group}</h3><div className="mt-4 flex flex-wrap gap-2">{names.map((name) => <span key={name} className="rounded-lg border border-white/7 px-3 py-2 text-xs text-white/56">{name}</span>)}</div></div>)}
        </div>
      </div>

      <div className="section-space pb-2">
        <SectionTitle eyebrow="Academic path" title="Education" />
        <div className="grid gap-4 lg:grid-cols-2">{education.map((item) => <div key={item.id} className="glass-panel rounded-2xl p-6"><GraduationCap className="mb-4 text-pink-300" /><h3 className="font-display text-2xl font-semibold">{item.institution}</h3><p className="mt-2 text-sm text-white/60">{item.degree[lang]} · {item.field[lang]}</p>{item.gpa && <p className="mt-3 text-xs text-pink-200">GPA {item.gpa}</p>}{item.thesis && <div className="mt-4 rounded-xl bg-pink-500/5 p-4 text-sm text-white/55"><span className="font-semibold text-pink-200">Thesis: </span>{item.thesis[lang]}</div>}</div>)}</div>
      </div>

      <div className="section-space pb-2">
        <SectionTitle eyebrow="Credentials" title="Certificates & Awards" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => <button key={certificate.id} onClick={() => setSelected(certificate)} className="glass-panel rounded-2xl p-5 text-left transition hover:-translate-y-1"><Award className="mb-4 text-pink-300" /><h3 className="font-semibold">{certificate.title[lang]}</h3><p className="mt-2 text-sm text-white/45">{certificate.issuer}</p></button>)}
          {awards.map((item) => <div key={item.id} className="glass-panel rounded-2xl p-5"><Sparkles className="mb-4 text-pink-300" /><h3 className="font-semibold">{item.title[lang]}</h3><p className="mt-2 text-sm text-white/45">{item.issuer}</p>{item.certificateIds.length > 0 && <p className="mt-3 text-xs text-pink-200">Linked certificate: {item.certificateIds.length}</p>}</div>)}
        </div>
      </div>

      <div className="section-space pb-2">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass-panel rounded-3xl p-6"><div className="mb-5 flex items-center gap-3 text-pink-300"><Microscope /><span className="text-xs font-semibold uppercase tracking-[.22em]">Research</span></div>{research.map((item) => <div key={item.id}><h3 className="font-display text-3xl font-semibold">{item.title[lang]}</h3><p className="mt-2 text-sm text-pink-200/70">{item.venue}</p><p className="mt-4 text-sm leading-7 text-white/52">{item.description?.[lang]}</p></div>)}</div>
          <div className="glass-panel rounded-3xl p-6"><div className="mb-5 flex items-center gap-3 text-pink-300"><LanguagesIcon /><span className="text-xs font-semibold uppercase tracking-[.22em]">Languages</span></div><div className="space-y-3">{languages.map((item) => <div key={item.id} className="rounded-xl border border-white/7 p-4"><h3 className="font-semibold">{item.name[lang]}</h3><p className="mt-1 text-sm text-white/45">{item.level[lang]}</p></div>)}</div></div>
        </div>
      </div>

      <CertificateModal certificate={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
