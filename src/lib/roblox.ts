export interface RobloxUser {
  userId: number
  username: string
  displayName: string
  avatarUrl: string
}

export async function verifyRobloxUsername(username: string): Promise<RobloxUser | null> {
  const clean = username.trim()
  if (clean.length < 3) return null

  // Try Edge Function first
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      const response = await fetch(`${supabaseUrl}/functions/v1/roblox-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ username: clean }),
        signal: AbortSignal.timeout(8000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          return {
            userId: data.userId,
            username: data.username,
            displayName: data.displayName,
            avatarUrl: data.avatarUrl,
          }
        }
      }
    }
  } catch {
    // Edge Function not deployed or unreachable, try direct
  }

  // Direct Roblox API (browser may have CORS issues, but Roblox allows it)
  try {
    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [clean] }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) return null

    const data = await response.json()
    if (!data.data || data.data.length === 0) return null

    const robloxUser = data.data[0]

    // Try to get real avatar
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(robloxUser.name[0])}&background=3b82f6&color=fff&bold=true&size=150`

    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUser.id}&size=150x150&format=Png&isCircular=false`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json()
        if (thumbData.data?.[0]?.imageUrl) {
          avatarUrl = thumbData.data[0].imageUrl
        }
      }
    } catch {
      // Keep fallback avatar
    }

    return {
      userId: robloxUser.id,
      username: robloxUser.name,
      displayName: robloxUser.displayName,
      avatarUrl,
    }
  } catch {
    return null
  }
}

export function getRobloxAvatarUrl(userId: number): string {
  return `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
}
