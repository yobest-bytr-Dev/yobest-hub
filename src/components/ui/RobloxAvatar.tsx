import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getDecorationUrl } from '@/lib/avatar-decorations'

interface RobloxAvatarProps {
  userId?: string | number
  username?: string
  avatarUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showOnline?: boolean
  className?: string
  onClick?: () => void
  decoration?: string | null
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

const decoSizeMap = {
  xs: 'w-9 h-9',
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
}

const borderSizeMap = {
  xs: 'border',
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-3',
  xl: 'border-4',
}

const avatarCache = new Map<string, string>()

function getFallbackUrl(username?: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=3b82f6&color=fff&bold=true&size=150`
}

function isRealUrl(url?: string): boolean {
  if (!url) return false
  if (url.includes('ui-avatars.com')) return false
  if (url.includes('thumbnails.roblox.com')) return false
  return url.startsWith('http')
}

async function fetchAvatarUrls(userIds: (string | number)[]): Promise<Record<string, string>> {
  const toFetch = userIds.filter((id) => id && !avatarCache.has(String(id)))
  if (toFetch.length === 0) return {}

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return {}

  try {
    const ids = toFetch.map(String).join(',')
    const res = await fetch(
      `${supabaseUrl}/functions/v1/roblox-avatar?userIds=${ids}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data && typeof data === 'object' && !data.error) {
        for (const [id, url] of Object.entries(data)) {
          if (typeof url === 'string' && url.startsWith('http')) {
            avatarCache.set(id, url)
          }
        }
      }
    }
  } catch {}

  return Object.fromEntries(
    toFetch
      .map(String)
      .filter((id) => avatarCache.has(id))
      .map((id) => [id, avatarCache.get(id)!])
  )
}

export default function RobloxAvatar({
  userId,
  username,
  avatarUrl,
  size = 'md',
  showOnline = false,
  className,
  onClick,
  decoration,
}: RobloxAvatarProps) {
  const [src, setSrc] = useState(() => {
    const id = userId ? String(userId) : null
    if (id && avatarCache.has(id)) return avatarCache.get(id)!
    if (isRealUrl(avatarUrl)) return avatarUrl!
    return getFallbackUrl(username)
  })

  useEffect(() => {
    if (!userId) {
      setSrc(isRealUrl(avatarUrl) ? avatarUrl! : getFallbackUrl(username))
      return
    }

    const id = String(userId)
    if (avatarCache.has(id)) {
      setSrc(avatarCache.get(id)!)
      return
    }

    fetchAvatarUrls([userId]).then(() => {
      if (avatarCache.has(id)) {
        setSrc(avatarCache.get(id)!)
      }
    })
  }, [userId, avatarUrl, username])

  const decoUrl = getDecorationUrl(decoration)

  return (
    <div className={cn('relative shrink-0', onClick && 'cursor-pointer', className)} onClick={onClick}>
      {decoUrl && (
        <img
          src={decoUrl}
          alt=""
          className={cn(
            decoSizeMap[size],
            'absolute inset-0 m-auto pointer-events-none z-10 object-contain drop-shadow-md'
          )}
          draggable={false}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <img
        src={src}
        alt={username || 'User'}
        className={cn(
          sizeMap[size],
          borderSizeMap[size],
          'rounded-full border-border-primary object-cover bg-bg-elevated relative z-0',
          onClick && 'hover:border-accent-blue/50 transition-colors'
        )}
        onError={(e) => {
          const img = e.target as HTMLImageElement
          if (!img.dataset.fallback) {
            img.dataset.fallback = '1'
            img.src = getFallbackUrl(username)
          }
        }}
      />
      {showOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-bg-primary z-20" />
      )}
    </div>
  )
}

export function preloadAvatars(userIds: (string | number)[]) {
  const ids = userIds.filter((id) => id && !avatarCache.has(String(id)))
  if (ids.length > 0) fetchAvatarUrls(ids)
}
