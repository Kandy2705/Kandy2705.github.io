import {
  Award,
  BookOpenText,
  BriefcaseBusiness,
  FileBadge2,
  FolderKanban,
  Gauge,
  GraduationCap,
  Images,
  Languages,
  LogOut,
  Mail,
  Microscope,
  Settings,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

const nav = [
  ['/admin', 'Dashboard', Gauge],
  ['/admin/projects', 'Projects', FolderKanban],
  ['/admin/blog', 'Blog', BookOpenText],
  ['/admin/messages', 'Messages', Mail],
  ['/admin/experience', 'Experience', BriefcaseBusiness],
  ['/admin/education', 'Education', GraduationCap],
  ['/admin/skills', 'Skills', Wrench],
  ['/admin/certificates', 'Certificates', FileBadge2],
  ['/admin/awards', 'Awards', Award],
  ['/admin/research', 'Research', Microscope],
  ['/admin/languages', 'Languages', Languages],
  ['/admin/profile', 'Profile', SlidersHorizontal],
  ['/admin/media', 'Media', Images],
  ['/admin/settings', 'Settings', Settings],
] as const

export function AdminLayout() {
  return (
    <div className="admin-shell min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-white/7 bg-[#0d090e] p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="mb-5"><Logo /></div>
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-pink-500/10 text-pink-200' : 'text-white/48 hover:bg-white/[.03] hover:text-white/80'}`}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 hover:text-pink-200"><LogOut size={16} /> Sign out</button>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  )
}
