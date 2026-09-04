import { supabase } from '@/lib/supabase'

export async function uploadMedia(file: File, folder = 'media') {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
  const path = `${folder}/${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('portfolio-media').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path)
  return data.publicUrl
}

export const asArray = (value: string) => value.split(',').map((x) => x.trim()).filter(Boolean)
export const asJsonLocalizedArray = (value: string) => value.split('\n').filter(Boolean).map((line) => ({ en: line.trim(), vi: line.trim() }))
