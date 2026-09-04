import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Eye, Github, UsersRound } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProject, incrementProjectView } from '@/services/contentService'
import { Seo } from '@/components/Seo'

export function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: project, isLoading } = useQuery({ queryKey: ['project', slug], queryFn: () => getProject(slug) })

  useEffect(() => { if (slug) void incrementProjectView(slug) }, [slug])

  if (isLoading) return <div className="site-container min-h-screen pt-40 text-white/50">Loading...</div>
  if (!project) return <div className="site-container min-h-screen pt-40"><h1 className="font-display text-5xl">Project not found.</h1><Link to="/projects" className="mt-6 inline-flex text-pink-300">← Projects</Link></div>

  return (
    <>
      <Seo title={`${project.title} | Portfolio`} description={project.excerpt[lang]} path={`/projects/${project.slug}`} />
    <article className="site-container pb-20 pt-36">
      <Link to="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-pink-200"><ArrowLeft size={16} /> {t('common.back')}</Link>
      <div className="glass-panel neon-border overflow-hidden rounded-[2rem]">
        <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-[#2a1422] via-[#130b12] to-[#080609] p-7 sm:p-10 lg:p-14">
          <div className="absolute right-[-6rem] top-[-7rem] h-80 w-80 rounded-full bg-pink-500/15 blur-3xl" />
          <div className="relative max-w-4xl">
            <div className="mb-4 flex flex-wrap gap-2">{project.categories.map((category) => <span key={category} className="rounded-full border border-pink-300/20 bg-black/30 px-3 py-1 text-xs text-pink-200">{category}</span>)}</div>
            <h1 className="font-display text-5xl font-semibold sm:text-7xl">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">{project.excerpt[lang]}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Github size={17} /> GitHub</a>}
              {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><ExternalLink size={17} /> Demo</a>}
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[.72fr_1.28fr] lg:p-10">
          <aside className="space-y-5">
            <div className="rounded-2xl border border-white/7 bg-black/20 p-5">
              <div className="text-xs uppercase tracking-[.18em] text-pink-300">{t('common.role')}</div><div className="mt-2 font-semibold">{project.role[lang]}</div>
            </div>
            {project.teamSize && <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><UsersRound size={15} /> {t('common.team')}</div><div className="mt-2 font-semibold">{project.teamSize}</div></div>}
            <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><Eye size={15} /> {t('common.views')}</div><div className="mt-2 font-semibold">{project.views}</div></div>
            <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-xs uppercase tracking-[.18em] text-pink-300">{t('common.technologies')}</div><div className="mt-3 flex flex-wrap gap-2">{project.technologies.map((tech) => <span key={tech} className="rounded-lg bg-white/[.035] px-2.5 py-1.5 text-xs text-white/58">{tech}</span>)}</div></div>
          </aside>
          <div className="prose-dark max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content[lang]}</ReactMarkdown></div>
        </div>
      </div>
    </article>
    </>
  )
}
