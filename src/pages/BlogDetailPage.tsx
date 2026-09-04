import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getBlogPost, incrementBlogView } from '@/services/contentService'
import { Seo } from '@/components/Seo'

export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: post, isLoading } = useQuery({ queryKey: ['blog-post', slug], queryFn: () => getBlogPost(slug) })
  useEffect(() => { if (slug) void incrementBlogView(slug) }, [slug])

  if (isLoading) return <div className="site-container min-h-screen pt-40 text-white/50">Loading...</div>
  if (!post) return <div className="site-container min-h-screen pt-40"><h1 className="font-display text-5xl">Post not found.</h1></div>

  return (
    <>
      <Seo title={`${post.title[lang]} | Portfolio`} description={post.excerpt[lang]} path={`/blog/${post.slug}`} />
    <article className="site-container max-w-4xl pb-20 pt-36">
      <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-pink-200"><ArrowLeft size={16} /> {t('common.back')}</Link>
      <div className="mb-8 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-pink-500/8 px-3 py-1 text-xs text-pink-200">#{tag}</span>)}</div>
      <h1 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">{post.title[lang]}</h1>
      <p className="mt-5 text-lg leading-8 text-white/55">{post.excerpt[lang]}</p>
      <div className="mt-6 flex gap-5 text-xs text-white/40"><span className="inline-flex items-center gap-2"><CalendarDays size={15} /> {new Date(post.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span><span className="inline-flex items-center gap-2"><Eye size={15} /> {post.views} {t('common.views')}</span></div>
      <div className="prose-dark mt-12 border-t border-white/8 pt-8"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content[lang]}</ReactMarkdown></div>
    </article>
    </>
  )
}
