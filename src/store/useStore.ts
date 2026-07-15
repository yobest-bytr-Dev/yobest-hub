import { create } from 'zustand'
import type { ChatMessage, UserProfile } from '@/lib/types'
import { sendDbMessage, fetchDbMessages, markDbMessagesRead, getCurrentUser, getProfile } from '@/lib/api'
import { supabase } from '@/config/supabase'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Conversation {
  participantId: string
  participantName: string
  participantAvatar: string
  participantRobloxId?: string
  lastMessage: string
  lastTime: string
  unread: number
}

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void

  aiModel: string
  setAiModel: (model: string) => void

  studioConnected: boolean
  studioToken: string
  setStudioConnected: (connected: boolean) => void
  setStudioToken: (token: string) => void
  disconnectStudio: () => void

  currentUser: UserProfile | null
  setCurrentUser: (user: UserProfile | null) => void
  setAvatarDecoration: (decoration: string) => void

  platformStats: {
    officialGames: number
    creators: number
    assets: number
    communityGames: number
  }
  setPlatformStats: (stats: AppState['platformStats']) => void

  siteAnalytics: {
    visitors: number
    downloads: number
    aiSessions: number
  }
  setSiteAnalytics: (analytics: AppState['siteAnalytics']) => void

  following: string[]
  loadFollowing: () => void
  toggleFollow: (userId: string) => Promise<void>
  isFollowing: (userId: string) => boolean

  messages: Message[]
  conversations: Conversation[]
  sendMessage: (to: string, toName: string, toAvatar: string, toRobloxId: string, content: string) => Promise<boolean>
  markRead: (participantId: string) => void
  loadMessages: () => Promise<void>
  getConversation: (participantId: string) => Message[]
  getUnreadCount: (participantId: string) => number
}

const FOLLOWING_KEY = 'yobest_following'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

const profileCache = new Map<string, { username: string; avatar_url: string; roblox_id?: string }>()

async function resolveProfile(userId: string) {
  if (profileCache.has(userId)) return profileCache.get(userId)!
  const profile = await getProfile(userId)
  if (profile) {
    const info = { username: profile.username, avatar_url: profile.avatar_url, roblox_id: profile.roblox_id }
    profileCache.set(userId, info)
    return info
  }
  return null
}

