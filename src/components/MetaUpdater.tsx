import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { experiences } from '@/data/official-games'
import { supabase } from '@/config/supabase'

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

function setDefaultMeta() {
  const title = `${SITE_NAME} — The Roblox Creator Platform`
  document.title = title
  setMeta('og:title', title)
  setMeta('og:description', DEFAULT_DESC)
  setMeta('og:image', DEFAULT_IMAGE)
  setMeta('og:type', 'website')
  setMeta('og:site_name', SITE_NAME)
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title)
  setMeta('twitter:description', DEFAULT_DESC)
  setMeta('twitter:image', DEFAULT_IMAGE)
}

async function resolveGameData(pathname: string): Promise<{ title?: string; description?: string; image?: string }> {
  // Game detail page
  const gameMatch = pathname.match(/\/games\/([^/]+)/)
  if (gameMatch) {
    const id = gameMatch[1]
    // Try static list first
    const staticGame = experiences.find((g) => g.id === id)
    if (staticGame) {
      const thumbId = staticGame.video_url?.includes('youtube.com') ? staticGame.video_url.match(/v=([^&]+)/)?.[1] : null
      return {
        title: `${staticGame.title} — ${SITE_NAME}`,
        description: staticGame.description || `${staticGame.title} — Free Roblox game on ${SITE_NAME}`,
        image: staticGame.thumbnail_url || (thumbId ? `https://img.youtube.com/vi/${thumbId}/maxresdefault.jpg` : DEFAULT_IMAGE),
      }
    }
    // Fetch from database (experiences or submissions)
    try {
      let { data: game } = await supabase.from('experiences').select('title, description, thumbnail_url, video_url').eq('id', id).maybeSingle()
      if (!game) {
        const { data: sub } = await supabase.from('submissions').select('title, description, thumbnail_url, video_url').eq('id', id).maybeSingle()
        game = sub
      }
      if (game) {
        const thumbId = game.video_url?.includes('youtube.com') ? game.video_url.match(/v=([^&]+)/)?.[1] : null
        return {
          title: `${game.title} — ${SITE_NAME}`,
          description: game.description || `${game.title} — Free Roblox game on ${SITE_NAME}`,
          image: game.thumbnail_url || (thumbId ? `https://img.youtube.com/vi/${thumbId}/maxresdefault.jpg` : DEFAULT_IMAGE),
        }
      }
    } catch {}
  }
  // Marketplace page
  if (pathname.match(/^\/marketplace\/?$/)) {
    return {
      title: `Asset Marketplace — ${SITE_NAME}`,
      description: 'Scripts, models, and UI kits for your Roblox games.',
      image: DEFAULT_IMAGE,
    }
  }
  // AI page
  if (pathname.match(/^\/ai\/?$/)) {
    return {
      title: `AI Architect — ${SITE_NAME}`,
      description: 'AI coding assistant connected to your Roblox Studio.',
      image: DEFAULT_IMAGE,
    }
  }
  // Tool pages
  if (pathname.match(/^\/tools\/3d-generator\/?$/)) {
    return {
      title: `3D Model Generator — ${SITE_NAME}`,
      description: 'Generate stunning 3D models from text descriptions using AI. Download as GLB for Blender, Roblox Studio, or other 3D software.',
      image: DEFAULT_IMAGE,
    }
  }
  if (pathname.match(/^\/tools\/ui-generator\/?$/)) {
    return {
      title: `Roblox UI Generator — ${SITE_NAME}`,
      description: 'Build professional Roblox game interfaces with AI. Design shops, menus, HUDs, inventories — export as Lua, .rbxmx, or JSON.',
      image: DEFAULT_IMAGE,
    }
  }
  if (pathname.match(/^\/tools\/?$/)) {
    return {
      title: `Tools — ${SITE_NAME}`,
      description: 'Official tools and utilities for Roblox developers. 3D Model Generator, UI Generator, and more.',
      image: DEFAULT_IMAGE,
    }
  }
  return {}
}

export default function MetaUpdater() {
  const location = useLocation()
  const abortRef = useRef(0)

  useEffect(() => {
    const run = async () => {
      const gen = ++abortRef.current
      const meta = await resolveGameData(location.pathname)
      if (gen !== abortRef.current) return

      const url = `${BASE_URL}${location.pathname}`

      if (!meta.title) {
        setDefaultMeta()
      } else {
        document.title = meta.title
        setMeta('og:title', meta.title)
        setMeta('og:description', meta.description || DEFAULT_DESC)
        setMeta('og:image', meta.image || DEFAULT_IMAGE)
        setMeta('og:type', 'website')
        setMeta('og:site_name', SITE_NAME)
        setMeta('twitter:card', 'summary_large_image')
        setMeta('twitter:title', meta.title)
        setMeta('twitter:description', meta.description || DEFAULT_DESC)
        setMeta('twitter:image', meta.image || DEFAULT_IMAGE)
      }
      setMeta('og:url', url)
    }
    run()
  }, [location.pathname])

  return null
}
