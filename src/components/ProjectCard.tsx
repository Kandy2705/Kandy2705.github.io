import { motion } from 'framer-motion'
import { ArrowUpRight, Boxes, Code2, Eye, Gamepad2, Glasses, Microscope, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Project, ProjectCategory } from '@/types/content'

function CategoryIcon({ category }: { category: ProjectCategory }) {
  const props = { size: 30, strokeWidth: 1.6 }
  if (category === 'Web') return <Code2 {...props} />
  if (category === 'Mobile App') return <Smartphone {...props} />
  if (category === 'Game') return <Gamepad2 {...props} />
  if (category === 'AR/VR') return <Glasses {...props} />
  if (category === 'Research') return <Microscope {...props} />
  return <Boxes {...props} />
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const primary = project.categories[0] || 'Other'

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: .5, delay: Math.min(index * .06, .25) }}
      whileHover={{ y: -7, rotateX: 1.2, rotateY: -1.2 }}
      className="glass-panel neon-border group overflow-hidden rounded-3xl"
    >
      <Link to={`/projects/${project.slug}`} className="block h-full">
        <div className="project-card-cover relative overflow-hidden">
          {project.coverImageUrl ? (
            <img src={project.coverImageUrl} alt={project.title} className="h-full min-h-[210px] w-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="absolute left-[12%] top-[18%] h-28 w-28 rounded-full bg-pink-500/10 blur-2xl" />
              <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-pink-300/20 bg-black/30 text-pink-300 shadow-neon">
                <CategoryIcon category={primary} />
              </div>
            </div>
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {project.categories.slice(0, 2).map((category) => (
              <span key={category} className="rounded-full border border-pink-300/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-pink-200 backdrop-blur">
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold text-white group-hover:text-pink-200">{project.title}</h3>
            <ArrowUpRight className="mt-1 shrink-0 text-pink-400 transition group-hover:translate-x-1 group-hover:-translate-y-1" size={20} />
          </div>
          <p className="min-h-[48px] text-sm leading-6 text-white/58">{project.excerpt[lang]}</p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/7 pt-4 text-xs text-white/45">
            <span>{project.technologies.slice(0, 3).join(' · ')}</span>
            <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {project.views} {t('common.views')}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
