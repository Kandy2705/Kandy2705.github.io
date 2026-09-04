import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Chrome, LockKeyhole, LogOut } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { ADMIN_EMAIL } from '@/lib/constants'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    let active = true
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
      setDenied(Boolean(data.session && data.session.user.email !== ADMIN_EMAIL))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setDenied(Boolean(next && next.user.email !== ADMIN_EMAIL))
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    })
  }

  if (loading) return <div className="admin-shell grid min-h-screen place-items-center text-white/45">Checking admin session...</div>

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-shell grid min-h-screen place-items-center p-5">
        <div className="glass-panel w-full max-w-xl rounded-3xl p-7 text-center">
          <Logo compact />
          <LockKeyhole className="mx-auto mt-6 text-pink-300" size={34} />
          <h1 className="mt-4 font-display text-4xl font-semibold">Connect Supabase first</h1>
          <p className="mt-4 text-sm leading-7 text-white/50">Copy <code>.env.example</code> to <code>.env</code>, add the Supabase URL and anon key, then apply the SQL migration in <code>supabase/migrations</code>.</p>
          <a href="/" className="outline-button mt-6 inline-flex rounded-xl px-4 py-2.5 text-sm">Back to portfolio</a>
        </div>
      </div>
    )
  }

  if (denied) {
    return (
      <div className="admin-shell grid min-h-screen place-items-center p-5">
        <div className="glass-panel max-w-lg rounded-3xl p-7 text-center">
          <LockKeyhole className="mx-auto text-pink-300" />
          <h1 className="mt-4 font-display text-4xl font-semibold">Access denied</h1>
          <p className="mt-3 text-sm text-white/50">Only <strong>{ADMIN_EMAIL}</strong> is allowed to manage this portfolio.</p>
          <button onClick={() => supabase.auth.signOut()} className="outline-button mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><LogOut size={16} /> Sign out</button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="admin-shell grid min-h-screen place-items-center p-5">
        <div className="glass-panel neon-border w-full max-w-lg rounded-3xl p-8 text-center">
          <div className="mx-auto flex justify-center"><Logo /></div>
          <h1 className="mt-7 font-display text-5xl font-semibold">Portfolio Admin</h1>
          <p className="mt-3 text-sm leading-6 text-white/48">Sign in with the whitelisted Google account to add projects, publish blog posts, upload certificates and update your profile.</p>
          <button onClick={login} className="neon-button mt-7 inline-flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold"><Chrome size={18} /> Continue with Google</button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
