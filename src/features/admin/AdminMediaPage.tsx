import { useEffect, useState } from 'react'
import { Check, Copy, File, ImagePlus, UploadCloud } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadMedia } from './adminUtils'

const folders = ['media', 'profiles', 'projects', 'blog', 'certificates', 'companies', 'education']

type MediaFile = { name: string; folder: string; url: string }

export function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folder, setFolder] = useState('media')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState('')

  const load = async () => {
    const all: MediaFile[] = []
    for (const current of folders) {
      const { data } = await supabase.storage.from('portfolio-media').list(current, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      for (const item of data || []) {
        if (!item.id) continue
        const path = `${current}/${item.name}`
        all.push({ name: item.name, folder: current, url: supabase.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl })
      }
    }
    setFiles(all)
  }

  useEffect(() => { void load() }, [])

  const upload = async (file?: File) => {
    if (!file) return
    try { setMessage('Uploading...'); const url = await uploadMedia(file, folder); setMessage(`Uploaded: ${url}`); await load() } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed') }
  }

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(''), 1200)
  }

  return (
    <div>
      <div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Supabase Storage</div><h1 className="mt-2 font-display text-5xl font-semibold">Media</h1><p className="mt-2 text-sm text-white/42">Upload images, PDFs and supporting files. Copy the public URL into any content form.</p></div>
      <div className="glass-panel mt-7 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-3"><label className="admin-label min-w-52">Folder<select className="admin-input" value={folder} onChange={(e) => setFolder(e.target.value)}>{folders.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="neon-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"><UploadCloud size={17} /> Choose & upload<input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => void upload(e.target.files?.[0])} /></label>{message && <span className="max-w-2xl break-all text-xs text-white/40">{message}</span>}</div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{files.map((item) => <div key={item.url} className="glass-panel rounded-2xl p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/8 text-pink-300">{item.name.match(/\.(png|jpe?g|webp|gif)$/i) ? <ImagePlus size={18} /> : <File size={18} />}</span><div className="min-w-0 flex-1"><div className="truncate text-sm">{item.name}</div><div className="mt-1 text-xs text-white/30">/{item.folder}</div></div><button onClick={() => copy(item.url)} className="outline-button grid h-9 w-9 place-items-center rounded-lg">{copied === item.url ? <Check size={15} /> : <Copy size={15} />}</button></div></div>)}</div>
    </div>
  )
}
