import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Microscope,
  Music2,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlogCard } from '@/components/BlogCard'
import { CertificateModal } from '@/components/CertificateModal'
import { ContactForm } from '@/components/ContactForm'
import { ProjectCard } from '@/components/ProjectCard'
import { SectionTitle } from '@/components/SectionTitle'
import { SkillsSection } from '@/components/SkillsSection'
import {
  useAwards,
  useBlogPosts,
  useCertificates,
  useEducation,
  useExperiences,
  useLanguages,
  useProjects,
  useResearch,
  useSiteProfile,
  useSkills,
} from '@/hooks/useContent'
import type { Certificate, Education } from '@/types/content'

function educationScoreBadges(item: Education) {
  const mode = item.scoreDisplay || 'both'
  const scores: { label: string; value: string }[] = []

  if ((mode === 'both' || mode === 'gpa4') && item.gpa4 != null) {
    scores.push({ label: 'GPA', value: `${item.gpa4.toFixed(2).replace(/\.00$/, '')} / 4.0` })
  }

  if ((mode === 'both' || mode === 'score10') && item.score10 != null) {
    scores.push({ label: '10-point', value: `${item.score10.toFixed(2).replace(/\.00$/, '')} / 10` })
  }

  if (!scores.length && item.gpa) scores.push({ label: 'Score', value: item.gpa })
  return scores
}

function formatFollowerCount(value?: number) {
  if (!value) return ''
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(value)
}

