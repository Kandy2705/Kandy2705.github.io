import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'checkbox' | 'tags' | 'localizedLines' | 'select'

export interface CrudField {
  key: string
  label: string
  type?: FieldType
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  options?: Array<{ value: string; label: string }>
}

interface Props {
  table: string
  title: string
  subtitle?: string
  fields: CrudField[]
  displayField: string
  orderBy?: string
}

function normalizeForEdit(row: Record<string, any>, fields: CrudField[]) {
  const out: Record<string, any> = {}
  for (const field of fields) {
    const value = row[field.key]
    if (field.type === 'tags') out[field.key] = Array.isArray(value) ? value.join(', ') : value || ''
    else if (field.type === 'localizedLines') out[field.key] = Array.isArray(value) ? value.map((x: any) => `${x.en || ''} || ${x.vi || x.en || ''}`).join('\n') : ''
    else if (field.type === 'checkbox') out[field.key] = Boolean(value)
    else out[field.key] = value ?? ''
  }
  return out
}

function normalizeForSave(form: Record<string, any>, fields: CrudField[]) {
  const out: Record<string, any> = {}
  for (const field of fields) {
    let value = form[field.key]
    if (field.type === 'tags') value = String(value || '').split(',').map((x) => x.trim()).filter(Boolean)
    if (field.type === 'localizedLines') value = String(value || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const [en, vi] = line.split('||').map((x) => x.trim()); return { en, vi: vi || en } })
    if (field.type === 'number') value = value === '' ? null : Number(value)
    if (field.type === 'date') value = value || null
    out[field.key] = value
  }
  return out
}

export function SimpleCrudPage({ table, title, subtitle, fields, displayField, orderBy = 'created_at' }: Props) {
  const empty = useMemo(() => Object.fromEntries(fields.map((field) => [field.key, field.type === 'checkbox' ? false : field.type === 'select' ? field.options?.[0]?.value || '' : ''])), [fields])
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [form, setForm] = useState<Record<string, any>>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const query = supabase.from(table).select('*')
    const { data, error } = orderBy ? await query.order(orderBy, { ascending: false }) : await query
    if (error) setMessage(error.message)
    else setRows(data || [])
  }

  useEffect(() => { void load() }, [table])
  useEffect(() => setForm(empty), [empty])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = normalizeForSave(form, fields)
    const result = editingId
      ? await supabase.from(table).update(payload).eq('id', editingId)
      : await supabase.from(table).insert(payload)
    setSaving(false)
    if (result.error) return setMessage(result.error.message)
    setEditingId(null)
    setForm(empty)
    setMessage('Saved and published.')
    await load()
  }

  const edit = (row: Record<string, any>) => {
    setEditingId(row.id)
    setForm(normalizeForEdit(row, fields))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this item?')) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) setMessage(error.message)
    else await load()
  }

  return (
    <div>
      <div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Content manager</div><h1 className="mt-2 font-display text-5xl font-semibold">{title}</h1>{subtitle && <p className="mt-2 text-sm text-white/45">{subtitle}</p>}</div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <form onSubmit={save} className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit item' : 'Add item'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="outline-button grid h-9 w-9 place-items-center rounded-lg"><X size={16} /></button>}</div>
          <div className="grid gap-4">
            {fields.map((field) => {
              if (field.type === 'checkbox') {
                return <label key={field.key} className="flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={Boolean(form[field.key])} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.checked }))} /> {field.label}</label>
              }
              if (field.type === 'select') {
                return <label key={field.key} className="admin-label">{field.label}<select value={form[field.key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))} className="admin-input" required={field.required}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              }
              const common = { value: form[field.key] ?? '', onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [field.key]: e.target.value })), placeholder: field.placeholder, required: field.required, className: 'admin-input' }
              return <label key={field.key} className="admin-label">{field.label}{field.type === 'textarea' || field.type === 'localizedLines' ? <textarea {...common} rows={field.type === 'localizedLines' ? 7 : 5} /> : <input {...common} min={field.min} max={field.max} step={field.step} type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} />}{field.type === 'tags' && <span className="text-[11px] text-white/30">Comma separated</span>}{field.type === 'localizedLines' && <span className="text-[11px] text-white/30">One per line: English || Vietnamese</span>}</label>
            })}
          </div>
          <div className="mt-5 flex items-center gap-3"><button disabled={saving} className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> {saving ? 'Saving...' : 'Save & publish'}</button>{message && <span className="text-xs text-white/42">{message}</span>}</div>
        </form>

        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Plus size={16} className="text-pink-300" /> Existing items</div>
          <div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/7 p-3"><div className="min-w-0"><div className="truncate text-sm font-medium">{row[displayField] || row.title_en || row.name}</div><div className="mt-1 truncate text-xs text-white/30">{row.id}</div></div><div className="flex gap-2"><button onClick={() => edit(row)} className="outline-button grid h-9 w-9 place-items-center rounded-lg" aria-label="Edit"><Pencil size={15} /></button><button onClick={() => remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300" aria-label="Delete"><Trash2 size={15} /></button></div></div>)}</div>
        </div>
      </div>
    </div>
  )
}
