import { ArrowUpRight, CalendarDays, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { BlogPost } from '@/types/content'

export function BlogCard({ post }: { post: BlogPost }) {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'

  return (
    <article className="glass-panel neon-border rounded-3xl p-6 transition duration-300 hover:-translate-y-1">
      <div className="mb-5 flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-pink-500/8 px-3 py-1 text-[11px] text-pink-200">#{tag}</span>)}
      </div>
      <h3 className="font-display text-3xl font-semibold text-white">{post.title[lang]}</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">{post.excerpt[lang]}</p>
      <div className="mt-6 flex items-center gap-4 text-xs text-white/42">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {new Date(post.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
        <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {post.views} {t('common.views')}</span>
      </div>
      <Link to={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-300 hover:text-pink-200">
        {t('common.readMore')} <ArrowUpRight size={16} />
      </Link>
    </article>
  )
}
