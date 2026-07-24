import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

export function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'Uncopylocked': 'bg-green-500/15 text-green-400 border-green-500/25',
    'Minigame': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    'Anime': 'bg-pink-500/15 text-pink-400 border-pink-500/25',
    'Paid': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    'Tower Defense': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    'Script Kit': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    'UI Kit': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    'Core API': 'bg-teal-500/15 text-teal-400 border-teal-500/25',
    'Template': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  }
  return map[category] || 'bg-gray-500/15 text-gray-400 border-gray-500/25'
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  if (isNaN(then)) return ''
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}
