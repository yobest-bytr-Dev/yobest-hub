import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { requestNotificationPermission } from '@/lib/notifications'
import { cn } from '@/lib/utils'

const DISMISSED_KEY = 'yobest_notif_prompt_dismissed'

export default function NotificationPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const dismissed = localStorage.getItem(DISMISSED_KEY)
      if (!dismissed) {
        const timer = setTimeout(() => setShow(true), 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl bg-bg-secondary border border-border-primary shadow-2xl p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-accent-blue" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-1">Enable Notifications</h4>
          <p className="text-xs text-text-secondary mb-3">Get notified when your submissions are reviewed or you receive messages.</p>
          <div className="flex gap-2">
            <button onClick={async () => {
              await requestNotificationPermission()
              setShow(false)
            }} className="px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              Enable
            </button>
            <button onClick={() => { localStorage.setItem(DISMISSED_KEY, 'true'); setShow(false) }}
              className="px-3 py-1.5 rounded-lg bg-bg-elevated text-text-secondary text-xs font-medium hover:text-text-primary transition-colors">
              Maybe Later
            </button>
          </div>
        </div>
        <button onClick={() => { localStorage.setItem(DISMISSED_KEY, 'true'); setShow(false) }} className="text-text-muted hover:text-text-primary">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
