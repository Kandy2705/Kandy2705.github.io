import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProjectCard } from '@/components/ProjectCard'
import { SectionTitle } from '@/components/SectionTitle'
import { useProjects } from '@/hooks/useContent'
import { projectCategories } from '@/lib/constants'
import type { ProjectCategory } from '@/types/content'

type SortMode = 'default' | 'featured' | 'newest' | 'az'

export function ProjectsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: projects = [] } = useProjects()
  const [category, setCategory] = useState<'All' | ProjectCategory>('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('default')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = projects.filter((project) => {
      const categoryMatches = category === 'All' || project.categories.includes(category)
      const searchMatches = !q || [project.title, project.excerpt[lang], ...project.technologies, ...project.categories].join(' ').toLowerCase().includes(q)
      return categoryMatches && searchMatches
    })

    if (sort === 'featured') return [...result].sort((a, b) => Number(b.featured) - Number(a.featured))
    if (sort === 'newest') return [...result].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
    if (sort === 'az') return [...result].sort((a, b) => a.title.localeCompare(b.title))
    return result
  }, [projects, category, query, sort, lang])

  const countFor = (item: 'All' | ProjectCategory) => item === 'All' ? projects.length : projects.filter((project) => project.categories.includes(item)).length
  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'default', label: lang === 'vi' ? 'Mặc định' : 'Default' },
    { value: 'featured', label: lang === 'vi' ? 'Nổi bật' : 'Featured' },
    { value: 'newest', label: lang === 'vi' ? 'Mới nhất' : 'Newest' },
    { value: 'az', label: 'A–Z' },
  ]

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow="Portfolio archive" title={t('projects.allProjects')} />

      <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search size={18} className="text-pink-300" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('projects.searchPlaceholder')} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
        </div>
        <div className="glass-panel flex flex-wrap items-center gap-2 rounded-2xl p-2">
          <SlidersHorizontal size={16} className="ml-2 mr-1 text-pink-300" />
          {sortOptions.map((option) => <button key={option.value} onClick={() => setSort(option.value)} className={`rounded-xl px-3.5 py-2 text-xs transition ${sort === option.value ? 'bg-pink-500/15 text-pink-100 shadow-[0_0_20px_rgba(255,79,149,.08)]' : 'text-white/45 hover:text-white/75'}`}>{option.label}</button>)}
        </div>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {projectCategories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`category-chip rounded-xl border border-white/8 px-4 py-2.5 text-sm text-white/62 transition ${category === item ? 'active text-pink-200' : 'hover:border-pink-300/25 hover:text-white'}`}>
            {item === 'All' ? t('common.all') : item} <span className="ml-1 text-xs text-white/32">{countFor(item)}</span>
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl py-20 text-center text-white/45">{t('projects.empty')}</div>
      )}
    </section>
  )
}
