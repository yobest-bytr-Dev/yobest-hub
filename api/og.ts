const GAMES: Record<string, { title: string; desc: string; img: string }> = {
  'a1000000-0000-0000-0000-000000000001': { title: 'Roblox Studio SharkBite UNCOPYLOCKED by BYTR', desc: 'Free Roblox SharkBite uncopylocked game with all scripts by Yobest.', img: 'https://img.youtube.com/vi/bRzzhZcNHr0/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000002': { title: 'Yobest Blade Ball uncopylocked all Scripts', desc: 'Free Blade Ball uncopylocked with all scripts included.', img: 'https://img.youtube.com/vi/gHeW6FvXmkk/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000003': { title: 'Yobest Tower Defense Anime uncopylocked Up 3', desc: 'Free Anime Tower Defense uncopylocked game by Yobest.', img: 'https://img.youtube.com/vi/XiGrxZNzpZM/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000004': { title: 'Yobest Anime Vanguard uncopylocked (all Scripts)', desc: 'Anime Vanguard uncopylocked with all scripts. Premium Roblox game.', img: 'https://img.youtube.com/vi/o3VxS9r2OwY/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000005': { title: 'Toilet Tower Defense uncopylocked UP4 By BYTR', desc: 'Free Toilet Tower Defense uncopylocked with all features.', img: 'https://img.youtube.com/vi/6mDovQ4d87M/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000006': { title: 'Pet Trade System Up 1 By BYTR', desc: 'Pet trading system template for Roblox Studio.', img: 'https://img.youtube.com/vi/pMrRFF7dHYM/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000007': { title: 'Tower Defense Anime Update 2 BYTR uncopylocked', desc: 'Free Anime Tower Defense Update 2 uncopylocked.', img: 'https://img.youtube.com/vi/97f1sqtWy6o/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000008': { title: 'Robot Simulator BYTR uncopylocked', desc: 'Free Robot Simulator uncopylocked game by Yobest.', img: 'https://img.youtube.com/vi/dsDqBZBLpfg/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000009': { title: 'Real Pls Donate Game BYTR uncopylocked', desc: 'Pls Donate game uncopylocked with full script system.', img: 'https://img.youtube.com/vi/w9OLn8YValE/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000010': { title: 'Pet Trade System and Trade Chat BYTR', desc: 'Pet trading system with trade chat for Roblox.', img: 'https://img.youtube.com/vi/kXMamYt5Zd8/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000011': { title: 'Real Donation Game uncopylocked BYTR', desc: 'Donation game uncopylocked with working donate system.', img: 'https://img.youtube.com/vi/5BYv9x_E2Iw/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000012': { title: 'Race Clicker BYTR uncopylocked', desc: 'Race clicker game uncopylocked by Yobest.', img: 'https://img.youtube.com/vi/bW3ILQnV6Rw/maxresdefault.jpg' },
  'a1000000-0000-0000-0000-000000000013': { title: 'Pet Companions BYTR uncopylocked', desc: 'Pet companions system UI kit for Roblox.', img: 'https://img.youtube.com/vi/KATJLumZSOs/maxresdefault.jpg' },
  'bRzzhZcNHr0': { title: 'Roblox Studio SharkBite UNCOPYLOCKED by BYTR', desc: 'Free Roblox SharkBite uncopylocked game with all scripts by Yobest.', img: 'https://img.youtube.com/vi/bRzzhZcNHr0/maxresdefault.jpg' },
  'gHeW6FvXmkk': { title: 'Yobest Blade Ball uncopylocked all Scripts', desc: 'Free Blade Ball uncopylocked with all scripts included.', img: 'https://img.youtube.com/vi/gHeW6FvXmkk/maxresdefault.jpg' },
  'XiGrxZNzpZM': { title: 'Yobest Tower Defense Anime uncopylocked Up 3', desc: 'Free Anime Tower Defense uncopylocked game by Yobest.', img: 'https://img.youtube.com/vi/XiGrxZNzpZM/maxresdefault.jpg' },
  'o3VxS9r2OwY': { title: 'Yobest Anime Vanguard uncopylocked (all Scripts)', desc: 'Anime Vanguard uncopylocked with all scripts.', img: 'https://img.youtube.com/vi/o3VxS9r2OwY/maxresdefault.jpg' },
  '6mDovQ4d87M': { title: 'Toilet Tower Defense uncopylocked UP4 By BYTR', desc: 'Free Toilet Tower Defense uncopylocked.', img: 'https://img.youtube.com/vi/6mDovQ4d87M/maxresdefault.jpg' },
  'pMrRFF7dHYM': { title: 'Pet Trade System Up 1 By BYTR', desc: 'Pet trading system template for Roblox Studio.', img: 'https://img.youtube.com/vi/pMrRFF7dHYM/maxresdefault.jpg' },
  '97f1sqtWy6o': { title: 'Tower Defense Anime Update 2 BYTR uncopylocked', desc: 'Free Anime Tower Defense Update 2.', img: 'https://img.youtube.com/vi/97f1sqtWy6o/maxresdefault.jpg' },
  'dsDqBZBLpfg': { title: 'Robot Simulator BYTR uncopylocked', desc: 'Free Robot Simulator uncopylocked.', img: 'https://img.youtube.com/vi/dsDqBZBLpfg/maxresdefault.jpg' },
  'w9OLn8YValE': { title: 'Real Pls Donate Game BYTR uncopylocked', desc: 'Pls Donate game uncopylocked.', img: 'https://img.youtube.com/vi/w9OLn8YValE/maxresdefault.jpg' },
  'kXMamYt5Zd8': { title: 'Pet Trade System and Trade Chat BYTR', desc: 'Pet trading system with trade chat.', img: 'https://img.youtube.com/vi/kXMamYt5Zd8/maxresdefault.jpg' },
  '5BYv9x_E2Iw': { title: 'Real Donation Game uncopylocked BYTR', desc: 'Donation game uncopylocked.', img: 'https://img.youtube.com/vi/5BYv9x_E2Iw/maxresdefault.jpg' },
  'bW3ILQnV6Rw': { title: 'Race Clicker BYTR uncopylocked', desc: 'Race clicker game uncopylocked.', img: 'https://img.youtube.com/vi/bW3ILQnV6Rw/maxresdefault.jpg' },
  'KATJLumZSOs': { title: 'Pet Companions BYTR uncopylocked', desc: 'Pet companions system UI kit.', img: 'https://img.youtube.com/vi/KATJLumZSOs/maxresdefault.jpg' },
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function handler(req: any, res: any) {
  const gameId = (req.query.id as string) || ''
  const game = GAMES[gameId]
  const base = 'https://yobestbytr.vercel.app'

  if (game) {
    const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(game.title)} — Yobest" />
<meta property="og:description" content="${esc(game.desc)}" />
<meta property="og:image" content="${game.img}" />
<meta property="og:image:width" content="1280" />
<meta property="og:image:height" content="720" />
<meta property="og:url" content="${base}/games/${gameId}" />
<meta property="og:site_name" content="Yobest" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(game.title)} — Yobest" />
<meta name="twitter:description" content="${esc(game.desc)}" />
<meta name="twitter:image" content="${game.img}" />
<meta http-equiv="refresh" content="0;url=${base}/games/${gameId}" />
<title>${esc(game.title)} — Yobest</title>
</head><body>
<script>window.location.replace("${base}/games/${gameId}")</script>
<p>Redirecting to <a href="${base}/games/${gameId}">${esc(game.title)}</a>...</p>
</body></html>`
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 's-maxage=86400, maxage=0')
    return res.send(html)
  }

  const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8" />
<meta property="og:title" content="Yobest — The Roblox Creator Platform" />
<meta property="og:description" content="Build games with AI assistance, share with the community, and monetize your creations." />
<meta property="og:image" content="${base}/YobestLogo.png" />
<meta http-equiv="refresh" content="0;url=${base}/" />
</head><body>
<script>window.location.replace("${base}/")</script>
<p>Redirecting to <a href="${base}/">Yobest</a>...</p>
</body></html>`
  res.setHeader('Content-Type', 'text/html')
  return res.send(html)
}
