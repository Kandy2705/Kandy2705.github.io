import { useEffect, useMemo, useState } from 'react'
import { Archive, Gamepad2, ImagePlus, Images, Pencil, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react'
import { projectCategories } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type { ProjectCategory } from '@/types/content'
import { asArray, asLines, uploadMedia, uploadMediaMany, uploadUnityWebGLZip } from './adminUtils'

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
  webgl_url: string
  cover_image_url: string
  gallery_urls: string
  achievements_en: string
  achievements_vi: string
  responsibilities_en: string
  responsibilities_vi: string
  downloads_total: string
  downloads_ios: string
  downloads_android: string
  playable: boolean
  featured: boolean
}

const empty: Form = {
  slug: '',
  title: '',
  excerpt_en: '',
  excerpt_vi: '',
  content_en: '',
  content_vi: '',
  categories: ['Game'],
  technologies: '',
  role_en: '',
  role_vi: '',
  start_date: '',
  end_date: '',
  team_size: '',
  status_en: '',
  status_vi: '',
  github_url: '',
  demo_url: '',
  app_store_url: '',
  play_store_url: '',
  video_url: '',
  webgl_url: '',
  cover_image_url: '',
  gallery_urls: '',
  achievements_en: '',
  achievements_vi: '',
  responsibilities_en: '',
  responsibilities_vi: '',
  downloads_total: '',
  downloads_ios: '',
  downloads_android: '',
  playable: false,
  featured: false,
}

