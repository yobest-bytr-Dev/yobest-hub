import { Link, useLocation } from 'react-router-dom'
import { Gamepad2, Brain, Users, ShoppingBag, Menu, X, LogIn, Zap, LogOut, MessageCircle, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { getCurrentProfile, signOut } from '@/lib/api'
import { cn } from '@/lib/utils'
import RobloxAvatar from '@/components/ui/RobloxAvatar'

const navLinks = [
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/ai', label: 'AI', icon: Brain },
  { to: '/creators', label: 'Creators', icon: UserPlus },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentUser = useStore((s) => s.currentUser)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const conversations = useStore((s) => s.conversations)

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  useEffect(() => {
    getCurrentProfile().then((profile) => {
      if (profile) {
        const savedDeco = localStorage.getItem('yobest_avatar_decoration')
        if (savedDeco) profile.avatar_decoration = savedDeco
        setCurrentUser(profile)
      }
    }).catch(() => {})
  }, [setCurrentUser])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
    setMobileOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass glow-line">
      <div className="noise-overlay" />      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src={`${import.meta.env.BASE_URL}YobestLogo.png`} alt="Yobest" className="w-9 h-9 rounded-xl shadow-lg shadow-accent-blue/20 group-hover:shadow-accent-blue/30 transition-shadow object-cover" />
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">YO</span>
              <span className="text-text-primary">BEST</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent-blue/15 text-accent-blue shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70'
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                <Link
                  to="/messages"
                  className={cn(
                    'relative p-2 rounded-lg transition-all',
                    location.pathname.startsWith('/messages')
                      ? 'bg-accent-blue/15 text-accent-blue'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated/70'
                  )}
                  title="Messages"
                >
                  <MessageCircle size={18} />
                  {totalUnread > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-blue flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{totalUnread > 9 ? '9+' : totalUnread}</span>
                    </div>
                  )}
                </Link>
                <div className="w-px h-6 bg-border-primary mx-1" />
                <Link to="/profile" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-bg-elevated/70 transition-colors group">
                  <RobloxAvatar
                    userId={currentUser.roblox_id}
                    username={currentUser.username}
                    avatarUrl={currentUser.avatar_url}
                    size="sm"
                    decoration={currentUser.avatar_decoration}
                    className="ring-2 ring-accent-blue/30 group-hover:ring-accent-blue/50 transition-all"
                  />
                  <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors">{currentUser.username}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70 transition-all">
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link to="/auth" className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-accent-blue/20">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border-primary glass animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-accent-blue/15 text-accent-blue'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
            {currentUser && (
            <Link
              to="/messages"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                location.pathname.startsWith('/messages')
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <MessageCircle size={18} />
              Messages
              {totalUnread > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center text-[10px] font-bold text-white">
                  {totalUnread}
                </span>
              )}
            </Link>
            )}
            <div className="pt-2 border-t border-border-primary mt-2">
              {currentUser ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-elevated transition-colors"
                  >
                    <RobloxAvatar
                      userId={currentUser.roblox_id}
                      username={currentUser.username}
                      avatarUrl={currentUser.avatar_url}
                      size="md"
                      decoration={currentUser.avatar_decoration}
                    />
                    <div>
                      <div className="text-sm font-medium text-text-primary">{currentUser.username}</div>
                      <div className="text-xs text-text-muted">View Profile</div>
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated text-text-primary text-sm font-medium border border-border-primary text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
