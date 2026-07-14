export function updatePageMeta(opts: {
  title?: string
  description?: string
  image?: string
  url?: string
}) {
  const title = opts.title ? `${opts.title} — Yobest` : 'Yobest — The Roblox Creator Platform'
  document.title = title

  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  const setName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  if (opts.description) {
    setMeta('og:description', opts.description)
    setName('description', opts.description)
    setName('twitter:description', opts.description)
  }
  if (opts.image) {
    setMeta('og:image', opts.image)
    setName('twitter:image', opts.image)
  }
  if (opts.url) {
    setMeta('og:url', opts.url)
  }
  setMeta('og:title', title)
  setName('twitter:title', title)
}
