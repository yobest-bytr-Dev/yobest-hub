import { Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, Brain, Users, ShoppingBag, User, UserPlus, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/ai', label: 'AI Architect', icon: Brain },
  { to: '/creators', label: 'Creators', icon: UserPlus },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const location = useLocation()
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const currentUser = useStore((s) => s.currentUser)
  const conversations = useStore((s) => s.conversations)
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  const visibleLinks = sidebarLinks.filter((link) => {
    if ((link.to === '/messages' || link.to === '/profile') && !currentUser) return false
    return true
  })

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 border-r border-border-primary bg-bg-secondary/80 backdrop-blur-xl transition-all duration-300',
        sidebarOpen ? 'w-[220px]' : 'w-[68px]'
      )}
    >
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-blue/10 to-transparent" />
      <nav className="flex-1 py-4 px-3 space-y-1">
        {visibleLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
          const unread = link.to === '/messages' ? totalUnread : 0
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
                isActive
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
              title={!sidebarOpen ? link.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon size={18} />
                {unread > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent-blue flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
                  </div>
                )}
              </div>
              {sidebarOpen && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border-primary">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  )
}
