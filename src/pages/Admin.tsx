import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, Gamepad2, FileText, BarChart3, Settings, Loader2, Trash2,
  UserCheck, UserX, Search, Eye, Heart, MessageSquare, Download, CheckCircle,
  XCircle, ExternalLink, ArrowLeft, Crown, Mail, Calendar, TrendingUp, RefreshCw,
  Wrench, Plus, Clock, Sparkles, Save, Upload, Ban, ShieldOff, ImagePlus, Tag, X,
  ShoppingCart, AlertTriangle, Bot, Send, Radio, Hash, Volume2, Zap, Power,
  CircleDot, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Terminal, AtSign
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/config/supabase'
import { formatNumber, cn, extractYoutubeId } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import { uploadToGoogleDrive, toDirectImageUrl } from '@/lib/drive-upload'
import ImagePicker from '@/components/ui/ImagePicker'

const ADMIN_USERNAME = 'ByocefS'

interface AdminUser {
  id: string
  email: string
  username?: string
  created_at: string
  last_sign_in_at?: string
  banned_until?: string
  profile?: any
}

type Tab = 'dashboard' | 'users' | 'submissions' | 'games' | 'tools' | 'settings' | 'bot'

export default function Admin() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')

  useEffect(() => {
    if (currentUser) {
      const admin = currentUser.is_admin || currentUser.username?.toLowerCase() === 'byocefs'
      setIsAdmin(admin)
      setLoading(false)
    }
  }, [currentUser])

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <Shield size={48} className="mx-auto text-text-dim mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in required</h2>
        <p className="text-text-secondary text-sm mb-4">You must be signed in to access the admin panel.</p>
        <button onClick={() => navigate('/auth')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity">Sign In</button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <Shield size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Access Denied</h2>
        <p className="text-text-secondary text-sm mb-4">You don't have admin privileges.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-bg-elevated border border-border-primary text-text-primary font-semibold text-sm hover:border-accent-blue/30 transition-all">Go Home</button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'bot', label: 'Bot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-xs text-text-muted">Manage your platform</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 p-1 bg-bg-secondary rounded-xl border border-border-primary overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  tab === t.id ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50')}>
                <Icon size={16} />{t.label}
              </button>
            )
          })}
        </div>

        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'submissions' && <SubmissionsTab />}
        {tab === 'games' && <GamesTab />}
        {tab === 'tools' && <ToolsTab />}
        {tab === 'bot' && <BotTab />}
        {tab === 'settings' && <SettingsTab />}
      </motion.div>
    </div>
  )
}

