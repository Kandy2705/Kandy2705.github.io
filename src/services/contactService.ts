import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContact(payload: ContactPayload) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet. Copy .env.example to .env and add your credentials.')
  }

  const { error } = await supabase.from('contact_messages').insert(payload)
  if (error) throw error

  const { error: functionError } = await supabase.functions.invoke('send-contact-email', {
    body: payload,
  })

  return { stored: true, emailed: !functionError }
}
