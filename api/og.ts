const SITE = 'Yobest'
const BASE = 'https://yobest-bytr.vercel.app'
const DEFAULT_IMG = `${BASE}/YobestLogo.png`
const DEFAULT_DESC = 'Build games with AI assistance, share with the community, and monetize your creations.'

const SB_URL = 'https://pohslivolczprxacroje.supabase.co'
const SB_KEY = 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ytThumb(url?: string | null): string | null {
  if (!url?.includes('youtube.com')) return null
  const m = url.match(/v=([^&]+)/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

async function sbGet(table: string, id: string): Promise<any> {
  const url = `${SB_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}&select=title,description,thumbnail_url,video_url&limit=1`
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data && data.length > 0) ? data[0] : null
  } catch {
    return null
  }
}

async function fetchGame(id: string): Promise<{ title: string; description: string; img: string } | null> {
  if (!id) return null

  let row = await sbGet('experiences', id)
  if (!row) row = await sbGet('submissions', id)
  if (!row) return null

  const img = row.thumbnail_url || ytThumb(row.video_url) || DEFAULT_IMG
  const desc = row.description || `${row.title} — Free Roblox game on ${SITE}`
  return { title: row.title, description: desc, img }
}

function buildRedirect(title: string, desc: string, img: string, url: string) {
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

function injectOg(html: string, title: string, desc: string, img: string, url: string): string {
  const newTitle = `<title>${esc(title)}</title>`
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

  const defaultBlock = `<meta property="og:type" content="website" />
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

  if (html.includes(defaultBlock)) {
    html = html.replace(defaultBlock, ogTags)
  }
  html = html.replace(`<title>Yobest — The Roblox Creator Platform</title>`, newTitle)

  return html
}

export default async function handler(req: any, res: any) {
  const id = (req.query.id as string) || ''
  const spa = req.query.spa === '1'

  const game = await fetchGame(id)

  if (spa) {
    try {
      const indexRes = await fetch(`${BASE}/index.html`)
      if (indexRes.ok) {
        let html = await indexRes.text()
        if (game) {
          const pageUrl = `${BASE}/games/${id}`
          html = injectOg(html, `${game.title} — ${SITE}`, game.description, game.img, pageUrl)
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 's-maxage=300, maxage=0')
        return res.send(html)
      }
    } catch {}
    res.statusCode = 500
    return res.send('Failed to load page')
  }

  const pageUrl = `${BASE}/games/${id}`

  if (game) {
    const html = buildRedirect(`${game.title} — ${SITE}`, game.description, game.img, pageUrl)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, maxage=0')
    return res.send(html)
  }

  const html = buildRedirect(`${SITE} — The Roblox Creator Platform`, DEFAULT_DESC, DEFAULT_IMG, `${BASE}/`)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.send(html)
}
