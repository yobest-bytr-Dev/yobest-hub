import { createClient } from '@supabase/supabase-js'

const SITE = 'Yobest'
const BASE = 'https://yobest-bytr.vercel.app'
const DEFAULT_IMG = `${BASE}/YobestLogo.png`
const DEFAULT_DESC = 'Build games with AI assistance, share with the community, and monetize your creations.'

const SB_URL = process.env.SUPABASE_URL || 'https://pohslivolczprxacroje.supabase.co'
const SB_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'
const supabase = createClient(SB_URL, SB_KEY)

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ytThumb(url?: string): string | null {
  if (!url?.includes('youtube.com')) return null
  const m = url.match(/v=([^&]+)/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

async function fetchGame(id: string): Promise<{ title: string; description: string; img: string } | null> {
  if (!id) return null
  try {
    const { data, error } = await supabase.from('experiences').select('title, description, thumbnail_url, video_url').eq('id', id).limit(1)
    if (!error && data && data.length > 0) {
      const g = data[0]
      const img = g.thumbnail_url || ytThumb(g.video_url) || DEFAULT_IMG
      return { title: g.title, description: g.description || `${g.title} — Free Roblox game on ${SITE}`, img }
    }
  } catch {}
  try {
    const { data, error } = await supabase.from('submissions').select('title, description, thumbnail_url, video_url').eq('id', id).limit(1)
    if (!error && data && data.length > 0) {
      const g = data[0]
      const img = g.thumbnail_url || ytThumb(g.video_url) || DEFAULT_IMG
      return { title: g.title, description: g.description || `${g.title} — Free Roblox game on ${SITE}`, img }
    }
  } catch {}
  return null
}

function buildRedirectPage(title: string, desc: string, img: string, url: string) {
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

function injectOgIntoHtml(html: string, title: string, desc: string, img: string, url: string): string {
  const ogTags = `<meta property="og:type" content="website"/>
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
    <meta name="twitter:image" content="${img}"/>`

  const defaultOgBlock = `<meta property="og:type" content="website" />
    <meta property="og:title" content="Yobest — The Roblox Creator Platform" />
    <meta property="og:description" content="Build games with AI assistance, share with the community, and monetize your creations." />
    <meta property="og:url" content="https://yobest.app" />
    <meta property="og:image" content="https://yobest.app/YobestLogo.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Yobest" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Yobest — The Roblox Creator Platform" />
    <meta name="twitter:description" content="Build games with AI assistance, share with the community, and monetize your creations." />
    <meta name="twitter:image" content="https://yobest.app/YobestLogo.png" />`

  if (html.includes(defaultOgBlock)) {
    return html.replace(defaultOgBlock, ogTags)
  }

  const titleTag = `<title>Yobest — The Roblox Creator Platform</title>`
  if (html.includes(titleTag)) {
    return html.replace(titleTag, `<title>${esc(title)}</title>\n    ${ogTags}`)
  }

  return html.replace('</head>', `  ${ogTags}\n  </head>`)
}

export default async function handler(req: any, res: any) {
  const id = (req.query.id as string) || ''
  const spa = req.query.spa === '1'
  const game = await fetchGame(id)

  if (spa) {
    if (game) {
      const pageUrl = `${BASE}/games/${id}`
      try {
        const indexRes = await fetch(`${BASE}/index.html`)
        if (indexRes.ok) {
          let html = await indexRes.text()
          html = injectOgIntoHtml(html, `${game.title} — ${SITE}`, game.description, game.img, pageUrl)
          html = html.replace(`<title>Yobest — The Roblox Creator Platform</title>`, `<title>${esc(game.title)} — ${SITE}</title>`)
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 's-maxage=300, maxage=0')
          return res.send(html)
        }
      } catch {}
    }

    const indexRes = await fetch(`${BASE}/index.html`)
    if (indexRes.ok) {
      const html = await indexRes.text()
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(html)
    }
    res.statusCode = 500
    return res.send('Failed to load page')
  }

  const pageUrl = `${BASE}/games/${id}`

  if (game) {
    const html = buildRedirectPage(`${game.title} — ${SITE}`, game.description, game.img, pageUrl)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, maxage=0')
    return res.send(html)
  }

  const html = buildRedirectPage(`${SITE} — The Roblox Creator Platform`, DEFAULT_DESC, DEFAULT_IMG, `${BASE}/`)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.send(html)
}