function buildConversations(messages: Message[], currentUserId: string, profiles: Map<string, { username: string; avatar_url: string; roblox_id?: string }>): Conversation[] {
  const map = new Map<string, Conversation>()
  for (const m of messages) {
    const otherId = m.sender_id === currentUserId ? m.receiver_id : m.sender_id
    const profile = profiles.get(otherId)
    const existing = map.get(otherId)
    const unread = m.sender_id !== currentUserId && !m.is_read ? 1 : 0
    if (!existing || m.created_at > existing.lastTime) {
      map.set(otherId, {
        participantId: otherId,
        participantName: profile?.username || otherId.slice(0, 8),
        participantAvatar: profile?.avatar_url || '',
        participantRobloxId: profile?.roblox_id,
        lastMessage: m.content,
        lastTime: m.created_at,
        unread: existing ? existing.unread + unread : unread,
      })
    } else {
      if (m.sender_id !== currentUserId && !m.is_read) {
        existing.unread += 1
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
}

export const useStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  chatMessages: [],
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),

  aiModel: 'google/gemini-2.5-flash',
  setAiModel: (model) => set({ aiModel: model }),

  studioConnected: false,
  studioToken: '',
  setStudioConnected: (connected) => set({ studioConnected: connected }),
  setStudioToken: (token) => set({ studioToken: token }),
  disconnectStudio: () => set({ studioConnected: false, studioToken: '' }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAvatarDecoration: (decoration) => {
    const { currentUser } = get()
    if (!currentUser) return
    const updated = { ...currentUser, avatar_decoration: decoration }
    set({ currentUser: updated })
    localStorage.setItem('yobest_avatar_decoration', decoration)
  },

  platformStats: { officialGames: 13, creators: 0, assets: 0, communityGames: 0 },
  setPlatformStats: (stats) => set({ platformStats: stats }),

  siteAnalytics: { visitors: 0, downloads: 0, aiSessions: 0 },
  setSiteAnalytics: (analytics) => set({ siteAnalytics: analytics }),

  following: loadFromStorage<string[]>(FOLLOWING_KEY, []),
  loadFollowing: () => {
    set({ following: loadFromStorage<string[]>(FOLLOWING_KEY, []) })
  },
  toggleFollow: async (userId) => {
    const { following } = get()
    const isNowFollowing = !following.includes(userId)
    const next = isNowFollowing
      ? [...following, userId]
      : following.filter((id) => id !== userId)
    saveToStorage(FOLLOWING_KEY, next)
    set({ following: next })
    
    // Update followers_count in DB
    try {
      if (isNowFollowing) {
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          await supabase.rpc('increment_field' as any, { table_name: 'profiles', field_name: 'followers_count', row_id: userId }).catch(() => {
            supabase.from('profiles').select('followers_count').eq('id', userId).single().then(({ data }) => {
              if (data) supabase.from('profiles').update({ followers_count: (data.followers_count || 0) + 1 }).eq('id', userId)
            })
          })
          await supabase.rpc('increment_field' as any, { table_name: 'profiles', field_name: 'following_count', row_id: user.data.user.id }).catch(() => {
            supabase.from('profiles').select('following_count').eq('id', user.data.user!.id).single().then(({ data }) => {
              if (data) supabase.from('profiles').update({ following_count: (data.following_count || 0) + 1 }).eq('id', user.data.user!.id)
            })
          })
        }
      } else {
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          supabase.from('profiles').select('followers_count').eq('id', userId).single().then(({ data }) => {
            if (data) supabase.from('profiles').update({ followers_count: Math.max(0, (data.followers_count || 0) - 1) }).eq('id', userId)
          })
          supabase.from('profiles').select('following_count').eq('id', user.data.user!.id).single().then(({ data }) => {
            if (data) supabase.from('profiles').update({ following_count: Math.max(0, (data.following_count || 0) - 1) }).eq('id', user.data.user!.id)
          })
        }
      }
    } catch (e) {
      console.warn('Failed to update follow counts:', e)
    }
  },
  isFollowing: (userId) => get().following.includes(userId),

  messages: [],
  conversations: [],

  sendMessage: async (to, _toName, _toAvatar, _toRobloxId, content) => {
    try {
      await sendDbMessage(to, content)
      await get().loadMessages()
      return true
    } catch (e) {
      console.error('Failed to send message:', e)
      return false
    }
  },

  markRead: async (participantId) => {
    try {
      await markDbMessagesRead(participantId)
      await get().loadMessages()
    } catch (e) {
      console.error('Failed to mark read:', e)
    }
  },

  loadMessages: async () => {
    const user = await getCurrentUser()
    if (!user) return
    try {
      const rawMessages = await fetchDbMessages()
      const dbMessages: Message[] = rawMessages.map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        is_read: m.is_read,
        created_at: m.created_at,
      }))

      const otherIds = new Set<string>()
      for (const m of dbMessages) {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
        if (!profileCache.has(otherId)) otherIds.add(otherId)
      }

      const profiles = new Map(profileCache)
      await Promise.all([...otherIds].map(async (id) => {
        const p = await resolveProfile(id)
        if (p) profiles.set(id, p)
      }))

      const convos = buildConversations(dbMessages, user.id, profiles)
      set({ messages: dbMessages, conversations: convos })
    } catch (e) {
      console.error('Failed to load messages:', e)
    }
  },

  getConversation: (participantId) => {
    const { currentUser, messages } = get()
    if (!currentUser) return []
    return messages.filter(
      (m) =>
        (m.sender_id === currentUser.id && m.receiver_id === participantId) ||
        (m.sender_id === participantId && m.receiver_id === currentUser.id)
    )
  },

  getUnreadCount: (participantId) => {
    const { currentUser, messages } = get()
    if (!currentUser) return 0
    return messages.filter((m) => m.sender_id === participantId && m.receiver_id === currentUser.id && !m.is_read).length
  },
}))
