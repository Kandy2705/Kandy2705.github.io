import JSZip from 'jszip'
import { supabase } from '@/lib/supabase'

export async function uploadMedia(file: File, folder = 'media') {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
  const path = `${folder}/${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('portfolio-media').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadMediaMany(files: File[] | FileList, folder = 'media') {
  const urls: string[] = []
  for (const file of Array.from(files)) urls.push(await uploadMedia(file, folder))
  return urls
}

const cleanZipPath = (value: string) => {
  const parts = value.replace(/\\/g, '/').split('/').filter((part) => part && part !== '.')
  if (parts.some((part) => part === '..')) throw new Error('ZIP contains an unsafe path.')
  return parts.join('/')
}

const contentTypeForPath = (path: string) => {
  let normalized = path.toLowerCase()
  if (normalized.endsWith('.br')) normalized = normalized.slice(0, -3)
  if (normalized.endsWith('.gz')) normalized = normalized.slice(0, -3)
  if (normalized.endsWith('.html')) return 'text/html; charset=utf-8'
  if (normalized.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (normalized.endsWith('.css')) return 'text/css; charset=utf-8'
  if (normalized.endsWith('.json')) return 'application/json'
  if (normalized.endsWith('.wasm')) return 'application/wasm'
  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg'
  if (normalized.endsWith('.webp')) return 'image/webp'
  if (normalized.endsWith('.svg')) return 'image/svg+xml'
  if (normalized.endsWith('.mp4')) return 'video/mp4'
  if (normalized.endsWith('.webm')) return 'video/webm'
  if (normalized.endsWith('.ogg')) return 'audio/ogg'
  return 'application/octet-stream'
}

export type WebGLUploadProgress = {
  completed: number
  total: number
  currentFile: string
}

export async function uploadUnityWebGLZip(
  file: File,
  slug: string,
  onProgress?: (progress: WebGLUploadProgress) => void,
) {
  if (!slug.trim()) throw new Error('Add a project slug before uploading a WebGL ZIP.')

  const zip = await JSZip.loadAsync(file)
  const entries = Object.values(zip.files).filter((entry) => !entry.dir && !entry.name.includes('__MACOSX'))
  const indexEntry = entries.find((entry) => /(^|\/)index\.html$/i.test(entry.name))
  if (!indexEntry) throw new Error('No index.html found. ZIP the exported Unity WebGL folder, including index.html, Build and TemplateData.')

  const normalizedIndex = indexEntry.name.replace(/^\/+/, '')
  const rootPrefix = normalizedIndex.slice(0, normalizedIndex.length - 'index.html'.length)
  const uploadEntries = entries.filter((entry) => !rootPrefix || entry.name.replace(/^\/+/, '').startsWith(rootPrefix))
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'game'
  const basePath = `webgl/${safeSlug}/${Date.now()}`
  let completed = 0

  for (const entry of uploadEntries) {
    const rawName = entry.name.replace(/^\/+/, '')
    const relativeName = cleanZipPath(rootPrefix ? rawName.slice(rootPrefix.length) : rawName)
    if (!relativeName) continue

    const blob = await entry.async('blob')
    const storagePath = `${basePath}/${relativeName}`
    const { error } = await supabase.storage.from('portfolio-media').upload(storagePath, blob, {
      upsert: true,
      contentType: contentTypeForPath(relativeName),
      cacheControl: '3600',
    })
    if (error) throw new Error(`${relativeName}: ${error.message}`)

    completed += 1
    onProgress?.({ completed, total: uploadEntries.length, currentFile: relativeName })
  }

  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(`${basePath}/index.html`)
  return data.publicUrl
}

export const asArray = (value: string) => value.split(',').map((x) => x.trim()).filter(Boolean)
export const asLines = (value: string) => value.split('\n').map((x) => x.trim()).filter(Boolean)
export const asJsonLocalizedArray = (value: string) => value.split('\n').filter(Boolean).map((line) => ({ en: line.trim(), vi: line.trim() }))
