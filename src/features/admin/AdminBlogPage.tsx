import { useEffect, useState } from 'react'
import { ImagePlus, Pencil, Save, Trash2, Upload, Video, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { asArray, uploadMedia, uploadMediaMany } from './adminUtils'

type Form = {
  slug: string
  title_en: string
  title_vi: string
  excerpt_en: string
  excerpt_vi: string
  content_en: string
  content_vi: string
  tags: string
  cover_image_url: string
  gallery_urls: string[]
  video_urls: string[]
  featured: boolean
}

const empty: Form = {
  slug: '', title_en: '', title_vi: '', excerpt_en: '', excerpt_vi: '', content_en: '', content_vi: '', tags: '',
  cover_image_url: '', gallery_urls: [], video_urls: [], featured: false,
}

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
    const payload = {
      ...form,
      tags: asArray(form.tags),
      cover_image_url: form.cover_image_url || null,
      gallery_urls: form.gallery_urls,
      video_urls: form.video_urls,
      published_at: new Date().toISOString(),
    }
    const result = editingId ? await supabase.from('blog_posts').update(payload).eq('id', editingId) : await supabase.from('blog_posts').insert(payload)
    if (result.error) return setMessage(result.error.message)
    setForm(empty); setEditingId(null); setMessage('Published.'); await load()
  }

  const edit = (row: any) => {
    setEditingId(row.id)
    setForm({
      slug: row.slug || '', title_en: row.title_en || '', title_vi: row.title_vi || '', excerpt_en: row.excerpt_en || '', excerpt_vi: row.excerpt_vi || '',
      content_en: row.content_en || '', content_vi: row.content_vi || '', tags: (row.tags || []).join(', '), cover_image_url: row.cover_image_url || '',
      gallery_urls: row.gallery_urls || [], video_urls: row.video_urls || [], featured: Boolean(row.featured),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this post?')) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) setMessage(error.message); else await load()
  }

  const uploadCover = async (file?: File) => {
    if (!file) return
    try {
      setMessage('Uploading cover...')
      const url = await uploadMedia(file, 'blog/covers')
      setForm((f) => ({ ...f, cover_image_url: url }))
      setMessage('Cover uploaded.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed') }
  }

  const uploadGallery = async (files?: FileList | null) => {
    if (!files?.length) return
    try {
      setMessage(`Uploading ${files.length} images...`)
      const urls = await uploadMediaMany(files, 'blog/gallery')
      setForm((f) => ({ ...f, gallery_urls: [...f.gallery_urls, ...urls] }))
      setMessage(`${urls.length} images uploaded.`)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed') }
  }

  const uploadVideos = async (files?: FileList | null) => {
    if (!files?.length) return
    try {
      setMessage(`Uploading ${files.length} videos...`)
      const urls = await uploadMediaMany(files, 'blog/videos')
      setForm((f) => ({ ...f, video_urls: [...f.video_urls, ...urls] }))
      setMessage(`${urls.length} videos uploaded.`)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed') }
  }

  return (
    <div>
      <div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Markdown editor</div><h1 className="mt-2 font-display text-5xl font-semibold">Blog</h1><p className="mt-2 text-sm text-white/42">Save publishes immediately. Blog posts support a cover, image gallery and multiple videos.</p></div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit post' : 'New post'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="admin-label">Title — English<input className="admin-input" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} /></label><label className="admin-label">Title — Vietnamese<input className="admin-input" value={form.title_vi} onChange={(e) => setForm((f) => ({ ...f, title_vi: e.target.value }))} /></label></div>
          <label className="admin-label mt-4">Slug<input className="admin-input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="admin-label">Excerpt — English<textarea className="admin-input" rows={3} value={form.excerpt_en} onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))} /></label><label className="admin-label">Excerpt — Vietnamese<textarea className="admin-input" rows={3} value={form.excerpt_vi} onChange={(e) => setForm((f) => ({ ...f, excerpt_vi: e.target.value }))} /></label></div>
          <div className="mt-4 grid gap-4"><label className="admin-label">Markdown — English<textarea className="admin-input font-mono text-xs" rows={14} value={form.content_en} onChange={(e) => setForm((f) => ({ ...f, content_en: e.target.value }))} /></label><label className="admin-label">Markdown — Vietnamese<textarea className="admin-input font-mono text-xs" rows={14} value={form.content_vi} onChange={(e) => setForm((f) => ({ ...f, content_vi: e.target.value }))} /></label></div>
          <label className="admin-label mt-4">Tags<input className="admin-input" placeholder="Unity, AR, Research" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} /></label>

          <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ImagePlus size={16} className="text-pink-300" /> Cover image</div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input className="admin-input" value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} placeholder="Cover URL" /><label className="outline-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm"><Upload size={16} /> Upload cover<input type="file" accept="image/*" className="hidden" onChange={(e) => void uploadCover(e.target.files?.[0])} /></label></div>
            {form.cover_image_url && <img src={form.cover_image_url} alt="Cover preview" className="mt-3 aspect-video w-full rounded-xl object-cover" />}
          </div>

          <div className="mt-4 rounded-2xl border border-white/7 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold"><ImagePlus size={16} className="text-pink-300" /> Gallery</div><div className="mt-1 text-xs text-white/35">Select many images at once.</div></div><label className="outline-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs"><Upload size={14} /> Upload images<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void uploadGallery(e.target.files)} /></label></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{form.gallery_urls.map((url, index) => <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-white/8"><img src={url} alt="" className="aspect-video h-full w-full object-cover" /><button type="button" onClick={() => setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((_, i) => i !== index) }))} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-pink-200 opacity-0 transition group-hover:opacity-100"><X size={13} /></button></div>)}</div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/7 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold"><Video size={16} className="text-pink-300" /> Videos</div><div className="mt-1 text-xs text-white/35">Upload multiple MP4/WebM files. You can also paste YouTube/Vimeo URLs below.</div></div><label className="outline-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs"><Upload size={14} /> Upload videos<input type="file" accept="video/mp4,video/webm,video/*" multiple className="hidden" onChange={(e) => void uploadVideos(e.target.files)} /></label></div>
            <textarea className="admin-input text-xs" rows={4} placeholder="One video URL per line" value={form.video_urls.join('\n')} onChange={(e) => setForm((f) => ({ ...f, video_urls: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) }))} />
            {form.video_urls.length > 0 && <div className="mt-3 space-y-2">{form.video_urls.map((url, index) => <div key={`${url}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/7 px-3 py-2 text-xs text-white/50"><span className="truncate">{url}</span><button type="button" onClick={() => setForm((f) => ({ ...f, video_urls: f.video_urls.filter((_, i) => i !== index) }))} className="text-pink-300"><X size={14} /></button></div>)}</div>}
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured</label>
          <div className="mt-5 flex items-center gap-3"><button className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> Save & publish</button>{message && <span className="text-xs text-white/42">{message}</span>}</div>
        </form>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5"><h2 className="mb-4 font-semibold">Published posts</h2><div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/7 p-3"><div className="min-w-0"><div className="truncate text-sm">{row.title_en}</div><div className="mt-1 text-xs text-white/30">/{row.slug} · {row.views || 0} views</div></div><div className="flex gap-2"><button onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><Pencil size={15} /></button><button onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button></div></div>)}</div></div>
        </div>
      </div>
    </div>
  )
}
