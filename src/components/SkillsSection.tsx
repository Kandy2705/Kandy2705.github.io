import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  Bot,
  Braces,
  Code2,
  Database,
  FileCode2,
  Gamepad2,
  GitBranch,
  Glasses,
  Layers3,
  PanelsTopLeft,
  ServerCog,
  Smartphone,
  Sparkles,
  SquareTerminal,
  UsersRound,
  Workflow,
  Wrench,
} from 'lucide-react'
import { SectionTitle } from '@/components/SectionTitle'
import type { Skill } from '@/types/content'

const categoryPriority = [
  'Language',
  'Engine',
  'AR/VR',
  'Web',
  'Mobile',
  'Tools',
  'Project Management',
  'Communication',
  'DevOps',
  'Database',
  'IDE',
  'Principle',
  'Soft Skills',
  'Other',
]

function iconForCategory(category: string): LucideIcon {
  const value = category.toLowerCase()
  if (value === 'language') return Braces
  if (value === 'engine') return Gamepad2
  if (value.includes('ar') || value.includes('vr') || value.includes('xr')) return Glasses
  if (value.includes('web')) return PanelsTopLeft
  if (value.includes('mobile')) return Smartphone
  if (value.includes('project management')) return Workflow
  if (value.includes('communication')) return UsersRound
  if (value.includes('tool')) return Wrench
  if (value.includes('devops')) return Workflow
  if (value.includes('database')) return Database
  if (value.includes('ide')) return SquareTerminal
  if (value.includes('principle')) return BadgeCheck
  if (value.includes('soft')) return UsersRound
  return Sparkles
}

function iconForSkill(name: string): LucideIcon {
  const value = name.toLowerCase()
  if (value.includes('unity') || value.includes('unreal')) return Gamepad2
  if (value.includes('c#') || value.includes('c/c++') || value.includes('c++') || value === 'c') return Code2
  if (value.includes('typescript') || value.includes('javascript') || value.includes('react')) return FileCode2
  if (value.includes('python') || value.includes('ai')) return Bot
  if (value.includes('ar foundation') || value.includes('openxr') || value.includes('vuforia') || value.includes('xr interaction')) return Glasses
  if (value.includes('git') || value.includes('github') || value.includes('gitlab')) return GitBranch
  if (value.includes('jenkins')) return ServerCog
  if (value.includes('supabase') || value.includes('sql')) return Database
  if (value.includes('tailwind') || value.includes('html') || value.includes('css')) return PanelsTopLeft
  if (value.includes('figma') || value.includes('blender')) return Layers3
  if (value.includes('notion') || value.includes('jira')) return Workflow
  if (value.includes('slack') || value.includes('teams')) return UsersRound
  return Sparkles
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'

  const groups = Array.from(
    skills.reduce((map, skill) => {
      map.set(skill.category, [...(map.get(skill.category) || []), skill])
      return map
    }, new Map<string, Skill[]>()),
  ).sort(([a], [b]) => {
    const ai = categoryPriority.indexOf(a)
    const bi = categoryPriority.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <section className="section-space pt-4">
      <div className="site-container">
        <SectionTitle eyebrow="Technical toolbox" title="Skills & Expertise" />
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map(([group, items], index) => {
            const CategoryIcon = iconForCategory(group)
            return (
              <motion.article
                key={group}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: Math.min(index * 0.05, 0.25) }}
                className="glass-panel group rounded-3xl border border-white/[.07] p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-pink-300/20 bg-gradient-to-br from-pink-500/20 to-fuchsia-500/5 text-pink-200 shadow-[0_0_28px_rgba(255,79,149,.12)]">
                    <CategoryIcon size={21} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-white">{group}</h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[.18em] text-white/30">{items.length} skills</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {items
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((skill) => {
                      const SkillIcon = iconForSkill(skill.name)
                      const description = skill.description?.[lang] || skill.description?.en || ''
                      return (
                        <span key={skill.id} className="group/skill relative inline-flex">
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3.5 py-2.5 text-sm text-white/68 transition duration-300 group-hover/skill:-translate-y-0.5 group-hover/skill:border-pink-300/25 group-hover/skill:bg-pink-500/[.06] group-hover/skill:text-pink-100">
                            <SkillIcon size={15} strokeWidth={1.9} className="text-pink-300" />
                            {skill.name}
                          </span>

                          {description && (
                            <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-64 -translate-x-1/2 translate-y-1 rounded-2xl border border-pink-300/20 bg-[#120d13]/95 px-4 py-3 text-left opacity-0 shadow-[0_18px_50px_rgba(0,0,0,.42),0_0_30px_rgba(255,68,150,.12)] backdrop-blur-xl transition duration-200 group-hover/skill:translate-y-0 group-hover/skill:opacity-100">
                              <span className="block font-semibold text-pink-200">{skill.name}</span>
                              <span className="mt-1.5 block text-xs leading-5 text-white/68">{description}</span>
                              <span className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-pink-300/20 bg-[#120d13]" />
                            </span>
                          )}
                        </span>
                      )
                    })}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
