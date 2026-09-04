import fs from 'node:fs'
import path from 'node:path'

const site = (process.env.VITE_SITE_URL || 'https://kandy2705.github.io').replace(/\/$/, '')
const urls = new Set(['/', '/about', '/projects', '/experience', '/blog'])

const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

async function addDynamic(table, prefix) {
  if (!supabaseUrl || !anonKey || supabaseUrl.includes('YOUR_PROJECT')) return
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=slug`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    })
    if (!response.ok) return
    const rows = await response.json()
    rows.forEach((row) => row.slug && urls.add(`/${prefix}/${row.slug}`))
  } catch {
    // Static routes are still enough for a valid sitemap.
  }
}

await addDynamic('projects', 'projects')
await addDynamic('blog_posts', 'blog')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map((url) => `  <url><loc>${site}${url}</loc></url>`).join('\n')}\n</urlset>\n`

fs.writeFileSync(path.resolve('public/sitemap.xml'), xml)
console.log(`Generated sitemap with ${urls.size} URLs.`)
