import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Eye, Images, Maximize2, Video, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getBlogPost, incrementBlogView } from '@/services/contentService'
import { Seo } from '@/components/Seo'

function getVideoEmbedUrl(url: string) {
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

export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: post, isLoading } = useQuery({ queryKey: ['blog-post', slug], queryFn: () => getBlogPost(slug) })
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => { if (slug) void incrementBlogView(slug) }, [slug])
  useEffect(() => { setGalleryIndex(0); setLightboxOpen(false) }, [slug])

  const gallery = useMemo(() => {
    if (!post) return []
    return Array.from(new Set([post.coverImageUrl, ...(post.galleryUrls || [])].filter((value): value is string => Boolean(value))))
  }, [post])

  if (isLoading) return <div className="site-container min-h-screen pt-40 text-white/50">Loading...</div>
  if (!post) return <div className="site-container min-h-screen pt-40"><h1 className="font-display text-5xl">Post not found.</h1></div>

  const labels = lang === 'vi'
    ? { gallery: 'Thư viện ảnh', media: 'Video trong bài viết' }
    : { gallery: 'Image Gallery', media: 'Post Videos' }

  const previousImage = () => setGalleryIndex((index) => (index - 1 + gallery.length) % gallery.length)
  const nextImage = () => setGalleryIndex((index) => (index + 1) % gallery.length)

  return (
    <>
      <Seo title={`${post.title[lang]} | Portfolio`} description={post.excerpt[lang]} path={`/blog/${post.slug}`} />
      <article className="site-container max-w-5xl pb-20 pt-36">
        <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-pink-200"><ArrowLeft size={16} /> {t('common.back')}</Link>
        <div className="mb-8 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-pink-500/8 px-3 py-1 text-xs text-pink-200">#{tag}</span>)}</div>
        <h1 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">{post.title[lang]}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/55">{post.excerpt[lang]}</p>
        <div className="mt-6 flex gap-5 text-xs text-white/40"><span className="inline-flex items-center gap-2"><CalendarDays size={15} /> {new Date(post.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span><span className="inline-flex items-center gap-2"><Eye size={15} /> {post.views} {t('common.views')}</span></div>

        {gallery.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><Images size={15} /> {labels.gallery}</div><div className="mt-1 text-sm text-white/40">{gallery.length} images</div></div><div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-white/65">{galleryIndex + 1} / {gallery.length}</div></div>
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/8 bg-black/40 shadow-[0_25px_80px_rgba(255,47,134,.08)]">
              <img src={gallery[galleryIndex]} alt={`${post.title[lang]} image ${galleryIndex + 1}`} className="aspect-video w-full object-contain" />
              {gallery.length > 1 && <><button type="button" onClick={previousImage} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/65 backdrop-blur hover:bg-black/85"><ChevronLeft /></button><button type="button" onClick={nextImage} aria-label="Next image" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/65 backdrop-blur hover:bg-black/85"><ChevronRight /></button></>}
              <button type="button" onClick={() => setLightboxOpen(true)} aria-label="View full size" className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-black/65 backdrop-blur"><Maximize2 size={17} /></button>
            </div>
            {gallery.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{gallery.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setGalleryIndex(index)} className={`shrink-0 overflow-hidden rounded-lg border ${index === galleryIndex ? 'border-pink-400/80' : 'border-white/8'}`}><img src={image} alt="" className="h-16 w-24 object-cover" /></button>)}</div>}
          </section>
        )}

        {(post.videoUrls || []).length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-pink-300"><Video size={15} /> {labels.media}</div>
            <div className="grid gap-5">
              {(post.videoUrls || []).map((url, index) => {
                const embed = getVideoEmbedUrl(url)
                return <div key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-white/8 bg-black/45">{embed ? <iframe src={embed} title={`${post.title[lang]} video ${index + 1}`} className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <video src={url} controls preload="metadata" className="aspect-video w-full bg-black object-contain" />}</div>
              })}
            </div>
          </section>
        )}

        <div className="prose-dark mt-12 border-t border-white/8 pt-8"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content[lang]}</ReactMarkdown></div>
      </article>

      {lightboxOpen && gallery[galleryIndex] && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/90 p-4 backdrop-blur-md" onClick={() => setLightboxOpen(false)}><button type="button" onClick={() => setLightboxOpen(false)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/65"><X /></button><img src={gallery[galleryIndex]} alt="" className="max-h-[90vh] max-w-[94vw] rounded-2xl object-contain shadow-[0_0_80px_rgba(255,47,134,.18)]" onClick={(event) => event.stopPropagation()} /></div>}
    </>
  )
}
