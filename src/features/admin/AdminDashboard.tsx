import { useEffect, useState } from 'react'
import { BookOpenText, FolderKanban, Mail, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminDashboard() {
  const [counts, setCounts] = useState({ projects: 0, blog: 0, messages: 0 })

  useEffect(() => {
    void Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
    ]).then(([projects, blog, messages]) => setCounts({ projects: projects.count || 0, blog: blog.count || 0, messages: messages.count || 0 }))
  }, [])

  const items = [
    ['Projects', counts.projects, FolderKanban],
    ['Blog posts', counts.blog, BookOpenText],
    ['Unread messages', counts.messages, Mail],
  ] as const

  return (
    <div>
      <div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Admin</div><h1 className="mt-2 font-display text-5xl font-semibold">Dashboard</h1></div><Sparkles className="text-pink-300" /></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{items.map(([label, value, Icon]) => <div key={label} className="glass-panel rounded-2xl p-5"><Icon className="text-pink-300" size={20} /><div className="mt-5 text-3xl font-semibold">{value}</div><div className="mt-1 text-sm text-white/42">{label}</div></div>)}</div>
      <div className="glass-panel mt-6 rounded-2xl p-6"><h2 className="font-semibold">Quick workflow</h2><p className="mt-2 text-sm leading-7 text-white/48">Projects and blog posts publish immediately after Save. Images are uploaded through Media or directly inside supported forms. Public content is protected by Supabase RLS: everyone can read, but only the whitelisted Google account can edit.</p></div>
    </div>
  )
}
