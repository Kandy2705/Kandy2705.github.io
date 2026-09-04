import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProjectCard } from '@/components/ProjectCard'
import { SectionTitle } from '@/components/SectionTitle'
import { useProjects } from '@/hooks/useContent'
import { projectCategories } from '@/lib/constants'
import type { ProjectCategory } from '@/types/content'

export function ProjectsPage() {
  const { t } = useTranslation()
  const { data: projects = [] } = useProjects()
  const [category, setCategory] = useState<'All' | ProjectCategory>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((project) => {
      const categoryMatches = category === 'All' || project.categories.includes(category)
      const searchMatches = !q || [project.title, ...project.technologies, ...project.categories].join(' ').toLowerCase().includes(q)
      return categoryMatches && searchMatches
    })
  }, [projects, category, query])

  const countFor = (item: 'All' | ProjectCategory) => item === 'All' ? projects.length : projects.filter((project) => project.categories.includes(item)).length

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow="Portfolio archive" title={t('projects.allProjects')} />
      <div className="mx-auto mb-8 max-w-2xl">
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search size={18} className="text-pink-300" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('projects.searchPlaceholder')} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl py-20 text-center text-white/45">{t('projects.empty')}</div>
      )}
    </section>
  )
}
