import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, ArrowLeft, MessageCircle, Search, SmilePlus, MoreVertical
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import RobloxAvatar from '@/components/ui/RobloxAvatar'

function formatTime(ts: string | number) {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatFullTime(ts: string | number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ConversationList({ onSelect }: { onSelect: () => void }) {
  const currentUser = useStore((s) => s.currentUser)
  const conversations = useStore((s) => s.conversations)
  const loadMessages = useStore((s) => s.loadMessages)
  const getUnreadCount = useStore((s) => s.getUnreadCount)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (currentUser) loadMessages()
  }, [currentUser, loadMessages])

  const filtered = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  )

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
          <MessageCircle size={24} className="text-text-dim" />
        </div>
        <p className="text-text-secondary text-sm font-medium mb-1">Sign in to chat</p>
        <p className="text-text-muted text-xs mb-4">Message other creators directly</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-accent-blue/20"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-blue/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-bg-elevated flex items-center justify-center mb-3">
              <MessageCircle size={20} className="text-text-dim" />
            </div>
            <p className="text-text-secondary text-sm font-medium">No conversations yet</p>
            <p className="text-text-muted text-xs mt-1">Visit a creator's profile to start chatting</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Search size={20} className="text-text-dim mb-2" />
            <p className="text-text-muted text-sm">No results for "{search}"</p>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((convo) => {
              const unread = getUnreadCount(convo.participantId)
              return (
                <button
                  key={convo.participantId}
                  onClick={() => {
                    navigate(`/messages/${convo.participantId}`, {
                      state: { user: { id: convo.participantId, username: convo.participantName, avatar_url: convo.participantAvatar, roblox_id: convo.participantRobloxId } }
                    })
                    onSelect()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 mx-1 rounded-xl hover:bg-bg-elevated/70 active:bg-bg-elevated transition-all text-left group"
                >
                  <RobloxAvatar
                    userId={convo.participantRobloxId}
                    username={convo.participantName}
                    avatarUrl={convo.participantAvatar}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('text-sm truncate', unread > 0 ? 'font-semibold text-text-primary' : 'font-medium text-text-primary')}>
                        {convo.participantName}
                      </span>
                      <span className="text-[10px] text-text-muted shrink-0 ml-2 tabular-nums">
                        {formatTime(convo.lastTime)}
                      </span>
                    </div>
                    <p className={cn('text-xs truncate', unread > 0 ? 'text-text-secondary font-medium' : 'text-text-muted')}>
                      {convo.lastMessage}
                    </p>
                  </div>
                  {unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ChatView() {
  const { participantId } = useParams()
  const location = useLocation()
  const stateUser = (location.state as any)?.user
  const currentUser = useStore((s) => s.currentUser)
  const conversations = useStore((s) => s.conversations)
  const allMessages = useStore((s) => s.messages)
  const sendMessage = useStore((s) => s.sendMessage)
  const markRead = useStore((s) => s.markRead)
  const loadMessages = useStore((s) => s.loadMessages)
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [sendError, setSendError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const convoUser = conversations.find((c) => c.participantId === participantId)
  const user = stateUser || (convoUser ? {
    id: convoUser.participantId,
    username: convoUser.participantName,
    avatar_url: convoUser.participantAvatar,
    roblox_id: convoUser.participantRobloxId,
  } : null)

  const messages = useMemo(() => {
    if (!currentUser || !participantId) return []
    return allMessages.filter(
      (m) =>
        (m.sender_id === currentUser.id && m.receiver_id === participantId) ||
        (m.sender_id === participantId && m.receiver_id === currentUser.id)
    )
  }, [allMessages, currentUser, participantId])

  useEffect(() => {
    if (participantId) markRead(participantId)
  }, [participantId, markRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [participantId])

  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => loadMessages(), 15000)
    return () => clearInterval(interval)
  }, [currentUser, loadMessages])

  const handleSend = async () => {
    if (!text.trim() || !currentUser || !participantId) return
    const msg = text.trim()
    setText('')
    setSendError(false)
    const ok = await sendMessage(
      participantId,
      user?.username || participantId.slice(0, 8),
      user?.avatar_url || '',
      user?.roblox_id || '',
      msg
    )
    if (!ok) {
      setText(msg)
      setSendError(true)
      setTimeout(() => setSendError(false), 3000)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center h-full">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
          <MessageCircle size={24} className="text-text-dim" />
        </div>
        <p className="text-text-secondary text-sm font-medium mb-1">Sign in to chat</p>
        <p className="text-text-muted text-xs mb-4">Message other creators directly</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    )
  }

  const grouped = messages.reduce<{ date: string; items: typeof messages }[]>((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
    const last = acc[acc.length - 1]
    if (last && last.date === date) {
      last.items.push(msg)
    } else {
      acc.push({ date, items: [msg] })
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <button onClick={() => navigate('/messages')} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <RobloxAvatar
          userId={user?.roblox_id}
          username={user?.username || participantId}
          avatarUrl={user?.avatar_url}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-primary truncate">{user?.username || participantId}</div>
          <div className="text-[10px] text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Online
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <RobloxAvatar
              userId={user?.roblox_id}
              username={user?.username || participantId}
              avatarUrl={user?.avatar_url}
              size="lg"
            />
            <p className="text-text-primary text-sm font-semibold mt-3">{user?.username || participantId}</p>
            <p className="text-text-muted text-xs mt-1 mb-4">Start a conversation</p>
            <p className="text-text-dim text-xs max-w-[240px]">Send a message to start chatting. Keep it friendly and follow the community guidelines.</p>
          </motion.div>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border-primary" />
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider shrink-0">{group.date}</span>
              <div className="flex-1 h-px bg-border-primary" />
            </div>
            <div className="space-y-1.5">
              {group.items.map((msg, i) => {
                const isMine = msg.sender_id === currentUser.id
                const nextMsg = group.items[i + 1]
                const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[70%] px-3.5 py-2 text-sm leading-relaxed',
                      isMine
                        ? cn(
                            'bg-accent-blue text-white',
                            i === 0 || group.items[i - 1].sender_id !== currentUser.id ? 'rounded-2xl rounded-br-md' : '',
                            isLastInGroup ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-r-md'
                          )
                        : cn(
                            'bg-bg-elevated text-text-primary border border-border-primary',
                            i === 0 || group.items[i - 1].sender_id === currentUser.id ? 'rounded-2xl rounded-bl-md' : '',
                            isLastInGroup ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-l-md'
                          )
                    )}>
                      <p>{msg.content}</p>
                      {isLastInGroup && (
                        <p className={cn('text-[10px] mt-1', isMine ? 'text-white/60' : 'text-text-dim')}>
                          {formatFullTime(msg.created_at)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        {sendError && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-medium">
            Failed to send. Make sure you are signed in and try again.
          </div>
        )}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors">
            <SmilePlus size={18} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              text.trim()
                ? 'bg-accent-blue text-white hover:bg-accent-blue/80 shadow-md shadow-accent-blue/20'
                : 'bg-bg-elevated text-text-dim cursor-not-allowed'
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Messages() {
  const { participantId } = useParams()
  const currentUser = useStore((s) => s.currentUser)
  const loadMessages = useStore((s) => s.loadMessages)

  useEffect(() => {
    if (currentUser) loadMessages()
  }, [currentUser, loadMessages])

  if (participantId) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden h-[calc(100vh-10rem)] shadow-2xl shadow-black/20">
          <ChatView />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">Messages</span>
          </h1>
          <p className="text-text-secondary text-lg">Chat with other creators</p>
        </div>

        <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden h-[calc(100vh-18rem)] shadow-2xl shadow-black/20">
          <ConversationList onSelect={() => {}} />
        </div>
      </motion.div>
    </div>
  )
}
