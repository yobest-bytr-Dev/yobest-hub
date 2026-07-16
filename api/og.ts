import { createClient } from '@supabase/supabase-js'

const SITE = 'Yobest'
const BASE = 'https://yobest-bytr.vercel.app'
const DEFAULT_IMG = `${BASE}/YobestLogo.png`
const DEFAULT_DESC = 'Build games with AI assistance, share with the community, and monetize your creations.'

const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://pohslivolczprxacroje.supabase.co'
const SB_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(SB_URL, SB_KEY)

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ytThumb(url?: string): string | null {
  if (!url?.includes('youtube.com')) return null
  const m = url.match(/v=([^&]+)/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

function buildPage(title: string, desc: string, img: string, url: string) {
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:image:width" content="1280"/>
<meta property="og:image:height" content="720"/>
<meta property="og:url" content="${url}"/>
<meta property="og:site_name" content="${SITE}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(desc)}"/>
<meta name="twitter:image" content="${img}"/>
<meta http-equiv="refresh" content="0;url=${url}"/>
<title>${esc(title)}</title>
</head><body>
<script>window.location.replace("${url}")</script>
<p>Redirecting to <a href="${url}">${esc(title)}</a>...</p>
</body></html>`
}

export default async function handler(req: any, res: any) {
  const id = (req.query.id as string) || ''
  const pageUrl = `${BASE}/games/${id}`

  let game: any = null

  if (id) {
    try {
      const { data, error } = await supabase.from('experiences').select('title, description, thumbnail_url, video_url').eq('id', id).limit(1)
      if (!error && data && data.length > 0) {
        game = data[0]
      }
    } catch {}

    if (!game) {
      try {
        const { data, error } = await supabase.from('submissions').select('title, description, thumbnail_url, video_url').eq('id', id).limit(1)
        if (!error && data && data.length > 0) {
          game = data[0]
        }
      } catch {}
    }
  }

  if (game) {
    const img = game.thumbnail_url || ytThumb(game.video_url) || DEFAULT_IMG
    const desc = game.description || `${game.title} — Free Roblox game on ${SITE}`
    const title = `${game.title} — ${SITE}`
    const html = buildPage(title, desc, img, pageUrl)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, maxage=0')
    return res.send(html)
  }

  const html = buildPage(`${SITE} — The Roblox Creator Platform`, DEFAULT_DESC, DEFAULT_IMG, `${BASE}/`)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.send(html)
}
