import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://cfslauzvgirsaqkdqxgn.supabase.co'
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GIy0V9vJBEIG7j_TFQLgEA__NM-OsgB'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT'))

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
