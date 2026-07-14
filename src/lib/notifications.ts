export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'system' | 'message'
  title: string
  body: string
  link?: string
  read: boolean
  created_at: string
}

const STORAGE_KEY = 'yobest_notifications'

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotifications(notifs: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 100)))
  } catch {}
}

export function getNotifications(): Notification[] {
  return loadNotifications()
}

export function getUnreadNotificationCount(): number {
  return loadNotifications().filter((n) => !n.read).length
}

export function addNotification(n: Omit<Notification, 'id' | 'read' | 'created_at'>): Notification {
  const notif: Notification = {
    ...n,
    id: crypto.randomUUID(),
    read: false,
    created_at: new Date().toISOString(),
  }
  const all = loadNotifications()
  all.unshift(notif)
  saveNotifications(all)
  return notif
}

export function markNotificationRead(id: string) {
  const all = loadNotifications()
  const n = all.find((x) => x.id === id)
  if (n) n.read = true
  saveNotifications(all)
}

export function markAllNotificationsRead() {
  const all = loadNotifications()
  for (const n of all) n.read = true
  saveNotifications(all)
}

export function clearNotifications() {
  saveNotifications([])
}

export function removeNotification(id: string) {
  const all = loadNotifications().filter((n) => n.id !== id)
  saveNotifications(all)
}

const VAPID_PUBLIC_KEY = '' // Will be configured later

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendLocalNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: icon || `${import.meta.env.BASE_URL}YobestLogo.png`,
    badge: `${import.meta.env.BASE_URL}YobestLogo.png`,
  })
}

export function setupNotificationListener() {
  // Listen for Supabase realtime notifications or periodic checks
  // For now, we'll use localStorage-based notifications
}
