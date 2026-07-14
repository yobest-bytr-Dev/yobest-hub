import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, MessageCircle, Heart, UserPlus, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead, removeNotification, clearNotifications, type Notification } from '@/lib/notifications'
import { cn } from '@/lib/utils'

const iconMap: Record<Notification['type'], typeof Bell> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: MessageCircle,
  system: Info,
}

const colorMap: Record<Notification['type'], string> = {
  like: 'text-red-400',
  comment: 'text-accent-blue',
  follow: 'text-accent-purple',
  message: 'text-accent-green',
  system: 'text-text-muted',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const refresh = () => {
      setNotifications(getNotifications())
      setUnread(getUnreadNotificationCount())
    }
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleReadAll = () => {
    markAllNotificationsRead()
    setNotifications(getNotifications())
    setUnread(0)
  }

  const handleDismiss = (id: string) => {
    removeNotification(id)
    setNotifications(getNotifications())
    setUnread(getUnreadNotificationCount())
  }

  const handleClick = (notif: Notification) => {
    markNotificationRead(notif.id)
    setNotifications(getNotifications())
    setUnread(getUnreadNotificationCount())
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-lg transition-all',
          open ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated/70'
        )}
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-hidden rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl shadow-black/50 z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
              <span className="text-sm font-semibold text-text-primary">Notifications</span>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={handleReadAll} className="text-[11px] text-accent-blue hover:underline px-2 py-0.5">
                    Read all
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={() => { clearNotifications(); setNotifications([]); setUnread(0) }}
                    className="text-[11px] text-text-muted hover:text-red-400 px-2 py-0.5">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[360px]">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={24} className="mx-auto text-text-dim mb-2" />
                  <p className="text-xs text-text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = iconMap[notif.type]
                  const iconColor = colorMap[notif.type]
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-bg-elevated/50 transition-colors border-b border-border-primary/50 last:border-0',
                        !notif.read && 'bg-accent-blue/5'
                      )}
                    >
                      <div className={cn('mt-0.5 shrink-0', iconColor)}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {notif.link ? (
                          <Link
                            to={notif.link}
                            onClick={() => handleClick(notif)}
                            className="block"
                          >
                            <p className="text-xs font-medium text-text-primary truncate">{notif.title}</p>
                            <p className="text-[11px] text-text-muted truncate">{notif.body}</p>
                          </Link>
                        ) : (
                          <div onClick={() => handleClick(notif)} className="cursor-pointer">
                            <p className="text-xs font-medium text-text-primary truncate">{notif.title}</p>
                            <p className="text-[11px] text-text-muted truncate">{notif.body}</p>
                          </div>
                        )}
                        <span className="text-[10px] text-text-dim mt-0.5 block">{timeAgo(notif.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {!notif.read && (
                          <button onClick={() => { markNotificationRead(notif.id); setNotifications(getNotifications()); setUnread(getUnreadNotificationCount()) }}
                            className="p-1 rounded hover:bg-bg-tertiary text-text-dim hover:text-accent-blue transition-colors"
                            title="Mark read">
                            <Check size={12} />
                          </button>
                        )}
                        <button onClick={() => handleDismiss(notif.id)}
                          className="p-1 rounded hover:bg-bg-tertiary text-text-dim hover:text-red-400 transition-colors"
                          title="Dismiss">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