function apiCall(action: string, data: Record<string, any> = {}) {
  const { data: { session } } = (supabase as any).auth?.getSession ? { data: { session: null } } : { data: { session: null } }
  return supabase.auth.getSession().then(({ data: { session } }) => {
    return fetch(`${supabaseUrl}/functions/v1/admin-ops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ action, ...data }),
    }).then((r) => r.json())
  })
}

function DashboardTab() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiCall('get_all_stats')
      if (!data.error) {
        setCounts(data.counts || {})
        setStats(data.stats || [])
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  const statCards = [
    { label: 'Total Users', value: counts.profiles || 0, icon: Users, color: 'text-accent-blue' },
    { label: 'Games', value: counts.experiences || 0, icon: Gamepad2, color: 'text-accent-green' },
    { label: 'Submissions', value: counts.submissions || 0, icon: FileText, color: 'text-accent-purple' },
    { label: 'Assets', value: counts.assets || 0, icon: Download, color: 'text-accent-orange' },
    { label: 'Messages', value: counts.messages || 0, icon: MessageSquare, color: 'text-accent-pink' },
    { label: 'AI Chats', value: counts.ai_chats || 0, icon: TrendingUp, color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Overview</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
              <Icon size={18} className={cn(s.color, 'mb-2')} />
              <div className="text-2xl font-bold text-text-primary">{formatNumber(s.value)}</div>
              <div className="text-xs text-text-muted">{s.label}</div>
            </div>
          )
        })}
      </div>

      {stats.length > 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Site Stats</h3>
          <div className="space-y-2">
            {stats.map((s: any) => (
              <div key={s.id || s.name} className="flex justify-between text-xs">
                <span className="text-text-muted">{s.name}</span>
                <span className="text-text-primary font-medium">{formatNumber(s.value || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiCall('list_users')
      if (!data.error) {
        setUsers(data.users || [])
        setProfiles(data.profiles || [])
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    try {
      const data = await apiCall('delete_user', { userId })
      if (data.error) throw new Error(data.error)
      toast(`Deleted ${username}`, 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to delete', 'error')
    }
  }

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    try {
      const data = await apiCall('set_admin', { userId, isAdmin: !currentAdmin })
      if (data.error) throw new Error(data.error)
      toast(currentAdmin ? 'Removed admin' : 'Made admin', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const handleBan = async (userId: string, username: string, currentlyBanned: boolean) => {
    if (currentlyBanned) {
      if (!confirm(`Unban "${username}"?`)) return
      try {
        const { error } = await supabase.from('profiles').update({ is_banned: false, banned_until: null }).eq('id', userId)
        if (error) throw error
        toast(`Unbanned ${username}`, 'success')
        load()
      } catch (e: any) {
        toast(e.message || 'Failed to unban', 'error')
      }
    } else {
      const reason = prompt(`Ban reason for "${username}":`)
      if (reason === null) return
      try {
        const { error } = await supabase.from('profiles').update({ is_banned: true, ban_reason: reason || 'No reason provided' }).eq('id', userId)
        if (error) throw error
        toast(`Banned ${username}`, 'success')
        load()
      } catch (e: any) {
        toast(e.message || 'Failed to ban', 'error')
      }
    }
  }

  const merged = profiles.map((p) => {
    const auth = users.find((u) => u.id === p.id)
    return { ...p, email: auth?.email || '', last_sign_in_at: auth?.last_sign_in_at }
  }).filter((p) => !search || p.username?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Users ({merged.length})</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
      </div>
      <div className="space-y-2">
        {merged.map((user) => (
          <div key={user.id} className={cn('flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border transition-colors', user.is_banned ? 'border-red-500/30 bg-red-500/5' : 'border-border-primary hover:bg-bg-elevated/50')}>
            <RobloxAvatar userId={user.roblox_id} username={user.username} avatarUrl={user.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary truncate">{user.username || 'Unknown'}</span>
                {user.is_admin && <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 text-[10px] font-bold border border-yellow-500/25">ADMIN</span>}
                {user.is_banned && <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/25">BANNED</span>}
              </div>
              <div className="text-[11px] text-text-muted truncate">{user.email || user.id.slice(0, 8)}</div>
              {user.is_banned && user.ban_reason && <div className="text-[10px] text-red-400/70 truncate mt-0.5">Reason: {user.ban_reason}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                className={cn('p-1.5 rounded-lg text-xs transition-colors', user.is_admin ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25' : 'bg-bg-elevated text-text-muted hover:text-yellow-400')}
                title={user.is_admin ? 'Remove admin' : 'Make admin'}>
                <Crown size={14} />
              </button>
              <button onClick={() => handleBan(user.id, user.username || 'user', !!user.is_banned)}
                className={cn('p-1.5 rounded-lg text-xs transition-colors', user.is_banned ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10')}
                title={user.is_banned ? 'Unban user' : 'Ban user'}>
                {user.is_banned ? <ShieldOff size={14} /> : <Ban size={14} />}
              </button>
              <button onClick={() => handleDelete(user.id, user.username || 'user')}
                className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete user">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {merged.length === 0 && <p className="text-sm text-text-muted text-center py-8">No users found</p>}
      </div>
    </div>
  )
}

function SubmissionsTab() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(100)
      setSubs(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: string, sub?: any) => {
    try {
      const data = await apiCall('approve_submission', { id })
      if (data.error) throw new Error(data.error)
      toast('Submission approved!', 'success')
      if (sub?.title) {
        try {
          await botApiCall('auto_post', {
            feed_type: 'game_feed',
            title: `New Game: ${sub.title}`,
            description: sub.description || `New game "${sub.title}" has been added to the catalog!`,
            url: sub.play_url || undefined,
            image_url: sub.image_url || undefined,
          })
        } catch {}
      }
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (optional):')
    try {
      const data = await apiCall('reject_submission', { id, reason })
      if (data.error) throw new Error(data.error)
      toast('Submission rejected', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    try {
      const data = await apiCall('delete_submission', { id })
      if (data.error) throw new Error(data.error)
      toast('Deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const filtered = filter === 'all' ? subs : subs.filter((s) => s.status === filter)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Submissions</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-lg border border-border-primary">
        {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filter === f ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary')}>
            {f} {f === 'pending' && subs.filter((s) => s.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">{subs.filter((s) => s.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((sub) => (
          <div key={sub.id} className="rounded-xl bg-bg-secondary border border-border-primary overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)} className="text-sm font-semibold text-text-primary truncate hover:text-accent-blue transition-colors text-left">
                      {sub.title}
                    </button>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold',
                      sub.status === 'pending' && 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
                      sub.status === 'approved' && 'bg-green-500/15 text-green-400 border border-green-500/25',
                      sub.status === 'rejected' && 'bg-red-500/15 text-red-400 border border-red-500/25'
                    )}>{sub.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-dim">
                    <span>{sub.category}</span>
                    <span>·</span>
                    <span>{sub.price || 'Free'}</span>
                    <span>·</span>
                    <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {sub.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(sub.id, sub)} className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-[10px] font-bold" title="Approve">
                        <CheckCircle size={14} />
                      </button>
                      <button onClick={() => handleReject(sub.id)} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-[10px] font-bold" title="Reject">
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            {expanded === sub.id && (
              <div className="px-4 pb-4 border-t border-border-primary pt-3 space-y-3">
                {sub.thumbnail_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Thumbnail</p>
                    <img src={sub.thumbnail_url} alt="" className="w-full max-w-sm h-auto rounded-lg object-cover bg-bg-tertiary" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-text-muted mb-1">Description</p>
                  <p className="text-xs text-text-primary whitespace-pre-wrap">{sub.description || 'No description'}</p>
                </div>
                {sub.video_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Video</p>
                    <a href={sub.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline break-all">{sub.video_url}</a>
                  </div>
                )}
                {sub.game_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Game URL</p>
                    <a href={sub.game_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline break-all">{sub.game_url}</a>
                  </div>
                )}
                {sub.drive_file_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Download File</p>
                    <a href={sub.drive_file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline break-all">{sub.drive_file_url}</a>
                  </div>
                )}
                {sub.gamepass_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Gamepass ID</p>
                    <p className="text-xs text-text-primary">{sub.gamepass_url}</p>
                  </div>
                )}
                <div className="flex gap-4 text-[10px] text-text-dim">
                  <span>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                  {sub.reviewed_at && <span>Reviewed: {new Date(sub.reviewed_at).toLocaleString()}</span>}
                </div>
                {sub.rejection_reason && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] text-red-400 font-medium mb-0.5">Rejection Reason</p>
                    <p className="text-xs text-red-300">{sub.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-8">No submissions</p>}
      </div>
    </div>
  )
}

const GAME_CATEGORIES = ['Uncopylocked', 'Minigame', 'Anime', 'Paid', 'Tower Defense', 'Script Kit', 'Template', 'UI Kit', 'Core API']

interface GameForm {
  title: string
  description: string
  category: string
  video_url: string
  game_url: string
  download_url: string
  thumbnail_url: string
  images: string[]
  gamepass_id: string
  price: string
  is_official: boolean
  game_play: boolean
  download_enabled: boolean
}

const emptyGame: GameForm = {
  title: '', description: '', category: 'Uncopylocked', video_url: '', game_url: '',
  download_url: '', thumbnail_url: '', images: [], gamepass_id: '', price: 'Free',
  is_official: true, game_play: false, download_enabled: true,
}

function GamesTab() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<GameForm>(emptyGame)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'official' | 'community'>('all')
  const [releaseGame, setReleaseGame] = useState<any>(null)
  const [releases, setReleases] = useState<any[]>([])
  const [releaseForm, setReleaseForm] = useState({ version: '', title: '', body: '', file_url: '', file_name: '', file_size: '', is_prerelease: false })
  const [releaseLoading, setReleaseLoading] = useState(false)
  const [releaseUploading, setReleaseUploading] = useState(false)
  const releaseFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [gpLoading, setGpLoading] = useState(false)
  const [gpStatus, setGpStatus] = useState<'idle' | 'ok' | 'warn'>('idle')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('experiences').select('*').order('created_at', { ascending: false })
      setGames(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title is required', 'error'); return }
    setSaving(true)
    try {
      const gamepassId = form.gamepass_id.trim()
      const price = gamepassId
        ? (form.price === 'Free' || !form.price ? 'Gamepass Required' : form.price)
        : (form.price === 'Gamepass Required' ? 'Free' : form.price || 'Free')

      if (editing) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')
        const res = await fetch(`${supabaseUrl}/functions/v1/update-record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            table: 'experiences',
            id: editing,
            fields: {
              title: form.title, description: form.description, category: form.category,
              video_url: form.video_url, game_url: form.game_url, download_url: form.download_url,
              thumbnail_url: form.thumbnail_url, gamepass_id: gamepassId, price,
              is_official: form.is_official, game_play: form.game_play, download_enabled: form.download_enabled,
              gallery_images: form.images || [],
            },
          }),
        })
        const result = await res.json()
        if (!res.ok || result.error) throw new Error(result.error || 'Update failed')

        // Sync matching submission
        try {
          const { data: sub } = await supabase.from('submissions').select('id').eq('title', form.title).limit(1).maybeSingle()
          if (sub) {
            await fetch(`${supabaseUrl}/functions/v1/update-record`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}`, 'apikey': supabaseAnonKey },
              body: JSON.stringify({
                table: 'submissions', id: sub.id,
                fields: { title: form.title, description: form.description, category: form.category, price, gamepass_url: gamepassId, video_url: form.video_url, game_url: form.game_url, drive_file_url: form.download_url, thumbnail_url: form.thumbnail_url, gallery_images: form.images || [] },
              }),
            })
          }
        } catch {}
        toast('Game updated!', 'success')
      } else {
        const { error } = await supabase.from('experiences').insert({
          title: form.title, description: form.description, category: form.category,
          video_url: form.video_url, game_url: form.game_url, download_url: form.download_url,
          thumbnail_url: form.thumbnail_url, images: form.images || [], gallery_images: form.images || [], gamepass_id: gamepassId,
          price, is_official: form.is_official, game_play: form.game_play,
          download_enabled: form.download_enabled, views_count: 0, likes_count: 0,
        })
        if (error) throw error
        toast('Game created!', 'success')
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyGame)
      setGpStatus('idle')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to save game', 'error')
    }
    setSaving(false)
  }

  const handleEdit = (game: any) => {
    setForm({
      title: game.title, description: game.description || '', category: game.category || 'Uncopylocked',
      video_url: game.video_url || '', game_url: game.game_url || '', download_url: game.download_url || '',
      thumbnail_url: game.thumbnail_url || '', images: game.gallery_images || game.images || [], gamepass_id: game.gamepass_id || '',
      price: game.price || 'Free', is_official: game.is_official ?? true,
      game_play: game.game_play ?? false, download_enabled: game.download_enabled ?? true,
    })
    setEditing(game.id)
    setShowForm(true)
    setGpStatus(game.gamepass_id ? 'ok' : 'idle')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game permanently?')) return
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', id)
      if (error) throw error
      toast('Game deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const openReleases = async (game: any) => {
    setReleaseGame(game)
    const { data } = await supabase.from('releases').select('*').eq('target_type', 'game').eq('target_id', game.id).order('created_at', { ascending: false })
    setReleases(data || [])
    setReleaseForm({ version: '', title: '', body: '', file_url: '', file_name: '', file_size: '', is_prerelease: false })
  }

  const handleReleaseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) { toast('File too large. Max 100MB.', 'error'); return }
    setReleaseUploading(true)
    try {
      const { uploadToGoogleDrive } = await import('@/lib/drive-upload')
      const result = await uploadToGoogleDrive(file, 'yobest/releases')
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setReleaseForm(f => ({ ...f, file_url: result.directLink, file_name: result.fileName, file_size: `${sizeMB} MB` }))
      toast('File uploaded!', 'success')
    } catch (err: any) {
      toast('Upload failed: ' + (err.message || 'Unknown error'), 'error')
    }
    setReleaseUploading(false)
    if (releaseFileRef.current) releaseFileRef.current.value = ''
  }

  const addReleaseHandler = async () => {
    if (!releaseForm.version.trim() || !releaseForm.title.trim()) { toast('Version and title required', 'error'); return }
    setReleaseLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('releases').insert({
        target_type: 'game', target_id: releaseGame.id,
        version: releaseForm.version, title: releaseForm.title, body: releaseForm.body,
        file_url: releaseForm.file_url, file_name: releaseForm.file_name,
        file_size: releaseForm.file_size, author_id: user?.id || null,
        is_prerelease: releaseForm.is_prerelease,
      })
      if (error) throw error
      toast('Release published!', 'success')
      const { data } = await supabase.from('releases').select('*').eq('target_type', 'game').eq('target_id', releaseGame.id).order('created_at', { ascending: false })
      setReleases(data || [])
      setReleaseForm({ version: '', title: '', body: '', file_url: '', file_name: '', file_size: '', is_prerelease: false })
    } catch (e: any) { toast(e.message || 'Failed', 'error') }
    setReleaseLoading(false)
  }

  const deleteReleaseHandler = async (id: string) => {
    const { error } = await supabase.from('releases').delete().eq('id', id)
    if (!error) setReleases(prev => prev.filter(r => r.id !== id))
  }

  const filtered = games.filter((g) => {
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || (g.category || '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || (filterType === 'official' && g.is_official) || (filterType === 'community' && !g.is_official)
    return matchSearch && matchType
  })

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Games ({games.length})</h2>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyGame) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-xs font-medium hover:bg-accent-blue/25 transition-colors">
            <Plus size={12} /> Add Game
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50" />
        </div>
        <div className="flex gap-1.5 p-1 bg-bg-secondary rounded-lg border border-border-primary">
          {(['all', 'official', 'community'] as const).map((f) => (
            <button key={f} onClick={() => setFilterType(f)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all',
                filterType === f ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-bg-secondary border border-border-primary p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">{editing ? 'Edit Game' : 'Add New Game'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Game title"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Game description" rows={2}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50">
                {GAME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Price</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Free"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">YouTube Video URL</label>
              <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Roblox Game URL</label>
              <input value={form.game_url} onChange={e => setForm(f => ({ ...f, game_url: e.target.value }))} placeholder="https://www.roblox.com/games/..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Download URL</label>
              <input value={form.download_url} onChange={e => setForm(f => ({ ...f, download_url: e.target.value }))} placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">GamePass ID</label>
              <div className="relative">
                <input value={form.gamepass_id} onChange={e => {
                  const gpId = e.target.value
                  setGpStatus('idle')
                  setForm(f => {
                    const updates: GameForm = { ...f, gamepass_id: gpId }
                    if (gpId && (!f.price || f.price === 'Free')) updates.price = 'Gamepass Required'
                    else if (!gpId && f.price === 'Gamepass Required') updates.price = 'Free'
                    return updates
                  })
                }} onBlur={async (e) => {
                  const gpUrl = e.target.value.trim()
                  if (!gpUrl) { setGpStatus('idle'); return }
                  setGpLoading(true); setGpStatus('idle')
                  try {
                    const info = await fetch(`${supabaseUrl}/functions/v1/gamepass-verify`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': supabaseAnonKey },
                      body: JSON.stringify({ gamepass_id: gpUrl, action: 'info' }),
                    }).then(r => r.json())
                    if (info.exists) { setGpStatus('ok'); setForm(f => ({ ...f, gamepass_id: gpUrl, price: info.price != null && info.price > 0 ? `${info.price} Robux` : f.price })) }
                    else { setGpStatus('warn') }
                  } catch { setGpStatus('warn') }
                  setGpLoading(false)
                }} placeholder="e.g. 12345678"
                  className="w-full px-3 py-2 pr-8 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {gpLoading ? <Loader2 size={14} className="animate-spin text-text-muted" /> :
                    gpStatus === 'ok' ? <CheckCircle size={14} className="text-green-400" /> :
                    gpStatus === 'warn' ? <AlertTriangle size={14} className="text-yellow-400" /> : null}
                </div>
              </div>
              <p className="text-[9px] text-text-dim mt-1">
                {gpStatus === 'ok' ? <span className="text-green-400">Verified - price auto-filled</span> :
                 gpStatus === 'warn' ? <span className="text-yellow-400">GamePass not found on Roblox</span> :
                 'Users must own this GamePass to download'}
              </p>
            </div>
            <div>
              <ImagePicker value={form.thumbnail_url} onChange={(url) => setForm(f => ({ ...f, thumbnail_url: url }))} folder="yobest/thumbnails" label="Thumbnail Image" />
            </div>
            <div className="sm:col-span-2">
              <ImagePicker value="" onChange={() => {}} folder="yobest/thumbnails" label="Gallery Images" multiple values={form.images}
                onMultipleChange={(urls) => setForm(f => ({ ...f, images: urls }))} maxImages={12} />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={form.is_official} onChange={e => setForm(f => ({ ...f, is_official: e.target.checked }))} className="rounded" /> Official Game
              </label>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={form.game_play} onChange={e => setForm(f => ({ ...f, game_play: e.target.checked }))} className="rounded" /> Playable
              </label>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={form.download_enabled} onChange={e => setForm(f => ({ ...f, download_enabled: e.target.checked }))} className="rounded" /> Download Enabled
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {editing ? 'Update' : 'Create'} Game
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyGame) }} className="px-4 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs font-medium hover:text-text-primary transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {filtered.map((game) => (
          <div key={game.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors">
            <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center shrink-0 border border-accent-blue/10 overflow-hidden">
              {game.thumbnail_url ? <img src={toDirectImageUrl(game.thumbnail_url)} alt="" className="w-full h-full object-cover" /> :
                game.video_url?.includes('youtube') ? <img src={`https://img.youtube.com/vi/${game.video_url.match(/v=([^&]+)/)?.[1] || ''}/default.jpg`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement && ((e.target as HTMLImageElement).parentElement as HTMLElement).appendChild(Object.assign(document.createElement('div'), { className: 'text-accent-blue/60' })) }} /> :
                <Gamepad2 size={18} className="text-accent-blue/60" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary truncate">{game.title}</span>
                {game.is_official && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-bold">OFFICIAL</span>}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-dim font-mono">{game.category}</span>
                {game.gamepass_id && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-bold">GAMEPASS</span>}
                {game.images && game.images.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 font-bold">{game.images.length} imgs</span>}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-text-muted mt-0.5">
                <span>{game.price || 'Free'}</span>
                <span>{formatNumber(game.views_count || 0)} views</span>
                <span>{formatNumber(game.likes_count || 0)} likes</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {game.game_url && <a href={game.game_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Play"><ExternalLink size={14} /></a>}
              <button onClick={() => openReleases(game)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-green transition-colors" title="Releases"><Tag size={14} /></button>
              <button onClick={() => handleEdit(game)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Edit"><Eye size={14} /></button>
              <button onClick={() => handleDelete(game.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-8">No games found</p>}
      </div>

      {releaseGame && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-bg-secondary border border-accent-green/25 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Tag size={14} className="text-accent-green" /> Releases for: {releaseGame.title}
            </h3>
            <button onClick={() => setReleaseGame(null)} className="text-xs text-text-muted hover:text-text-primary">Close</button>
          </div>

          <div className="p-4 rounded-xl bg-bg-elevated border border-border-primary space-y-3">
            <h4 className="text-xs font-semibold text-text-primary">Create a new release</h4>
            <div className="flex gap-2">
              <div className="w-28">
                <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Version *</label>
                <input value={releaseForm.version} onChange={e => setReleaseForm(f => ({ ...f, version: e.target.value }))} placeholder="v1.0.0"
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Title *</label>
                <input value={releaseForm.title} onChange={e => setReleaseForm(f => ({ ...f, title: e.target.value }))} placeholder="Release title"
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
              </div>
            </div>
            <div>
              <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Release Notes</label>
              <textarea value={releaseForm.body} onChange={e => setReleaseForm(f => ({ ...f, body: e.target.value }))} rows={4}
                placeholder="What's new, what was fixed, changes list..."
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none font-mono text-xs" />
            </div>
            <div>
              <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Attachment</label>
              <div className="flex gap-2">
                <input type="file" ref={releaseFileRef} onChange={handleReleaseFileUpload} className="hidden"
                  accept=".lua,.luau,.txt,.rbxm,.rbxmx,.obj,.fbx,.json,.xml,.png,.jpg,.jpeg,.gif,.zip,.rar,.7z,.mp3,.wav,.mp4" />
                <button type="button" onClick={() => releaseFileRef.current?.click()} disabled={releaseUploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border-primary hover:border-accent-green/50 hover:bg-accent-green/5 transition-all text-text-secondary hover:text-accent-green text-xs disabled:opacity-50">
                  {releaseUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {releaseForm.file_name ? releaseForm.file_name : 'Upload File'}
                </button>
                {releaseForm.file_url && (
                  <button onClick={() => setReleaseForm(f => ({ ...f, file_url: '', file_name: '', file_size: '' }))}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              {releaseForm.file_url && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="truncate">{releaseForm.file_name}</span>
                  {releaseForm.file_size && <span className="text-green-400/60 shrink-0">({releaseForm.file_size})</span>}
                </div>
              )}
              <div className="mt-2">
                <p className="text-[9px] text-text-dim mb-1">Or paste a download link</p>
                <input value={releaseForm.file_url} onChange={e => setReleaseForm(f => ({ ...f, file_url: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={releaseForm.is_prerelease} onChange={e => setReleaseForm(f => ({ ...f, is_prerelease: e.target.checked }))} className="rounded" /> Pre-release
              </label>
              <button onClick={addReleaseHandler} disabled={releaseLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-green/15 text-accent-green border border-accent-green/25 text-xs font-semibold hover:bg-accent-green/25 disabled:opacity-50 transition-all">
                {releaseLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Publish Release
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border-primary" />
            <div className="space-y-0">
              {releases.length > 0 ? releases.map((r, i) => (
                <div key={r.id} className="relative flex gap-3 group">
                  <div className="relative z-10 shrink-0 mt-1">
                    <div className={cn('w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-[9px] font-bold',
                      i === 0 ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-elevated border-border-primary text-text-muted')} />
                  </div>
                  <div className="flex-1 pb-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-accent-blue/15 text-accent-blue text-[10px] font-bold border border-accent-blue/20">v{r.version}</span>
                      {i === 0 && <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 text-[10px] font-bold border border-green-500/20">Latest</span>}
                      {r.is_prerelease && <span className="px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 text-[10px] font-bold border border-yellow-500/20">Pre</span>}
                    </div>
                    <h4 className="text-xs font-semibold text-text-primary">{r.title}</h4>
                    {r.body && <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5 whitespace-pre-wrap">{r.body}</p>}
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 px-2 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] font-medium text-accent-blue hover:border-accent-blue/30 transition-all">
                        <Download size={10} /> {r.file_name || 'Download'} {r.file_size && <span className="text-text-dim">({r.file_size})</span>}
                      </a>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-dim">
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      <button onClick={() => { if (confirm('Delete this release?')) deleteReleaseHandler(r.id) }}
                        className="text-text-dim hover:text-red-400 transition-colors"><Trash2 size={10} /></button>
                    </div>
                  </div>
                </div>
              )) : <p className="text-xs text-text-muted text-center py-4 ml-8">No releases yet</p>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SettingsTab() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiKeys, setApiKeys] = useState<{ id: string; key: string; name: string; status: 'unknown' | 'ok' | 'error'; lastError?: string }[]>([])
  const [keysLoading, setKeysLoading] = useState(true)
  const [newKeyValue, setNewKeyValue] = useState('')
  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyIdx, setShowKeyIdx] = useState<number | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [modelSaving, setModelSaving] = useState(false)
  const { toast } = useToast()

  const botApiCall = useCallback(async (action: string, data: Record<string, any> = {}) => {
    const { data: { session } } = await supabase.auth.getSession()
    const r = await fetch(`${supabaseUrl}/functions/v1/bot-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ action, ...data }),
    })
    return r.json()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, configRes] = await Promise.all([
          supabase.from('site_stats').select('*'),
          botApiCall('get_config'),
        ])
        setStats(statsRes.data || [])

        const cfg = configRes?.config || {}
        if (cfg.gemini_api_model) setSelectedModel(cfg.gemini_api_model)

        const keysRaw = cfg.gemini_api_keys
        if (keysRaw) {
          try {
            const parsed = typeof keysRaw === 'string' ? JSON.parse(keysRaw) : keysRaw
            if (Array.isArray(parsed)) {
              setApiKeys(parsed.map((k: any, i: number) => ({
                id: k.id || `key-${i}`,
                key: k.key || '',
                name: k.name || `Key ${i + 1}`,
                status: k.status || 'unknown',
                lastError: k.lastError,
              })))
            }
          } catch {}
        }
      } catch (e) {
        console.error('Settings load error:', e)
      }
      setLoading(false)
      setKeysLoading(false)
    }
    load()
  }, [botApiCall])

  const saveKeys = async (keys: typeof apiKeys) => {
    setApiKeys(keys)
    try {
      const data = await botApiCall('update_config', {
        key: 'gemini_api_keys',
        value: JSON.stringify(keys.map(k => ({ id: k.id, key: k.key, name: k.name, status: k.status, lastError: k.lastError }))),
      })
      if (data.error) throw new Error(data.error)
    } catch (e: any) {
      toast(`Save failed: ${e.message}`, 'error')
    }
  }

  const addKey = async () => {
    const trimmed = newKeyValue.trim()
    if (!trimmed) { toast('Paste a Gemini API key', 'error'); return }
    if (apiKeys.some(k => k.key === trimmed)) { toast('Key already added', 'error'); return }
    const newKey = {
      id: `key-${Date.now()}`,
      key: trimmed,
      name: newKeyName.trim() || `Key ${apiKeys.length + 1}`,
      status: 'unknown' as const,
    }
    await saveKeys([...apiKeys, newKey])
    setNewKeyValue('')
    setNewKeyName('')
    toast('Key added! Click Test to verify it works.', 'success')
  }

  const removeKey = async (id: string) => {
    await saveKeys(apiKeys.filter(k => k.id !== id))
    toast('Key removed', 'success')
  }

  const testKey = async (id: string) => {
    const k = apiKeys.find(x => x.id === id)
    if (!k) return
    setTesting(id)
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say OK' }],
          model: 'gemini-2.5-flash',
          max_tokens: 10,
          api_key: k.key,
        }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      const updated = apiKeys.map(x => x.id === id ? { ...x, status: 'ok' as const, lastError: undefined } : x)
      await saveKeys(updated)
      toast(`"${k.name}" works!`, 'success')
    } catch (e: any) {
      const updated = apiKeys.map(x => x.id === id ? { ...x, status: 'error' as const, lastError: e.message?.slice(0, 80) } : x)
      await saveKeys(updated)
      toast(`"${k.name}" failed: ${e.message}`, 'error')
    }
    setTesting(null)
  }

  const [bulkText, setBulkText] = useState('')
  const [checkingAll, setCheckingAll] = useState(false)

  const bulkImport = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 10)
    if (!lines.length) { toast('Paste keys (one per line)', 'error'); return }
    const newKeys = lines.map((key, i) => ({
      id: `key-${Date.now()}-${i}`,
      key,
      name: `Key ${apiKeys.length + i + 1}`,
      status: 'unknown' as const,
    }))
    const deduped = newKeys.filter(nk => !apiKeys.some(ek => ek.key === nk.key))
    if (!deduped.length) { toast('All keys already added', 'error'); return }
    await saveKeys([...apiKeys, ...deduped])
    setBulkText('')
    toast(`Added ${deduped.length} key(s)`, 'success')
  }

  const checkAllKeys = async () => {
    if (!apiKeys.length) { toast('No keys to check', 'error'); return }
    setCheckingAll(true)
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-all-keys', keys: apiKeys.map(k => k.key) }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      const results: any[] = data.results || []
      const updated = apiKeys.map(k => {
        const match = results.find((r: any) => r.fullKey === k.key)
        if (match) {
          return { ...k, status: match.ok ? 'ok' as const : 'error' as const, lastError: match.ok ? undefined : match.error }
        }
        return k
      })
      await saveKeys(updated)
      const working = updated.filter(k => k.status === 'ok').length
      const broken = updated.filter(k => k.status === 'error').length
      toast(`${working} working, ${broken} broken out of ${updated.length} keys`, 'success')
    } catch (e: any) {
      toast(`Check failed: ${e.message}`, 'error')
    }
    setCheckingAll(false)
  }

  const saveModel = async (model: string) => {
    setModelSaving(true)
    setSelectedModel(model)
    try {
      const data = await botApiCall('update_config', { key: 'gemini_api_model', value: model })
      if (data.error) throw new Error(data.error)
      toast(`AI model set to ${model}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setModelSaving(false)
  }

  const handleSave = async (name: string, value: number) => {
    setSaving(true)
    try {
      const data = await botApiCall('update_config', { key: `stat_${name}`, value: String(value) })
      if (data.error) throw new Error(data.error)
      setStats((prev) => {
        const existing = prev.find((s: any) => (s.key || s.name) === name)
        if (existing) return prev.map((s: any) => (s.key || s.name) === name ? { ...s, value, key: name } : s)
        return [...prev, { key: name, value }]
      })
      toast('Saved!', 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  const knownStats = ['visits', 'downloads', 'ai_sessions']
  const workingKeys = apiKeys.filter(k => k.status === 'ok').length

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Site Settings</h2>

      {/* Gemini API Keys — BYOK */}
      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Gemini API Keys</h3>
            <p className="text-[11px] text-text-dim">BYOK — add multiple keys, site uses them automatically</p>
          </div>
          {apiKeys.length > 0 && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-primary text-[10px]">
                <span className="text-text-muted">{apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''}</span>
                {workingKeys > 0 && <span className="text-green-400 ml-1">{workingKeys} active</span>}
              </div>
              <button onClick={checkAllKeys} disabled={checkingAll}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-[10px] font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50 border border-green-500/20">
                {checkingAll ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                Check All Keys
              </button>
            </div>
          )}
        </div>

        {keysLoading ? (
          <div className="flex items-center gap-2 py-4"><Loader2 size={16} className="animate-spin text-accent-blue" /><span className="text-xs text-text-muted">Loading keys...</span></div>
        ) : (
          <>
            {/* Existing keys */}
            {apiKeys.length > 0 && (
              <div className="space-y-2 mb-4">
                {apiKeys.map((k, i) => (
                  <div key={k.id} className="flex items-center gap-2 p-3 rounded-lg bg-bg-elevated border border-border-primary group">
                    <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', k.status === 'ok' ? 'bg-green-400' : k.status === 'error' ? 'bg-red-400' : 'bg-yellow-400/60')} />
                    <span className="text-xs font-medium text-text-primary min-w-[60px]">{k.name}</span>
                    <span className="text-[11px] text-text-dim font-mono flex-1 truncate">
                      {showKeyIdx === i ? k.key : k.key.slice(0, 8) + '...' + k.key.slice(-4)}
                    </span>
                    {k.status === 'error' && k.lastError && (
                      <span className="text-[9px] text-red-400/80 max-w-[150px] truncate hidden sm:block" title={k.lastError}>{k.lastError}</span>
                    )}
                    <button onClick={() => setShowKeyIdx(showKeyIdx === i ? null : i)}
                      className="text-[10px] px-2 py-1 rounded bg-bg-secondary text-text-muted hover:text-text-primary transition-colors">
                      {showKeyIdx === i ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => testKey(k.id)} disabled={testing === k.id}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-bg-secondary text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50">
                      {testing === k.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                      Test
                    </button>
                    <button onClick={() => removeKey(k.id)}
                      className="text-[10px] px-2 py-1 rounded bg-bg-secondary text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new key */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Name (optional)"
                className="sm:w-32 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
              <input value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder="Paste Gemini API key (AIza...)"
                type="password"
                onKeyDown={(e) => e.key === 'Enter' && addKey()}
                className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm font-mono focus:outline-none focus:border-accent-blue/50 transition-all" />
              <button onClick={addKey}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue/15 text-accent-blue text-sm font-medium hover:bg-accent-blue/25 transition-colors whitespace-nowrap">
                <Plus size={14} /> Add Key
              </button>
            </div>

            {/* Bulk import */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-text-dim uppercase tracking-wider font-medium">Bulk Import</span>
              </div>
              <div className="flex gap-2">
                <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"Paste multiple keys (one per line):\nAIzaSy...\nAIzaSy...\nAQ.Ab..."}
                  rows={3}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-[11px] font-mono focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
                <button onClick={bulkImport}
                  className="self-end flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent-purple/15 text-accent-purple text-sm font-medium hover:bg-accent-purple/25 transition-colors whitespace-nowrap">
                  <Upload size={14} /> Import All
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 mt-3 rounded-lg bg-bg-elevated/50 border border-border-primary/50">
              <Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" />
              <div className="text-[11px] text-text-dim leading-relaxed">
                <p><strong className="text-text-secondary">How it works:</strong> Add one or more Gemini API keys. The site rotates between them automatically — if one key hits rate limits, the next one is used.</p>
                <p className="mt-1">Get free keys at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-accent-blue hover:underline">aistudio.google.com/apikey</a> — no credit card needed.</p>
                <p className="mt-1 text-green-400/80">Keys are stored in your Supabase database and never exposed to the browser.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Model Selection */}
      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Model</h3>
            <p className="text-[11px] text-text-dim">Choose which Gemini model powers all AI features</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Best balance of speed & quality', badge: 'Recommended' },
            { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Best quality, slower', badge: 'Smart' },
            { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fast, reliable', badge: '' },
            { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', desc: 'Ultra-fast, basic quality', badge: '' },
          ].map((m) => (
            <button key={m.id} onClick={() => saveModel(m.id)} disabled={modelSaving}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                selectedModel === m.id
                  ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                  : 'bg-bg-elevated border-border-primary text-text-secondary hover:border-border-hover'
              )}>
              <div className={cn('w-3 h-3 rounded-full border-2 shrink-0',
                selectedModel === m.id ? 'border-accent-blue bg-accent-blue' : 'border-text-dim'
              )} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium flex items-center gap-1.5">
                  {m.label}
                  {m.badge && <span className="text-[8px] px-1 py-0.5 rounded bg-accent-blue/15 text-accent-blue font-bold">{m.badge}</span>}
                </div>
                <div className="text-[10px] text-text-dim">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Site Statistics</h3>
        <div className="space-y-3">
          {knownStats.map((name) => {
            const stat = stats.find((s: any) => (s.key || s.name) === name)
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-28 capitalize">{name.replace('_', ' ')}</span>
                <input type="number" defaultValue={stat?.value || 0}
                  onBlur={(e) => handleSave(name, parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface ToolForm {
  name: string
  description: string
  image_url: string
  images: string[]
  status: 'ready' | 'soon' | 'beta' | 'deprecated'
  download_url: string
  version: string
}

const emptyTool: ToolForm = { name: '', description: '', image_url: '', images: [], status: 'ready', download_url: '', version: '' }

function ToolsTab() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ToolForm>(emptyTool)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('yobest_tools' as any).select('*').order('created_at', { ascending: false })
      setTools(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Tool name is required', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('yobest_tools' as any).update({ ...form, images: form.images || [] }).eq('id', editing)
        if (error) throw error
        toast('Tool updated!', 'success')
      } else {
        const { error } = await supabase.from('yobest_tools' as any).insert({ ...form, images: form.images || [], downloads_count: 0 })
        if (error) throw error
        toast('Tool created!', 'success')
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyTool)
      setImagePreview('')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to save tool', 'error')
    }
    setSaving(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast('Image must be under 10MB', 'error'); return }
    setUploadingImage(true)
    try {
      const result = await uploadToGoogleDrive(file, 'yobest-tools')
      const directUrl = toDirectImageUrl(result.directLink || result.fileUrl)
      setForm(f => ({ ...f, image_url: directUrl }))
      setImagePreview(directUrl)
      toast('Image uploaded!', 'success')
    } catch (e: any) {
      toast(e.message || 'Upload failed', 'error')
    }
    setUploadingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { toast(`${file.name} is over 10MB, skipped`, 'error'); continue }
      try {
        const result = await uploadToGoogleDrive(file, 'yobest-tools')
        const directUrl = toDirectImageUrl(result.directLink || result.fileUrl)
        setForm(f => ({ ...f, images: [...(f.images || []), directUrl] }))
        toast(`${file.name} uploaded!`, 'success')
      } catch (err: any) {
        toast(err.message || `Failed to upload ${file.name}`, 'error')
      }
    }
    setUploadingGallery(false)
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const removeGalleryImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const handleEdit = (tool: any) => {
    setForm({ name: tool.name, description: tool.description, image_url: tool.image_url || '', images: tool.images || [], status: tool.status, download_url: tool.download_url || '', version: tool.version || '' })
    setImagePreview(tool.image_url || '')
    setEditing(tool.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tool?')) return
    try {
      const { error } = await supabase.from('yobest_tools' as any).delete().eq('id', id)
      if (error) throw error
      toast('Tool deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const statusOpts = [
    { value: 'ready', label: 'Ready', color: 'text-green-400' },
    { value: 'beta', label: 'Beta', color: 'text-yellow-400' },
    { value: 'soon', label: 'Coming Soon', color: 'text-blue-400' },
    { value: 'deprecated', label: 'Deprecated', color: 'text-red-400' },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Tools ({tools.length})</h2>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyTool, images: [] }) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-xs font-medium hover:bg-accent-blue/25 transition-colors">
            <Plus size={12} /> Add Tool
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-bg-secondary border border-border-primary p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">{editing ? 'Edit Tool' : 'Add New Tool'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Tool Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Yobest Studio Plugin"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Version</label>
              <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. v1.0"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this tool do?" rows={3}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Image Preview</label>
              <div className="flex gap-2">
                <input value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }} placeholder="Paste image URL..."
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-purple/15 border border-accent-purple/25 text-accent-purple text-xs font-medium hover:bg-accent-purple/25 transition-colors disabled:opacity-50 shrink-0">
                  {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {(imagePreview || form.image_url) && (
                <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-border-primary bg-bg-tertiary">
                  <img src={imagePreview || form.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <button onClick={() => { setForm(f => ({ ...f, image_url: '' })); setImagePreview('') }} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[8px] hover:bg-red-500 transition-colors">X</button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Gallery Images</label>
              <div className="flex items-center gap-2 mb-2">
                <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                <button onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-purple/15 border border-accent-purple/25 text-accent-purple text-xs font-medium hover:bg-accent-purple/25 transition-colors disabled:opacity-50">
                  {uploadingGallery ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                  {uploadingGallery ? 'Uploading...' : 'Add Images'}
                </button>
                <span className="text-[10px] text-text-dim">{form.images?.length || 0} images</span>
              </div>
              {form.images && form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border-primary bg-bg-tertiary group/img">
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <button onClick={() => removeGalleryImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[8px] hover:bg-red-500 transition-colors opacity-0 group-hover/img:opacity-100">X</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Download URL</label>
              <input value={form.download_url} onChange={e => setForm(f => ({ ...f, download_url: e.target.value }))} placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all">
                {statusOpts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {editing ? 'Update' : 'Create'} Tool
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm({ ...emptyTool, images: [] }) }} className="px-4 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs font-medium hover:text-text-primary transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Tools List */}
      <div className="space-y-2">
        {tools.map((tool) => {
          const sConf = statusOpts.find(s => s.value === tool.status) || statusOpts[1]
          return (
            <div key={tool.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center shrink-0 border border-accent-blue/10 overflow-hidden">
                {tool.image_url ? <img src={tool.image_url} alt="" className="w-full h-full object-cover" /> : <Wrench size={18} className="text-accent-blue/60" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary truncate">{tool.name}</span>
                  {tool.version && <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-dim font-mono">{tool.version}</span>}
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', sConf.color, `${sConf.value === 'ready' ? 'bg-green-500/10 border-green-500/20' : sConf.value === 'beta' ? 'bg-yellow-500/10 border-yellow-500/20' : sConf.value === 'soon' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`)}>
                    {sConf.label}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">{tool.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(tool)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Edit">
                  <Eye size={14} />
                </button>
                <button onClick={() => handleDelete(tool.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
        {tools.length === 0 && (
          <div className="text-center py-12">
            <Wrench size={36} className="mx-auto text-text-dim mb-3" />
            <p className="text-sm text-text-muted">No tools yet. Click "Add Tool" to create one.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function botApiCall(action: string, data: Record<string, any> = {}) {
  return supabase.auth.getSession().then(({ data: { session } }) => {
    return fetch(`${supabaseUrl}/functions/v1/bot-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ action, ...data }),
    }).then((r) => r.json())
  })
}

function BotTab() {
  const { toast } = useToast()
  const currentUser = useStore((s) => s.currentUser)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [lastHb, setLastHb] = useState<string | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [stats, setStats] = useState({ pending_commands: 0, executed_commands: 0, failed_commands: 0, guild_count: 0 })
  const [guilds, setGuilds] = useState<any[]>([])
  const [selectedGuild, setSelectedGuild] = useState<string>('')
  const [cmdHistory, setCmdHistory] = useState<any[]>([])
  const [newsTitle, setNewsTitle] = useState('')
  const [newsDesc, setNewsDesc] = useState('')
  const [newsUrl, setNewsUrl] = useState('')
  const [newsImage, setNewsImage] = useState('')
  const [sending, setSending] = useState(false)
  const [expandedConfig, setExpandedConfig] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState(false)
  const [expandedChannels, setExpandedChannels] = useState(false)
  const [configEdits, setConfigEdits] = useState<Record<string, string>>({})
  const [guildSettings, setGuildSettings] = useState<any>(null)
  const [newsChannel, setNewsChannel] = useState('')
  const [commands, setCommands] = useState<any[]>([])
  const [commandCategories, setCommandCategories] = useState<string[]>([])
  const [expandedCommands, setExpandedCommands] = useState(false)
  const [cmdFilter, setCmdFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [feedChannels, setFeedChannels] = useState<Record<string, string>>({})
  const [expandedFeeds, setExpandedFeeds] = useState(false)
  const [aiChannels, setAiChannels] = useState<string[]>([])
  const [expandedAiChannels, setExpandedAiChannels] = useState(false)
  const [botGames, setBotGames] = useState<any[]>([])
  const [botAssets, setBotAssets] = useState<any[]>([])
  const [expandedGames, setExpandedGames] = useState(false)
  const [publishChannel, setPublishChannel] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [selectedGames, setSelectedGames] = useState<number[]>([])
  const [selectedAssets, setSelectedAssets] = useState<number[]>([])
  const [publishTab, setPublishTab] = useState<'games' | 'assets'>('games')
  const [autoPublishGames, setAutoPublishGames] = useState('false')
  const [autoPublishAssets, setAutoPublishAssets] = useState('false')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiMode, setAiMode] = useState<'agent' | 'generate'>('agent')
  const [aiSending, setAiSending] = useState(false)
  const [aiHistory, setAiHistory] = useState<any[]>([])
  const [expandedAiBuilder, setExpandedAiBuilder] = useState(false)
  const [expandedServerStats, setExpandedServerStats] = useState(false)
  const [serverStatsData, setServerStatsData] = useState<any>(null)
  const [mentionTarget, setMentionTarget] = useState<'none' | 'everyone' | 'here' | 'role'>('none')
  const [mentionRoleId, setMentionRoleId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await botApiCall('get_bot_status')
      if (!data.error) {
        setIsOnline(data.is_online)
        setLastHb(data.last_heartbeat)
        setStats(data.stats || {})
        setGuilds(data.guilds || [])
        const cfg: Record<string, string> = {}
        ;(data.config || []).forEach((c: any) => { cfg[c.key] = c.value })
        setConfig(cfg)
        setConfigEdits(cfg)
        if (data.guilds?.length && !selectedGuild) {
          setSelectedGuild(data.guilds[0].guild_id)
        }
      }
    } catch (e: any) {
      toast('Failed to load bot status: ' + (e.message || ''), 'error')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const loadGuildSettings = useCallback(async (guildId: string) => {
    try {
      const data = await botApiCall('get_guild_settings', { guild_id: guildId })
      setGuildSettings(data.settings || {})
    } catch { setGuildSettings({}) }
  }, [])

  useEffect(() => {
    if (selectedGuild) loadGuildSettings(selectedGuild)
  }, [selectedGuild, loadGuildSettings])

  const loadHistory = useCallback(async () => {
    try {
      const data = await botApiCall('get_command_history')
      if (!data.error) setCmdHistory(data.commands || [])
    } catch {}
  }, [])

  useEffect(() => {
    if (expandedHistory) loadHistory()
  }, [expandedHistory, loadHistory])

  const toggleConfig = async (key: string, value: string) => {
    const newVal = value === 'true' ? 'false' : 'true'
    try {
      const data = await botApiCall('update_config', { key, value: newVal })
      if (data.error) throw new Error(data.error)
      setConfig(prev => ({ ...prev, [key]: newVal }))
      setConfigEdits(prev => ({ ...prev, [key]: newVal }))
      toast(`${key} ${newVal === 'true' ? 'enabled' : 'disabled'}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const saveConfig = async (key: string) => {
    try {
      const data = await botApiCall('update_config', { key, value: configEdits[key] || '' })
      if (data.error) throw new Error(data.error)
      setConfig(prev => ({ ...prev, [key]: configEdits[key] }))
      toast('Saved', 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const sendNews = async () => {
    if (!newsTitle.trim()) { toast('Title required', 'error'); return }
    if (!selectedGuild) { toast('Select a server first', 'error'); return }
    setSending(true)
    try {
      const payload: any = { title: newsTitle, description: newsDesc, ...getMentionPayload() }
      if (newsUrl) payload.game_url = newsUrl
      if (newsImage) payload.image_url = newsImage
      if (newsChannel) payload.channel_id = newsChannel
      const data = await botApiCall('post_news', { guild_id: selectedGuild, payload })
      if (data.error) throw new Error(data.error)
      toast('News posted to Discord!', 'success')
      setNewsTitle('')
      setNewsDesc('')
      setNewsUrl('')
      setNewsImage('')
      if (expandedHistory) loadHistory()
    } catch (e: any) {
      toast(e.message || 'Failed to send', 'error')
    }
    setSending(false)
  }

  const sendCommand = async (command: string, payload: any = {}) => {
    if (!selectedGuild) { toast('Select a server first', 'error'); return }
    try {
      const data = await botApiCall('send_command', { guild_id: selectedGuild, command, payload })
      if (data.error) throw new Error(data.error)
      toast(`Command "${command}" sent`, 'success')
      if (expandedHistory) loadHistory()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const loadCommands = useCallback(async () => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('list_commands', { guild_id: selectedGuild })
      if (!data.error) {
        setCommands(data.commands || [])
        setCommandCategories(data.categories || [])
      }
    } catch {}
  }, [selectedGuild])

  useEffect(() => {
    if (expandedCommands && selectedGuild) loadCommands()
  }, [expandedCommands, selectedGuild, loadCommands])

  const loadFeeds = useCallback(async () => {
    try {
      const data = await botApiCall('get_feed_channels')
      if (!data.error) setFeedChannels(data.feeds || {})
    } catch {}
  }, [])

  useEffect(() => { if (expandedFeeds) loadFeeds() }, [expandedFeeds, loadFeeds])

  const loadAiChannels = useCallback(async () => {
    try {
      const data = await botApiCall('get_ai_channels')
      if (!data.error) setAiChannels(data.channels || [])
    } catch {}
  }, [])

  useEffect(() => { if (expandedAiChannels) loadAiChannels() }, [expandedAiChannels, loadAiChannels])

  const toggleAiChannel = async (channelId: string) => {
    if (!selectedGuild) return
    try {
      const isAi = aiChannels.includes(channelId)
      const action = isAi ? 'disable_ai_channel' : 'enable_ai_channel'
      const data = await botApiCall(action, { channel_id: channelId, guild_id: selectedGuild, ...getMentionPayload() })
      if (data.error) throw new Error(data.error)
      setAiChannels(data.channels || [])
      toast(`AI ${isAi ? 'disabled' : 'enabled'} in #${channels.find((c: any) => c.id === channelId)?.name || channelId}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const loadGames = useCallback(async () => {
    try {
      const [expRes, assetRes] = await Promise.all([
        supabase.from('experiences').select('id, title, description, game_url, download_url, thumbnail_url, video_url, gallery_images, category, price, is_official, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('assets').select('id, title, description, type, thumbnail_url, gallery_images, price_robux, downloads_count, created_at').order('created_at', { ascending: false }).limit(50),
      ])
      if (expRes.error) console.error('loadGames exp error:', expRes.error)
      if (assetRes.error) console.error('loadGames asset error:', assetRes.error)
      const dbGames = expRes.data || []
      console.log('loadGames: dbGames=', dbGames.length, 'dbAssets=', assetRes.data?.length || 0)
      setBotGames(dbGames)
      if (assetRes.data) setBotAssets(assetRes.data)
    } catch (e) { console.error('loadGames catch:', e) }
  }, [])

  useEffect(() => { if (expandedGames) loadGames() }, [expandedGames, loadGames])
  useEffect(() => { if (expandedFeeds) loadGames() }, [expandedFeeds, loadGames])

  const getGameThumb = (game: any) => {
    if (game.thumbnail_url) return toDirectImageUrl(game.thumbnail_url)
    const ytId = extractYoutubeId(game.video_url)
    if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
    if (game.download_url && /\.(jpg|jpeg|png|gif|webp|drive|google)/i.test(game.download_url)) return toDirectImageUrl(game.download_url)
    if (game.gallery_images?.length) return toDirectImageUrl(game.gallery_images[0])
    return ''
  }
  const getAssetThumb = (asset: any) => {
    if (asset.thumbnail_url) return toDirectImageUrl(asset.thumbnail_url)
    if (asset.gallery_images?.length) return toDirectImageUrl(asset.gallery_images[0])
    return ''
  }

  const getMentionPayload = () => {
    if (mentionTarget === 'everyone') return { mention: '@everyone' }
    if (mentionTarget === 'here') return { mention: '@here' }
    if (mentionTarget === 'role' && mentionRoleId) return { mention: `<@&${mentionRoleId}>` }
    return {}
  }

  const publishGame = async (gameId: string, itemType: 'game' | 'asset' = 'game') => {
    if (!selectedGuild) { toast('Select a server first', 'error'); return }
    setPublishing(true)
    try {
      const data = await botApiCall('publish_game', { guild_id: selectedGuild, game_id: gameId, item_type: itemType === 'asset' ? 'asset' : undefined, channel_id: publishChannel || undefined, ...getMentionPayload() })
      if (data.error) throw new Error(data.error)
      toast(`Published "${data.game}" to Discord!`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setPublishing(false)
  }

  const publishAllGames = async () => {
    if (!selectedGuild) { toast('Select a server first', 'error'); return }
    setPublishing(true)
    try {
      const isAssets = publishTab === 'assets'
      const data = await botApiCall('publish_all_games', { guild_id: selectedGuild, channel_id: publishChannel || undefined, item_type: isAssets ? 'asset' : undefined, ...getMentionPayload() })
      if (data.error) throw new Error(data.error)
      toast(`Published ${data.posted} item${data.posted !== 1 ? 's' : ''} to Discord!`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setPublishing(false)
  }

  const publishSelectedGames = async () => {
    if (!selectedGuild) { toast('Select a server first', 'error'); return }
    const isAssets = publishTab === 'assets'
    const sel = isAssets ? selectedAssets : selectedGames
    if (sel.length === 0) { toast('Select items first', 'error'); return }
    setPublishing(true)
    try {
      const data = await botApiCall('publish_selected_games', { guild_id: selectedGuild, game_ids: sel, item_type: isAssets ? 'asset' : undefined, channel_id: publishChannel || undefined, ...getMentionPayload() })
      if (data.error) throw new Error(data.error)
      toast(`Published ${data.posted} item${data.posted !== 1 ? 's' : ''} to Discord!`, 'success')
      if (isAssets) setSelectedAssets([]); else setSelectedGames([])
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setPublishing(false)
  }

  const toggleGameSelection = (id: number) => {
    const isAssets = publishTab === 'assets'
    if (isAssets) {
      setSelectedAssets(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setSelectedGames(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  const selectAllGames = () => {
    const isAssets = publishTab === 'assets'
    if (isAssets) {
      setSelectedAssets(botAssets.map(g => g.id))
    } else {
      setSelectedGames(botGames.map(g => g.id))
    }
  }

  const clearSelection = () => {
    setSelectedGames([])
    setSelectedAssets([])
  }

  const currentItems = publishTab === 'assets' ? botAssets : botGames
  const currentSelection = publishTab === 'assets' ? selectedAssets : selectedGames

  const toggleAutoPublish = async (key: string) => {
    try {
      const data = await botApiCall('toggle_auto_publish', { key })
      if (data.error) throw new Error(data.error)
      if (key === 'auto_publish_games') setAutoPublishGames(data.value)
      if (key === 'auto_publish_assets') setAutoPublishAssets(data.value)
      toast(`${key.replace(/_/g, ' ')} ${data.value === 'true' ? 'enabled' : 'disabled'}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const loadAutoPublishConfig = useCallback(async () => {
    try {
      const data = await botApiCall('get_bot_status')
      if (!data.error) {
        setAutoPublishGames(data.config_map?.auto_publish_games || 'false')
        setAutoPublishAssets(data.config_map?.auto_publish_assets || 'false')
      }
    } catch {}
  }, [])

  useEffect(() => { if (expandedFeeds) { loadFeeds(); loadAutoPublishConfig() } }, [expandedFeeds, loadFeeds, loadAutoPublishConfig])

  const sendAiPrompt = async () => {
    if (!selectedGuild || !aiPrompt.trim()) return
    setAiSending(true)
    try {
      const data = await botApiCall('ai_builder', { guild_id: selectedGuild, instruction: aiPrompt, mode: aiMode })
      if (data.error) throw new Error(data.error)
      toast(`AI ${aiMode === 'generate' ? 'Server Builder' : 'Agent'} prompt sent!`, 'success')
      setAiPrompt('')
      if (expandedAiBuilder) loadAiHistory()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setAiSending(false)
  }

  const loadAiHistory = useCallback(async () => {
    try {
      const data = await botApiCall('get_agent_history')
      if (!data.error) setAiHistory(data.history || [])
    } catch {}
  }, [])

  useEffect(() => { if (expandedAiBuilder) loadAiHistory() }, [expandedAiBuilder, loadAiHistory])

  const loadServerStats = useCallback(async () => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('get_server_stats', { guild_id: selectedGuild })
      if (!data.error) setServerStatsData(data)
    } catch {}
  }, [selectedGuild])

  useEffect(() => { if (expandedServerStats && selectedGuild) loadServerStats() }, [expandedServerStats, selectedGuild, loadServerStats])

  const saveFeedChannel = async (feedType: string, channelId: string) => {
    try {
      const data = await botApiCall('save_feed_channel', { feed_type: feedType, channel_id: channelId || null })
      if (data.error) throw new Error(data.error)
      setFeedChannels(data.feeds || {})
      toast(`${feedType.replace(/_/g, ' ')} ${channelId ? 'set' : 'cleared'}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const toggleCommand = async (cmd: string) => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('toggle_command', { guild_id: selectedGuild, command: cmd })
      if (data.error) throw new Error(data.error)
      setCommands(prev => prev.map(c => c.name === cmd ? { ...c, disabled: !c.disabled } : c))
      toast(`Command "${cmd}" ${commands.find(c => c.name === cmd)?.disabled ? 'enabled' : 'disabled'}`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const setCommandChannel = async (cmd: string, channelId: string) => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('set_command_channel', { guild_id: selectedGuild, command: cmd, channel_id: channelId || null })
      if (data.error) throw new Error(data.error)
      setCommands(prev => prev.map(c => c.name === cmd ? { ...c, channel_restricted: channelId || null } : c))
      toast(`Command "${cmd}" channel updated`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const setCommandPerm = async (cmd: string, level: string) => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('update_command_permission', { guild_id: selectedGuild, command: cmd, min_level: level || undefined })
      if (data.error) throw new Error(data.error)
      setCommands(prev => prev.map(c => c.name === cmd ? { ...c, custom_level: level || null, effective_level: level || c.defaultLevel } : c))
      toast(`Command "${cmd}" permission updated`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const filteredCmds = commands.filter(c => {
    if (cmdFilter && !c.name.includes(cmdFilter.toLowerCase()) && !c.description.toLowerCase().includes(cmdFilter.toLowerCase())) return false
    if (catFilter && c.category !== catFilter) return false
    return true
  })

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  const selectedGuildData = guilds.find((g: any) => g.guild_id === selectedGuild)
  const parseJson = (v: any) => { if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } }
  const channels: { id: string; name: string }[] = parseJson(selectedGuildData?.channels)
  const categories: { id: string; name: string }[] = parseJson(selectedGuildData?.categories)
  const roles: { id: string; name: string; color: string }[] = parseJson(selectedGuildData?.roles)

  const toggleConfigItems = [
    { key: 'ai_enabled', label: 'AI Chat', desc: 'AI-powered chatbot responses', icon: Sparkles },
    { key: 'xp_enabled', label: 'XP System', desc: 'Leveling and experience points', icon: TrendingUp },
    { key: 'automod_enabled', label: 'Auto Mod', desc: 'Automatic moderation filters', icon: Shield },
    { key: 'welcome_enabled', label: 'Welcome Messages', desc: 'Greet new members', icon: MessageSquare },
  ]

  const channelSettings = [
    { key: 'welcome_channel', label: 'Welcome Channel', desc: 'Greet new members', icon: '👋', type: 'channel' as const },
    { key: 'goodbye_channel', label: 'Goodbye Channel', desc: 'Farewell messages', icon: '👋', type: 'channel' as const },
    { key: 'modlog_channel', label: 'Mod Log', desc: 'Moderation audit trail', icon: '🛡️', type: 'channel' as const },
    { key: 'game_announce_channel', label: 'Game Announcements', desc: 'New game catalog posts', icon: '🎮', type: 'channel' as const },
    { key: 'roblox_updates_channel', label: 'Roblox Updates', desc: 'Roblox/Studio version alerts', icon: '🔧', type: 'channel' as const },
    { key: 'ticket_log_channel', label: 'Ticket Log', desc: 'Support ticket logs', icon: '🎫', type: 'channel' as const },
    { key: 'ticket_panel_channel', label: 'Ticket Panel', desc: 'Ticket creation buttons', icon: '🎫', type: 'channel' as const },
    { key: 'ticket_category', label: 'Ticket Category', desc: 'Category for ticket channels', icon: '📂', type: 'category' as const },
  ]
  const roleSettings = [
    { key: 'mod_role_id', label: 'Mod Role', desc: 'Members with this role get mod permissions', icon: '🛡️' },
    { key: 'auto_role_id', label: 'Auto Role', desc: 'Auto-assign to new members on join', icon: '🏷️' },
  ]

  const saveChannelSetting = async (channelName: string, channelId: string) => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('save_guild_channel', {
        guild_id: selectedGuild, channel_name: channelName, channel_id: channelId || null,
      })
      if (data.error) throw new Error(data.error)
      setGuildSettings((prev: any) => ({ ...prev, [channelName]: channelId || null }))
      toast(`${channelName.replace(/_/g, ' ')} updated`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const testChannel = async (channelId: string, channelName: string) => {
    if (!selectedGuild) return
    try {
      const data = await botApiCall('test_channel', { guild_id: selectedGuild, channel_id: channelId, channel_name: channelName })
      if (data.error) throw new Error(data.error)
      toast(`Test message sent to #${channelName}!`, 'success')
    } catch (e: any) {
      toast(e.message || 'Failed to send test', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Discord Account Linking */}
      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
          <Bot size={16} className="text-[#5865F2]" /> Discord Account
        </h3>
        {currentUser?.discord_user_id ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-primary">
            {currentUser.discord_avatar && <img src={currentUser.discord_avatar} alt="" className="w-10 h-10 rounded-full" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{currentUser.discord_username || 'Linked'}</p>
              <p className="text-[10px] text-green-400 font-medium">Account linked</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-text-muted text-xs flex-1">Link your Discord account to manage the bot from here.</p>
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: window.location.origin + '/admin' } })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] text-white text-xs font-semibold hover:bg-[#4752C4] transition-colors shrink-0">
              <Gamepad2 size={14} /> Link Discord
            </button>
          </div>
        )}
      </div>

      {/* Add Bot to Server */}
      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
          <Hash size={16} className="text-accent-blue" /> Server Management
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <a href={`https://discord.com/api/oauth2/authorize?client_id=1456027240977399818&permissions=8&scope=bot%20applications.commands&redirect_uri=${encodeURIComponent('https://yobest-bytr.vercel.app/admin')}&response_type=code`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] text-white text-xs font-semibold hover:bg-[#4752C4] transition-colors">
            <Plus size={14} /> Add Bot to Server
          </a>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw size={12} /> Refresh Servers
          </button>
        </div>
      </div>

      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Discord Bot</h2>
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            isOnline ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25')}>
            <CircleDot size={10} className={isOnline ? 'animate-pulse' : ''} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
          {lastHb && <span className="text-[10px] text-text-dim">Last seen: {new Date(lastHb).toLocaleString()}</span>}
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {guilds.length > 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-4">
          <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-2">Select Server</label>
          <div className="flex flex-wrap gap-2">
            {guilds.map((g) => (
              <button key={g.guild_id} onClick={() => { setSelectedGuild(g.guild_id); botApiCall('update_config', { key: 'default_guild_id', value: g.guild_id }).catch(() => {}) }}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                  selectedGuild === g.guild_id
                    ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25'
                    : 'bg-bg-elevated text-text-secondary border-border-primary hover:border-accent-blue/30')}>
                {g.icon_url ? <img src={g.icon_url} alt="" className="w-5 h-5 rounded-full" /> : <Hash size={14} />}
                <span className="truncate max-w-[150px]">{g.name || g.guild_id}</span>
                <span className="text-[9px] text-text-dim">{formatNumber(g.member_count)} members</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Channel Settings */}
      {selectedGuild && channels.length > 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <button onClick={() => setExpandedChannels(!expandedChannels)} className="flex items-center gap-2 w-full text-left">
            {expandedChannels ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            <Hash size={14} className="text-accent-blue" />
            <h3 className="text-sm font-semibold text-text-primary">Channel & Role Settings</h3>
            <span className="text-[9px] text-text-dim ml-auto">{channels.length} channels • {roles.length} roles</span>
          </button>
          {expandedChannels && (
            <div className="mt-4 space-y-2">
              {channelSettings.map((ch) => (
                <div key={ch.key} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary hover:border-accent-blue/20 transition-colors">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-sm">{ch.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-text-primary">{ch.label}</div>
                      <div className="text-[10px] text-text-dim">{ch.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={guildSettings?.[ch.key] || ''}
                      onChange={(e) => saveChannelSetting(ch.key, e.target.value)}
                      className="w-40 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors">
                      <option value="">Disabled</option>
                      {ch.type === 'category' ? categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      )) : channels.map((c: any) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                      ))}
                    </select>
                    {guildSettings?.[ch.key] && ch.type !== 'category' && (
                      <button onClick={() => testChannel(guildSettings[ch.key], channels.find((c: any) => c.id === guildSettings[ch.key])?.name || 'channel')} className="px-2 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-[10px] text-accent-blue hover:bg-accent-blue/10 hover:border-accent-blue/30 transition-all shrink-0" title="Send test message">🧪</button>
                    )}
                  </div>
                </div>
              ))}
              {/* Role Settings */}
              {roleSettings.map((r) => (
                <div key={r.key} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary hover:border-accent-blue/20 transition-colors">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-sm">{r.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-text-primary">{r.label}</div>
                      <div className="text-[10px] text-text-dim">{r.desc}</div>
                    </div>
                  </div>
                  <select
                    value={guildSettings?.[r.key] || ''}
                    onChange={(e) => saveChannelSetting(r.key, e.target.value)}
                    className="w-48 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors">
                    <option value="">None</option>
                    {roles.map((role: any) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              ))}
              {/* Text Inputs */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary hover:border-accent-blue/20 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-sm">🎫</span>
                  <div>
                    <div className="text-xs font-medium text-text-primary">Ticket Name Prefix</div>
                    <div className="text-[10px] text-text-dim">e.g. "ticket" → ticket-001</div>
                  </div>
                </div>
                <input
                  value={guildSettings?.ticket_name_prefix || ''}
                  onChange={(e) => setGuildSettings((prev: any) => ({ ...prev, ticket_name_prefix: e.target.value }))}
                  onBlur={() => saveChannelSetting('ticket_name_prefix', guildSettings?.ticket_name_prefix || '')}
                  placeholder="ticket"
                  className="w-48 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors" />
              </div>
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary hover:border-accent-blue/20 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-sm">👋</span>
                  <div>
                    <div className="text-xs font-medium text-text-primary">Welcome Message</div>
                    <div className="text-[10px] text-text-dim">Use {'{user}'} for mention</div>
                  </div>
                </div>
                <input
                  value={guildSettings?.welcome_message || ''}
                  onChange={(e) => setGuildSettings((prev: any) => ({ ...prev, welcome_message: e.target.value }))}
                  onBlur={() => saveChannelSetting('welcome_message', guildSettings?.welcome_message || '')}
                  placeholder="Welcome {user}!"
                  className="w-48 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors" />
              </div>
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary hover:border-accent-blue/20 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-sm">👋</span>
                  <div>
                    <div className="text-xs font-medium text-text-primary">Goodbye Message</div>
                    <div className="text-[10px] text-text-dim">Farewell text</div>
                  </div>
                </div>
                <input
                  value={guildSettings?.goodbye_message || ''}
                  onChange={(e) => setGuildSettings((prev: any) => ({ ...prev, goodbye_message: e.target.value }))}
                  onBlur={() => saveChannelSetting('goodbye_message', guildSettings?.goodbye_message || '')}
                  placeholder="Goodbye {user}!"
                  className="w-48 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Guilds', value: stats.guild_count, icon: Hash, color: 'text-accent-blue' },
          { label: 'Pending Cmds', value: stats.pending_commands, icon: Clock, color: 'text-yellow-400' },
          { label: 'Executed', value: stats.executed_commands, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Failed', value: stats.failed_commands, icon: XCircle, color: 'text-red-400' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
              <Icon size={18} className={cn(s.color, 'mb-2')} />
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-muted">{s.label}</div>
            </div>
          )
        })}
      </div>

      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <button onClick={() => { setExpandedAiChannels(!expandedAiChannels); if (!expandedAiChannels) loadAiChannels() }} className="flex items-center gap-2 w-full text-left">
            {expandedAiChannels ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            <Sparkles size={14} className="text-accent-purple" />
            <h3 className="text-sm font-semibold text-text-primary">AI Chat Channels</h3>
            <span className="text-[9px] text-text-dim ml-auto">{aiChannels.length} channel{aiChannels.length !== 1 ? 's' : ''} active</span>
          </button>
          {expandedAiChannels && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] text-text-dim mb-3">Enable or disable AI chat per channel. Only channels listed here will respond to AI mentions.</p>
              {channels.length === 0 && <p className="text-xs text-text-muted text-center py-4">No channels found. Sync server first.</p>}
              {channels.map((ch: any) => {
                const isActive = aiChannels.includes(ch.id)
                return (
                  <div key={ch.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-bg-elevated border border-border-primary">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Hash size={12} className="text-text-dim shrink-0" />
                      <span className="text-xs font-medium text-text-primary truncate">{ch.name}</span>
                    </div>
                    <button onClick={() => toggleAiChannel(ch.id)} className={cn('px-3 py-1 rounded-lg text-[10px] font-semibold transition-all', isActive ? 'bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25' : 'bg-bg-secondary text-text-dim border border-border-primary hover:text-text-secondary hover:border-accent-blue/30')}>
                      {isActive ? 'AI On' : 'AI Off'}
                    </button>
                  </div>
                )
              })}
              <button onClick={loadAiChannels} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-[10px] text-text-dim hover:text-text-secondary transition-colors mt-2">
                <RefreshCw size={10} /> Refresh
              </button>
            </div>
          )}
        </div>
      )}

      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => sendCommand('sync_commands')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-accent-blue hover:border-accent-blue/30 transition-all">
              <Zap size={12} /> Sync Commands
            </button>
            <button onClick={() => sendCommand('snapshot_stats')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-accent-green hover:border-accent-green/30 transition-all">
              <BarChart3 size={12} /> Snapshot Stats
            </button>
            <button onClick={() => sendCommand('test_welcome')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-accent-purple hover:border-accent-purple/30 transition-all">
              <MessageSquare size={12} /> Test Welcome
            </button>
            <button onClick={() => sendCommand('reload_settings')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-yellow-400 hover:border-yellow-400/30 transition-all">
              <RefreshCw size={12} /> Reload Settings
            </button>
            <button onClick={async () => { try { const d = await botApiCall('send_command', { guild_id: selectedGuild, command: 'ping', payload: {} }); toast(d.error ? `Error: ${d.error}` : 'Ping sent — bot should respond in chat', d.error ? 'error' : 'success'); } catch (e: any) { toast(e.message, 'error'); } }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-green-400 hover:border-green-400/30 transition-all">
              <Power size={12} /> Test Connection
            </button>
          </div>
        </div>
      )}

      {/* Bot Status Control */}
      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Bot size={14} className="text-[#5865F2]" /> Bot Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-dim mb-1 block">Status</label>
              <div className="flex gap-1.5">
                {[
                  { value: 'online', label: '🟢 Online', color: 'green' },
                  { value: 'idle', label: '🟡 Idle', color: 'yellow' },
                  { value: 'dnd', label: '🔴 DND', color: 'red' },
                  { value: 'invisible', label: '⚫ Invisible', color: 'slate' },
                ].map((s) => (
                  <button key={s.value} onClick={async () => {
                    const data = await botApiCall('set_bot_status', { guild_id: selectedGuild, status: s.value, activity: '' })
                    if (data.error) toast(data.error, 'error'); else toast(`Bot status → ${s.label}`, 'success')
                  }} className={`flex-1 px-2 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-[10px] text-text-secondary hover:border-accent-${s.color}-400/50 hover:text-accent-${s.color}-400 transition-all`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-dim mb-1 block">Custom Activity Text</label>
              <div className="flex gap-1.5">
                <input id="bot-activity-input" placeholder="e.g. Playing Roblox" className="flex-1 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors" />
                <button onClick={async () => {
                  const val = (document.getElementById('bot-activity-input') as HTMLInputElement)?.value || ''
                  const data = await botApiCall('set_bot_status', { guild_id: selectedGuild, status: 'online', activity: val })
                  if (data.error) toast(data.error, 'error'); else toast(`Activity → "${val || 'default'}"`, 'success')
                }} className="px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/30 text-[10px] text-accent-blue hover:bg-accent-blue/20 transition-all shrink-0">
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <button onClick={() => { setExpandedCommands(!expandedCommands); if (!expandedCommands) loadCommands() }} className="flex items-center gap-2 w-full text-left">
            {expandedCommands ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            <Terminal size={14} className="text-accent-purple" />
            <h3 className="text-sm font-semibold text-text-primary">Slash Commands</h3>
            <span className="text-[9px] text-text-dim ml-auto">{commands.filter(c => !c.disabled).length}/{commands.length} enabled</span>
          </button>
          {expandedCommands && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <input value={cmdFilter} onChange={(e) => setCmdFilter(e.target.value)} placeholder="Search commands..."
                  className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50" />
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => setCatFilter('')} className={cn('px-2 py-1 rounded text-[10px] font-medium transition-colors', !catFilter ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-dim hover:text-text-secondary')}>All</button>
                  {commandCategories.map(cat => (
                    <button key={cat} onClick={() => setCatFilter(cat === catFilter ? '' : cat)} className={cn('px-2 py-1 rounded text-[10px] font-medium transition-colors capitalize', catFilter === cat ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-dim hover:text-text-secondary')}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredCmds.map((cmd) => (
                  <div key={cmd.name} className={cn('flex items-center gap-3 p-2.5 rounded-lg border transition-all', cmd.disabled ? 'bg-bg-elevated/50 border-border-primary/50 opacity-60' : 'bg-bg-elevated border-border-primary')}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-mono font-semibold', cmd.disabled ? 'text-text-dim line-through' : 'text-text-primary')}>/{cmd.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-secondary text-text-dim capitalize">{cmd.category}</span>
                        {cmd.custom_level && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple">{cmd.custom_level}</span>}
                      </div>
                      <p className="text-[10px] text-text-dim mt-0.5 truncate">{cmd.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select value={cmd.effective_level} onChange={(e) => setCommandPerm(cmd.name, e.target.value)} className="px-1.5 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-secondary focus:outline-none focus:border-accent-blue/50">
                        <option value="member">Member</option>
                        <option value="mod">Mod</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                      <select value={cmd.channel_restricted || ''} onChange={(e) => setCommandChannel(cmd.name, e.target.value)} className="px-1.5 py-1 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-secondary focus:outline-none focus:border-accent-blue/50 max-w-[120px]">
                        <option value="">Any channel</option>
                        {channels.map((c: any) => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                      <button onClick={() => toggleCommand(cmd.name)} className={cn('w-9 h-5 rounded-full transition-all relative', cmd.disabled ? 'bg-red-500/30' : 'bg-accent-green/30')}>
                        <div className={cn('w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all', cmd.disabled ? 'left-0.5 bg-red-400' : 'left-[18px] bg-accent-green')} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Server Channels Display */}
      {selectedGuild && channels.length > 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Hash size={14} className="text-accent-blue" /> Server Channels
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {channels.map((ch: any) => (
              <div key={ch.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-elevated border border-border-primary text-[11px]">
                <Hash size={10} className="text-text-dim shrink-0" />
                <span className="text-text-secondary truncate">{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Send size={14} className="text-accent-blue" /> Post News to Discord
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Title *</label>
              <input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="News title..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={newsDesc} onChange={(e) => setNewsDesc(e.target.value)} rows={3} placeholder="News content..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Game URL (optional)</label>
              <input value={newsUrl} onChange={(e) => setNewsUrl(e.target.value)} placeholder="https://roblox.com/games/..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Image URL (optional)</label>
              <input value={newsImage} onChange={(e) => setNewsImage(e.target.value)} placeholder="https://...png"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Channel (optional)</label>
              <select value={newsChannel} onChange={(e) => setNewsChannel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50">
                <option value="">Auto (first available channel)</option>
                {channels.map((c: any) => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={sendNews} disabled={sending || !newsTitle.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Send to Discord
          </button>
        </div>
      )}

      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <button onClick={() => { setExpandedFeeds(!expandedFeeds); if (!expandedFeeds) loadFeeds() }} className="flex items-center gap-2 w-full text-left">
            {expandedFeeds ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            <Radio size={14} className="text-accent-green" />
            <h3 className="text-sm font-semibold text-text-primary">Channel Feeds & Publishing</h3>
            <span className="text-[9px] text-text-dim ml-auto">Auto-post and manual publish</span>
          </button>
          {expandedFeeds && (
            <div className="mt-4 space-y-4">
              {/* Mention Target */}
              <div className="space-y-2">
                <p className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Message Mention</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-elevated border border-border-primary">
                  <AtSign size={14} className={mentionTarget !== 'none' ? 'text-accent-blue' : 'text-text-dim'} />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-text-primary">Notify Recipients</div>
                    <div className="text-[10px] text-text-dim">Add a mention to all bot messages (publish, news, auto-post)</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: 'none', label: 'None' },
                      { value: 'everyone', label: '@everyone' },
                      { value: 'here', label: '@here' },
                      { value: 'role', label: '@role' },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => { setMentionTarget(opt.value as any); if (opt.value === 'role' && !mentionRoleId) setMentionRoleId(channels[0]?.id || '') }}
                        className={cn('px-2 py-1 rounded-lg text-[10px] font-medium transition-all border',
                          mentionTarget === opt.value ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25' : 'bg-bg-secondary text-text-dim border-border-primary hover:text-text-secondary')}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {mentionTarget === 'role' && (
                  <div className="flex items-center gap-2 ml-7">
                    <span className="text-[10px] text-text-dim">Role ID:</span>
                    <input value={mentionRoleId} onChange={(e) => setMentionRoleId(e.target.value)} placeholder="Discord role ID"
                      className="flex-1 px-2 py-1 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50" />
                  </div>
                )}
              </div>

              {/* Feed Channel Pickers */}
              <div className="space-y-2">
                <p className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Feed Channels</p>
                {[
                  { key: 'game_feed', label: 'Game Feed', desc: 'Auto-post when new games are approved', icon: Gamepad2 },
                  { key: 'news_feed', label: 'News Feed', desc: 'Auto-post site news to Discord', icon: Send },
                  { key: 'submission_feed', label: 'Submission Feed', desc: 'Auto-post when community submissions are approved', icon: Users },
                  { key: 'announcement_feed', label: 'Announcements', desc: 'Auto-post site announcements', icon: Zap },
                ].map((feed) => (
                  <div key={feed.key} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <feed.icon size={14} className="text-accent-green shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-text-primary">{feed.label}</div>
                        <div className="text-[10px] text-text-dim">{feed.desc}</div>
                      </div>
                    </div>
                    <select value={feedChannels[feed.key] || ''} onChange={(e) => saveFeedChannel(feed.key, e.target.value)}
                      className="w-48 px-2 py-1.5 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50">
                      <option value="">Disabled</option>
                      {channels.map((c: any) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Auto-Publish Toggles */}
              <div className="space-y-2">
                <p className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Auto-Publish</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-primary">
                  <div className="flex items-center gap-3">
                    <Gamepad2 size={14} className={autoPublishGames === 'true' ? 'text-accent-green' : 'text-text-dim'} />
                    <div>
                      <div className="text-xs font-medium text-text-primary">Auto-Publish Games</div>
                      <div className="text-[10px] text-text-dim">Post new games to game_feed channel automatically</div>
                    </div>
                  </div>
                  <button onClick={() => toggleAutoPublish('auto_publish_games')} className={cn('p-1 rounded-lg transition-colors', autoPublishGames === 'true' ? 'text-green-400 hover:bg-green-500/10' : 'text-text-dim hover:bg-bg-secondary')}>
                    {autoPublishGames === 'true' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-primary">
                  <div className="flex items-center gap-3">
                    <Upload size={14} className={autoPublishAssets === 'true' ? 'text-accent-green' : 'text-text-dim'} />
                    <div>
                      <div className="text-xs font-medium text-text-primary">Auto-Publish Assets</div>
                      <div className="text-[10px] text-text-dim">Post new assets to Discord automatically</div>
                    </div>
                  </div>
                  <button onClick={() => toggleAutoPublish('auto_publish_assets')} className={cn('p-1 rounded-lg transition-colors', autoPublishAssets === 'true' ? 'text-green-400 hover:bg-green-500/10' : 'text-text-dim hover:bg-bg-secondary')}>
                    {autoPublishAssets === 'true' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
              </div>

              {/* Manual Publish */}
              <div className="space-y-2">
                <p className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Publish from Site</p>
                <div className="flex gap-2">
                  <button onClick={() => { setPublishTab('games'); setSelectedGames([]) }} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all', publishTab === 'games' ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25' : 'bg-bg-elevated text-text-dim border border-border-primary hover:text-text-secondary')}>
                    <Gamepad2 size={10} className="inline mr-1" /> Games ({botGames.length})
                  </button>
                  <button onClick={() => { setPublishTab('assets'); setSelectedAssets([]) }} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all', publishTab === 'assets' ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/25' : 'bg-bg-elevated text-text-dim border border-border-primary hover:text-text-secondary')}>
                    <Upload size={10} className="inline mr-1" /> Assets ({botAssets.length})
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <select value={publishChannel} onChange={(e) => setPublishChannel(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50">
                    <option value="">Auto channel</option>
                    {channels.map((c: any) => (
                      <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                  </select>
                  <button onClick={selectAllGames} className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-[10px] text-text-dim hover:text-text-secondary transition-colors">
                    Select All
                  </button>
                  <button onClick={clearSelection} className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-[10px] text-text-dim hover:text-text-secondary transition-colors">
                    Clear
                  </button>
                  {currentSelection.length > 0 && (
                    <button onClick={publishSelectedGames} disabled={publishing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-green/15 text-accent-green text-[10px] font-semibold hover:bg-accent-green/25 transition-colors disabled:opacity-50">
                      {publishing ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                      Publish Selected ({currentSelection.length})
                    </button>
                  )}
                  <button onClick={publishAllGames} disabled={publishing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-purple/15 text-accent-purple text-[10px] font-semibold hover:bg-accent-purple/25 transition-colors disabled:opacity-50">
                    {publishing ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                    Publish All
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {currentItems.length === 0 && (
                    <p className="text-[10px] text-text-dim text-center py-4">No {publishTab} found on the site yet.</p>
                  )}
                  {publishTab === 'games' && botGames.map((game) => {
                    const thumb = getGameThumb(game)
                    return (
                    <div key={game.id} className={cn('flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer', selectedGames.includes(game.id) ? 'bg-accent-blue/10 border-accent-blue/25' : 'bg-bg-elevated border-border-primary hover:border-border-accent')}>
                      <input type="checkbox" checked={selectedGames.includes(game.id)} onChange={() => toggleGameSelection(game.id)} className="w-3.5 h-3.5 rounded border-border-primary text-accent-blue focus:ring-accent-blue/50 bg-bg-secondary" />
                      {thumb ? <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border-primary" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="w-12 h-12 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0 border border-border-primary"><Gamepad2 size={16} className="text-accent-blue" /></div>}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-primary truncate">{game.title}</div>
                        <div className="text-[10px] text-text-dim truncate">{game.description || 'No description'}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {game.is_official && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">Official</span>}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-secondary text-text-dim">{game.category || 'Uncategorized'}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); publishGame(game.id, 'game') }} disabled={publishing} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-secondary border border-border-primary text-[10px] text-text-dim hover:text-accent-green hover:border-accent-green/30 transition-all disabled:opacity-50 shrink-0">
                        <Send size={9} /> Post
                      </button>
                    </div>
                    )
                  })}
                  {publishTab === 'assets' && botAssets.map((asset) => {
                    const thumb = getAssetThumb(asset)
                    return (
                    <div key={asset.id} className={cn('flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer', selectedAssets.includes(asset.id) ? 'bg-accent-purple/10 border-accent-purple/25' : 'bg-bg-elevated border-border-primary hover:border-border-accent')}>
                      <input type="checkbox" checked={selectedAssets.includes(asset.id)} onChange={() => toggleGameSelection(asset.id)} className="w-3.5 h-3.5 rounded border-border-primary text-accent-purple focus:ring-accent-purple/50 bg-bg-secondary" />
                      {thumb ? <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border-primary" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="w-12 h-12 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0 border border-border-primary"><Upload size={16} className="text-accent-purple" /></div>}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-primary truncate">{asset.title}</div>
                        <div className="text-[10px] text-text-dim truncate">{asset.description || 'No description'}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple font-medium capitalize">{asset.type}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-secondary text-text-dim">{asset.price_robux === 0 ? 'Free' : `${asset.price_robux} R$`}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); publishGame(asset.id, 'asset') }} disabled={publishing} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-secondary border border-border-primary text-[10px] text-text-dim hover:text-accent-green hover:border-accent-green/30 transition-all disabled:opacity-50 shrink-0">
                        <Send size={9} /> Post
                      </button>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Server Builder */}
      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <button onClick={() => { setExpandedAiBuilder(!expandedAiBuilder); if (!expandedAiBuilder) loadAiHistory() }} className="flex items-center gap-2 w-full text-left">
            {expandedAiBuilder ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            <Sparkles size={14} className="text-accent-purple" />
            <h3 className="text-sm font-semibold text-text-primary">AI Server Builder</h3>
            <span className="text-[9px] text-text-dim ml-auto">Generate and edit server with AI</span>
          </button>
          {expandedAiBuilder && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setAiMode('agent')} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all', aiMode === 'agent' ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/25' : 'bg-bg-elevated text-text-dim border border-border-primary hover:text-text-secondary')}>
                  <Bot size={10} className="inline mr-1" /> Agent (Edit Server)
                </button>
                <button onClick={() => setAiMode('generate')} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all', aiMode === 'generate' ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25' : 'bg-bg-elevated text-text-dim border border-border-primary hover:text-text-secondary')}>
                  <Sparkles size={10} className="inline mr-1" /> Generate (New Layout)
                </button>
              </div>
              <p className="text-[10px] text-text-dim">
                {aiMode === 'agent' ? 'Tell the AI what to change — rename channels, create categories, adjust roles, set permissions...' : 'Describe a server layout and the AI will generate categories, channels, and roles from scratch.'}
              </p>
              <div className="flex gap-2">
                <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAiPrompt()}
                  placeholder={aiMode === 'agent' ? 'e.g. Create a #memes channel in the Fun category...' : 'e.g. A gaming community server with voice channels...'}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-purple/50" />
                <button onClick={sendAiPrompt} disabled={aiSending || !aiPrompt.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-purple text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
                  {aiSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Send
                </button>
              </div>
              {aiHistory.length > 0 && (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  <p className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Recent AI Activity</p>
                  {aiHistory.map((cmd) => (
                    <div key={cmd.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated border border-border-primary text-xs">
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold',
                        cmd.status === 'pending' && 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
                        cmd.status === 'done' && 'bg-green-500/15 text-green-400 border border-green-500/20',
                        cmd.status === 'error' && 'bg-red-500/15 text-red-400 border border-red-500/20',
                        cmd.status === 'executed' && 'bg-green-500/15 text-green-400 border border-green-500/20',
                        cmd.status === 'failed' && 'bg-red-500/15 text-red-400 border border-red-500/20'
                      )}>{cmd.status}</span>
                      <span className="font-mono text-text-primary">{cmd.command}</span>
                      <span className="text-text-dim truncate flex-1">{cmd.payload?.instruction || JSON.stringify(cmd.payload || {}).slice(0, 60)}</span>
                      <span className="text-text-dim shrink-0">{new Date(cmd.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Server Stats */}
      {selectedGuild && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <button onClick={() => { setExpandedServerStats(!expandedServerStats); if (!expandedServerStats) loadServerStats() }} className="flex items-center gap-2 w-full text-left">
            {expandedServerStats ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
            <BarChart3 size={14} className="text-accent-orange" />
            <h3 className="text-sm font-semibold text-text-primary">Server Stats</h3>
            <span className="text-[9px] text-text-dim ml-auto">Live server information</span>
          </button>
          {expandedServerStats && serverStatsData?.guild && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Members', value: serverStatsData.guild.member_count },
                  { label: 'Boost Level', value: serverStatsData.guild.boost_level },
                  { label: 'Boosts', value: serverStatsData.guild.boost_count },
                  { label: 'Channels', value: (typeof serverStatsData.guild.channels === 'string' ? JSON.parse(serverStatsData.guild.channels || '[]') : serverStatsData.guild.channels || []).length },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg bg-bg-elevated border border-border-primary">
                    <div className="text-lg font-bold text-text-primary">{s.value}</div>
                    <div className="text-[10px] text-text-dim">{s.label}</div>
                  </div>
                ))}
              </div>
              {serverStatsData.history?.length > 0 && (
                <div className="p-3 rounded-lg bg-bg-elevated border border-border-primary">
                  <p className="text-[10px] text-text-dim font-semibold mb-2">Member Growth (recent snapshots)</p>
                  <div className="flex items-end gap-1 h-16">
                    {[...serverStatsData.history].reverse().map((h: any, i: number) => {
                      const max = Math.max(...serverStatsData.history.map((x: any) => x.member_count))
                      const pct = max > 0 ? (h.member_count / max) * 100 : 50
                      return <div key={i} className="flex-1 bg-accent-blue/30 rounded-t" style={{ height: `${Math.max(pct, 5)}%` }} title={`${h.member_count} members`} />
                    })}
                  </div>
                  <div className="flex justify-between text-[8px] text-text-dim mt-1">
                    <span>Oldest</span><span>Newest</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <button onClick={() => setExpandedConfig(!expandedConfig)} className="flex items-center gap-2 w-full text-left">
          {expandedConfig ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
          <h3 className="text-sm font-semibold text-text-primary">Bot Configuration</h3>
          <span className="text-[9px] text-text-dim ml-auto">{Object.keys(config).length} settings</span>
        </button>
        {expandedConfig && (
          <div className="mt-4 space-y-3">
            {toggleConfigItems.map((item) => {
              const Icon = item.icon
              const enabled = config[item.key] === 'true'
              return (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-primary">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={cn(enabled ? 'text-accent-blue' : 'text-text-dim')} />
                    <div>
                      <div className="text-xs font-medium text-text-primary">{item.label}</div>
                      <div className="text-[10px] text-text-dim">{item.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => toggleConfig(item.key, config[item.key])}
                    className={cn('p-1 rounded-lg transition-colors', enabled ? 'text-green-400 hover:bg-green-500/10' : 'text-text-dim hover:bg-bg-secondary')}>
                    {enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
              )
            })}
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border-primary">
              <div className="flex items-center gap-3">
                <Bot size={16} className="text-accent-purple" />
                <div>
                  <div className="text-xs font-medium text-text-primary">AI Model</div>
                  <div className="text-[10px] text-text-dim">OpenRouter model for chat</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input value={configEdits.ai_model || ''} onChange={(e) => setConfigEdits(prev => ({ ...prev, ai_model: e.target.value }))}
                  className="w-48 px-2 py-1 rounded bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50" />
                {configEdits.ai_model !== config.ai_model && (
                  <button onClick={() => saveConfig('ai_model')} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><Save size={14} /></button>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated border border-border-primary space-y-2">
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-accent-orange" />
                <div>
                  <div className="text-xs font-medium text-text-primary">AI System Prompt</div>
                  <div className="text-[10px] text-text-dim">Personality and instructions for the bot</div>
                </div>
              </div>
              <textarea value={configEdits.ai_system_prompt || ''} onChange={(e) => setConfigEdits(prev => ({ ...prev, ai_system_prompt: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-blue/50 resize-none font-mono" />
              {configEdits.ai_system_prompt !== config.ai_system_prompt && (
                <button onClick={() => saveConfig('ai_system_prompt')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors">
                  <Save size={12} /> Save Prompt
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <button onClick={() => { setExpandedHistory(!expandedHistory); if (!expandedHistory) loadHistory() }}
          className="flex items-center gap-2 w-full text-left">
          {expandedHistory ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
          <h3 className="text-sm font-semibold text-text-primary">Command History</h3>
          <span className="text-[9px] text-text-dim ml-auto">{cmdHistory.length} commands</span>
        </button>
        {expandedHistory && (
          <div className="mt-4 space-y-1 max-h-80 overflow-y-auto">
            {cmdHistory.length === 0 && <p className="text-xs text-text-muted text-center py-4">No commands yet</p>}
            {cmdHistory.map((cmd) => (
              <div key={cmd.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated border border-border-primary text-xs">
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold',
                  cmd.status === 'pending' && 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
                  cmd.status === 'executed' && 'bg-green-500/15 text-green-400 border border-green-500/20',
                  cmd.status === 'failed' && 'bg-red-500/15 text-red-400 border border-red-500/20'
                )}>{cmd.status}</span>
                <span className="font-mono text-text-primary">{cmd.command}</span>
                <span className="text-text-dim truncate flex-1">{cmd.guild_id?.slice(0, 8)}</span>
                <span className="text-text-dim shrink-0">{new Date(cmd.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
