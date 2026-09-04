import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { BlogCard } from '@/components/BlogCard'
import { SectionTitle } from '@/components/SectionTitle'
import { useBlogPosts } from '@/hooks/useContent'

export function BlogPage() {
  const { data: posts = [] } = useBlogPosts()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('All')
  const tags = useMemo(() => ['All', ...Array.from(new Set(posts.flatMap((p) => p.tags)))], [posts])
  const filtered = useMemo(() => posts.filter((post) => {
    const q = query.toLowerCase().trim()
    return (tag === 'All' || post.tags.includes(tag)) && (!q || `${post.title.en} ${post.title.vi} ${post.tags.join(' ')}`.toLowerCase().includes(q))
  }), [posts, query, tag])

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow="Writing" title="Blog" />
      <div className="mx-auto mb-6 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/8 bg-white/[.025] px-4 py-3"><Search size={18} className="text-pink-300" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/30" /></div>
      <div className="mb-9 flex flex-wrap justify-center gap-2">{tags.map((item) => <button key={item} onClick={() => setTag(item)} className={`rounded-xl border px-3.5 py-2 text-xs ${tag === item ? 'border-pink-400/50 bg-pink-500/10 text-pink-200' : 'border-white/8 text-white/50'}`}>{item}</button>)}</div>
      <div className="grid gap-5 lg:grid-cols-2">{filtered.map((post) => <BlogCard key={post.id} post={post} />)}</div>
    </section>
  )
}