export function HomePage() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: profile } = useSiteProfile()
  const { data: projects = [] } = useProjects()
  const { data: skills = [] } = useSkills()
  const { data: experiences = [] } = useExperiences()
  const { data: education = [] } = useEducation()
  const { data: certificates = [] } = useCertificates()
  const { data: awards = [] } = useAwards()
  const { data: research = [] } = useResearch()
  const { data: languages = [] } = useLanguages()
  const { data: blog = [] } = useBlogPosts()
  const [profileFailed, setProfileFailed] = useState(false)
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null)

  const featuredProjects = useMemo(() => projects.filter((p) => p.featured).slice(0, 3), [projects])
  const featuredBlog = blog.slice(0, 2)

  if (!profile) return null

  return (
    <>
      <section className="site-container hero-grid">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
          className="profile-wrap relative"
        >
          <div className="profile-frame mx-auto">
            <div className="profile-inner">
              {!profileFailed ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.fullName}
                  onError={() => setProfileFailed(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <div className="text-center text-white/45">
                    <UserRound size={88} strokeWidth={1} className="mx-auto text-pink-300/60" />
                    <p className="mt-4 text-sm">Drop your photo at</p>
                    <code className="mt-2 inline-block rounded-lg bg-black/30 px-3 py-2 text-xs text-pink-200">public/images/profile/profile.jpg</code>
                  </div>
                </div>
              )}
            </div>
            <div className="profile-orbit" />
            <span className="sparkle left-[8%] top-[22%]" />
            <span className="sparkle bottom-[17%] right-[3%]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .7, delay: .08 }}
          className="hero-copy"
        >
          <div className="mb-4 inline-flex items-center gap-2 text-sm text-pink-300">
            <Sparkles size={16} /> {t('hero.hello')} <span className="font-semibold text-white">{profile.fullName}</span>
          </div>
          <h1 className="font-display text-6xl font-semibold leading-[.92] sm:text-7xl lg:text-[6.6rem]">
            <span className="block text-white">{profile.brand}</span>
            <span className="pink-gradient-text block">{profile.role[lang]}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/68">{profile.tagline[lang]}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/52">{profile.about[lang]}</p>

          <div className="mt-8 flex flex-wrap gap-3 lg:justify-start">
            <Link to="/projects" className="neon-button inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold">
              {t('hero.viewWork')} <ArrowRight size={17} />
            </Link>
            {(lang === 'vi' ? profile.cvViUrl : profile.cvEnUrl) && (
              <a href={lang === 'vi' ? profile.cvViUrl : profile.cvEnUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white/82">
                <Download size={17} /> {t('hero.downloadCv')}
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/42 lg:justify-start">
            <span className="inline-flex items-center gap-2"><MapPin size={15} className="text-pink-300" /> {profile.city[lang]}</span>
            <span className="inline-flex items-center gap-2"><Mail size={15} className="text-pink-300" /> {profile.email}</span>
          </div>
        </motion.div>
      </section>

      <section className="site-container pb-6">
        <div className="glass-panel neon-border grid gap-7 rounded-3xl p-6 md:grid-cols-[1fr_1.35fr] md:p-8">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[.24em] text-pink-300">{t('sections.about')}</div>
            <h2 className="font-display text-4xl font-semibold">Crafting experiences through <span className="text-pink-300">code & curiosity.</span></h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-l border-pink-200/10 pl-4"><div className="text-xs text-white/40">Focus</div><div className="mt-1 font-semibold text-white/85">Unity · Game · AR/VR</div></div>
            <div className="border-l border-pink-200/10 pl-4"><div className="text-xs text-white/40">Based in</div><div className="mt-1 font-semibold text-white/85">{profile.city[lang]}</div></div>
            <div className="border-l border-pink-200/10 pl-4"><div className="text-xs text-white/40">Status</div><div className="mt-1 font-semibold text-pink-200">{t('hero.available')}</div></div>
            {profile.tiktokUrl && profile.tiktokFollowers ? (
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="group border-l border-pink-200/10 pl-4 transition hover:border-pink-300/35"
                aria-label="TikTok profile"
              >
                <div className="flex items-center gap-1.5 text-xs text-white/40"><Music2 size={13} className="text-pink-300" /> TikTok</div>
                <div className="mt-1 font-semibold text-pink-200 transition group-hover:text-pink-100">
                  {formatFollowerCount(profile.tiktokFollowers)} {lang === 'vi' ? 'người theo dõi' : 'followers'}
                </div>
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <SectionTitle eyebrow="Selected work" title={t('sections.projects')} />
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
          </div>
          <div className="mt-7 text-center"><Link to="/projects" className="outline-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm text-pink-200">{t('common.viewAll')} <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <SkillsSection skills={skills} />

      <section className="section-space pt-4">
        <div className="site-container grid gap-6 lg:grid-cols-2">
          <div>
            <SectionTitle align="left" eyebrow="Timeline" title={t('sections.experience')} />
            <div className="space-y-4">
              {experiences.slice(0, 3).map((item) => (
                <div key={item.id} className="glass-panel rounded-2xl p-5">
                  <div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pink-500/8 text-pink-300"><BriefcaseBusiness size={20} /></span><div><h3 className="font-semibold">{item.position[lang]}</h3><p className="mt-1 text-sm text-pink-200/75">{item.company}</p><p className="mt-3 text-sm leading-6 text-white/52">{item.description[lang]}</p></div></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle align="left" eyebrow="Academic" title={t('sections.education')} />
            <div className="space-y-4">
              {education.slice(0, 3).map((item) => {
                const scores = educationScoreBadges(item)
                return (
                  <div key={item.id} className="glass-panel rounded-2xl p-5">
                    <div className="flex gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pink-500/8 text-pink-300"><GraduationCap size={20} /></span>
                      <div>
                        <h3 className="font-semibold">{item.institution}</h3>
                        <p className="mt-1 text-sm text-white/66">{item.degree[lang]}</p>
                        {scores.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {scores.map((score) => (
                              <span key={`${item.id}-${score.label}`} className="rounded-lg border border-pink-300/12 bg-pink-500/[.035] px-2.5 py-1 text-xs text-pink-200/80">
                                {score.label} {score.value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-pink-200/75">{item.field[lang]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5"><Link to="/education" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-pink-200">{t('common.viewAll')} <ArrowRight size={15} /></Link></div>
          </div>
        </div>
      </section>

      <section className="section-space pt-4">
        <div className="site-container">
          <SectionTitle eyebrow="Proof of work" title={`${t('sections.certificates')} · ${t('sections.awards')}`} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.slice(0, 3).map((certificate) => (
              <button key={certificate.id} onClick={() => setActiveCertificate(certificate)} className="glass-panel rounded-2xl p-5 text-left transition hover:-translate-y-1 hover:border-pink-300/30">
                <Award className="mb-4 text-pink-300" size={24} /><h3 className="font-semibold">{certificate.title[lang]}</h3><p className="mt-2 text-sm text-white/45">{certificate.issuer}</p>
              </button>
            ))}
            {awards.slice(0, 3).map((item) => (
              <div key={item.id} className="glass-panel rounded-2xl p-5"><Sparkles className="mb-4 text-pink-300" size={24} /><h3 className="font-semibold">{item.title[lang]}</h3><p className="mt-2 text-sm text-white/45">{item.issuer}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-4">
        <div className="site-container grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3 text-pink-300"><Microscope size={21} /><span className="text-xs font-semibold uppercase tracking-[.24em]">{t('sections.research')}</span></div>
            {research.map((item) => <div key={item.id}><h3 className="font-display text-3xl font-semibold">{item.title[lang]}</h3><p className="mt-2 text-sm text-pink-200/70">{item.venue}</p><p className="mt-4 text-sm leading-7 text-white/52">{item.description?.[lang]}</p></div>)}
          </div>
          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3 text-pink-300"><LanguagesIcon size={21} /><span className="text-xs font-semibold uppercase tracking-[.24em]">{t('sections.languages')}</span></div>
            <div className="space-y-4">{languages.map((item) => <div key={item.id} className="rounded-xl border border-white/7 p-4"><div className="font-semibold">{item.name[lang]}</div><div className="mt-1 text-sm text-white/48">{item.level[lang]}</div></div>)}</div>
          </div>
        </div>
      </section>

      <section className="section-space pt-4">
        <div className="site-container">
          <SectionTitle eyebrow="Notes & ideas" title={t('sections.blog')} />
          <div className="grid gap-5 lg:grid-cols-2">{featuredBlog.map((post) => <BlogCard key={post.id} post={post} />)}</div>
        </div>
      </section>

      <section id="contact" className="section-space pt-4">
        <div className="site-container">
          <div className="glass-panel neon-border grid gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-[.75fr_1.25fr] lg:p-10">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.24em] text-pink-300">{t('sections.contact')}</div>
              <h2 className="mt-3 font-display text-4xl font-semibold">{t('contact.title')} <span className="text-pink-300">{t('contact.subtitle')}</span></h2>
              <div className="mt-7 space-y-3 text-sm text-white/55">
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-pink-200"><Mail size={17} className="text-pink-300" /> {profile.email}</a>
                <a href={`tel:${profile.phone}`} className="flex items-center gap-3 hover:text-pink-200"><Phone size={17} className="text-pink-300" /> {profile.phone}</a>
                <span className="flex items-center gap-3"><MapPin size={17} className="text-pink-300" /> {profile.city[lang]}</span>
              </div>
              <div className="mt-6 flex gap-3">
                <a href={profile.github} target="_blank" rel="noreferrer" className="outline-button grid h-10 w-10 place-items-center rounded-xl" aria-label="GitHub"><Github size={18} /></a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="outline-button grid h-10 w-10 place-items-center rounded-xl" aria-label="LinkedIn"><Linkedin size={18} /></a>
                <a href={profile.facebook} target="_blank" rel="noreferrer" className="outline-button grid h-10 w-10 place-items-center rounded-xl" aria-label="Facebook"><ExternalLink size={18} /></a>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
    </>
  )
}
