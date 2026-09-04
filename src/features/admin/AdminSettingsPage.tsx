import { ExternalLink, KeyRound, ShieldCheck } from 'lucide-react'
import { ADMIN_EMAIL, SITE_URL } from '@/lib/constants'

export function AdminSettingsPage() {
  return (
    <div>
      <div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Deployment</div><h1 className="mt-2 font-display text-5xl font-semibold">Settings</h1></div>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6"><ShieldCheck className="text-pink-300" /><h2 className="mt-4 font-semibold">Admin whitelist</h2><p className="mt-2 text-sm text-white/48">Only this Google account can write content through RLS:</p><code className="mt-4 block rounded-xl bg-black/30 p-3 text-xs text-pink-200">{ADMIN_EMAIL}</code></div>
        <div className="glass-panel rounded-2xl p-6"><ExternalLink className="text-pink-300" /><h2 className="mt-4 font-semibold">Public site</h2><p className="mt-2 text-sm text-white/48">GitHub Pages target:</p><a href={SITE_URL} target="_blank" rel="noreferrer" className="mt-4 block text-sm text-pink-200">{SITE_URL}</a></div>
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2"><KeyRound className="text-pink-300" /><h2 className="mt-4 font-semibold">Secrets that never go in Git</h2><div className="mt-4 grid gap-2 text-xs text-white/48"><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_ANON_KEY</code><code>VITE_GA_MEASUREMENT_ID (optional)</code><code>RESEND_API_KEY (Supabase Edge Function secret)</code><code>CONTACT_TO_EMAIL=man.ngoman2705@gmail.com</code></div></div>
      </div>
    </div>
  )
}
