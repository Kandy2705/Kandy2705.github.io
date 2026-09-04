import { useEffect, useState } from 'react'
import { ExternalLink, ImagePlus, Pencil, Save, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadMediaMany } from './adminUtils'

const empty = {
  title_en: '',
  title_vi: '',
  issuer: '',
  award_date: '',
  description_en: '',
  description_vi: '',
  source_url: '',
  proof_image_urls: [] as string[],
}

export function AdminAwardsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    const { data, error } = await supabase.from('awards').select('*').order('award_date', { ascending: false })
    if (error) setMessage(error.message)
    else setRows(data || [])
  }

  useEffect(() => { void load() }, [])

  const uploadProofs = async (files: FileList | null) => {
    if (!files?.length) return
    try {
      setUploading(true)
      setMessage(`Uploading ${files.length} proof image${files.length > 1 ? 's' : ''}...`)
      const urls = await uploadMediaMany(files, 'awards')
      setForm((current) => ({ ...current, proof_image_urls: [...current.proof_image_urls, ...urls] }))
      setMessage('Proof images uploaded. Click Save & publish to finish.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeProof = (url: string) => {
    setForm((current) => ({ ...current, proof_image_urls: current.proof_image_urls.filter((item) => item !== url) }))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title_en: form.title_en,
      title_vi: form.title_vi,
      issuer: form.issuer || null,
      award_date: form.award_date || null,
      description_en: form.description_en || null,
      description_vi: form.description_vi || null,
      source_url: form.source_url || null,
      proof_image_urls: form.proof_image_urls,
    }

    const result = editingId
      ? await supabase.from('awards').update(payload).eq('id', editingId)
      : await supabase.from('awards').insert(payload)

    if (result.error) return setMessage(result.error.message)
    setForm(empty)
    setEditingId(null)
    setMessage('Award saved and published.')
    await load()
  }

  const edit = (row: any) => {
    setEditingId(row.id)
    setForm({
      title_en: row.title_en || '',
      title_vi: row.title_vi || '',
      issuer: row.issuer || '',
      award_date: row.award_date || '',
      description_en: row.description_en || '',
      description_vi: row.description_vi || '',
      source_url: row.source_url || '',
      proof_image_urls: row.proof_image_urls || [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this award?')) return
    const { error } = await supabase.from('awards').delete().eq('id', id)
    if (error) setMessage(error.message)
    else await load()
  }

  return (
    <div>
      <div>
        <div className="text-xs uppercase tracking-[.22em] text-pink-300">Proof enabled</div>
        <h1 className="mt-2 font-display text-5xl font-semibold">Awards</h1>
        <p className="mt-2 text-sm text-white/42">Upload proof images and optionally add a public source link such as an official result page or announcement post.</p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_.85fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit award' : 'Add award'}</h2>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-label">Title — English<input className="admin-input" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} required /></label>
            <label className="admin-label">Title — Vietnamese<input className="admin-input" value={form.title_vi} onChange={(e) => setForm((f) => ({ ...f, title_vi: e.target.value }))} /></label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="admin-label">Issuer<input className="admin-input" value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} /></label>
            <label className="admin-label">Award date<input type="date" className="admin-input" value={form.award_date} onChange={(e) => setForm((f) => ({ ...f, award_date: e.target.value }))} /></label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="admin-label">Description — English<textarea rows={4} className="admin-input" value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} /></label>
            <label className="admin-label">Description — Vietnamese<textarea rows={4} className="admin-input" value={form.description_vi} onChange={(e) => setForm((f) => ({ ...f, description_vi: e.target.value }))} /></label>
          </div>

          <div className="mt-4">
            <label className="admin-label">Source / announcement URL<input className="admin-input" value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://..." /></label>
          </div>

          <div className="mt-5 rounded-2xl border border-white/7 bg-white/[.02] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white/82">Proof images</div>
                <div className="mt-1 text-xs text-white/35">You can upload one or many images at once.</div>
              </div>
              <label className="outline-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs text-pink-200">
                <ImagePlus size={15} /> {uploading ? 'Uploading...' : 'Upload images'}
                <input type="file" multiple accept="image/*" className="hidden" disabled={uploading} onChange={(e) => void uploadProofs(e.target.files)} />
              </label>
            </div>

            {form.proof_image_urls.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.proof_image_urls.map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-white/8 bg-black/25">
                    <img src={url} alt={`Award proof ${index + 1}`} className="aspect-[4/3] h-full w-full object-cover" />
                    <button type="button" onClick={() => removeProof(url)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg border border-pink-300/20 bg-black/70 text-pink-200 opacity-0 backdrop-blur transition group-hover:opacity-100" aria-label="Remove image"><X size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-xs text-white/30">No proof images uploaded yet.</div>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> Save & publish</button>
            {message && <span className="text-xs text-white/42">{message}</span>}
          </div>
        </form>

        <div className="glass-panel rounded-2xl p-5">
          <h2 className="mb-4 font-semibold">Awards</h2>
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/7 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm">{row.title_en}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/30">
                    <span>Proof images: {(row.proof_image_urls || []).length}</span>
                    {row.source_url && <span className="inline-flex items-center gap-1 text-pink-200/60"><ExternalLink size={11} /> Source</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><Pencil size={15} /></button>
                  <button onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
