import { useEffect, useState } from 'react'
import { ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { projectCategories } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type { ProjectCategory } from '@/types/content'
import { asArray, uploadMedia } from './adminUtils'

type Form = {
  slug: string
  title: string
  excerpt_en: string
  excerpt_vi: string
  content_en: string
  content_vi: string
  categories: ProjectCategory[]
  technologies: string
  role_en: string
  role_vi: string
  start_date: string
  end_date: string
  team_size: string
  status_en: string
  status_vi: string
  github_url: string
  demo_url: string
  app_store_url: string
  play_store_url: string
  video_url: string
  cover_image_url: string
  gallery_urls: string
  featured: boolean
}

const empty: Form = {
  slug: '', title: '', excerpt_en: '', excerpt_vi: '', content_en: '', content_vi: '', categories: ['Game'], technologies: '', role_en: '', role_vi: '', start_date: '', end_date: '', team_size: '', status_en: '', status_vi: '', github_url: '', demo_url: '', app_store_url: '', play_store_url: '', video_url: '', cover_image_url: '', gallery_urls: '', featured: false,
}

export function AdminProjectsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState<Form>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setRows(data || [])
  }
  useEffect(() => { void load() }, [])

  const toggleCategory = (category: ProjectCategory) => setForm((prev) => ({ ...prev, categories: prev.categories.includes(category) ? prev.categories.filter((c) => c !== category) : [...prev.categories, category] }))

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      technologies: asArray(form.technologies),
      gallery_urls: asArray(form.gallery_urls),
      team_size: form.team_size ? Number(form.team_size) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      github_url: form.github_url || null,
      demo_url: form.demo_url || null,
      app_store_url: form.app_store_url || null,
      play_store_url: form.play_store_url || null,
      video_url: form.video_url || null,
      cover_image_url: form.cover_image_url || null,
    }
    const result = editingId ? await supabase.from('projects').update(payload).eq('id', editingId) : await supabase.from('projects').insert(payload)
    setSaving(false)
    if (result.error) return setMessage(result.error.message)
    setForm(empty); setEditingId(null); setMessage('Saved and published.'); await load()
  }

  const edit = (row: any) => {
    setEditingId(row.id)
    setForm({
      slug: row.slug || '', title: row.title || '', excerpt_en: row.excerpt_en || '', excerpt_vi: row.excerpt_vi || '', content_en: row.content_en || '', content_vi: row.content_vi || '', categories: row.categories || [], technologies: (row.technologies || []).join(', '), role_en: row.role_en || '', role_vi: row.role_vi || '', start_date: row.start_date || '', end_date: row.end_date || '', team_size: row.team_size?.toString() || '', status_en: row.status_en || '', status_vi: row.status_vi || '', github_url: row.github_url || '', demo_url: row.demo_url || '', app_store_url: row.app_store_url || '', play_store_url: row.play_store_url || '', video_url: row.video_url || '', cover_image_url: row.cover_image_url || '', gallery_urls: (row.gallery_urls || []).join(', '), featured: Boolean(row.featured),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) setMessage(error.message); else await load()
  }

  const uploadCover = async (file?: File) => {
    if (!file) return
    setMessage('Uploading cover...')
    try { const url = await uploadMedia(file, 'projects'); setForm((f) => ({ ...f, cover_image_url: url })); setMessage('Cover uploaded.') } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed') }
  }

  type StringFieldKey = Exclude<keyof Form, 'categories' | 'featured'>
  const field = (key: StringFieldKey, label: string, type: 'text' | 'date' | 'number' = 'text') => (
    <label className="admin-label">{label}<input className="admin-input" type={type} value={String(form[key] ?? '')} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} /></label>
  )

  return (
    <div>
      <div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Content manager</div><h1 className="mt-2 font-display text-5xl font-semibold">Projects</h1><p className="mt-2 text-sm text-white/42">Web, Mobile App, Game, AR/VR, Research and Other. Save publishes immediately.</p></div><Plus className="text-pink-300" /></div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit project' : 'Add project'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}</div>
          <div className="grid gap-4 sm:grid-cols-2">{field('title', 'Project title')}{field('slug', 'Slug (example: agentic-ar)')}</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="admin-label">Short description — English<textarea className="admin-input" rows={3} value={form.excerpt_en} onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))} /></label><label className="admin-label">Short description — Vietnamese<textarea className="admin-input" rows={3} value={form.excerpt_vi} onChange={(e) => setForm((f) => ({ ...f, excerpt_vi: e.target.value }))} /></label></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="admin-label">Case study — English (Markdown)<textarea className="admin-input font-mono text-xs" rows={12} value={form.content_en} onChange={(e) => setForm((f) => ({ ...f, content_en: e.target.value }))} /></label><label className="admin-label">Case study — Vietnamese (Markdown)<textarea className="admin-input font-mono text-xs" rows={12} value={form.content_vi} onChange={(e) => setForm((f) => ({ ...f, content_vi: e.target.value }))} /></label></div>
          <div className="mt-4"><div className="mb-2 text-xs text-white/55">Categories</div><div className="flex flex-wrap gap-2">{projectCategories.filter((x) => x !== 'All').map((item) => <button type="button" key={item} onClick={() => toggleCategory(item as ProjectCategory)} className={`rounded-lg border px-3 py-2 text-xs ${form.categories.includes(item as ProjectCategory) ? 'border-pink-400/45 bg-pink-500/10 text-pink-200' : 'border-white/8 text-white/45'}`}>{item}</button>)}</div></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{field('technologies', 'Technologies (comma separated)')}{field('team_size', 'Team size', 'number')}{field('role_en', 'Role — English')}{field('role_vi', 'Role — Vietnamese')}{field('start_date', 'Start date', 'date')}{field('end_date', 'End date', 'date')}{field('status_en', 'Status — English')}{field('status_vi', 'Status — Vietnamese')}</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{field('github_url', 'GitHub URL')}{field('demo_url', 'Demo URL')}{field('app_store_url', 'App Store URL')}{field('play_store_url', 'Google Play URL')}{field('video_url', 'Video URL')}{field('gallery_urls', 'Gallery URLs (comma separated)')}</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]"><label className="admin-label">Cover image URL<input className="admin-input" value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} /></label><label className="outline-button mt-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm"><ImagePlus size={16} /> Upload cover<input type="file" accept="image/*" className="hidden" onChange={(e) => void uploadCover(e.target.files?.[0])} /></label></div>
          <label className="mt-4 flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured on homepage</label>
          <div className="mt-5 flex items-center gap-3"><button disabled={saving} className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> {saving ? 'Saving...' : 'Save & publish'}</button>{message && <span className="text-xs text-white/42">{message}</span>}</div>
        </form>

        <div className="glass-panel rounded-2xl p-4 sm:p-5"><h2 className="mb-4 font-semibold">Published projects</h2><div className="space-y-2">{rows.map((row) => <div key={row.id} className="rounded-xl border border-white/7 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-medium">{row.title}</div><div className="mt-1 truncate text-xs text-white/35">{(row.categories || []).join(' · ')}</div></div><div className="flex gap-2"><button onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><Pencil size={15} /></button><button onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button></div></div></div>)}</div></div>
      </div>
    </div>
  )
}
