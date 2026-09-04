import { useEffect } from 'react'

export function Analytics() {
  useEffect(() => {
    const id = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
    if (!id || document.getElementById('ga-script')) return
    const script = document.createElement('script')
    script.id = 'ga-script'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)

    const inline = document.createElement('script')
    inline.id = 'ga-inline'
    inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`
    document.head.appendChild(inline)
  }, [])

  return null
}
