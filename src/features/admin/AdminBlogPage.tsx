import { useEffect, useState } from 'react'
import { ImagePlus, Pencil, Save, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { asArray, uploadMedia } from './adminUtils'

type Form = { slug: string; title_en: string; title_vi: string; excerpt_en: string; excerpt_vi: string; content_en: string; content_vi: string; tags: string; cover_image_url: string; featured: boolean }
const empty: Form = { slug: '', title_en: '', title_vi: '', excerpt_en: '', excerpt_vi: '', content_en: '', content_vi: '', tags: '', cover_image_url: '', featured: false }

export function AdminBlogPage() {
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState<Form>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false })
    if (error) setMessage(error.message); else setRows(data || [])
  }
  useEffect(() => { void load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, tags: asArray(form.tags), cover_image_url: form.cover_image_url || null, published_at: new Date().toISOString() }
    const result = editingId ? await supabase.from('blog_posts').update(payload).eq('id', editingId) : await supabase.from('blog_posts').insert(payload)
    if (result.error) return setMessage(result.error.message)
    setForm(empty); setEditingId(null); setMessage('Published.'); await load()
  }

  const edit = (row: any) => {
    setEditingId(row.id)
    setForm({ slug: row.slug || '', title_en: row.title_en || '', title_vi: row.title_vi || '', excerpt_en: row.excerpt_en || '', excerpt_vi: row.excerpt_vi || '', content_en: row.content_en || '', content_vi: row.content_vi || '', tags: (row.tags || []).join(', '), cover_image_url: row.cover_image_url || '', featured: Boolean(row.featured) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this post?')) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) setMessage(error.message); else await load()
  }

  const upload = async (file?: File) => {
    if (!file) return
    try { setMessage('Uploading...'); const url = await uploadMedia(file, 'blog'); setForm((f) => ({ ...f, cover_image_url: url })); setMessage('Image uploaded.') } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed') }
  }

  return (
    <div>
      <div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Markdown editor</div><h1 className="mt-2 font-display text-5xl font-semibold">Blog</h1><p className="mt-2 text-sm text-white/42">No drafts: Save publishes immediately.</p></div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit post' : 'New post'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="admin-label">Title — English<input className="admin-input" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} /></label><label className="admin-label">Title — Vietnamese<input className="admin-input" value={form.title_vi} onChange={(e) => setForm((f) => ({ ...f, title_vi: e.target.value }))} /></label></div>
          <label className="admin-label mt-4">Slug<input className="admin-input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="admin-label">Excerpt — English<textarea className="admin-input" rows={3} value={form.excerpt_en} onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))} /></label><label className="admin-label">Excerpt — Vietnamese<textarea className="admin-input" rows={3} value={form.excerpt_vi} onChange={(e) => setForm((f) => ({ ...f, excerpt_vi: e.target.value }))} /></label></div>
          <div className="mt-4 grid gap-4"><label className="admin-label">Markdown — English<textarea className="admin-input font-mono text-xs" rows={14} value={form.content_en} onChange={(e) => setForm((f) => ({ ...f, content_en: e.target.value }))} /></label><label className="admin-label">Markdown — Vietnamese<textarea className="admin-input font-mono text-xs" rows={14} value={form.content_vi} onChange={(e) => setForm((f) => ({ ...f, content_vi: e.target.value }))} /></label></div>
          <label className="admin-label mt-4">Tags<input className="admin-input" placeholder="Unity, AR, Research" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]"><label className="admin-label">Cover image URL<input className="admin-input" value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} /></label><label className="outline-button mt-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm"><ImagePlus size={16} /> Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} /></label></div>
          <label className="mt-4 flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured</label>
          <div className="mt-5 flex items-center gap-3"><button className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> Save & publish</button>{message && <span className="text-xs text-white/42">{message}</span>}</div>
        </form>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5"><h2 className="mb-4 font-semibold">Published posts</h2><div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/7 p-3"><div className="min-w-0"><div className="truncate text-sm">{row.title_en}</div><div className="mt-1 text-xs text-white/30">/{row.slug}</div></div><div className="flex gap-2"><button onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><Pencil size={15} /></button><button onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button></div></div>)}</div></div>
        </div>
      </div>
    </div>
  )
}