export function AdminProjectsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState<Form>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingWebGL, setUploadingWebGL] = useState(false)

  const galleryItems = useMemo(() => asArray(form.gallery_urls), [form.gallery_urls])

  const load = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setRows(data || [])
  }

  useEffect(() => { void load() }, [])

  const toggleCategory = (category: ProjectCategory) => setForm((prev) => ({
    ...prev,
    categories: prev.categories.includes(category)
      ? prev.categories.filter((c) => c !== category)
      : [...prev.categories, category],
  }))

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = {
      ...form,
      technologies: asArray(form.technologies),
      gallery_urls: asArray(form.gallery_urls),
      achievements_en: asLines(form.achievements_en),
      achievements_vi: asLines(form.achievements_vi),
      responsibilities_en: asLines(form.responsibilities_en),
      responsibilities_vi: asLines(form.responsibilities_vi),
      team_size: form.team_size ? Number(form.team_size) : null,
      downloads_total: form.downloads_total ? Number(form.downloads_total) : 0,
      downloads_ios: form.downloads_ios ? Number(form.downloads_ios) : 0,
      downloads_android: form.downloads_android ? Number(form.downloads_android) : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      github_url: form.github_url || null,
      demo_url: form.demo_url || null,
      app_store_url: form.app_store_url || null,
      play_store_url: form.play_store_url || null,
      video_url: form.video_url || null,
      webgl_url: form.webgl_url || null,
      cover_image_url: form.cover_image_url || null,
    }

    const result = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId)
      : await supabase.from('projects').insert(payload)

    setSaving(false)
    if (result.error) return setMessage(result.error.message)
    setForm(empty)
    setEditingId(null)
    setMessage('Saved and published.')
    await load()
  }

  const edit = (row: any) => {
    setEditingId(row.id)
    setForm({
      slug: row.slug || '',
      title: row.title || '',
      excerpt_en: row.excerpt_en || '',
      excerpt_vi: row.excerpt_vi || '',
      content_en: row.content_en || '',
      content_vi: row.content_vi || '',
      categories: row.categories || [],
      technologies: (row.technologies || []).join(', '),
      role_en: row.role_en || '',
      role_vi: row.role_vi || '',
      start_date: row.start_date || '',
      end_date: row.end_date || '',
      team_size: row.team_size?.toString() || '',
      status_en: row.status_en || '',
      status_vi: row.status_vi || '',
      github_url: row.github_url || '',
      demo_url: row.demo_url || '',
      app_store_url: row.app_store_url || '',
      play_store_url: row.play_store_url || '',
      video_url: row.video_url || '',
      webgl_url: row.webgl_url || '',
      cover_image_url: row.cover_image_url || '',
      gallery_urls: (row.gallery_urls || []).join(', '),
      achievements_en: (row.achievements_en || []).join('\n'),
      achievements_vi: (row.achievements_vi || []).join('\n'),
      responsibilities_en: (row.responsibilities_en || []).join('\n'),
      responsibilities_vi: (row.responsibilities_vi || []).join('\n'),
      downloads_total: row.downloads_total?.toString() || '',
      downloads_ios: row.downloads_ios?.toString() || '',
      downloads_android: row.downloads_android?.toString() || '',
      playable: Boolean(row.playable),
      featured: Boolean(row.featured),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) setMessage(error.message)
    else await load()
  }

  const uploadCover = async (file?: File) => {
    if (!file) return
    setMessage('Uploading cover...')
    try {
      const url = await uploadMedia(file, `projects/${form.slug || 'draft'}/cover`)
      setForm((f) => ({ ...f, cover_image_url: url }))
      setMessage('Cover uploaded.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const uploadGallery = async (files?: FileList | null) => {
    if (!files?.length) return
    setUploadingGallery(true)
    setMessage(`Uploading ${files.length} gallery image${files.length > 1 ? 's' : ''}...`)
    try {
      const urls = await uploadMediaMany(files, `projects/${form.slug || 'draft'}/gallery`)
      setForm((f) => ({ ...f, gallery_urls: [...asArray(f.gallery_urls), ...urls].join(', ') }))
      setMessage(`${urls.length} gallery image${urls.length > 1 ? 's' : ''} uploaded.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gallery upload failed')
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setForm((f) => ({ ...f, gallery_urls: asArray(f.gallery_urls).filter((_, itemIndex) => itemIndex !== index).join(', ') }))
  }

  const uploadWebGL = async (file?: File) => {
    if (!file) return
    if (!form.slug.trim()) return setMessage('Add a slug first, then upload the Unity WebGL ZIP.')
    setUploadingWebGL(true)
    setMessage('Reading Unity WebGL ZIP...')
    try {
      const url = await uploadUnityWebGLZip(file, form.slug, ({ completed, total, currentFile }) => {
        setMessage(`Uploading WebGL ${completed}/${total}: ${currentFile}`)
      })
      setForm((f) => ({ ...f, webgl_url: url, playable: true }))
      setMessage('Unity WebGL build uploaded. Save & publish to enable Play in browser.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'WebGL upload failed')
    } finally {
      setUploadingWebGL(false)
    }
  }

  type StringFieldKey = Exclude<keyof Form, 'categories' | 'featured' | 'playable'>
  const field = (key: StringFieldKey, label: string, type: 'text' | 'date' | 'number' = 'text') => (
    <label className="admin-label">
      {label}
      <input className="admin-input" type={type} value={String(form[key] ?? '')} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
    </label>
  )

  const linesField = (key: 'achievements_en' | 'achievements_vi' | 'responsibilities_en' | 'responsibilities_vi', label: string) => (
    <label className="admin-label">
      {label}
      <textarea className="admin-input" rows={6} placeholder="One item per line" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
    </label>
  )

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.22em] text-pink-300">Content manager</div>
          <h1 className="mt-2 font-display text-5xl font-semibold">Projects</h1>
          <p className="mt-2 text-sm text-white/42">Rich project pages with galleries, videos, store links and playable Unity WebGL builds.</p>
        </div>
        <Plus className="text-pink-300" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit project' : 'Add project'}</h2>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}
          </div>

          <div className="mb-3 text-xs uppercase tracking-[.18em] text-pink-300">Basic information</div>
          <div className="grid gap-4 sm:grid-cols-2">{field('title', 'Project title')}{field('slug', 'Slug (example: agentic-ar)')}</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="admin-label">Short description — English<textarea className="admin-input" rows={3} value={form.excerpt_en} onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))} /></label>
            <label className="admin-label">Short description — Vietnamese<textarea className="admin-input" rows={3} value={form.excerpt_vi} onChange={(e) => setForm((f) => ({ ...f, excerpt_vi: e.target.value }))} /></label>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs text-white/55">Categories</div>
            <div className="flex flex-wrap gap-2">{projectCategories.filter((x) => x !== 'All').map((item) => <button type="button" key={item} onClick={() => toggleCategory(item as ProjectCategory)} className={`rounded-lg border px-3 py-2 text-xs ${form.categories.includes(item as ProjectCategory) ? 'border-pink-400/45 bg-pink-500/10 text-pink-200' : 'border-white/8 text-white/45'}`}>{item}</button>)}</div>
          </div>

          <div className="mt-6 mb-3 text-xs uppercase tracking-[.18em] text-pink-300">Case study</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-label">Case study — English (Markdown)<textarea className="admin-input font-mono text-xs" rows={12} value={form.content_en} onChange={(e) => setForm((f) => ({ ...f, content_en: e.target.value }))} /></label>
            <label className="admin-label">Case study — Vietnamese (Markdown)<textarea className="admin-input font-mono text-xs" rows={12} value={form.content_vi} onChange={(e) => setForm((f) => ({ ...f, content_vi: e.target.value }))} /></label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {linesField('achievements_en', 'Key achievements — English')}
            {linesField('achievements_vi', 'Key achievements — Vietnamese')}
            {linesField('responsibilities_en', 'Key responsibilities — English')}
            {linesField('responsibilities_vi', 'Key responsibilities — Vietnamese')}
          </div>

          <div className="mt-6 mb-3 text-xs uppercase tracking-[.18em] text-pink-300">Project details</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('technologies', 'Technologies (comma separated)')}
            {field('team_size', 'Team size', 'number')}
            {field('role_en', 'Role — English')}
            {field('role_vi', 'Role — Vietnamese')}
            {field('start_date', 'Start date', 'date')}
            {field('end_date', 'End date', 'date')}
            {field('status_en', 'Status — English')}
            {field('status_vi', 'Status — Vietnamese')}
          </div>

          <div className="mt-6 mb-3 text-xs uppercase tracking-[.18em] text-pink-300">Download statistics</div>
          <div className="grid gap-4 sm:grid-cols-3">
            {field('downloads_total', 'Total downloads', 'number')}
            {field('downloads_android', 'Android downloads', 'number')}
            {field('downloads_ios', 'iOS downloads', 'number')}
          </div>

          <div className="mt-6 mb-3 text-xs uppercase tracking-[.18em] text-pink-300">Links & video</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('github_url', 'GitHub URL')}
            {field('demo_url', 'Website / Demo URL')}
            {field('app_store_url', 'App Store URL')}
            {field('play_store_url', 'Google Play URL')}
            {field('video_url', 'Demo video URL (YouTube, Vimeo or MP4)')}
            {field('webgl_url', 'Playable WebGL URL')}
          </div>

          <div className="mt-6 mb-3 text-xs uppercase tracking-[.18em] text-pink-300">Media</div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="admin-label">Cover image URL<input className="admin-input" value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} /></label>
            <label className="outline-button mt-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm"><ImagePlus size={16} /> Upload cover<input type="file" accept="image/*" className="hidden" onChange={(e) => void uploadCover(e.target.files?.[0])} /></label>
          </div>

          <div className="mt-4 rounded-2xl border border-white/7 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="flex items-center gap-2 font-medium"><Images size={17} className="text-pink-300" /> Project gallery</div><div className="mt-1 text-xs text-white/40">Select many images at once. Visitors can swipe/click through them.</div></div>
              <label className="outline-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><UploadCloud size={16} /> {uploadingGallery ? 'Uploading...' : 'Upload images'}<input type="file" multiple accept="image/*" className="hidden" disabled={uploadingGallery} onChange={(e) => void uploadGallery(e.target.files)} /></label>
            </div>
            {galleryItems.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{galleryItems.map((url, index) => <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-white/8 bg-black/30"><img src={url} alt={`Gallery ${index + 1}`} className="aspect-video h-full w-full object-cover" /><button type="button" onClick={() => removeGalleryImage(index)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/75 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><X size={14} /></button><div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white/70">{index + 1}</div></div>)}</div>}
            <details className="mt-3 text-xs text-white/35"><summary className="cursor-pointer">Advanced: edit gallery URLs manually</summary><textarea className="admin-input mt-2 font-mono text-[11px]" rows={3} value={form.gallery_urls} onChange={(e) => setForm((f) => ({ ...f, gallery_urls: e.target.value }))} /></details>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-400/15 bg-pink-500/[.035] p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl"><div className="flex items-center gap-2 font-medium"><Gamepad2 size={18} className="text-pink-300" /> Play Unity game directly on the portfolio</div><p className="mt-1 text-xs leading-5 text-white/42">Build Unity for WebGL, ZIP the exported folder that contains <code>index.html</code>, <code>Build/</code> and <code>TemplateData/</code>, then upload it here. For easiest hosting, use Compression Format = Disabled or enable Decompression Fallback in Unity WebGL Publishing Settings.</p></div>
              <label className="outline-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Archive size={16} /> {uploadingWebGL ? 'Uploading build...' : 'Upload WebGL ZIP'}<input type="file" accept=".zip,application/zip,application/x-zip-compressed" className="hidden" disabled={uploadingWebGL} onChange={(e) => void uploadWebGL(e.target.files?.[0])} /></label>
            </div>
            {form.webgl_url && <div className="mt-3 break-all rounded-xl border border-white/7 bg-black/25 px-3 py-2 text-xs text-white/45">Playable URL: {form.webgl_url}</div>}
            <label className="mt-3 flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={form.playable} onChange={(e) => setForm((f) => ({ ...f, playable: e.target.checked }))} /> Show “Play in browser” on the public project page</label>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured on homepage</label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button disabled={saving || uploadingGallery || uploadingWebGL} className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> {saving ? 'Saving...' : 'Save & publish'}</button>
            {message && <span className="max-w-xl text-xs text-white/42">{message}</span>}
          </div>
        </form>

        <div className="glass-panel h-fit rounded-2xl p-4 sm:p-5 xl:sticky xl:top-28">
          <h2 className="mb-4 font-semibold">Published projects</h2>
          <div className="space-y-2">{rows.map((row) => <div key={row.id} className="rounded-xl border border-white/7 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-medium">{row.title}</div><div className="mt-1 truncate text-xs text-white/35">{(row.categories || []).join(' · ')}</div>{row.playable && <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-pink-500/10 px-2 py-1 text-[10px] text-pink-200"><Gamepad2 size={11} /> Playable</div>}</div><div className="flex gap-2"><button type="button" onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><Pencil size={15} /></button><button type="button" onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button></div></div></div>)}</div>
        </div>
      </div>
    </div>
  )
}
