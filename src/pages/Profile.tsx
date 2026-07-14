import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Mail, Calendar, ShieldCheck, Gamepad2, Settings,
  Loader2, ExternalLink, Copy, Check, LogOut, ChevronRight,
  BarChart3, Heart, MessageSquare, Bookmark, Users, Sparkles
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { signOut, getSubmissions, getAiChats } from '@/lib/api'
import { getSiteAnalytics } from '@/lib/analytics'
import { experiences } from '@/data/official-games'
import { cn, formatNumber } from '@/lib/utils'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import { avatarDecorations, getDecorationUrl } from '@/lib/avatar-decorations'
import type { Submission } from '@/lib/types'

export default function Profile() {
  const currentUser = useStore((s) => s.currentUser)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const setAvatarDecoration = useStore((s) => s.setAvatarDecoration)
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [aiChats, setAiChats] = useState<unknown[]>([])
  const [analytics, setAnalytics] = useState({ visitors: 0, downloads: 0, aiSessions: 0 })

  useEffect(() => {
    getSiteAnalytics().then(setAnalytics)
  }, [])
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'activity' | 'settings'>('overview')

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth')
      return
    }
    const savedDeco = localStorage.getItem('yobest_avatar_decoration')
    if (savedDeco && !currentUser.avatar_decoration) {
      setAvatarDecoration(savedDeco)
    }
    getSubmissions().then(setSubmissions)
    getAiChats().then(setAiChats)
  }, [currentUser, navigate])

  if (!currentUser) return null

  const joinDate = currentUser.created_at
    ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
    navigate('/')
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'submissions', label: 'My Games', icon: Gamepad2 },
    { id: 'activity', label: 'Activity', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Profile Header */}
        <div className="relative rounded-2xl overflow-hidden mb-6">
          <div className="h-48 sm:h-56 bg-gradient-to-br from-accent-blue/30 via-accent-purple/20 to-accent-pink/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
          </div>

          <div className="px-6 sm:px-8 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative group">
                <RobloxAvatar
                  userId={currentUser.roblox_id}
                  username={currentUser.username}
                  avatarUrl={currentUser.avatar_url}
                  size="xl"
                  decoration={currentUser.avatar_decoration}
                  className="rounded-2xl !w-28 !h-28 shadow-2xl group-hover:shadow-accent-blue/20 transition-shadow"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-3 border-bg-primary flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary truncate">{currentUser.display_name || currentUser.username}</h1>
                  {currentUser.is_admin && (
                    <span className="px-2 py-0.5 rounded-md bg-accent-blue/15 text-accent-blue text-xs font-semibold border border-accent-blue/25">Admin</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-sm">
                  <Gamepad2 size={14} />
                  <span>@{currentUser.username}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {currentUser.roblox_id && (
                  <a
                    href={`https://www.roblox.com/users/${currentUser.roblox_id}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-secondary border border-border-primary text-text-secondary text-xs font-medium hover:border-border-hover hover:text-text-primary transition-all"
                  >
                    <ExternalLink size={12} /> Roblox Profile
                  </a>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/15 transition-all"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-bg-secondary border border-border-primary overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-accent-blue/15 text-accent-blue shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Submissions', value: submissions.length, icon: Gamepad2, color: 'text-accent-blue' },
                { label: 'Followers', value: currentUser.followers_count || 0, icon: Users, color: 'text-accent-purple' },
                { label: 'Following', value: currentUser.following_count || 0, icon: Heart, color: 'text-accent-pink' },
                { label: 'Games', value: currentUser.games_count || 0, icon: Bookmark, color: 'text-accent-green' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
                  <stat.icon size={18} className={cn(stat.color, 'mb-2')} />
                  <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Account Info */}
            <div className="p-5 rounded-xl bg-bg-secondary border border-border-primary">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <User size={16} className="text-accent-blue" /> Account Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Mail size={14} /> Email
                  </div>
                  <span className="text-text-primary text-sm">••••••</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar size={14} /> Joined
                  </div>
                  <span className="text-text-primary text-sm">{joinDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <ShieldCheck size={14} /> Verified
                  </div>
                  <span className="text-green-400 text-sm font-medium">Roblox</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <User size={14} /> User ID
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentUser.id, 'uid')}
                    className="flex items-center gap-1 text-text-muted text-xs hover:text-text-primary transition-colors"
                  >
                    <span className="font-mono">{currentUser.id.slice(0, 8)}...</span>
                    {copiedId === 'uid' ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  </button>
                </div>
                {currentUser.roblox_id && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Gamepad2 size={14} /> Roblox ID
                    </div>
                    <button
                      onClick={() => copyToClipboard(currentUser.roblox_id!, 'rid')}
                      className="flex items-center gap-1 text-text-muted text-xs hover:text-text-primary transition-colors"
                    >
                      <span className="font-mono">{currentUser.roblox_id}</span>
                      {copiedId === 'rid' ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-bg-secondary border border-border-primary">
              <h3 className="text-sm font-semibold text-text-primary mb-3">About</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {currentUser.bio || 'No bio yet. Edit your profile to add one.'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="p-5 rounded-xl bg-bg-secondary border border-border-primary">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Your Activity</h3>
              <div className="space-y-3">
                {[
                  { label: 'Site Visitors', value: formatNumber(analytics.visitors), color: 'text-accent-blue' },
                  { label: 'Downloads', value: formatNumber(analytics.downloads), color: 'text-accent-green' },
                  { label: 'AI Sessions', value: formatNumber(analytics.aiSessions), color: 'text-accent-purple' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">{item.label}</span>
                    <span className={cn('text-sm font-semibold', item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary card-hover">
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center shrink-0">
                      <Gamepad2 size={18} className="text-accent-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary truncate">{sub.title}</h4>
                      <p className="text-xs text-text-muted truncate">{sub.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium',
                        sub.status === 'approved' ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                          : sub.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                            : 'bg-red-500/15 text-red-400 border border-red-500/25'
                      )}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                      <ChevronRight size={16} className="text-text-dim" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Gamepad2 size={48} className="mx-auto mb-4 text-text-dim" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No games submitted yet</h3>
                <p className="text-text-secondary text-sm mb-4">Submit your first game to the Experience Registry</p>
                <button
                  onClick={() => navigate('/games')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Browse Games
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            {aiChats.length > 0 ? (
              aiChats.map((chat: any, i: number) => (
                <div key={chat.id || i} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary card-hover">
                  <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="text-accent-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary truncate">{chat.title || 'AI Chat'}</h4>
                    <p className="text-xs text-text-muted">{chat.model || 'AI Model'} · {chat.updated_at ? new Date(chat.updated_at).toLocaleDateString() : 'Unknown date'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <MessageSquare size={48} className="mx-auto mb-4 text-text-dim" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No activity yet</h3>
                <p className="text-text-secondary text-sm mb-4">Start a conversation with Yobest AI Architect</p>
                <button
                  onClick={() => navigate('/ai')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Open AI Architect
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-5 rounded-xl bg-bg-secondary border border-border-primary">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Display Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.display_name || currentUser.username}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Bio</label>
                  <textarea
                    defaultValue={currentUser.bio || ''}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                    readOnly
                  />
                </div>
                <p className="text-xs text-text-dim">Profile editing coming soon. Contact support for changes.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-bg-secondary border border-border-primary">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-accent-purple" />
                <h3 className="text-sm font-semibold text-text-primary">Avatar Decoration</h3>
              </div>
              <p className="text-text-muted text-xs mb-4">Choose a decoration that wraps around your avatar, like Discord's Nitro decorations.</p>

              <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-bg-elevated border border-border-primary">
                <div className="relative">
                  <RobloxAvatar
                    userId={currentUser.roblox_id}
                    username={currentUser.username}
                    avatarUrl={currentUser.avatar_url}
                    size="xl"
                    decoration={currentUser.avatar_decoration}
                    className="!w-20 !h-20"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{currentUser.username}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Current: {currentUser.avatar_decoration && currentUser.avatar_decoration !== 'none'
                      ? avatarDecorations.find((d) => d.value === currentUser.avatar_decoration)?.label || currentUser.avatar_decoration
                      : 'None'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {avatarDecorations.map((deco) => {
                  const isActive = (currentUser.avatar_decoration || 'none') === deco.value
                  const decoUrl = getDecorationUrl(deco.value)
                  return (
                    <button
                      key={deco.value}
                      onClick={() => setAvatarDecoration(deco.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all',
                        isActive
                          ? 'bg-accent-blue/15 border-accent-blue/40 ring-1 ring-accent-blue/20'
                          : 'bg-bg-elevated border-border-primary hover:border-border-hover hover:bg-bg-tertiary'
                      )}
                    >
                      <div className="relative w-12 h-12">
                        {decoUrl ? (
                          <img
                            src={decoUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                            draggable={false}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : null}
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=3b82f6&color=fff&bold=true&size=96`}
                          alt={currentUser.username}
                          className="w-12 h-12 rounded-full object-cover bg-bg-elevated relative z-0"
                        />
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium leading-tight text-center',
                        isActive ? 'text-accent-blue' : 'text-text-muted'
                      )}>
                        {deco.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/15">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-text-muted text-xs mb-4">Permanently delete your account and all associated data.</p>
              <button className="px-4 py-2 rounded-xl bg-red-500/15 text-red-400 text-xs font-medium border border-red-500/25 hover:bg-red-500/20 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
