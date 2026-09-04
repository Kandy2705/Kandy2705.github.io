import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Gamepad2,
  Github,
  Images,
  ListChecks,
  Maximize2,
  MonitorPlay,
  Smartphone,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProject, incrementProjectView } from '@/services/contentService'
import { Seo } from '@/components/Seo'
import { supabase } from '@/lib/supabase'

type ProjectExtras = {
  achievements_en: string[] | null
  achievements_vi: string[] | null
  responsibilities_en: string[] | null
  responsibilities_vi: string[] | null
  downloads_total: number | null
  downloads_ios: number | null
  downloads_android: number | null
  webgl_url: string | null
  playable: boolean | null
}

const compactNumber = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

const dateLabel = (value?: string | null, lang: 'en' | 'vi' = 'en') => {
  if (!value) return ''
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

const getVideoEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) return `https://www.youtube-nocookie.com/embed/${parsed.pathname.split('/').filter(Boolean)[0]}`
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return url
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      if (id) return `https://player.vimeo.com/video/${id}`
    }
  } catch {
    return null
  }
  return null
}

export function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const { i18n, t } = useTranslation()
  const lang: 'en' | 'vi' = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: project, isLoading } = useQuery({ queryKey: ['project', slug], queryFn: () => getProject(slug) })
  const { data: extras } = useQuery<ProjectExtras | null>({
    queryKey: ['project-showcase-extras', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('achievements_en, achievements_vi, responsibilities_en, responsibilities_vi, downloads_total, downloads_ios, downloads_android, webgl_url, playable')
        .eq('slug', slug)
        .maybeSingle()
      return data as ProjectExtras | null
    },
  })

  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => { if (slug) void incrementProjectView(slug) }, [slug])
  useEffect(() => { setGalleryIndex(0); setGameStarted(false); setLightboxOpen(false) }, [slug])

  const gallery = useMemo(() => {
    if (!project) return []
    return Array.from(new Set([project.coverImageUrl, ...(project.galleryUrls || [])].filter((value): value is string => Boolean(value))))
  }, [project])

  if (isLoading) return <div className="site-container min-h-screen pt-40 text-white/50">Loading...</div>
  if (!project) return <div className="site-container min-h-screen pt-40"><h1 className="font-display text-5xl">Project not found.</h1><Link to="/projects" className="mt-6 inline-flex text-pink-300">← Projects</Link></div>

  const labels = lang === 'vi'
    ? {
        overview: 'Tổng quan dự án',
        tryNow: 'Trải nghiệm ngay',
        achievements: 'Thành tựu nổi bật',
        responsibilities: 'Vai trò & trách nhiệm',
        details: 'Chi tiết dự án',
        timeline: 'Thời gian',
        status: 'Trạng thái',
        downloads: 'Thống kê lượt tải',
        totalDownloads: 'Tổng lượt tải',
        android: 'Google Play / Android',
        ios: 'App Store / iOS',
        gallery: 'Thư viện dự án',
        screenshots: 'ảnh',
        playBrowser: 'Chơi trực tiếp trên web',
        launchGame: 'Bắt đầu chơi',
        webglHint: 'Game được chạy trực tiếp bằng bản build Unity WebGL.',
        demoVideo: 'Video demo',
        openDemo: 'Mở demo',
        caseStudy: 'Chi tiết kỹ thuật',
      }
    : {
        overview: 'Project Overview',
        tryNow: 'Try It Now',
        achievements: 'Key Achievements',
        responsibilities: 'Key Responsibilities',
        details: 'Project Details',
        timeline: 'Timeline',
        status: 'Status',
        downloads: 'Download Statistics',
        totalDownloads: 'Total Downloads',
        android: 'Google Play / Android',
        ios: 'App Store / iOS',
        gallery: 'Project Gallery',
        screenshots: 'screenshots',
        playBrowser: 'Play directly in browser',
        launchGame: 'Start game',
        webglHint: 'The game runs directly from a Unity WebGL build.',
        demoVideo: 'Demo Video',
        openDemo: 'Open demo',
        caseStudy: 'Technical Case Study',
      }

  const achievements = (lang === 'vi' ? extras?.achievements_vi : extras?.achievements_en) || []
  const responsibilities = (lang === 'vi' ? extras?.responsibilities_vi : extras?.responsibilities_en) || []
  const downloadsTotal = Number(extras?.downloads_total || 0)
  const downloadsAndroid = Number(extras?.downloads_android || 0)
  const downloadsIos = Number(extras?.downloads_ios || 0)
  const hasDownloads = downloadsTotal > 0 || downloadsAndroid > 0 || downloadsIos > 0
  const webglUrl = extras?.webgl_url || null
  const playable = Boolean(extras?.playable && webglUrl)
  const videoEmbedUrl = project.videoUrl ? getVideoEmbedUrl(project.videoUrl) : null
  const timeline = [dateLabel(project.startDate, lang), dateLabel(project.endDate, lang)].filter(Boolean).join(' — ')

  const previousImage = () => setGalleryIndex((index) => (index - 1 + gallery.length) % gallery.length)
  const nextImage = () => setGalleryIndex((index) => (index + 1) % gallery.length)

  return (
    <>
      <Seo title={`${project.title} | Portfolio`} description={project.excerpt[lang]} path={`/projects/${project.slug}`} />
      <article className="site-container pb-24 pt-36">
        <Link to="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-pink-200"><ArrowLeft size={16} /> {t('common.back')}</Link>

        <div className="glass-panel neon-border overflow-hidden rounded-[2rem]">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#2a1422] via-[#130b12] to-[#080609] p-7 sm:p-10 lg:p-14">
            {project.coverImageUrl && <img src={project.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[.14] blur-[2px]" />}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a070a]/95 via-[#0c080c]/80 to-[#100811]/55" />
            <div className="absolute right-[-6rem] top-[-7rem] h-80 w-80 rounded-full bg-pink-500/15 blur-3xl" />
            <div className="relative max-w-4xl">
              <div className="mb-4 flex flex-wrap gap-2">{project.categories.map((category) => <span key={category} className="rounded-full border border-pink-300/20 bg-black/30 px-3 py-1 text-xs text-pink-200">{category}</span>)}</div>
              <h1 className="font-display text-5xl font-semibold sm:text-7xl">{project.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/64">{project.excerpt[lang]}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {playable && <button type="button" onClick={() => document.getElementById('play-game')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Gamepad2 size={17} /> {labels.playBrowser}</button>}
                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Github size={17} /> GitHub</a>}
                {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><ExternalLink size={17} /> {labels.openDemo}</a>}
              </div>
            </div>
          </section>

          {gallery.length > 0 && <section className="border-t border-white/7 p-5 sm:p-8 lg:p-10">
            <div className="mb-4 flex items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><Images size={15} /> {labels.gallery}</div><div className="mt-1 text-sm text-white/40">{gallery.length} {labels.screenshots}</div></div><div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-white/65">{galleryIndex + 1} / {gallery.length}</div></div>
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-black/40">
              <img src={gallery[galleryIndex]} alt={`${project.title} screenshot ${galleryIndex + 1}`} className="aspect-video w-full object-contain" />
              {gallery.length > 1 && <><button type="button" onClick={previousImage} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/65 backdrop-blur hover:bg-black/85"><ChevronLeft /></button><button type="button" onClick={nextImage} aria-label="Next image" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/65 backdrop-blur hover:bg-black/85"><ChevronRight /></button></>}
              <button type="button" onClick={() => setLightboxOpen(true)} aria-label="View full size" className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-black/65 backdrop-blur"><Maximize2 size={17} /></button>
            </div>
            {gallery.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{gallery.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setGalleryIndex(index)} className={`shrink-0 overflow-hidden rounded-lg border ${index === galleryIndex ? 'border-pink-400/80' : 'border-white/8'}`}><img src={image} alt="" className="h-16 w-24 object-cover" /></button>)}</div>}
          </section>}

          <section className="grid gap-8 border-t border-white/7 p-6 sm:p-8 lg:grid-cols-[.7fr_1.3fr] lg:p-10">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-xs uppercase tracking-[.18em] text-pink-300">{t('common.role')}</div><div className="mt-2 font-semibold">{project.role[lang]}</div></div>
              {timeline && <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><CalendarDays size={15} /> {labels.timeline}</div><div className="mt-2 font-semibold">{timeline}</div></div>}
              {project.status?.[lang] && <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-xs uppercase tracking-[.18em] text-pink-300">{labels.status}</div><div className="mt-2 font-semibold">{project.status[lang]}</div></div>}
              {project.teamSize && <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><UsersRound size={15} /> {t('common.team')}</div><div className="mt-2 font-semibold">{project.teamSize}</div></div>}
              <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><Eye size={15} /> {t('common.views')}</div><div className="mt-2 font-semibold">{project.views}</div></div>
              <div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-xs uppercase tracking-[.18em] text-pink-300">{t('common.technologies')}</div><div className="mt-3 flex flex-wrap gap-2">{project.technologies.map((tech) => <span key={tech} className="rounded-lg bg-white/[.035] px-2.5 py-1.5 text-xs text-white/58">{tech}</span>)}</div></div>
            </aside>

            <div className="space-y-8">
              <section><div className="mb-3 text-xs uppercase tracking-[.18em] text-pink-300">{labels.overview}</div><p className="text-lg leading-8 text-white/72">{project.excerpt[lang]}</p></section>

              {(project.appStoreUrl || project.playStoreUrl || project.demoUrl || project.githubUrl) && <section className="rounded-2xl border border-pink-400/12 bg-pink-500/[.035] p-5"><h2 className="font-display text-3xl font-semibold">{labels.tryNow}</h2><div className="mt-4 flex flex-wrap gap-3">{project.playStoreUrl && <a href={project.playStoreUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Smartphone size={17} /> Google Play</a>}{project.appStoreUrl && <a href={project.appStoreUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Smartphone size={17} /> App Store</a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><ExternalLink size={17} /> Demo</a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Github size={17} /> Source</a>}</div></section>}

              {achievements.length > 0 && <section><h2 className="flex items-center gap-2 font-display text-3xl font-semibold"><Trophy size={22} className="text-pink-300" /> {labels.achievements}</h2><div className="mt-4 grid gap-3">{achievements.map((item, index) => <div key={`${item}-${index}`} className="rounded-xl border border-white/7 bg-black/20 p-4 text-sm leading-6 text-white/68"><span className="mr-2 text-pink-300">{String(index + 1).padStart(2, '0')}.</span>{item}</div>)}</div></section>}

              {responsibilities.length > 0 && <section><h2 className="flex items-center gap-2 font-display text-3xl font-semibold"><ListChecks size={22} className="text-pink-300" /> {labels.responsibilities}</h2><div className="mt-4 space-y-3">{responsibilities.map((item, index) => <div key={`${item}-${index}`} className="flex gap-3 rounded-xl border border-white/7 bg-black/20 p-4 text-sm leading-6 text-white/68"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400 shadow-[0_0_12px_rgba(255,92,159,.8)]" />{item}</div>)}</div></section>}

              {project.content[lang] && <section><h2 className="mb-4 font-display text-3xl font-semibold">{labels.caseStudy}</h2><div className="prose-dark max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content[lang]}</ReactMarkdown></div></section>}
            </div>
          </section>

          {hasDownloads && <section className="border-t border-white/7 p-6 sm:p-8 lg:p-10"><div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><Download size={15} /> {labels.downloads}</div><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-sm text-white/45">{labels.totalDownloads}</div><div className="mt-2 font-display text-4xl font-semibold pink-gradient-text">{compactNumber(downloadsTotal || downloadsAndroid + downloadsIos)}</div></div><div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-sm text-white/45">{labels.android}</div><div className="mt-2 font-display text-4xl font-semibold">{compactNumber(downloadsAndroid)}</div></div><div className="rounded-2xl border border-white/7 bg-black/20 p-5"><div className="text-sm text-white/45">{labels.ios}</div><div className="mt-2 font-display text-4xl font-semibold">{compactNumber(downloadsIos)}</div></div></div></section>}

          {project.videoUrl && <section className="border-t border-white/7 p-6 sm:p-8 lg:p-10"><h2 className="mb-5 flex items-center gap-2 font-display text-3xl font-semibold"><MonitorPlay size={22} className="text-pink-300" /> {labels.demoVideo}</h2><div className="overflow-hidden rounded-2xl border border-white/8 bg-black">{videoEmbedUrl ? <iframe src={videoEmbedUrl} title={`${project.title} demo`} className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen /> : <video src={project.videoUrl} controls playsInline className="aspect-video w-full bg-black object-contain" />}</div></section>}

          {playable && <section id="play-game" className="scroll-mt-32 border-t border-white/7 p-6 sm:p-8 lg:p-10"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="flex items-center gap-2 font-display text-3xl font-semibold"><Gamepad2 size={24} className="text-pink-300" /> {labels.playBrowser}</h2><p className="mt-1 text-sm text-white/42">{labels.webglHint}</p></div>{!gameStarted && <button type="button" onClick={() => setGameStarted(true)} className="neon-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"><Gamepad2 size={17} /> {labels.launchGame}</button>}</div>{gameStarted ? <div className="overflow-hidden rounded-2xl border border-pink-400/20 bg-black shadow-[0_0_60px_rgba(255,47,134,.1)]"><iframe src={webglUrl || undefined} title={`${project.title} WebGL game`} className="h-[72vh] min-h-[520px] w-full bg-black" allow="autoplay; fullscreen; gamepad" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-modals" allowFullScreen /></div> : <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-pink-400/20 bg-gradient-to-br from-pink-500/[.05] to-black/20 text-center"><div><Gamepad2 size={52} className="mx-auto text-pink-300/70" /><div className="mt-4 font-display text-3xl">{project.title}</div><div className="mt-2 text-sm text-white/40">Unity WebGL</div></div></div>}</section>}
        </div>
      </article>

      {lightboxOpen && gallery.length > 0 && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true"><button type="button" onClick={() => setLightboxOpen(false)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60"><X /></button><img src={gallery[galleryIndex]} alt={`${project.title} screenshot ${galleryIndex + 1}`} className="max-h-[88vh] max-w-[94vw] rounded-xl object-contain" />{gallery.length > 1 && <><button type="button" onClick={previousImage} className="absolute left-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60"><ChevronLeft /></button><button type="button" onClick={nextImage} className="absolute right-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60"><ChevronRight /></button></>}</div>}
    </>
  )
}
