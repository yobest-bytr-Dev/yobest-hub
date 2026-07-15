import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { experiences } from '@/data/official-games'

const SITE_NAME = 'Yobest'
const BASE_URL = 'https://yobest.app'
const DEFAULT_IMAGE = `${BASE_URL}/YobestLogo.png`
const DEFAULT_DESC = 'Build games with AI assistance, share with the community, and monetize your creations.'

function setMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (property.startsWith('og:')) {
      el.setAttribute('property', property)
    } else {
      el.setAttribute('name', property)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function resolveGameData(pathname: string): { title?: string; description?: string; image?: string } {
  const gameMatch = pathname.match(/\/games\/([^/]+)/)
  if (gameMatch) {
    const id = gameMatch[1]
    const game = experiences.find((g) => g.id === id)
    if (game) {
      const thumbId = game.video_url?.includes('youtube.com') ? game.video_url.match(/v=([^&]+)/)?.[1] : null
      return {
        title: `${game.title} — ${SITE_NAME}`,
        description: game.description || `${game.title} — Free Roblox game on ${SITE_NAME}`,
        image: game.thumbnail_url || (thumbId ? `https://img.youtube.com/vi/${thumbId}/maxresdefault.jpg` : DEFAULT_IMAGE),
      }
    }
  }
  const assetMatch = pathname.match(/\/marketplace/)
  if (assetMatch) {
    return {
      title: `Asset Marketplace — ${SITE_NAME}`,
      description: 'Scripts, models, and UI kits for your Roblox games.',
      image: DEFAULT_IMAGE,
    }
  }
  const aiMatch = pathname.match(/\/ai/)
  if (aiMatch) {
    return {
      title: `AI Architect — ${SITE_NAME}`,
      description: 'AI coding assistant connected to your Roblox Studio.',
      image: DEFAULT_IMAGE,
    }
  }
  return {}
}

export default function MetaUpdater() {
  const location = useLocation()

  useEffect(() => {
    const meta = resolveGameData(location.pathname)

    const title = meta.title || `${SITE_NAME} — The Roblox Creator Platform`
    const desc = meta.description || DEFAULT_DESC
    const image = meta.image || DEFAULT_IMAGE
    const url = `${BASE_URL}/${location.pathname}`

    document.title = title

    setMeta('og:title', title)
    setMeta('og:description', desc)
    setMeta('og:image', image)
    setMeta('og:url', url)

    setMeta('twitter:title', title)
    setMeta('twitter:description', desc)
    setMeta('twitter:image', image)
  }, [location.pathname])

  return null
}
