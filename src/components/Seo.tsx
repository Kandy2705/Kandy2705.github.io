import { useEffect } from 'react'
import { SITE_URL } from '@/lib/constants'

function setMeta(property: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`
  let element = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(isProperty ? 'property' : 'name', property)
    document.head.appendChild(element)
  }
  element.content = content
}

export function Seo({ title, description, path = '/' }: { title: string; description: string; path?: string }) {
  useEffect(() => {
    document.title = title
    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    const href = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = href
  }, [title, description, path])
  return null
}
