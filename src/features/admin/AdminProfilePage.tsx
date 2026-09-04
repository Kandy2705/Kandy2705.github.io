import { useEffect, useState } from 'react'
import { FileUp, ImagePlus, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadMedia } from './adminUtils'

const empty = {
  brand: 'Portfolio',
  full_name: '',
  role_en: '',
  role_vi: '',
  tagline_en: '',
  tagline_vi: '',
  about_en: '',
  about_vi: '',
  city_en: '',
  city_vi: '',
  email: '',
  phone: '',
  github: '',
  linkedin: '',
  facebook: '',
  profile_image_url: '',
  cv_en_url: '',
  cv_vi_url: '',
  cv_web_vi_url: '',
}

type ProfileKey = keyof typeof empty

export function AdminProfilePage() {
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void supabase.from('site_profile').select('*').eq('key', 'main').maybeSingle().then(({ data, error }) => {
      if (error) setMessage(error.message)
      if (data) setForm({ ...empty, ...data })
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('site_profile').upsert({ key: 'main', ...form }, { onConflict: 'key' })
    setMessage(error ? error.message : 'Profile updated and published.')
  }

  const upload = async (file: File | undefined, folder: string, key: ProfileKey, label: string) => {
    if (!file) return
    try {
      setMessage(`Uploading ${label}...`)
      const url = await uploadMedia(file, folder)
      setForm((current) => ({ ...current, [key]: url }))
      setMessage(`${label} uploaded. Click Save to publish.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const input = (key: ProfileKey, label: string) => (
    <label className="admin-label">
      {label}
      <input className="admin-input" value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} />
    </label>
  )

  const uploadButton = (label: string, key: ProfileKey, accept: string, folder: string) => (
    <label className="outline-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm">
      <FileUp size={16} /> {label}
      <input type="file" accept={accept} className="hidden" onChange={(e) => void upload(e.target.files?.[0], folder, key, label)} />
    </label>
  )

  return (
    <div>
      <div>
        <div className="text-xs uppercase tracking-[.22em] text-pink-300">Site identity</div>
        <h1 className="mt-2 font-display text-5xl font-semibold">Profile</h1>
      </div>

      <form onSubmit={save} className="glass-panel mt-7 max-w-5xl rounded-2xl p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {input('brand', 'Brand label')}
          {input('full_name', 'Full name')}
          {input('role_en', 'Role - English')}
          {input('role_vi', 'Role - Vietnamese')}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="admin-label">Tagline - English<textarea rows={3} className="admin-input" value={form.tagline_en} onChange={(e) => setForm((current) => ({ ...current, tagline_en: e.target.value }))} /></label>
          <label className="admin-label">Tagline - Vietnamese<textarea rows={3} className="admin-input" value={form.tagline_vi} onChange={(e) => setForm((current) => ({ ...current, tagline_vi: e.target.value }))} /></label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="admin-label">About - English<textarea rows={5} className="admin-input" value={form.about_en} onChange={(e) => setForm((current) => ({ ...current, about_en: e.target.value }))} /></label>
          <label className="admin-label">About - Vietnamese<textarea rows={5} className="admin-input" value={form.about_vi} onChange={(e) => setForm((current) => ({ ...current, about_vi: e.target.value }))} /></label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {input('city_en', 'City - English')}
          {input('city_vi', 'City - Vietnamese')}
          {input('email', 'Public email')}
          {input('phone', 'Public phone')}
          {input('github', 'GitHub')}
          {input('linkedin', 'LinkedIn')}
          {input('facebook', 'Facebook')}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          {input('profile_image_url', 'Profile image URL')}
          <label className="outline-button mt-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm">
            <ImagePlus size={16} /> Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0], 'profiles', 'profile_image_url', 'profile photo')} />
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-pink-200/10 bg-white/[.025] p-4">
          <div className="text-sm font-semibold text-white/85">CV / Resume</div>
          <p className="mt-1 text-xs leading-5 text-white/42">Upload a PDF directly to Supabase Storage or paste any public PDF URL. The public Download CV button appears only when a URL is configured.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">{input('cv_en_url', 'English Game CV URL')}{uploadButton('Upload EN CV', 'cv_en_url', 'application/pdf', 'cv')}</div>
            <div className="space-y-2">{input('cv_vi_url', 'Vietnamese Game CV URL')}{uploadButton('Upload VI Game CV', 'cv_vi_url', 'application/pdf', 'cv')}</div>
            <div className="space-y-2">{input('cv_web_vi_url', 'Vietnamese Web CV URL')}{uploadButton('Upload VI Web CV', 'cv_web_vi_url', 'application/pdf', 'cv')}</div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Save size={16} /> Save profile</button>
          {message && <span className="text-xs text-white/42">{message}</span>}
        </div>
      </form>
    </div>
  )
}
