import { useEffect, useState } from 'react'
import { Link2, Pencil, Save, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const empty = { title_en: '', title_vi: '', issuer: '', award_date: '', description_en: '', description_vi: '', certificateIds: [] as string[] }

export function AdminAwardsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [awards, certs] = await Promise.all([
      supabase.from('awards').select('*, award_certificates(certificate_id)').order('award_date', { ascending: false }),
      supabase.from('certificates').select('id,title_en,issuer').order('created_at', { ascending: false }),
    ])
    if (awards.error) setMessage(awards.error.message); else setRows(awards.data || [])
    if (!certs.error) setCertificates(certs.data || [])
  }
  useEffect(() => { void load() }, [])

  const toggleCertificate = (id: string) => setForm((f) => ({ ...f, certificateIds: f.certificateIds.includes(id) ? f.certificateIds.filter((x) => x !== id) : [...f.certificateIds, id] }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { title_en: form.title_en, title_vi: form.title_vi, issuer: form.issuer || null, award_date: form.award_date || null, description_en: form.description_en || null, description_vi: form.description_vi || null }
    let awardId = editingId
    if (editingId) {
      const { error } = await supabase.from('awards').update(payload).eq('id', editingId)
      if (error) return setMessage(error.message)
      await supabase.from('award_certificates').delete().eq('award_id', editingId)
    } else {
      const { data, error } = await supabase.from('awards').insert(payload).select('id').single()
      if (error) return setMessage(error.message)
      awardId = data.id
    }
    if (awardId && form.certificateIds.length) {
      const { error } = await supabase.from('award_certificates').insert(form.certificateIds.map((certificate_id) => ({ award_id: awardId, certificate_id })))
      if (error) return setMessage(error.message)
    }
    setForm(empty); setEditingId(null); setMessage('Saved with certificate relationships.'); await load()
  }

  const edit = (row: any) => {
    setEditingId(row.id)
    setForm({ title_en: row.title_en || '', title_vi: row.title_vi || '', issuer: row.issuer || '', award_date: row.award_date || '', description_en: row.description_en || '', description_vi: row.description_vi || '', certificateIds: (row.award_certificates || []).map((x: any) => x.certificate_id) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this award?')) return
    const { error } = await supabase.from('awards').delete().eq('id', id)
    if (error) setMessage(error.message); else await load()
  }

  return (
    <div>
      <div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Relations enabled</div><h1 className="mt-2 font-display text-5xl font-semibold">Awards</h1><p className="mt-2 text-sm text-white/42">An award can be linked to one or more certificate records.</p></div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_.85fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit award' : 'Add award'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="admin-label">Title — English<input className="admin-input" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} /></label><label className="admin-label">Title — Vietnamese<input className="admin-input" value={form.title_vi} onChange={(e) => setForm((f) => ({ ...f, title_vi: e.target.value }))} /></label></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="admin-label">Issuer<input className="admin-input" value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} /></label><label className="admin-label">Award date<input type="date" className="admin-input" value={form.award_date} onChange={(e) => setForm((f) => ({ ...f, award_date: e.target.value }))} /></label></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="admin-label">Description — English<textarea rows={4} className="admin-input" value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} /></label><label className="admin-label">Description — Vietnamese<textarea rows={4} className="admin-input" value={form.description_vi} onChange={(e) => setForm((f) => ({ ...f, description_vi: e.target.value }))} /></label></div>
          <div className="mt-5"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><Link2 size={16} className="text-pink-300" /> Linked certificates</div><div className="grid gap-2">{certificates.map((certificate) => <label key={certificate.id} className="flex items-center gap-3 rounded-xl border border-white/7 px-3 py-2.5 text-sm text-white/60"><input type="checkbox" checked={form.certificateIds.includes(certificate.id)} onChange={() => toggleCertificate(certificate.id)} /> <span>{certificate.title_en} <span className="text-white/30">· {certificate.issuer}</span></span></label>)}</div></div>
          <div className="mt-5 flex items-center gap-3"><button className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> Save & publish</button>{message && <span className="text-xs text-white/42">{message}</span>}</div>
        </form>
        <div className="glass-panel rounded-2xl p-5"><h2 className="mb-4 font-semibold">Awards</h2><div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/7 p-3"><div><div className="text-sm">{row.title_en}</div><div className="mt-1 text-xs text-white/30">Linked: {(row.award_certificates || []).length}</div></div><div className="flex gap-2"><button onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><Pencil size={15} /></button><button onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button></div></div>)}</div></div>
      </div>
    </div>
  )
}
